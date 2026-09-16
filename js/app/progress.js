const progressRoot = document.querySelector("[data-progress-root]");

if (progressRoot) {
    renderProgress();
}

function renderProgress() {
    if (!progressRoot) {
        return;
    }

    progressRoot.replaceChildren();

    const script = getActiveScript();

    if (!script) {
        progressRoot.appendChild(createEmptyState(
            "No active script. Add or select one on Manage Scripts.",
            {
                action: { label: "Manage Scripts", href: "/app/scripts/" },
                centered: true,
                wrapInSection: true,
            }
        ));
        return;
    }

    const settings = getScriptSettings(script.id);

    if (settings.practiceCharacters.length === 0) {
        progressRoot.appendChild(createEmptyState(
            "Choose at least one practice character in Settings to track progress.",
            {
                action: { label: "Open Settings", href: "/app/settings/" },
                centered: true,
                wrapInSection: true,
            }
        ));
        return;
    }

    if (Array.isArray(settings.practiceScenes) && settings.practiceScenes.length === 0) {
        progressRoot.appendChild(createEmptyState(
            "Choose at least one practice scene in Settings to track progress.",
            {
                action: { label: "Open Settings", href: "/app/settings/" },
                centered: true,
                wrapInSection: true,
            }
        ));
        return;
    }

    const summary = getPracticeProgressSummary(
        script,
        settings.practiceCharacters,
        settings.practiceScenes
    );

    if (summary.totalLines === 0) {
        progressRoot.appendChild(createEmptyState(
            "No practice lines match your current character and scene settings.",
            {
                action: { label: "Open Settings", href: "/app/settings/" },
                centered: true,
                wrapInSection: true,
            }
        ));
        return;
    }

    progressRoot.appendChild(createProgressHero(script, summary));
    progressRoot.appendChild(createProgressSummarySection(summary));
    progressRoot.appendChild(createPracticeScopeSection(script, settings));
    progressRoot.appendChild(createCharacterProgressSection(script, settings));
    progressRoot.appendChild(createSceneProgressSection(script, settings));

    if (summary.percent === 0) {
        progressRoot.appendChild(createPracticeCallToAction());
    }
}

function createProgressHero(script, summary) {
    const section = document.createElement("section");
    section.className = "page-section progress-hero";

    const content = document.createElement("div");
    content.className = "progress-hero-content";

    const text = document.createElement("div");
    text.className = "progress-hero-text";

    const title = document.createElement("h2");
    title.className = "progress-hero-title";
    title.textContent = script.title;
    text.appendChild(title);

    const subtitle = document.createElement("p");
    subtitle.className = "progress-hero-subtitle";
    subtitle.textContent = "Overall mastery across your current practice lines.";
    text.appendChild(subtitle);

    content.appendChild(text);
    content.appendChild(createMasteryDial(summary.percent));
    section.appendChild(content);

    return section;
}

function createMasteryDial(percent) {
    const dial = document.createElement("div");
    dial.className = "progress-mastery-dial";
    dial.setAttribute("role", "img");
    dial.setAttribute("aria-label", `Mastery ${percent}%`);
    dial.style.setProperty("--mastery-percent", String(percent));

    const ring = document.createElement("div");
    ring.className = "progress-mastery-dial-ring";
    ring.setAttribute("aria-hidden", "true");
    dial.appendChild(ring);

    const value = document.createElement("span");
    value.className = "progress-mastery-dial-value";
    value.textContent = `${percent}%`;
    dial.appendChild(value);

    return dial;
}

function createProgressSummarySection(summary) {
    const section = document.createElement("section");
    section.className = "page-section";

    const heading = document.createElement("h2");
    heading.className = "page-section-title";
    heading.textContent = "Summary";
    section.appendChild(heading);

    const grid = document.createElement("div");
    grid.className = "stat-grid";

    grid.appendChild(createStatCard(`${summary.percent}%`, "Overall mastery"));
    grid.appendChild(createStatCard(
        `${summary.practicedCount} / ${summary.totalLines}`,
        "Lines started"
    ));
    grid.appendChild(createStatCard(
        String(summary.masteredCount),
        summary.masteredCount === 1 ? "Line mastered" : "Lines mastered"
    ));
    grid.appendChild(createStatCard(
        String(summary.totalLines - summary.practicedCount),
        "Lines not started"
    ));

    section.appendChild(grid);
    return section;
}

function createPracticeScopeSection(script, settings) {
    const section = document.createElement("section");
    section.className = "page-section";

    const heading = document.createElement("h2");
    heading.className = "page-section-title";
    heading.textContent = "What you are learning";
    section.appendChild(heading);

    const card = document.createElement("article");
    card.className = "card progress-scope-card";

    const characters = document.createElement("p");
    characters.className = "progress-scope-line";
    characters.innerHTML = `<strong>Characters:</strong> ${settings.practiceCharacters.join(", ")}`;
    card.appendChild(characters);

    const scenes = document.createElement("p");
    scenes.className = "progress-scope-line";
    scenes.innerHTML = `<strong>Scenes:</strong> ${formatPracticeScenesLabel(script, settings.practiceScenes)}`;
    card.appendChild(scenes);

    const link = document.createElement("a");
    link.href = "/app/settings/";
    link.className = "progress-scope-link";
    link.textContent = "Change practice settings";
    card.appendChild(link);

    section.appendChild(card);
    return section;
}

function formatPracticeScenesLabel(script, practiceScenes) {
    const allScenes = getScriptScenes(script);

    if (practiceScenes === null || practiceScenes.length === allScenes.length) {
        return `All scenes (${allScenes.length})`;
    }

    const sceneLabels = allScenes
        .filter((scene) => practiceScenes.includes(scene.id))
        .map((scene) => scene.label);

    return sceneLabels.join(" · ");
}

function createCharacterProgressSection(script, settings) {
    const characterStats = getCharacterProgressStats(
        script,
        settings.practiceCharacters,
        settings.practiceScenes
    );
    const section = document.createElement("section");
    section.className = "page-section";

    const heading = document.createElement("h2");
    heading.className = "page-section-title";
    heading.textContent = "By character";
    section.appendChild(heading);

    section.appendChild(createDataTable({
        columns: ["Character", "Lines", "Started", "Mastered", "Mastery"],
        wrapClassName: "data-table-wrap--meter",
        rows: characterStats.map((character) => ({
            label: character.name,
            cells: [
                character.lineCount,
                character.practicedCount,
                character.masteredCount,
                createProgressBar(character.percent),
            ],
        })),
    }));

    return section;
}

function createSceneProgressSection(script, settings) {
    const sceneStats = getSceneProgressStats(
        script,
        settings.practiceCharacters,
        settings.practiceScenes
    );
    const section = document.createElement("section");
    section.className = "page-section";

    const heading = document.createElement("h2");
    heading.className = "page-section-title";
    heading.textContent = "By scene";
    section.appendChild(heading);

    section.appendChild(createDataTable({
        columns: ["Scene", "Lines", "Started", "Mastered", "Mastery"],
        wrapClassName: "data-table-wrap--meter",
        rows: sceneStats.map((scene) => ({
            label: scene.label,
            cells: [
                scene.lineCount,
                scene.practicedCount,
                scene.masteredCount,
                createProgressBar(scene.percent),
            ],
        })),
    }));

    return section;
}

function createProgressBar(percent) {
    const wrap = document.createElement("div");
    wrap.className = "progress-bar-wrap";

    const bar = document.createElement("div");
    bar.className = "progress-bar";
    bar.setAttribute("role", "progressbar");
    bar.setAttribute("aria-valuemin", "0");
    bar.setAttribute("aria-valuemax", "100");
    bar.setAttribute("aria-valuenow", String(percent));
    bar.setAttribute("aria-label", `${percent}% mastery`);

    const fill = document.createElement("div");
    fill.className = "progress-bar-fill";
    fill.style.width = `${percent}%`;
    bar.appendChild(fill);

    const label = document.createElement("span");
    label.className = "progress-bar-label";
    label.textContent = `${percent}%`;

    wrap.appendChild(bar);
    wrap.appendChild(label);
    return wrap;
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

function createPracticeCallToAction() {
    const section = document.createElement("section");
    section.className = "page-section progress-cta";

    const card = document.createElement("article");
    card.className = "card progress-cta-card";

    const text = document.createElement("p");
    text.textContent = "Start with Read, move to Recite, then use Recall to type each line from memory.";
    card.appendChild(text);

    const actions = document.createElement("div");
    actions.className = "page-actions";

    const readLink = document.createElement("a");
    readLink.href = "/app/practice/?tool=read";
    readLink.className = "button-primary";
    readLink.textContent = "Start Read";
    actions.appendChild(readLink);

    const reciteLink = document.createElement("a");
    reciteLink.href = "/app/practice/?tool=recite";
    reciteLink.className = "button-secondary";
    reciteLink.textContent = "Start Recite";
    actions.appendChild(reciteLink);

    const recallLink = document.createElement("a");
    recallLink.href = "/app/practice/?tool=recall";
    recallLink.className = "button-secondary";
    recallLink.textContent = "Start Recall";
    actions.appendChild(recallLink);

    card.appendChild(actions);
    section.appendChild(card);
    return section;
}

function getScriptScenes(script) {
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
