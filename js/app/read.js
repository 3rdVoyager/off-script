const readRoot = document.querySelector("[data-read-root]");

const readState = {
    queue: [],
    index: 0,
    revealed: false,
    script: null,
    practiceCharacters: [],
};

let readShell = null;

if (readRoot) {
    renderReadTool();
    document.addEventListener("keydown", handleReadKeydown);
}

function renderReadTool() {
    if (!readRoot) {
        return;
    }

    readRoot.replaceChildren();

    const session = loadPracticeSession(readState);

    if (!session.ok) {
        readRoot.appendChild(session.element);
        readShell = null;
        return;
    }

    readState.revealed = false;

    readShell = createPracticeToolShell({
        onPrev: () => moveReadIndex(-1),
        onNext: () => moveReadIndex(1),
    });

    readRoot.appendChild(readShell.element);
    renderReadStep();
}

function renderReadStep() {
    if (!readShell) {
        return;
    }

    const item = getPracticeItem(readState.queue, readState.index);

    if (!item) {
        return;
    }

    readShell.meta.textContent = formatPracticeMeta(
        item,
        readState.index,
        readState.queue.length
    );

    renderPracticeCue(readShell.cueSection, item.cue);
    readShell.contentSection.replaceChildren();
    renderReadLineSection(readShell.contentSection, item.line);
    readShell.updateNav(readState.index, readState.queue.length);
}

function renderReadLineSection(contentSection, line) {
    const label = document.createElement("p");
    label.className = "practice-section-label";
    label.textContent = "Your line";
    contentSection.appendChild(label);

    if (readState.revealed) {
        const character = document.createElement("p");
        character.className = "practice-line-character";
        character.textContent = line.character;
        contentSection.appendChild(character);

        const text = document.createElement("p");
        text.className = "practice-line-text";
        text.textContent = line.text;
        contentSection.appendChild(text);
        return;
    }

    const revealButton = document.createElement("button");
    revealButton.type = "button";
    revealButton.className = "practice-reveal-button";
    revealButton.textContent = "Show line";
    revealButton.addEventListener("click", revealCurrentLine);
    contentSection.appendChild(revealButton);
}

function revealCurrentLine() {
    if (readState.revealed) {
        return;
    }

    const item = getPracticeItem(readState.queue, readState.index);

    if (!item || !readState.script) {
        return;
    }

    readState.revealed = true;

    const result = recordLineProgress(
        readState.script.id,
        item.line.character,
        item.line.lineId,
        "read"
    );

    if (result.ok) {
        updateInterface();
    }

    renderReadStep();
}

function moveReadIndex(delta) {
    const nextIndex = readState.index + delta;

    if (nextIndex < 0 || nextIndex >= readState.queue.length) {
        return;
    }

    readState.index = nextIndex;
    readState.revealed = false;
    renderReadStep();
}

function handleReadKeydown(event) {
    if (!readRoot || readState.queue.length === 0 || isTypingTarget(event.target)) {
        return;
    }

    if (event.key === "ArrowLeft") {
        event.preventDefault();
        moveReadIndex(-1);
    }

    if (event.key === "ArrowRight") {
        event.preventDefault();
        moveReadIndex(1);
    }

    if (event.key === " " || event.key === "Enter") {
        if (!readState.revealed) {
            event.preventDefault();
            revealCurrentLine();
        }
    }
}
