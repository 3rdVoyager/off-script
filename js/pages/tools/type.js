const typeApi = createPracticeApi("type");

function mountTypeTool(root) {
    let lineInput = null;

    const session = createPracticeLineSession(root, typeApi, {
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
        hint.textContent = "Type the full line from memory. Small typos are OK — press Check or Enter.";
        contentSection.appendChild(hint);

        lineInput = createRecallFullLineInput(line.text, {
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

function normalizeRecallLine(text) {
    return text
        .toLowerCase()
        .replace(/[^\w\s]/g, "")
        .replace(/\s+/g, " ")
        .trim();
}

function splitRecallLineIntoWords(text) {
    return normalizeRecallLine(text).split(" ").filter(Boolean);
}

function recallLevenshteinDistance(a, b) {
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

function recallWordsSimilar(typedWord, expectedWord) {
    if (typedWord === expectedWord) {
        return true;
    }

    const maxDistance = expectedWord.length <= 4 ? 1 : 2;

    return recallLevenshteinDistance(typedWord, expectedWord) <= maxDistance;
}

function getRecallWordMatchScore(typedText, expectedText) {
    const typedWords = splitRecallLineIntoWords(typedText);
    const expectedWords = splitRecallLineIntoWords(expectedText);

    if (expectedWords.length === 0) {
        return typedWords.length === 0 ? 1 : 0;
    }

    let matched = 0;
    let typedIndex = 0;

    for (const expectedWord of expectedWords) {
        let found = false;

        while (typedIndex < typedWords.length) {
            if (recallWordsSimilar(typedWords[typedIndex], expectedWord)) {
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

function getRecallCharacterSimilarity(typedText, expectedText) {
    const typed = normalizeRecallLine(typedText);
    const expected = normalizeRecallLine(expectedText);
    const maxLength = Math.max(typed.length, expected.length);

    if (maxLength === 0) {
        return 1;
    }

    return 1 - recallLevenshteinDistance(typed, expected) / maxLength;
}

function recallLinesMatch(typedText, expectedText) {
    const typed = normalizeRecallLine(typedText);
    const expected = normalizeRecallLine(expectedText);

    if (typed === expected) {
        return true;
    }

    const threshold = typeof LINE_MATCH_THRESHOLD === "number" ? LINE_MATCH_THRESHOLD : 0.9;
    const wordScore = getRecallWordMatchScore(typedText, expectedText);

    if (wordScore >= threshold) {
        return true;
    }

    const characterThreshold = Math.min(0.96, threshold + 0.05);

    return getRecallCharacterSimilarity(typedText, expectedText) >= characterThreshold;
}

function createRecallFullLineInput(targetLine, options = {}) {
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

        if (recallLinesMatch(input.value, targetLine)) {
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

    if (!normalizeRecallLine(targetLine)) {
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

registerPracticeToolMount("type", mountTypeTool);
