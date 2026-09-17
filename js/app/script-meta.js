function getScriptCharacterNames(script) {
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

function getScriptSceneList(script) {
    const scenes = [];

    for (let actIndex = 0; actIndex < script.acts.length; actIndex++) {
        const act = script.acts[actIndex];

        for (let sceneIndex = 0; sceneIndex < act.scenes.length; sceneIndex++) {
            const scene = act.scenes[sceneIndex];

            scenes.push({
                id: createSceneId(actIndex, sceneIndex),
                label: `${act.title} · ${scene.title}`,
            });
        }
    }

    return scenes;
}

function getScriptStructureStats(script) {
    let sceneCount = 0;
    let spokenLineCount = 0;
    const characters = new Set();

    for (const act of script.acts) {
        sceneCount += act.scenes.length;

        for (const scene of act.scenes) {
            for (const line of scene.lines) {
                if (line.type !== "line") {
                    continue;
                }

                spokenLineCount += 1;

                if (line.character.trim()) {
                    characters.add(line.character.trim());
                }
            }
        }
    }

    return {
        actCount: script.acts.length,
        sceneCount,
        characterCount: characters.size,
        spokenLineCount,
    };
}

function formatPracticeScenesLabel(script, practiceScenes) {
    const allScenes = getScriptSceneList(script);

    if (practiceScenes === null || practiceScenes.length === allScenes.length) {
        return `All scenes (${allScenes.length})`;
    }

    const sceneLabels = allScenes
        .filter((scene) => practiceScenes.includes(scene.id))
        .map((scene) => scene.label);

    return sceneLabels.join(" · ");
}
