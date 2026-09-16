function createLineId(actIndex, sceneIndex, lineIndex) {
    return `${actIndex}-${sceneIndex}-${lineIndex}`;
}

function flattenScriptLines(script) {
    const lines = [];

    for (let actIndex = 0; actIndex < script.acts.length; actIndex++) {
        const act = script.acts[actIndex];

        for (let sceneIndex = 0; sceneIndex < act.scenes.length; sceneIndex++) {
            const scene = act.scenes[sceneIndex];

            for (let lineIndex = 0; lineIndex < scene.lines.length; lineIndex++) {
                const line = scene.lines[lineIndex];

                lines.push({
                    lineId: createLineId(actIndex, sceneIndex, lineIndex),
                    actIndex,
                    sceneIndex,
                    lineIndex,
                    actTitle: act.title,
                    sceneTitle: scene.title,
                    type: line.type,
                    character: line.type === "line" ? line.character.trim() : "",
                    text: line.text,
                });
            }
        }
    }

    return lines;
}

function getCueLine(lines, lineIndex) {
    for (let index = lineIndex - 1; index >= 0; index--) {
        return lines[index];
    }

    return null;
}

function buildPracticeQueue(script, practiceCharacters) {
    const allLines = flattenScriptLines(script);
    const characterSet = new Set(practiceCharacters);
    const items = [];

    for (let index = 0; index < allLines.length; index++) {
        const line = allLines[index];

        if (line.type !== "line" || !characterSet.has(line.character)) {
            continue;
        }

        items.push({
            line,
            cue: getCueLine(allLines, index),
        });
    }

    return items;
}
