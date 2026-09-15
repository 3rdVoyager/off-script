const reciteRoot = document.querySelector("[data-recite-root]");

const reciteState = {
    queue: [],
    index: 0,
    completed: false,
    script: null,
    practiceCharacter: "",
};

let reciteShell = null;
let lineInput = null;

if (reciteRoot) {
    renderReciteTool();
    document.addEventListener("keydown", handleReciteKeydown);
}

function renderReciteTool() {
    if (!reciteRoot) {
        return;
    }

    reciteRoot.replaceChildren();
    lineInput = null;

    const session = loadPracticeSession(reciteState);

    if (!session.ok) {
        reciteRoot.appendChild(session.element);
        reciteShell = null;
        return;
    }

    reciteState.completed = false;

    reciteShell = createPracticeToolShell({
        onPrev: () => moveReciteIndex(-1),
        onNext: () => moveReciteIndex(1),
    });

    reciteRoot.appendChild(reciteShell.element);
    renderReciteStep();
}

function renderReciteStep() {
    if (!reciteShell) {
        return;
    }

    const item = getPracticeItem(reciteState.queue, reciteState.index);

    if (!item) {
        return;
    }

    reciteState.completed = false;

    reciteShell.meta.textContent = formatPracticeMeta(
        item,
        reciteState.index,
        reciteState.queue.length
    );

    renderPracticeCue(reciteShell.cueSection, item.cue);
    reciteShell.contentSection.replaceChildren();
    renderReciteInputSection(reciteShell.contentSection, item.line);
    reciteShell.updateNav(reciteState.index, reciteState.queue.length);
}

function renderReciteInputSection(contentSection, line) {
    const label = document.createElement("p");
    label.className = "practice-section-label";
    label.textContent = "Type your line";
    contentSection.appendChild(label);

    const hint = document.createElement("p");
    hint.className = "practice-cue-empty";
    hint.textContent = "Type the first letter of each word to fill it in.";
    contentSection.appendChild(hint);

    lineInput = createFirstLetterLineInput(line.text, {
        onComplete: handleReciteLineComplete,
        onEnterWhenComplete: () => moveReciteIndex(1),
    });

    contentSection.appendChild(lineInput.element);
    lineInput.focus();
}

function handleReciteLineComplete() {
    if (reciteState.completed) {
        return;
    }

    const item = getPracticeItem(reciteState.queue, reciteState.index);

    if (!item || !reciteState.script) {
        return;
    }

    reciteState.completed = true;

    const result = recordLineProgress(
        reciteState.script.id,
        reciteState.practiceCharacter,
        item.line.lineId,
        "recite"
    );

    if (result.ok && typeof updateSidebarMasteryDial === "function") {
        updateSidebarMasteryDial();
    }
}

function moveReciteIndex(delta) {
    const nextIndex = reciteState.index + delta;

    if (nextIndex < 0 || nextIndex >= reciteState.queue.length) {
        return;
    }

    reciteState.index = nextIndex;
    reciteState.completed = false;
    renderReciteStep();
}

function handleReciteKeydown(event) {
    if (!reciteRoot || reciteState.queue.length === 0 || isTypingTarget(event.target)) {
        return;
    }

    if (event.key === "ArrowLeft") {
        event.preventDefault();
        moveReciteIndex(-1);
    }

    if (event.key === "ArrowRight") {
        event.preventDefault();
        moveReciteIndex(1);
    }
}
