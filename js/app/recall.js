const recallRoot = document.querySelector("[data-recall-root]");

const recallState = {
    queue: [],
    index: 0,
    completed: false,
    script: null,
    practiceCharacters: [],
};

let recallShell = null;
let lineInput = null;

if (recallRoot) {
    renderRecallTool();
    document.addEventListener("keydown", handleRecallKeydown);
}

function renderRecallTool() {
    if (!recallRoot) {
        return;
    }

    recallRoot.replaceChildren();
    lineInput = null;

    const session = loadPracticeSession(recallState);

    if (!session.ok) {
        recallRoot.appendChild(session.element);
        recallShell = null;
        return;
    }

    recallState.completed = false;

    recallShell = createPracticeToolShell({
        onPrev: () => moveRecallIndex(-1),
        onNext: () => moveRecallIndex(1),
    });

    recallRoot.appendChild(recallShell.element);
    renderRecallStep();
}

function renderRecallStep() {
    if (!recallShell) {
        return;
    }

    const item = getPracticeItem(recallState.queue, recallState.index);

    if (!item) {
        return;
    }

    recallState.completed = false;

    recallShell.meta.textContent = formatPracticeMeta(
        item,
        recallState.index,
        recallState.queue.length
    );

    renderPracticeCue(recallShell.cueSection, item.cue);
    recallShell.contentSection.replaceChildren();
    renderRecallInputSection(recallShell.contentSection, item.line);
    recallShell.updateNav(recallState.index, recallState.queue.length);
}

function renderRecallInputSection(contentSection, line) {
    const label = document.createElement("p");
    label.className = "practice-section-label";
    label.textContent = "Type your line";
    contentSection.appendChild(label);

    const hint = document.createElement("p");
    hint.className = "practice-cue-empty";
    hint.textContent = "Type the full line from memory. Small typos are OK — press Check or Enter.";
    contentSection.appendChild(hint);

    lineInput = createFullLineInput(line.text, {
        onComplete: handleRecallLineComplete,
        onEnterWhenComplete: () => moveRecallIndex(1),
    });

    contentSection.appendChild(lineInput.element);
    lineInput.focus();
}

function handleRecallLineComplete() {
    if (recallState.completed) {
        return;
    }

    const item = getPracticeItem(recallState.queue, recallState.index);

    if (!item || !recallState.script) {
        return;
    }

    recallState.completed = true;

    const result = recordLineProgress(
        recallState.script.id,
        item.line.character,
        item.line.lineId,
        "recall"
    );

    if (result.ok) {
        updateInterface();
    }
}

function moveRecallIndex(delta) {
    const nextIndex = recallState.index + delta;

    if (nextIndex < 0 || nextIndex >= recallState.queue.length) {
        return;
    }

    recallState.index = nextIndex;
    recallState.completed = false;
    renderRecallStep();
}

function handleRecallKeydown(event) {
    if (!recallRoot || recallState.queue.length === 0 || isTypingTarget(event.target)) {
        return;
    }

    if (event.key === "ArrowLeft") {
        event.preventDefault();
        moveRecallIndex(-1);
    }

    if (event.key === "ArrowRight") {
        event.preventDefault();
        moveRecallIndex(1);
    }
}
