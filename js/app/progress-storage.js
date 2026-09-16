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

function getPracticeQueueWithMastery(script, practiceCharacters, practiceScenes) {
    const queue = buildPracticeQueue(script, practiceCharacters, practiceScenes);

    return queue.map((item) => ({
        item,
        mastery: getLineMastery(script.id, item.line.character, item.line.lineId),
    }));
}

function isLineMastered(mastery) {
    return mastery >= 0.99;
}

function getPracticeProgressSummary(script, practiceCharacters, practiceScenes) {
    const lines = getPracticeQueueWithMastery(script, practiceCharacters, practiceScenes);
    let totalMastery = 0;
    let practicedCount = 0;
    let masteredCount = 0;

    for (const { mastery } of lines) {
        totalMastery += mastery;

        if (mastery > 0) {
            practicedCount += 1;
        }

        if (isLineMastered(mastery)) {
            masteredCount += 1;
        }
    }

    const totalLines = lines.length;

    return {
        totalLines,
        percent: totalLines === 0 ? 0 : Math.round((totalMastery / totalLines) * 100),
        practicedCount,
        masteredCount,
    };
}

function getCharacterProgressStats(script, practiceCharacters, practiceScenes) {
    const lines = getPracticeQueueWithMastery(script, practiceCharacters, practiceScenes);
    const statsByCharacter = new Map();

    for (const { item, mastery } of lines) {
        const name = item.line.character;

        if (!statsByCharacter.has(name)) {
            statsByCharacter.set(name, {
                name,
                lineCount: 0,
                totalMastery: 0,
                practicedCount: 0,
                masteredCount: 0,
            });
        }

        const stats = statsByCharacter.get(name);
        stats.lineCount += 1;
        stats.totalMastery += mastery;

        if (mastery > 0) {
            stats.practicedCount += 1;
        }

        if (isLineMastered(mastery)) {
            stats.masteredCount += 1;
        }
    }

    return Array.from(statsByCharacter.values())
        .map((stats) => ({
            name: stats.name,
            lineCount: stats.lineCount,
            practicedCount: stats.practicedCount,
            masteredCount: stats.masteredCount,
            percent: Math.round((stats.totalMastery / stats.lineCount) * 100),
        }))
        .sort((a, b) => a.name.localeCompare(b.name));
}

function getSceneProgressStats(script, practiceCharacters, practiceScenes) {
    const lines = getPracticeQueueWithMastery(script, practiceCharacters, practiceScenes);
    const statsByScene = new Map();

    for (const { item, mastery } of lines) {
        const sceneId = createSceneId(item.line.actIndex, item.line.sceneIndex);

        if (!statsByScene.has(sceneId)) {
            statsByScene.set(sceneId, {
                sceneId,
                label: `${item.line.actTitle} · ${item.line.sceneTitle}`,
                lineCount: 0,
                totalMastery: 0,
                practicedCount: 0,
                masteredCount: 0,
            });
        }

        const stats = statsByScene.get(sceneId);
        stats.lineCount += 1;
        stats.totalMastery += mastery;

        if (mastery > 0) {
            stats.practicedCount += 1;
        }

        if (isLineMastered(mastery)) {
            stats.masteredCount += 1;
        }
    }

    return Array.from(statsByScene.values())
        .map((stats) => ({
            sceneId: stats.sceneId,
            label: stats.label,
            lineCount: stats.lineCount,
            practicedCount: stats.practicedCount,
            masteredCount: stats.masteredCount,
            percent: Math.round((stats.totalMastery / stats.lineCount) * 100),
        }));
}

function getScriptMasteryPercent(script, practiceCharacters, practiceScenes) {
    if (!script || !Array.isArray(practiceCharacters) || practiceCharacters.length === 0) {
        return 0;
    }

    if (Array.isArray(practiceScenes) && practiceScenes.length === 0) {
        return 0;
    }

    return getPracticeProgressSummary(script, practiceCharacters, practiceScenes).percent;
}

function deleteScriptProgress(scriptId) {
    if (!scriptId) {
        return;
    }

    const data = getProgressData();

    delete data.byScriptId[String(scriptId)];
    saveProgressData(data);
}
