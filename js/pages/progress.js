const progressRoot = document.querySelector("[data-progress-root]");

if (progressRoot) {
    renderProgress();
}

function renderProgress() {
    if (!progressRoot) {
        return;
    }

    if (typeof markOnboardingProgressVisited === "function") {
        markOnboardingProgressVisited();
    }

    progressRoot.replaceChildren();

    const script = getActiveScript();

    if (!script) {
        progressRoot.appendChild(createEmptyState(
            "No active script. Add or select one in Settings.",
            {
                action: { label: "Open Settings", href: "/app/settings/" },
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

function createPracticeCallToAction() {
    const section = document.createElement("section");
    section.className = "page-section progress-cta";

    const card = document.createElement("article");
    card.className = "card progress-cta-card";

    const text = document.createElement("p");
    text.textContent = "Start with Read, move to Recite, then use Recall to type each line from memory.";
    card.appendChild(text);

    card.appendChild(createPracticeToolActions({ primaryToolId: "read", primaryLabelPrefix: "Start" }));
    section.appendChild(card);
    return section;
}

