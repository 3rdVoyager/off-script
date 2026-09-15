const scriptList = document.querySelector("[data-script-list]");

if (scriptList) {
    renderScriptList();

    scriptList.addEventListener("click", (event) => {
        const deleteButton = event.target.closest("[data-delete-script]");

        if (deleteButton) {
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
            renderScriptList();
            updateSidebarScriptTitle();
            return;
        }

        const card = event.target.closest("[data-script-id]");

        if (!card) {
            return;
        }

        const scriptId = card.dataset.scriptId;
        const data = getScriptsData();

        if (String(data.activeScriptId) === String(scriptId)) {
            return;
        }

        const result = setActiveScript(scriptId);

        if (!result.ok) {
            return;
        }

        renderScriptList();
        updateSidebarScriptTitle();
        showFeedback(`"${result.script.title}" is now active.`, "success");
    });
}

function renderScriptList() {
    if (!scriptList) {
        return;
    }

    const { scripts, activeScriptId } = getScriptsData();

    scriptList.replaceChildren();

    if (scripts.length === 0) {
        const empty = document.createElement("p");
        empty.className = "empty-state";
        empty.textContent = "No scripts saved yet. Add one below.";
        scriptList.appendChild(empty);
        return;
    }

    const list = document.createElement("ul");
    list.className = "script-list-items";

    for (const script of scripts) {
        list.appendChild(createScriptCard(script, activeScriptId));
    }

    scriptList.appendChild(list);
}

function createScriptCard(script, activeScriptId) {
    const item = document.createElement("li");
    const isActive = String(script.id) === String(activeScriptId);

    item.className = isActive ? "script-card script-card--active" : "script-card";
    item.dataset.scriptId = script.id;

    const header = document.createElement("div");
    header.className = "script-card-header";

    const title = document.createElement("h3");
    title.className = "script-card-title";
    title.textContent = script.title;

    header.appendChild(title);

    const actions = document.createElement("div");
    actions.className = "script-card-actions";

    if (isActive) {
        const badge = document.createElement("span");
        badge.className = "script-card-badge";
        badge.textContent = "Active";
        actions.appendChild(badge);
    }

    const deleteButton = document.createElement("button");
    deleteButton.type = "button";
    deleteButton.className = "script-card-delete";
    deleteButton.dataset.deleteScript = script.id;
    deleteButton.setAttribute("aria-label", `Delete ${script.title}`);

    const deleteIcon = document.createElement("span");
    deleteIcon.className = "material-icons";
    deleteIcon.setAttribute("aria-hidden", "true");
    deleteIcon.textContent = "delete";
    deleteButton.appendChild(deleteIcon);

    actions.appendChild(deleteButton);
    header.appendChild(actions);

    item.appendChild(header);

    if (script.notes && script.notes.trim()) {
        const notes = document.createElement("p");
        notes.className = "script-card-notes";
        notes.textContent = script.notes.trim();
        item.appendChild(notes);
    }

    const meta = document.createElement("p");
    meta.className = "script-card-meta";
    meta.textContent = formatScriptMeta(script);
    item.appendChild(meta);

    return item;
}

function formatScriptMeta(script) {
    const actCount = script.acts.length;
    const sceneCount = getSceneCount(script);
    const actLabel = actCount === 1 ? "act" : "acts";
    const sceneLabel = sceneCount === 1 ? "scene" : "scenes";

    return `${actCount} ${actLabel} · ${sceneCount} ${sceneLabel}`;
}

function getSceneCount(script) {
    let count = 0;

    for (const act of script.acts) {
        count += act.scenes.length;
    }

    return count;
}
