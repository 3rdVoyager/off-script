const GLOBAL_SETTINGS_KEY = "offscript-global-settings";
const SCRIPT_SETTINGS_KEY = "offscript-script-settings";

const DEFAULT_GLOBAL_SETTINGS = {};

const DEFAULT_SCRIPT_SETTINGS = {
    practiceCharacter: "",
    showStageDirections: true,
};

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

    if (!saved || typeof saved !== "object") {
        return { ...DEFAULT_SCRIPT_SETTINGS };
    }

    return {
        ...DEFAULT_SCRIPT_SETTINGS,
        ...saved,
    };
}

function saveScriptSettings(scriptId, settings) {
    if (!scriptId) {
        return { ok: false, error: "No script selected." };
    }

    const data = getScriptSettingsData();
    const current = getScriptSettings(scriptId);

    data.byScriptId[String(scriptId)] = {
        ...DEFAULT_SCRIPT_SETTINGS,
        ...current,
        ...settings,
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
