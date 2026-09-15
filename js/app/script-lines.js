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

function getCueLine(lines, lineIndex, showStageDirections) {
    for (let index = lineIndex - 1; index >= 0; index--) {
        const line = lines[index];

        if (line.type === "direction" && !showStageDirections) {
            continue;
        }

        return line;
    }

    return null;
}

function buildPracticeQueue(script, practiceCharacter, showStageDirections) {
    const allLines = flattenScriptLines(script);
    const items = [];

    for (let index = 0; index < allLines.length; index++) {
        const line = allLines[index];

        if (line.type !== "line" || line.character !== practiceCharacter) {
            continue;
        }

        items.push({
            line,
            cue: getCueLine(allLines, index, showStageDirections),
        });
    }

    return items;
}
