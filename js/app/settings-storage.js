const GLOBAL_SETTINGS_KEY = "offscript-global-settings";
const SCRIPT_SETTINGS_KEY = "offscript-script-settings";

const DEFAULT_GLOBAL_SETTINGS = {};

const DEFAULT_SCRIPT_SETTINGS = {
    practiceCharacters: [],
    practiceScenes: null,
};

function normalizePracticeCharacters(saved) {
    if (!saved || typeof saved !== "object") {
        return [];
    }

    if (Array.isArray(saved.practiceCharacters)) {
        return saved.practiceCharacters.filter(
            (character) => typeof character === "string" && character.trim()
        );
    }

    if (typeof saved.practiceCharacter === "string" && saved.practiceCharacter.trim()) {
        return [saved.practiceCharacter.trim()];
    }

    return [];
}

function normalizePracticeScenes(saved) {
    if (!saved || typeof saved !== "object" || !("practiceScenes" in saved)) {
        return null;
    }

    if (!Array.isArray(saved.practiceScenes)) {
        return null;
    }

    return saved.practiceScenes.filter(
        (sceneId) => typeof sceneId === "string" && sceneId.trim()
    );
}

function getGlobalSettings() {
    const data = readJson(GLOBAL_SETTINGS_KEY, null);

    if (!data || typeof data !== "object") {
        return { ...DEFAULT_GLOBAL_SETTINGS };
    }

    return {
        ...DEFAULT_GLOBAL_SETTINGS,
        ...data,
    };
}

function saveGlobalSettings(settings) {
    const current = getGlobalSettings();

    writeJson(GLOBAL_SETTINGS_KEY, {
        ...DEFAULT_GLOBAL_SETTINGS,
        ...current,
        ...settings,
    });
}

function getScriptSettingsData() {
    const data = readJson(SCRIPT_SETTINGS_KEY, null);

    if (!data || typeof data !== "object" || typeof data.byScriptId !== "object") {
        return { byScriptId: {} };
    }

    return { byScriptId: data.byScriptId };
}

function saveScriptSettingsData(data) {
    writeJson(SCRIPT_SETTINGS_KEY, {
        byScriptId: data.byScriptId ?? {},
    });
}

function getScriptSettings(scriptId) {
    if (!scriptId) {
        return { ...DEFAULT_SCRIPT_SETTINGS };
    }

    const data = getScriptSettingsData();
    const saved = data.byScriptId[String(scriptId)];

    return {
        practiceCharacters: normalizePracticeCharacters(saved),
        practiceScenes: normalizePracticeScenes(saved),
    };
}

function saveScriptSettings(scriptId, settings) {
    if (!scriptId) {
        return { ok: false, error: "No script selected." };
    }

    const data = getScriptSettingsData();
    const current = getScriptSettings(scriptId);

    data.byScriptId[String(scriptId)] = {
        practiceCharacters: settings.practiceCharacters ?? current.practiceCharacters,
        practiceScenes: settings.practiceScenes !== undefined
            ? settings.practiceScenes
            : current.practiceScenes,
    };
    saveScriptSettingsData(data);

    return { ok: true };
}

function deleteScriptSettings(scriptId) {
    if (!scriptId) {
        return;
    }

    const data = getScriptSettingsData();

    delete data.byScriptId[String(scriptId)];
    saveScriptSettingsData(data);
}
