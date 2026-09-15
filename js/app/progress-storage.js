const PROGRESS_STORAGE_KEY = "offscript-progress";

function getProgressData() {
    const data = readJson(PROGRESS_STORAGE_KEY, null);

    if (!data || typeof data !== "object" || typeof data.byScriptId !== "object") {
        return { byScriptId: {} };
    }

    return { byScriptId: data.byScriptId };
}

function saveProgressData(data) {
    writeJson(PROGRESS_STORAGE_KEY, {
        byScriptId: data.byScriptId ?? {},
    });
}

function getCharacterProgress(scriptId, character) {
    if (!scriptId || !character) {
        return { lines: {} };
    }

    const data = getProgressData();
    const scriptProgress = data.byScriptId[String(scriptId)];
    const characterProgress = scriptProgress?.byCharacter?.[character];

    if (!characterProgress || typeof characterProgress.lines !== "object") {
        return { lines: {} };
    }

    return { lines: characterProgress.lines };
}

function getLineMastery(scriptId, character, lineId) {
    const progress = getCharacterProgress(scriptId, character);
    const mastery = progress.lines[String(lineId)];

    if (typeof mastery !== "number") {
        return 0;
    }

    return Math.min(1, Math.max(0, mastery));
}

function recordLineProgress(scriptId, character, lineId, toolName) {
    if (!scriptId || !character || !lineId) {
        return { ok: false, error: "Missing progress context." };
    }

    const data = getProgressData();
    const scriptKey = String(scriptId);
    const characterKey = String(character);
    const lineKey = String(lineId);

    if (!data.byScriptId[scriptKey]) {
        data.byScriptId[scriptKey] = { byCharacter: {} };
    }

    if (!data.byScriptId[scriptKey].byCharacter[characterKey]) {
        data.byScriptId[scriptKey].byCharacter[characterKey] = { lines: {} };
    }

    const characterProgress = data.byScriptId[scriptKey].byCharacter[characterKey];
    const previousMastery = getLineMastery(scriptId, character, lineId);
    const nextMastery = applyPracticeScore(previousMastery, toolName);

    characterProgress.lines[lineKey] = nextMastery;
    saveProgressData(data);

    return {
        ok: true,
        previousMastery,
        nextMastery,
    };
}

function getScriptMasteryPercent(script, practiceCharacter, showStageDirections) {
    if (!script || !practiceCharacter) {
        return 0;
    }

    const queue = buildPracticeQueue(script, practiceCharacter, showStageDirections);

    if (queue.length === 0) {
        return 0;
    }

    let total = 0;

    for (const item of queue) {
        total += getLineMastery(script.id, practiceCharacter, item.line.lineId);
    }

    return Math.round((total / queue.length) * 100);
}

function deleteScriptProgress(scriptId) {
    if (!scriptId) {
        return;
    }

    const data = getProgressData();

    delete data.byScriptId[String(scriptId)];
    saveProgressData(data);
}
