function normalizeLineForCompare(text) {
    return text
        .toLowerCase()
        .replace(/[^\w\s]/g, "")
        .replace(/\s+/g, " ")
        .trim();
}

function splitLineIntoWords(text) {
    return normalizeLineForCompare(text).split(" ").filter(Boolean);
}

function levenshteinDistance(a, b) {
    const rows = a.length + 1;
    const cols = b.length + 1;
    const distances = Array.from({ length: rows }, () => new Array(cols).fill(0));

    for (let row = 0; row < rows; row++) {
        distances[row][0] = row;
    }

    for (let col = 0; col < cols; col++) {
        distances[0][col] = col;
    }

    for (let row = 1; row < rows; row++) {
        for (let col = 1; col < cols; col++) {
            const cost = a[row - 1] === b[col - 1] ? 0 : 1;

            distances[row][col] = Math.min(
                distances[row - 1][col] + 1,
                distances[row][col - 1] + 1,
                distances[row - 1][col - 1] + cost
            );
        }
    }

    return distances[rows - 1][cols - 1];
}

function wordsSimilar(typedWord, expectedWord) {
    if (typedWord === expectedWord) {
        return true;
    }

    const maxDistance = expectedWord.length <= 4 ? 1 : 2;

    return levenshteinDistance(typedWord, expectedWord) <= maxDistance;
}

function getWordMatchScore(typedText, expectedText) {
    const typedWords = splitLineIntoWords(typedText);
    const expectedWords = splitLineIntoWords(expectedText);

    if (expectedWords.length === 0) {
        return typedWords.length === 0 ? 1 : 0;
    }

    let matched = 0;
    let typedIndex = 0;

    for (const expectedWord of expectedWords) {
        let found = false;

        while (typedIndex < typedWords.length) {
            if (wordsSimilar(typedWords[typedIndex], expectedWord)) {
                matched += 1;
                typedIndex += 1;
                found = true;
                break;
            }

            typedIndex += 1;
        }

        if (!found) {
            break;
        }
    }

    let score = matched / expectedWords.length;

    if (typedWords.length > expectedWords.length) {
        const extraWords = typedWords.length - expectedWords.length;
        score -= Math.min(0.15, extraWords * 0.03);
    }

    return Math.max(0, score);
}

function getCharacterSimilarity(typedText, expectedText) {
    const typed = normalizeLineForCompare(typedText);
    const expected = normalizeLineForCompare(expectedText);
    const maxLength = Math.max(typed.length, expected.length);

    if (maxLength === 0) {
        return 1;
    }

    return 1 - levenshteinDistance(typed, expected) / maxLength;
}

function linesMatch(typedText, expectedText) {
    const typed = normalizeLineForCompare(typedText);
    const expected = normalizeLineForCompare(expectedText);

    if (typed === expected) {
        return true;
    }

    const threshold = typeof LINE_MATCH_THRESHOLD === "number" ? LINE_MATCH_THRESHOLD : 0.9;
    const wordScore = getWordMatchScore(typedText, expectedText);

    if (wordScore >= threshold) {
        return true;
    }

    const characterThreshold = Math.min(0.96, threshold + 0.05);

    return getCharacterSimilarity(typedText, expectedText) >= characterThreshold;
}

function createFullLineInput(targetLine, options = {}) {
    const { onComplete, onEnterWhenComplete } = options;
    let isComplete = false;

    const container = document.createElement("div");
    container.className = "practice-line-input-wrap practice-line-input-wrap--recall";

    const input = document.createElement("textarea");
    input.className = "practice-line-input practice-line-input--multiline";
    input.autocomplete = "off";
    input.spellcheck = false;
    input.rows = 3;
    container.appendChild(input);

    const checkButton = document.createElement("button");
    checkButton.type = "button";
    checkButton.className = "practice-check-button";
    checkButton.textContent = "Check";
    container.appendChild(checkButton);

    function showError() {
        input.classList.add("practice-line-input--error");

        window.setTimeout(() => {
            input.classList.remove("practice-line-input--error");
        }, 400);
    }

    function finishLine() {
        isComplete = true;
        input.disabled = true;
        checkButton.disabled = true;
        input.classList.add("practice-line-input--complete");

        if (onComplete) {
            onComplete();
        }
    }

    function checkAnswer() {
        if (isComplete) {
            return;
        }

        if (linesMatch(input.value, targetLine)) {
            finishLine();
            showFeedback("Correct answer!", "success");
            return;
        }

        showError();
        showFeedback("Incorrect answer. Try again.", "error");
    }

    function reset() {
        isComplete = false;
        input.value = "";
        input.disabled = false;
        checkButton.disabled = false;
        input.classList.remove("practice-line-input--error", "practice-line-input--complete");
    }

    function focus() {
        input.focus();
    }

    if (!normalizeLineForCompare(targetLine)) {
        finishLine();
    }

    checkButton.addEventListener("click", checkAnswer);

    input.addEventListener("keydown", (event) => {
        if (isComplete) {
            if (event.key === "Enter" && !event.shiftKey && onEnterWhenComplete) {
                event.preventDefault();
                onEnterWhenComplete();
            }

            return;
        }

        if (event.key === "Enter" && !event.shiftKey) {
            event.preventDefault();
            checkAnswer();
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
