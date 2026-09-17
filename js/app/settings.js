const scriptSettingsRoot = document.querySelector("[data-script-settings-root]");
const practiceSettingsRoot = document.querySelector("[data-practice-settings-root]");
const appSettingsRoot = document.querySelector("[data-app-settings-root]");

if (scriptSettingsRoot || practiceSettingsRoot || appSettingsRoot) {
    renderSettingsPage();
}

function renderSettingsPage() {
    renderScriptSettings();
    renderPracticeSettings();
    renderAppSettings();
}

function renderScriptSettings() {
    if (!scriptSettingsRoot) {
        return;
    }

    scriptSettingsRoot.replaceChildren();

    const { scripts, activeScriptId } = getScriptsData();

    const scriptRow = createSettingsRow({
        label: "Active script",
        hint: "The script you are currently learning. Click a title to switch.",
        control: createScriptPillGroup(scripts, activeScriptId),
        controlVariant: "pills",
    });

    scriptSettingsRoot.appendChild(scriptRow);
    wireScriptPillGroup(scriptRow);

    const addScriptRow = createAddScriptRow();
    scriptSettingsRoot.appendChild(addScriptRow);
    wireAddScriptForm(addScriptRow);
}

function createScriptPillGroup(scripts, activeScriptId) {
    const group = document.createElement("div");
    group.className = "settings-pill-group";
    group.setAttribute("data-script-pills", "");
    group.setAttribute("role", "radiogroup");
    group.setAttribute("aria-label", "Active script");

    if (scripts.length === 0) {
        const empty = document.createElement("p");
        empty.className = "settings-pill-empty";
        empty.textContent = "No scripts saved yet.";
        group.appendChild(empty);
        return group;
    }

    for (const script of scripts) {
        const isActive = String(script.id) === String(activeScriptId);

        const pill = document.createElement("div");
        pill.className = "settings-pill settings-script-pill";
        pill.setAttribute("data-script-pill", script.id);
        pill.setAttribute("role", "radio");
        pill.setAttribute("aria-checked", isActive ? "true" : "false");
        pill.setAttribute("tabindex", isActive ? "0" : "-1");

        if (isActive) {
            pill.classList.add("settings-pill--selected");
        }

        const label = document.createElement("span");
        label.className = "settings-script-pill-label";
        label.textContent = script.title;
        pill.appendChild(label);

        const deleteButton = document.createElement("button");
        deleteButton.type = "button";
        deleteButton.className = "settings-script-delete";
        deleteButton.setAttribute("data-delete-script", script.id);
        deleteButton.setAttribute("aria-label", `Delete ${script.title}`);

        const deleteIcon = document.createElement("span");
        deleteIcon.className = "material-icons";
        deleteIcon.setAttribute("aria-hidden", "true");
        deleteIcon.textContent = "delete";
        deleteButton.appendChild(deleteIcon);
        pill.appendChild(deleteButton);

        group.appendChild(pill);
    }

    return group;
}

function wireScriptPillGroup(scriptRow) {
    const pillGroup = scriptRow.querySelector("[data-script-pills]");

    if (!pillGroup) {
        return;
    }

    pillGroup.addEventListener("click", (event) => {
        const deleteButton = event.target.closest("[data-delete-script]");

        if (deleteButton) {
            event.stopPropagation();
            const scriptId = deleteButton.dataset.deleteScript;
            const data = getScriptsData();
            const script = data.scripts.find(
                (item) => String(item.id) === String(scriptId)
            );

            if (!script) {
                return;
            }

            const confirmed = confirm(`Delete "${script.title}"? This cannot be undone.`);

            if (!confirmed) {
                return;
            }

            const result = deleteScript(scriptId);

            if (!result.ok) {
                return;
            }

            deleteScriptSettings(scriptId);

            if (typeof deleteScriptProgress === "function") {
                deleteScriptProgress(scriptId);
            }

            updateInterface();
            showFeedback(`"${script.title}" deleted.`, "success");
            return;
        }

        const pill = event.target.closest("[data-script-pill]");

        if (!pill) {
            return;
        }

        const scriptId = pill.getAttribute("data-script-pill");
        const data = getScriptsData();

        if (String(data.activeScriptId) === String(scriptId)) {
            return;
        }

        const result = setActiveScript(scriptId);

        if (!result.ok) {
            return;
        }

        selectRadioPill(pillGroup, pill, "data-script-pill");
        updateInterface();
        showFeedback(`"${result.script.title}" is now active.`, "success");
    });
}

function renderPracticeSettings() {
    if (!practiceSettingsRoot) {
        return;
    }

    practiceSettingsRoot.replaceChildren();

    const script = getActiveScript();

    if (!script) {
        practiceSettingsRoot.appendChild(createEmptyState(
            "No active script. Choose one above to edit practice settings.",
            { variant: "minimal" }
        ));
        return;
    }

    const settings = getScriptSettings(script.id);
    const characters = getScriptCharacterNames(script);
    const scenes = getScriptSceneList(script);

    const characterRow = createSettingsRow({
        label: "Practice characters",
        hint: "Roles to include when practicing. Click to select or deselect. Multiple roles can be selected.",
        control: createMultiSelectPillGroup({
            items: characters.map((character) => ({ id: character, label: character })),
            selected: settings.practiceCharacters,
            dataAttribute: "data-character-pill",
            groupAttribute: "data-practice-characters",
            ariaLabel: "Practice characters",
            emptyMessage: "No characters in this script yet.",
        }),
        controlVariant: "pills",
    });

    const sceneRow = createSettingsRow({
        label: "Practice scenes",
        hint: "Scenes to include when practicing. All scenes are included until you change this.",
        control: createMultiSelectPillGroup({
            items: scenes,
            selected: getPracticeSceneSelection(settings.practiceScenes, scenes),
            dataAttribute: "data-scene-pill",
            groupAttribute: "data-practice-scenes",
            ariaLabel: "Practice scenes",
            emptyMessage: "No scenes in this script yet.",
        }),
        controlVariant: "pills",
    });

    practiceSettingsRoot.appendChild(characterRow);
    practiceSettingsRoot.appendChild(sceneRow);

    wireCharacterPillGroup(characterRow, script);
    wireScenePillGroup(sceneRow, script, scenes);
}

function wireCharacterPillGroup(characterRow, script) {
    const pillGroup = characterRow.querySelector("[data-practice-characters]");

    pillGroup.addEventListener("click", (event) => {
        const pill = event.target.closest("[data-character-pill]");

        if (!pill) {
            return;
        }

        togglePill(pill);

        const selected = getSelectedPillIds(pillGroup, "data-character-pill");

        saveScriptSettings(script.id, {
            practiceCharacters: selected,
        });
        updateInterface();
        showFeedback("Practice settings saved.");
    });
}

function wireScenePillGroup(sceneRow, script, scenes) {
    const pillGroup = sceneRow.querySelector("[data-practice-scenes]");
    const allSceneIds = scenes.map((scene) => scene.id);

    pillGroup.addEventListener("click", (event) => {
        const pill = event.target.closest("[data-scene-pill]");

        if (!pill) {
            return;
        }

        togglePill(pill);

        const selected = getSelectedPillIds(pillGroup, "data-scene-pill");

        saveScriptSettings(script.id, {
            practiceScenes: practiceScenesFromSelection(selected, allSceneIds),
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

