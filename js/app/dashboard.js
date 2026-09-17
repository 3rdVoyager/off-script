const dashboardRoot = document.querySelector("[data-dashboard-root]");

if (dashboardRoot) {
    renderDashboard();
}

function renderDashboard() {
    if (!dashboardRoot) {
        return;
    }

    dashboardRoot.replaceChildren();

    if (typeof syncOnboardingFromAppState === "function") {
        syncOnboardingFromAppState();
    }

    const scriptsData = getScriptsData();
    const script = getActiveScript();

    if (scriptsData.scripts.length === 0) {
        dashboardRoot.appendChild(createGettingStartedSection());
        dashboardRoot.appendChild(createWelcomeSection());
        return;
    }

    if (!script) {
        dashboardRoot.appendChild(createEmptyState(
            "No active script. Select one in Settings.",
            {
                action: { label: "Open Settings", href: "/app/settings/" },
                centered: true,
                wrapInSection: true,
            }
        ));
        return;
    }

    const settings = getScriptSettings(script.id);
    const hasPracticeSetup =
        settings.practiceCharacters.length > 0 &&
        !(Array.isArray(settings.practiceScenes) && settings.practiceScenes.length === 0);

    let summary = null;

    if (hasPracticeSetup) {
        summary = getPracticeProgressSummary(
            script,
            settings.practiceCharacters,
            settings.practiceScenes
        );
    }

    dashboardRoot.appendChild(createGettingStartedSection());
    dashboardRoot.appendChild(createDashboardHero(script, summary, hasPracticeSetup));
    dashboardRoot.appendChild(createDashboardStatsSection(script, summary, scriptsData.scripts.length));
    dashboardRoot.appendChild(createPracticeToolsSection());
    dashboardRoot.appendChild(createQuickLinksSection());
}

function createGettingStartedSection() {
    const status = getGettingStartedStatus();

    if (status.collapsed) {
        return createGettingStartedCollapsedBar(status);
    }

    return createGettingStartedExpandedSection(status);
}

function createGettingStartedCollapsedBar(status) {
    const section = document.createElement("section");
    section.className = "page-section getting-started getting-started--collapsed";

    const bar = document.createElement("div");
    bar.className = "getting-started-collapsed-bar";

    const text = document.createElement("div");
    text.className = "getting-started-collapsed-text";

    const label = document.createElement("p");
    label.className = "getting-started-collapsed-label";
    label.textContent = status.allComplete ? "You're all set!" : "Getting started";
    text.appendChild(label);

    const progress = document.createElement("p");
    progress.className = "getting-started-collapsed-progress";
    progress.textContent = `${status.completedCount} of ${status.totalCount} complete`;
    text.appendChild(progress);

    bar.appendChild(text);

    const expandButton = document.createElement("button");
    expandButton.type = "button";
    expandButton.className = "button-secondary getting-started-toggle";
    expandButton.innerHTML = '<span class="material-icons" aria-hidden="true">expand_more</span><span>Expand</span>';
    expandButton.addEventListener("click", () => {
        setGettingStartedCollapsed(false);
        renderDashboard();
    });
    bar.appendChild(expandButton);

    section.appendChild(bar);
    return section;
}

function createGettingStartedExpandedSection(status) {
    const section = document.createElement("section");
    section.className = "page-section getting-started";

    const header = document.createElement("div");
    header.className = "getting-started-header";

    const title = document.createElement("h2");
    title.className = "page-section-title";
    title.textContent = status.allComplete ? "You're all set!" : "Getting started";
    header.appendChild(title);

    const collapseButton = document.createElement("button");
    collapseButton.type = "button";
    collapseButton.className = "button-secondary getting-started-toggle";
    collapseButton.innerHTML = '<span class="material-icons" aria-hidden="true">expand_less</span><span>Collapse</span>';
    collapseButton.addEventListener("click", () => {
        setGettingStartedCollapsed(true);
        renderDashboard();
    });
    header.appendChild(collapseButton);

    section.appendChild(header);

    if (status.allComplete) {
        const text = document.createElement("p");
        text.className = "getting-started-complete-text";
        text.textContent = "You have the basics down. Keep practicing with Read, Recite, and Recall.";
        section.appendChild(text);
        return section;
    }

    const list = document.createElement("ol");
    list.className = "getting-started-steps";

    for (const step of status.steps) {
        list.appendChild(createGettingStartedStep(step));
    }

    section.appendChild(list);
    return section;
}

function createGettingStartedStep(step) {
    const item = document.createElement("li");
    item.className = step.complete
        ? "getting-started-step getting-started-step--complete"
        : "getting-started-step";

    const icon = document.createElement("span");
    icon.className = "material-icons getting-started-step-icon";
    icon.setAttribute("aria-hidden", "true");
    icon.textContent = step.complete ? "check_circle" : "radio_button_unchecked";
    item.appendChild(icon);

    const content = document.createElement("div");
    content.className = "getting-started-step-content";

    if (step.complete) {
        const label = document.createElement("p");
        label.className = "getting-started-step-label";
        label.textContent = step.label;
        content.appendChild(label);
    } else {
        const link = document.createElement("a");
        link.href = step.href;
        link.className = "getting-started-step-link";
        link.textContent = step.label;
        content.appendChild(link);
    }

    const description = document.createElement("p");
    description.className = "getting-started-step-description";
    description.textContent = step.description;
    content.appendChild(description);

    item.appendChild(content);
    return item;
}

function createWelcomeSection() {
    const section = document.createElement("section");
    section.className = "page-section dashboard-welcome";

    const card = document.createElement("article");
    card.className = "card dashboard-welcome-card";

    const title = document.createElement("h2");
    title.className = "dashboard-welcome-title";
    title.textContent = "Welcome to OffScript!";
    card.appendChild(title);

    const text = document.createElement("p");
    text.textContent = "Add a script to start practicing your lines with Read, Recite, and Recall.";
    card.appendChild(text);

    const actions = document.createElement("div");
    actions.className = "page-actions";

    const scriptsLink = document.createElement("a");
    scriptsLink.href = "/app/settings/";
    scriptsLink.className = "button-primary";
    scriptsLink.textContent = "Open Settings";
    actions.appendChild(scriptsLink);

    card.appendChild(actions);
    section.appendChild(card);

    return section;
}

function createDashboardHero(script, summary, hasPracticeSetup) {
    const section = document.createElement("section");
    section.className = "page-section dashboard-hero";

    const content = document.createElement("div");
    content.className = "dashboard-hero-content";

    const text = document.createElement("div");
    text.className = "dashboard-hero-text";

    const label = document.createElement("p");
    label.className = "dashboard-hero-label";
    label.textContent = "Current script";
    text.appendChild(label);

    const title = document.createElement("h2");
    title.className = "dashboard-hero-title";
    title.textContent = script.title;
    text.appendChild(title);

    const subtitle = document.createElement("p");
    subtitle.className = "dashboard-hero-subtitle";

    if (!hasPracticeSetup) {
        subtitle.textContent = "Choose practice characters and scenes in Settings to start tracking mastery.";
    } else if (summary.totalLines === 0) {
        subtitle.textContent = "No practice lines match your current settings.";
    } else if (summary.percent === 0) {
        subtitle.textContent = "Ready to practice. Start with Read, then move to Recite and Recall.";
    } else {
        subtitle.textContent = `${summary.masteredCount} of ${summary.totalLines} practice lines mastered.`;
    }

    text.appendChild(subtitle);

    if (!hasPracticeSetup) {
        const settingsLink = document.createElement("a");
        settingsLink.href = "/app/settings/";
        settingsLink.className = "dashboard-hero-link";
        settingsLink.textContent = "Open Settings";
        text.appendChild(settingsLink);
    }

    content.appendChild(text);

    if (hasPracticeSetup && summary && summary.totalLines > 0) {
        content.appendChild(createMasteryDial(summary.percent));
    }

    section.appendChild(content);
    return section;
}

function createDashboardStatsSection(script, summary, scriptCount) {
    const section = document.createElement("section");
    section.className = "page-section";

    const heading = document.createElement("h2");
    heading.className = "page-section-title";
    heading.textContent = "At a glance";
    section.appendChild(heading);

    const grid = document.createElement("div");
    grid.className = "stat-grid";

    if (summary && summary.totalLines > 0) {
        grid.appendChild(createStatCard(`${summary.percent}%`, "Overall mastery"));
        grid.appendChild(createStatCard(
            String(summary.masteredCount),
            summary.masteredCount === 1 ? "Line mastered" : "Lines mastered"
        ));
        grid.appendChild(createStatCard(
            `${summary.practicedCount} / ${summary.totalLines}`,
            "Lines started"
        ));
    } else {
        const stats = getScriptStructureStats(script);

        grid.appendChild(createStatCard(String(stats.actCount), stats.actCount === 1 ? "Act" : "Acts"));
        grid.appendChild(createStatCard(String(stats.sceneCount), stats.sceneCount === 1 ? "Scene" : "Scenes"));
        grid.appendChild(createStatCard(String(stats.spokenLineCount), "Spoken lines"));
    }

    grid.appendChild(createStatCard(String(scriptCount), scriptCount === 1 ? "Script saved" : "Scripts saved"));

    section.appendChild(grid);
    return section;
}

function createPracticeToolsSection() {
    const section = document.createElement("section");
    section.className = "page-section";

    const heading = document.createElement("h2");
    heading.className = "page-section-title";
    heading.textContent = "Practice tools";
    section.appendChild(heading);

    const intro = document.createElement("p");
    intro.className = "dashboard-section-intro";
    intro.textContent = "Work through Read, Recite, and Recall to build line mastery.";
    section.appendChild(intro);

    const grid = document.createElement("div");
    grid.className = "tools-grid";

    for (const tool of getPracticeToolsForNav()) {
        grid.appendChild(createPracticeToolCard(tool));
    }

    section.appendChild(grid);
    return section;
}

function createPracticeToolCard(tool) {
    const link = document.createElement("a");
    link.href = tool.href;
    link.className = "tool-card dashboard-tool-card";

    const icon = document.createElement("span");
    icon.className = "material-icons dashboard-tool-card-icon";
    icon.setAttribute("aria-hidden", "true");
    icon.textContent = tool.icon;
    link.appendChild(icon);

    const title = document.createElement("h3");
    title.className = "tool-card-title";
    title.textContent = tool.label;
    link.appendChild(title);

    const description = document.createElement("p");
    description.className = "tool-card-description";
    description.textContent = tool.description;
    link.appendChild(description);

    return link;
}

function createQuickLinksSection() {
    const section = document.createElement("section");
    section.className = "page-section";

    const heading = document.createElement("h2");
    heading.className = "page-section-title";
    heading.textContent = "Explore";
    section.appendChild(heading);

    const grid = document.createElement("div");
    grid.className = "dashboard-quick-links";

    const links = [
        { href: "/app/overview/", label: "Overview", icon: "book", description: "Characters, scenes, and script structure." },
        { href: "/app/progress/", label: "Progress", icon: "trending_up", description: "Mastery breakdown by character and scene." },
        { href: "/app/settings/", label: "Settings", icon: "settings", description: "Choose your script and practice characters." },
    ];

    for (const item of links) {
        grid.appendChild(createQuickLinkCard(item));
    }

    section.appendChild(grid);
    return section;
}

function createQuickLinkCard({ href, label, icon, description }) {
    const link = document.createElement("a");
    link.href = href;
    link.className = "card dashboard-quick-link";

    const header = document.createElement("div");
    header.className = "dashboard-quick-link-header";

    const iconElement = document.createElement("span");
    iconElement.className = "material-icons";
    iconElement.setAttribute("aria-hidden", "true");
    iconElement.textContent = icon;
    header.appendChild(iconElement);

    const title = document.createElement("span");
    title.className = "dashboard-quick-link-title";
    title.textContent = label;
    header.appendChild(title);

    link.appendChild(header);

    const text = document.createElement("p");
    text.textContent = description;
    link.appendChild(text);

    return link;
}

