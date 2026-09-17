const readApi = createPracticeApi("read");

function mountReadTool(root) {
    const session = createPracticeLineSession(root, readApi, {
        createState: () => ({
            queue: [],
            index: 0,
            revealed: false,
            script: null,
            practiceCharacters: [],
        }),
        onResetStep: (state) => {
            state.revealed = false;
        },
        renderStep: ({ shell, state, api }) => {
            const item = api.getCurrentItem(state);

            if (!item) {
                return;
            }

            shell.meta.textContent = api.formatMeta(item, state.index, state.queue.length);
            api.renderCue(shell.cueSection, item.cue);
            shell.contentSection.replaceChildren();
            shell.contentSection.classList.toggle("practice-content--correct", state.revealed);
            renderLineSection(shell.contentSection, item.line, state, api);
            shell.updateNav(state.index, state.queue.length);
        },
        onKeydownExtra: (event) => {
            if (event.key === " " || event.key === "Enter") {
                if (!session.state.revealed) {
                    event.preventDefault();
                    revealCurrentLine(session.state, session.renderStep, readApi);
                }
            }
        },
    });

    function renderLineSection(contentSection, line, state, api) {
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
        revealButton.addEventListener("click", () => {
            revealCurrentLine(state, session.renderStep, api);
        });
        contentSection.appendChild(revealButton);
    }
}

function revealCurrentLine(state, renderStep, api) {
    if (state.revealed) {
        return;
    }

    const item = api.getCurrentItem(state);

    if (!item || !state.script) {
        return;
    }

    state.revealed = true;
    api.recordSuccess(state, item);
    renderStep();
}
