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
        practiceSettingsRoot.appendChild(createEmptyState(
            "No active script. Load one on Manage Scripts to edit practice settings.",
            { variant: "minimal" }
        ));
        return;
    }

    const settings = getScriptSettings(script.id);
    const characters = getScriptCharacters(script);

    const characterRow = createSettingsRow({
        label: "Practice characters",
        hint: "Roles to include when using Read, Recite, and Recall. Applies to the active script.",
        control: createCharacterPillGroup({
            characters,
            selected: settings.practiceCharacters,
        }),
        controlVariant: "pills",
    });

    practiceSettingsRoot.appendChild(characterRow);

    const pillGroup = characterRow.querySelector("[data-practice-characters]");

    pillGroup.addEventListener("click", (event) => {
        const pill = event.target.closest("[data-character-pill]");

        if (!pill) {
            return;
        }

        const character = pill.getAttribute("data-character-pill");
        const isSelected = pill.classList.toggle("settings-pill--selected");
        pill.setAttribute("aria-pressed", isSelected ? "true" : "false");

        const selected = Array.from(
            pillGroup.querySelectorAll(".settings-pill--selected")
        ).map((button) => button.getAttribute("data-character-pill"));

        saveScriptSettings(script.id, {
            practiceCharacters: selected,
        });
        updateInterface();
        showFeedback("Practice settings saved.");
    });
}

function renderAppSettings() {
    if (!appSettingsRoot) {
        return;
    }

    appSettingsRoot.replaceChildren();

    appSettingsRoot.appendChild(createEmptyState("No app settings yet.", { variant: "minimal" }));
}

function createSettingsRow({ label, hint, control, controlVariant }) {
    const row = document.createElement("div");
    row.className = "settings-row";

    if (controlVariant === "pills") {
        row.classList.add("settings-row--pills");
    }

    const info = document.createElement("div");
    info.className = "settings-row-info";

    const labelElement = document.createElement("p");
    labelElement.className = "settings-row-label";
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

    if (controlVariant === "pills") {
        controlWrap.classList.add("settings-row-control--pills");
    }

    controlWrap.appendChild(control);

    row.appendChild(info);
    row.appendChild(controlWrap);
    return row;
}

function createCharacterPillGroup({ characters, selected }) {
    const selectedSet = new Set(selected);
    const group = document.createElement("div");
    group.className = "settings-pill-group";
    group.setAttribute("data-practice-characters", "");
    group.setAttribute("role", "group");
    group.setAttribute("aria-label", "Practice characters");

    if (characters.length === 0) {
        const empty = document.createElement("p");
        empty.className = "settings-pill-empty";
        empty.textContent = "No characters in this script yet.";
        group.appendChild(empty);
        return group;
    }

    for (const character of characters) {
        const pill = document.createElement("button");
        pill.type = "button";
        pill.className = "settings-pill";
        pill.setAttribute("data-character-pill", character);
        pill.textContent = character;

        const isSelected = selectedSet.has(character);

        if (isSelected) {
            pill.classList.add("settings-pill--selected");
        }

        pill.setAttribute("aria-pressed", isSelected ? "true" : "false");
        group.appendChild(pill);
    }

    return group;
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
