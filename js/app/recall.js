const recallApi = createPracticeApi("recall");

function mountRecallTool(root) {
    const state = {
        queue: [],
        index: 0,
        completed: false,
        script: null,
        practiceCharacters: [],
    };

    let shell = null;
    let lineInput = null;

    function renderTool() {
        root.replaceChildren();
        lineInput = null;

        const session = recallApi.loadSession(state);

        if (!session.ok) {
            root.appendChild(session.element);
            shell = null;
            return;
        }

        state.completed = false;

        shell = recallApi.createShell({
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

        const item = recallApi.getCurrentItem(state);

        if (!item) {
            return;
        }

        state.completed = false;

        shell.meta.textContent = recallApi.formatMeta(item, state.index, state.queue.length);
        recallApi.renderCue(shell.cueSection, item.cue);
        shell.contentSection.replaceChildren();
        renderInputSection(shell.contentSection, item.line);
        shell.updateNav(state.index, state.queue.length);
    }

    function renderInputSection(contentSection, line) {
        const label = document.createElement("p");
        label.className = "practice-section-label";
        label.textContent = "Type your line";
        contentSection.appendChild(label);

        const hint = document.createElement("p");
        hint.className = "practice-cue-empty";
        hint.textContent = "Type the full line from memory. Small typos are OK — press Check or Enter.";
        contentSection.appendChild(hint);

        lineInput = createFullLineInput(line.text, {
            onComplete: handleLineComplete,
            onEnterWhenComplete: () => moveIndex(1),
        });

        contentSection.appendChild(lineInput.element);
        lineInput.focus();
    }

    function handleLineComplete() {
        if (state.completed) {
            return;
        }

        const item = recallApi.getCurrentItem(state);

        if (!item || !state.script) {
            return;
        }

        state.completed = true;
        recallApi.recordSuccess(state, item);
    }

    function moveIndex(delta) {
        const nextIndex = state.index + delta;

        if (nextIndex < 0 || nextIndex >= state.queue.length) {
            return;
        }

        state.index = nextIndex;
        state.completed = false;
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
    }

    document.addEventListener("keydown", handleKeydown);
    renderTool();
}

document.addEventListener("DOMContentLoaded", () => {
    const root = document.querySelector("[data-recall-root]");

    if (root) {
        mountRecallTool(root);
    }
});
