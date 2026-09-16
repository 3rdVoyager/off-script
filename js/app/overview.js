const overviewRoot = document.querySelector("[data-overview-root]");

if (overviewRoot) {
    renderOverview();
}

function renderOverview() {
    if (!overviewRoot) {
        return;
    }

    const script = getActiveScript();

    overviewRoot.replaceChildren();

    if (!script) {
        overviewRoot.appendChild(createEmptyState(
            "No active script. Add or select one in Settings.",
            {
                action: { label: "Open Settings", href: "/app/settings/" },
                centered: true,
                wrapInSection: true,
            }
        ));
        return;
    }

    overviewRoot.appendChild(createScriptHeader(script));
    overviewRoot.appendChild(createStatsSection(script));
    overviewRoot.appendChild(createCharactersSection(script));
    overviewRoot.appendChild(createStructureSection(script));
}

function createScriptHeader(script) {
    const section = document.createElement("section");
    section.className = "page-section overview-hero";

    const title = document.createElement("h2");
    title.className = "overview-title";
    title.textContent = script.title;
    section.appendChild(title);

    if (script.notes && script.notes.trim()) {
        const notes = document.createElement("p");
        notes.className = "overview-notes";
        notes.textContent = script.notes.trim();
        section.appendChild(notes);
    }

    return section;
}

function createStatsSection(script) {
    const stats = getScriptStats(script);
    const section = document.createElement("section");
    section.className = "page-section";

    const heading = document.createElement("h2");
    heading.className = "page-section-title";
    heading.textContent = "At a glance";
    section.appendChild(heading);

    const grid = document.createElement("div");
    grid.className = "stat-grid";

    grid.appendChild(createStatCard(String(stats.actCount), stats.actCount === 1 ? "Act" : "Acts"));
    grid.appendChild(createStatCard(String(stats.sceneCount), stats.sceneCount === 1 ? "Scene" : "Scenes"));
    grid.appendChild(createStatCard(String(stats.characterCount), stats.characterCount === 1 ? "Character" : "Characters"));
    grid.appendChild(createStatCard(String(stats.spokenLineCount), "Spoken lines"));

    section.appendChild(grid);
    return section;
}

function createStatCard(value, label) {
    const card = document.createElement("article");
    card.className = "stat-card";

    const valueElement = document.createElement("p");
    valueElement.className = "stat-card-value";
    valueElement.textContent = value;

    const labelElement = document.createElement("p");
    labelElement.className = "stat-card-label";
    labelElement.textContent = label;

    card.appendChild(valueElement);
    card.appendChild(labelElement);
    return card;
}

function createCharactersSection(script) {
    const characterStats = getCharacterStatsList(script);
    const section = document.createElement("section");
    section.className = "page-section";

    const heading = document.createElement("h2");
    heading.className = "page-section-title";
    heading.textContent = "Characters";
    section.appendChild(heading);

    if (characterStats.length === 0) {
        const empty = document.createElement("p");
        empty.className = "overview-muted";
        empty.textContent = "No spoken lines yet.";
        section.appendChild(empty);
        return section;
    }

    const practiceCharacters = typeof getScriptSettings === "function"
        ? getScriptSettings(script.id).practiceCharacters
        : [];
    const practiceCharacterSet = new Set(practiceCharacters);

    section.appendChild(createDataTable({
        columns: ["Character", "Lines", "Scenes", "Acts"],
        rows: characterStats.map((character) => ({
            label: character.name,
            cells: [
                character.lineCount,
                character.sceneCount,
                character.actCount,
            ],
            rowClassName: practiceCharacterSet.has(character.name)
                ? "data-table-row--highlight"
                : "",
        })),
    }));
    return section;
}

function createStructureSection(script) {
    const section = document.createElement("section");
    section.className = "page-section";

    const heading = document.createElement("h2");
    heading.className = "page-section-title";
    heading.textContent = "Structure";
    section.appendChild(heading);

    const actsContainer = document.createElement("div");
    actsContainer.className = "overview-acts";

    for (const act of script.acts) {
        actsContainer.appendChild(createActBlock(act));
    }

    section.appendChild(actsContainer);
    return section;
}

function createActBlock(act) {
    const block = document.createElement("article");
    block.className = "overview-act";

    const title = document.createElement("h3");
    title.className = "overview-act-title";
    title.textContent = act.title;
    block.appendChild(title);

    const sceneList = document.createElement("ul");
    sceneList.className = "overview-scene-list";

    for (const scene of act.scenes) {
        sceneList.appendChild(createSceneItem(scene));
    }

    block.appendChild(sceneList);
    return block;
}

function createSceneItem(scene) {
    const item = document.createElement("li");
    item.className = "overview-scene";

    const titleRow = document.createElement("div");
    titleRow.className = "overview-scene-header";

    const title = document.createElement("h4");
    title.className = "overview-scene-title";
    title.textContent = scene.title;

    const meta = document.createElement("p");
    meta.className = "overview-scene-meta";
    meta.textContent = formatSceneMeta(scene);

    titleRow.appendChild(title);
    titleRow.appendChild(meta);
    item.appendChild(titleRow);

    const characters = getSceneCharacters(scene);

    if (characters.length > 0) {
        const characterList = document.createElement("p");
        characterList.className = "overview-scene-characters";
        characterList.textContent = characters.join(" · ");
        item.appendChild(characterList);
    }

    return item;
}

function formatSceneMeta(scene) {
    const lineCount = scene.lines.length;
    const spokenCount = scene.lines.filter((line) => line.type === "line").length;
    const lineLabel = lineCount === 1 ? "line" : "lines";
    const spokenLabel = spokenCount === 1 ? "spoken line" : "spoken lines";

    return `${lineCount} ${lineLabel} · ${spokenCount} ${spokenLabel}`;
}

function getScriptStats(script) {
    let sceneCount = 0;
    let spokenLineCount = 0;

    for (const act of script.acts) {
        sceneCount += act.scenes.length;

        for (const scene of act.scenes) {
            spokenLineCount += scene.lines.filter((line) => line.type === "line").length;
        }
    }

    return {
        actCount: script.acts.length,
        sceneCount,
        characterCount: getScriptCharacters(script).length,
        spokenLineCount,
    };
}

function getScriptCharacters(script) {
    return getCharacterStatsList(script).map((character) => character.name);
}

function getCharacterStatsList(script) {
    const statsByCharacter = new Map();

    for (let actIndex = 0; actIndex < script.acts.length; actIndex++) {
        const act = script.acts[actIndex];

        for (let sceneIndex = 0; sceneIndex < act.scenes.length; sceneIndex++) {
            const scene = act.scenes[sceneIndex];
            const charactersInScene = new Set();

            for (const line of scene.lines) {
                if (line.type !== "line" || !line.character.trim()) {
                    continue;
                }

                const name = line.character.trim();
                charactersInScene.add(name);

                if (!statsByCharacter.has(name)) {
                    statsByCharacter.set(name, {
                        name,
                        lineCount: 0,
                        sceneCount: 0,
                        actCount: 0,
                        sceneKeys: new Set(),
                        actKeys: new Set(),
                    });
                }

                statsByCharacter.get(name).lineCount += 1;
            }

            for (const name of charactersInScene) {
                const stats = statsByCharacter.get(name);
                const sceneKey = `${actIndex}-${sceneIndex}`;

                if (!stats.sceneKeys.has(sceneKey)) {
                    stats.sceneKeys.add(sceneKey);
                    stats.sceneCount += 1;
                }

                if (!stats.actKeys.has(actIndex)) {
                    stats.actKeys.add(actIndex);
                    stats.actCount += 1;
                }
            }
        }
    }

    return Array.from(statsByCharacter.values())
        .map(({ name, lineCount, sceneCount, actCount }) => ({
            name,
            lineCount,
            sceneCount,
            actCount,
        }))
        .sort((a, b) => a.name.localeCompare(b.name));
}

function getSceneCharacters(scene) {
    const characters = new Set();

    for (const line of scene.lines) {
        if (line.type === "line" && line.character.trim()) {
            characters.add(line.character.trim());
        }
    }

    return Array.from(characters).sort((a, b) => a.localeCompare(b));
}
