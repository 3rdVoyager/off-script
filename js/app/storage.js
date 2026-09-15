const SCRIPTS_STORAGE_KEY = "offscript-scripts";

function getScriptsData() {
    const raw = localStorage.getItem(SCRIPTS_STORAGE_KEY);

    if (!raw) {
        return { activeScriptId: null, scripts: [] };
    }

    try {
        const data = JSON.parse(raw);

        if (!data || !Array.isArray(data.scripts)) {
            return { activeScriptId: null, scripts: [] };
        }

        return {
            activeScriptId: data.activeScriptId ?? null,
            scripts: data.scripts,
        };
    } catch {
        return { activeScriptId: null, scripts: [] };
    }
}

function saveScriptsData(data) {
    localStorage.setItem(SCRIPTS_STORAGE_KEY, JSON.stringify(data));
}

function validateScript(script) {
    if (!script || typeof script !== "object") {
        return "Script must be a JSON object.";
    }

    if (script.schemaVersion !== 1) {
        return "schemaVersion must be 1.";
    }

    if (script.type !== "play") {
        return 'Only scripts with type "play" are supported right now.';
    }

    if (typeof script.title !== "string" || script.title.trim() === "") {
        return "Script must have a title.";
    }

    if (!Array.isArray(script.acts) || script.acts.length === 0) {
        return "Script must have at least one act.";
    }

    for (const act of script.acts) {
        if (typeof act.title !== "string" || act.title.trim() === "") {
            return "Each act must have a title.";
        }

        if (!Array.isArray(act.scenes) || act.scenes.length === 0) {
            return "Each act must have at least one scene.";
        }

        for (const scene of act.scenes) {
            if (typeof scene.title !== "string" || scene.title.trim() === "") {
                return "Each scene must have a title.";
            }

            if (!Array.isArray(scene.lines)) {
                return "Each scene must have a lines array.";
            }

            for (const line of scene.lines) {
                if (line.type !== "line" && line.type !== "direction") {
                    return 'Each line must have type "line" or "direction".';
                }

                if (typeof line.text !== "string") {
                    return "Each line must have text.";
                }

                if (line.type === "line") {
                    if (typeof line.character !== "string" || line.character.trim() === "") {
                        return 'Each spoken line must have a character.';
                    }
                }
            }
        }
    }

    return null;
}

function createScriptId() {
    if (typeof crypto !== "undefined" && typeof crypto.randomUUID === "function") {
        return crypto.randomUUID();
    }

    return `${Date.now()}-${Math.random().toString(36).slice(2, 11)}`;
}

function normalizeScript(script) {
    const { id: _uploadedId, ...scriptWithoutId } = script;

    return {
        ...scriptWithoutId,
        id: createScriptId(),
        title: script.title.trim(),
    };
}

function saveScript(script) {
    const validationError = validateScript(script);

    if (validationError) {
        return { ok: false, error: validationError };
    }

    const normalizedScript = normalizeScript(script);
    const data = getScriptsData();

    data.scripts.push(normalizedScript);
    data.activeScriptId = normalizedScript.id;
    saveScriptsData(data);

    return { ok: true, script: normalizedScript };
}

function getActiveScript() {
    const data = getScriptsData();

    if (!data.activeScriptId) {
        return null;
    }

    return data.scripts.find(
        (script) => String(script.id) === String(data.activeScriptId)
    ) ?? null;
}

function setActiveScript(scriptId) {
    const data = getScriptsData();
    const script = data.scripts.find(
        (item) => String(item.id) === String(scriptId)
    );

    if (!script) {
        return { ok: false, error: "Script not found." };
    }

    data.activeScriptId = script.id;
    saveScriptsData(data);

    return { ok: true, script };
}

function deleteScript(scriptId) {
    const data = getScriptsData();
    const index = data.scripts.findIndex(
        (script) => String(script.id) === String(scriptId)
    );

    if (index < 0) {
        return { ok: false, error: "Script not found." };
    }

    data.scripts.splice(index, 1);

    if (String(data.activeScriptId) === String(scriptId)) {
        data.activeScriptId = data.scripts[0]?.id ?? null;
    }

    saveScriptsData(data);

    return { ok: true };
}
