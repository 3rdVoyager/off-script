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
        overviewRoot.appendChild(createEmptyState());
        return;
    }

    overviewRoot.appendChild(createScriptHeader(script));
    overviewRoot.appendChild(createStatsSection(script));
    overviewRoot.appendChild(createCharactersSection(script));
    overviewRoot.appendChild(createStructureSection(script));
}

function createEmptyState() {
    const section = document.createElement("section");
    section.className = "page-section";

    const empty = document.createElement("div");
    empty.className = "empty-state overview-empty-state";

    const message = document.createElement("p");
    message.textContent = "No active script. Add or select one on Manage Scripts.";
    empty.appendChild(message);

    const link = document.createElement("a");
    link.href = "/app/scripts/";
    link.className = "button-primary";
    link.textContent = "Manage Scripts";
    empty.appendChild(link);

    section.appendChild(empty);
    return section;
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
    const characters = getScriptCharacters(script);
    const section = document.createElement("section");
    section.className = "page-section";

    const heading = document.createElement("h2");
    heading.className = "page-section-title";
    heading.textContent = "Characters";
    section.appendChild(heading);

    if (characters.length === 0) {
        const empty = document.createElement("p");
        empty.className = "overview-muted";
        empty.textContent = "No spoken lines yet.";
        section.appendChild(empty);
        return section;
    }

    const list = document.createElement("ul");
    list.className = "overview-character-list";

    for (const character of characters) {
        const item = document.createElement("li");
        item.className = "overview-character-chip";
        item.textContent = character;
        list.appendChild(item);
    }

    section.appendChild(list);
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
    const characters = new Set();

    for (const act of script.acts) {
        for (const scene of act.scenes) {
            for (const character of getSceneCharacters(scene)) {
                characters.add(character);
            }
        }
    }

    return Array.from(characters).sort((a, b) => a.localeCompare(b));
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
