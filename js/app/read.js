const readRoot = document.querySelector("[data-read-root]");

const readState = {
    queue: [],
    index: 0,
    revealed: false,
    script: null,
    practiceCharacter: "",
};

if (readRoot) {
    renderReadTool();
    document.addEventListener("keydown", handleReadKeydown);
}

function renderReadTool() {
    if (!readRoot) {
        return;
    }

    readRoot.replaceChildren();

    const script = getActiveScript();

    if (!script) {
        readRoot.appendChild(createPracticeEmptyState("no-script"));
        return;
    }

    const settings = getScriptSettings(script.id);

    if (!settings.practiceCharacter) {
        readRoot.appendChild(createPracticeEmptyState("no-character"));
        return;
    }

    const queue = buildPracticeQueue(
        script,
        settings.practiceCharacter,
        settings.showStageDirections
    );

    if (queue.length === 0) {
        readRoot.appendChild(createPracticeEmptyState("no-lines", {
            character: settings.practiceCharacter,
        }));
        return;
    }

    if (readState.script?.id !== script.id) {
        readState.index = 0;
    }

    readState.script = script;
    readState.queue = queue;
    readState.practiceCharacter = settings.practiceCharacter;
    readState.index = Math.min(readState.index, queue.length - 1);
    readState.revealed = false;

    readRoot.appendChild(createReadInterface());
    renderReadStep();
}

function createReadInterface() {
    const wrapper = document.createElement("div");
    wrapper.className = "read-tool";

    const meta = document.createElement("p");
    meta.className = "read-meta";
    meta.setAttribute("data-read-meta", "");
    wrapper.appendChild(meta);

    const card = document.createElement("article");
    card.className = "card read-card";

    const cueSection = document.createElement("section");
    cueSection.className = "read-cue";
    cueSection.setAttribute("data-read-cue", "");
    card.appendChild(cueSection);

    const lineSection = document.createElement("section");
    lineSection.className = "read-line";
    lineSection.setAttribute("data-read-line", "");
    card.appendChild(lineSection);

    wrapper.appendChild(card);

    const nav = document.createElement("nav");
    nav.className = "read-nav";
    nav.setAttribute("aria-label", "Line navigation");

    const prevButton = document.createElement("button");
    prevButton.type = "button";
    prevButton.className = "read-nav-button";
    prevButton.setAttribute("data-read-prev", "");
    prevButton.setAttribute("aria-label", "Previous line");
    prevButton.innerHTML = '<span class="material-icons" aria-hidden="true">arrow_back</span>';
    nav.appendChild(prevButton);

    const nextButton = document.createElement("button");
    nextButton.type = "button";
    nextButton.className = "read-nav-button";
    nextButton.setAttribute("data-read-next", "");
    nextButton.setAttribute("aria-label", "Next line");
    nextButton.innerHTML = '<span class="material-icons" aria-hidden="true">arrow_forward</span>';
    nav.appendChild(nextButton);

    wrapper.appendChild(nav);

    prevButton.addEventListener("click", () => {
        moveReadIndex(-1);
    });

    nextButton.addEventListener("click", () => {
        moveReadIndex(1);
    });

    return wrapper;
}

function renderReadStep() {
    const item = readState.queue[readState.index];

    if (!item) {
        return;
    }

    const meta = readRoot.querySelector("[data-read-meta]");
    const cueSection = readRoot.querySelector("[data-read-cue]");
    const lineSection = readRoot.querySelector("[data-read-line]");
    const prevButton = readRoot.querySelector("[data-read-prev]");
    const nextButton = readRoot.querySelector("[data-read-next]");

    if (!meta || !cueSection || !lineSection || !prevButton || !nextButton) {
        return;
    }

    meta.textContent = `${item.line.actTitle} · ${item.line.sceneTitle} · Line ${readState.index + 1} of ${readState.queue.length}`;

    cueSection.replaceChildren();
    renderCueSection(cueSection, item.cue);

    lineSection.replaceChildren();
    renderLineSection(lineSection, item.line);

    prevButton.disabled = readState.index === 0;
    nextButton.disabled = readState.index === readState.queue.length - 1;
}

function renderCueSection(cueSection, cue) {
    const label = document.createElement("p");
    label.className = "read-section-label";
    label.textContent = "Cue";
    cueSection.appendChild(label);

    if (!cue) {
        const empty = document.createElement("p");
        empty.className = "read-cue-empty";
        empty.textContent = "Start of script.";
        cueSection.appendChild(empty);
        return;
    }

    if (cue.type === "direction") {
        const direction = document.createElement("p");
        direction.className = "read-cue-direction";
        direction.textContent = cue.text;
        cueSection.appendChild(direction);
        return;
    }

    const character = document.createElement("p");
    character.className = "read-cue-character";
    character.textContent = cue.character;
    cueSection.appendChild(character);

    const text = document.createElement("p");
    text.className = "read-cue-text";
    text.textContent = cue.text;
    cueSection.appendChild(text);
}

function renderLineSection(lineSection, line) {
    const label = document.createElement("p");
    label.className = "read-section-label";
    label.textContent = "Your line";
    lineSection.appendChild(label);

    if (readState.revealed) {
        const character = document.createElement("p");
        character.className = "read-line-character";
        character.textContent = line.character;
        lineSection.appendChild(character);

        const text = document.createElement("p");
        text.className = "read-line-text";
        text.textContent = line.text;
        lineSection.appendChild(text);
        return;
    }

    const revealButton = document.createElement("button");
    revealButton.type = "button";
    revealButton.className = "read-reveal-button";
    revealButton.textContent = "Show line";
    revealButton.addEventListener("click", revealCurrentLine);
    lineSection.appendChild(revealButton);
}

function revealCurrentLine() {
    if (readState.revealed) {
        return;
    }

    const item = readState.queue[readState.index];

    if (!item || !readState.script) {
        return;
    }

    readState.revealed = true;

    const result = recordLineProgress(
        readState.script.id,
        readState.practiceCharacter,
        item.line.lineId,
        "read"
    );

    if (result.ok && typeof updateSidebarMasteryDial === "function") {
        updateSidebarMasteryDial();
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
    if (!readRoot || readState.queue.length === 0) {
        return;
    }

    if (event.target instanceof HTMLInputElement || event.target instanceof HTMLTextAreaElement) {
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
