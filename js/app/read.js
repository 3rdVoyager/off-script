const readApi = createPracticeApi("read");

function mountReadTool(root) {
    const state = {
        queue: [],
        index: 0,
        revealed: false,
        script: null,
        practiceCharacters: [],
    };

    let shell = null;

    function renderTool() {
        root.replaceChildren();

        const session = readApi.loadSession(state);

        if (!session.ok) {
            root.appendChild(session.element);
            shell = null;
            return;
        }

        state.revealed = false;

        shell = readApi.createShell({
            onPrev: () => moveIndex(-1),
            onNext: () => moveIndex(1),
        });

        root.appendChild(shell.element);
        renderStep();
    }

    function renderStep() {
        if (!shell) {
            return;
        }

        const item = readApi.getCurrentItem(state);

        if (!item) {
            return;
        }

        shell.meta.textContent = readApi.formatMeta(item, state.index, state.queue.length);
        readApi.renderCue(shell.cueSection, item.cue);
        shell.contentSection.replaceChildren();
        shell.contentSection.classList.toggle("practice-content--correct", state.revealed);
        renderLineSection(shell.contentSection, item.line);
        shell.updateNav(state.index, state.queue.length);
    }

    function renderLineSection(contentSection, line) {
        const label = document.createElement("p");
        label.className = "practice-section-label";
        label.textContent = "Your line";
        contentSection.appendChild(label);

        if (state.revealed) {
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
        if (state.revealed) {
            return;
        }

        const item = readApi.getCurrentItem(state);

        if (!item || !state.script) {
            return;
        }

        state.revealed = true;
        readApi.recordSuccess(state, item);
        renderStep();
    }

    function moveIndex(delta) {
        const nextIndex = state.index + delta;

        if (nextIndex < 0 || nextIndex >= state.queue.length) {
            return;
        }

        state.index = nextIndex;
        state.revealed = false;
        renderStep();
    }

    function handleKeydown(event) {
        if (state.queue.length === 0 || isTypingTarget(event.target)) {
            return;
        }

        if (event.key === "ArrowLeft") {
            event.preventDefault();
            moveIndex(-1);
        }

        if (event.key === "ArrowRight") {
            event.preventDefault();
            moveIndex(1);
        }

        if (event.key === " " || event.key === "Enter") {
            if (!state.revealed) {
                event.preventDefault();
                revealCurrentLine();
            }
        }
    }

    document.addEventListener("keydown", handleKeydown);
    renderTool();
}
