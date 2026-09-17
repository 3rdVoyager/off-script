const firstLetterApi = createPracticeApi("first-letter");

function mountFirstLetterTool(root) {
    let lineInput = null;

    const session = createPracticeLineSession(root, firstLetterApi, {
        createState: () => ({
            queue: [],
            index: 0,
            completed: false,
            script: null,
            practiceCharacters: [],
        }),
        onResetStep: (state) => {
            state.completed = false;
        },
        renderStep: ({ shell, state, api, moveIndex }) => {
            const item = api.getCurrentItem(state);

            if (!item) {
                return;
            }

            state.completed = false;
            lineInput = null;

            shell.meta.textContent = api.formatMeta(item, state.index, state.queue.length);
            api.renderCue(shell.cueSection, item.cue);
            shell.contentSection.replaceChildren();
            renderInputSection(shell.contentSection, item.line, state, api, moveIndex);
            shell.updateNav(state.index, state.queue.length);
        },
    });

    function renderInputSection(contentSection, line, state, api, moveIndex) {
        const label = document.createElement("p");
        label.className = "practice-section-label";
        label.textContent = "Type your line";
        contentSection.appendChild(label);

        const hint = document.createElement("p");
        hint.className = "practice-cue-empty";
        hint.textContent = "Type the first letter of each word to fill it in.";
        contentSection.appendChild(hint);

        lineInput = createReciteFirstLetterInput(line.text, {
            onComplete: () => {
                if (state.completed) {
                    return;
                }

                const item = api.getCurrentItem(state);

                if (!item || !state.script) {
                    return;
                }

                state.completed = true;
                api.recordSuccess(state, item);
            },
            onEnterWhenComplete: () => moveIndex(1),
        });

        contentSection.appendChild(lineInput.element);
        lineInput.focus();
    }
}

function normalizeReciteLine(text) {
    return text
        .toLowerCase()
        .replace(/[^\w\s]/g, "")
        .replace(/\s+/g, " ")
        .trim();
}

function splitReciteLineIntoWords(text) {
    return normalizeReciteLine(text).split(" ").filter(Boolean);
}

function createReciteFirstLetterInput(targetLine, options = {}) {
    const words = splitReciteLineIntoWords(targetLine);
    const { onComplete, onEnterWhenComplete } = options;

    let wordIndex = 0;
    let filledText = "";
    let isComplete = false;

    const container = document.createElement("div");
    container.className = "practice-line-input-wrap";

    const input = document.createElement("input");
    input.type = "text";
    input.className = "practice-line-input";
    input.autocomplete = "off";
    input.spellcheck = false;
    container.appendChild(input);

    function showError() {
        input.classList.add("practice-line-input--error");

        window.setTimeout(() => {
            input.classList.remove("practice-line-input--error");
        }, 400);
    }

    function finishLine() {
        isComplete = true;
        input.disabled = true;
        input.classList.add("practice-line-input--complete");

        if (onComplete) {
            onComplete();
        }
    }

    function completeCurrentWord() {
        const word = words[wordIndex];
        const needsSpace = wordIndex < words.length - 1;

        filledText += word + (needsSpace ? " " : "");
        wordIndex += 1;
        input.value = filledText;

        if (wordIndex >= words.length) {
            finishLine();
        }
    }

    function reset() {
        wordIndex = 0;
        filledText = "";
        isComplete = false;
        input.value = "";
        input.disabled = false;
        input.classList.remove("practice-line-input--error", "practice-line-input--complete");
    }

    function focus() {
        input.focus();
    }

    if (words.length === 0) {
        finishLine();
    }

    input.addEventListener("keydown", (event) => {
        if (isComplete) {
            if (event.key === "Enter" && onEnterWhenComplete) {
                event.preventDefault();
                onEnterWhenComplete();
                return;
            }

            event.preventDefault();
            return;
        }

        if (event.key === "Backspace" || event.key === "Delete") {
            event.preventDefault();
            return;
        }

        if (event.key === " ") {
            event.preventDefault();
            return;
        }

        if (event.key.length !== 1) {
            return;
        }

        event.preventDefault();

        const expectedWord = words[wordIndex];
        const expectedChar = expectedWord[0];

        if (event.key.toLowerCase() !== expectedChar.toLowerCase()) {
            showError();
            return;
        }

        completeCurrentWord();
    });

    input.addEventListener("input", () => {
        if (input.value !== filledText) {
            input.value = filledText;
        }
    });

    return {
        element: container,
        input,
        reset,
        focus,
        isComplete: () => isComplete,
    };
}

registerPracticeToolMount("first-letter", mountFirstLetterTool);
