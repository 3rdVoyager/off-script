const practiceSettingsRoot = document.querySelector("[data-practice-settings-root]");
const appSettingsRoot = document.querySelector("[data-app-settings-root]");

if (practiceSettingsRoot || appSettingsRoot) {
    renderSettingsPage();
}

function renderSettingsPage() {
    renderPracticeSettings();
    renderAppSettings();
}

function renderPracticeSettings() {
    if (!practiceSettingsRoot) {
        return;
    }

    practiceSettingsRoot.replaceChildren();

    const script = getActiveScript();

    if (!script) {
        const empty = document.createElement("p");
        empty.className = "settings-empty-message";
        empty.textContent = "No active script. Load one on Manage Scripts to edit practice settings.";
        practiceSettingsRoot.appendChild(empty);
        return;
    }

    const settings = getScriptSettings(script.id);
    const characters = getScriptCharacters(script);

    const characterRow = createSettingsRow({
        id: "practice-character",
        label: "Practice character",
        hint: "Your role when using Read, Recite, and Recall. Applies to the active script.",
        control: createSelectControl({
            id: "practice-character",
            value: settings.practiceCharacter,
            options: [
                { value: "", label: "Not set" },
                ...characters.map((character) => ({
                    value: character,
                    label: character,
                })),
            ],
        }),
    });

    const stageDirectionsRow = createSettingsRow({
        id: "show-stage-directions",
        label: "Show stage directions",
        hint: "Include stage directions during practice tools.",
        control: createToggleControl({
            id: "show-stage-directions",
            checked: settings.showStageDirections,
        }),
    });

    practiceSettingsRoot.appendChild(characterRow);
    practiceSettingsRoot.appendChild(stageDirectionsRow);

    characterRow.querySelector("select").addEventListener("change", (event) => {
        saveScriptSettings(script.id, {
            practiceCharacter: event.target.value,
        });
        showFeedback("Practice settings saved.");
    });

    stageDirectionsRow.querySelector("input").addEventListener("change", (event) => {
        saveScriptSettings(script.id, {
            showStageDirections: event.target.checked,
        });
        showFeedback("Practice settings saved.");
    });
}

function renderAppSettings() {
    if (!appSettingsRoot) {
        return;
    }

    appSettingsRoot.replaceChildren();

    const empty = document.createElement("p");
    empty.className = "settings-empty-message";
    empty.textContent = "No app settings yet.";
    appSettingsRoot.appendChild(empty);
}

function createSettingsRow({ id, label, hint, control }) {
    const row = document.createElement("div");
    row.className = "settings-row";

    const info = document.createElement("div");
    info.className = "settings-row-info";

    const labelElement = document.createElement("label");
    labelElement.className = "settings-row-label";
    labelElement.setAttribute("for", id);
    labelElement.textContent = label;
    info.appendChild(labelElement);

    if (hint) {
        const hintElement = document.createElement("p");
        hintElement.className = "settings-row-hint";
        hintElement.textContent = hint;
        info.appendChild(hintElement);
    }

    const controlWrap = document.createElement("div");
    controlWrap.className = "settings-row-control";
    controlWrap.appendChild(control);

    row.appendChild(info);
    row.appendChild(controlWrap);
    return row;
}

function createSelectControl({ id, value, options }) {
    const select = document.createElement("select");
    select.id = id;
    select.className = "settings-control settings-control--select";

    for (const option of options) {
        const optionElement = document.createElement("option");
        optionElement.value = option.value;
        optionElement.textContent = option.label;

        if (option.value === value) {
            optionElement.selected = true;
        }

        select.appendChild(optionElement);
    }

    return select;
}

function createToggleControl({ id, checked }) {
    const input = document.createElement("input");
    input.type = "checkbox";
    input.id = id;
    input.className = "settings-control settings-control--toggle";
    input.checked = checked;
    return input;
}

function getScriptCharacters(script) {
    const characters = new Set();

    for (const act of script.acts) {
        for (const scene of act.scenes) {
            for (const line of scene.lines) {
                if (line.type === "line" && line.character.trim()) {
                    characters.add(line.character.trim());
                }
            }
        }
    }

    return Array.from(characters).sort((a, b) => a.localeCompare(b));
}
