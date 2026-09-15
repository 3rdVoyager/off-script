function splitLineIntoWords(text) {
    return text.trim().split(/\s+/).filter(Boolean);
}

function createFirstLetterLineInput(targetLine, options = {}) {
    const words = splitLineIntoWords(targetLine);
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
