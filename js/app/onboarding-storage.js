const ONBOARDING_STORAGE_KEY = "offscript-onboarding";

function getDefaultOnboardingData() {
    return {
        collapsed: false,
        toolsUsed: {
            reveal: false,
            "first-letter": false,
            type: false,
        },
        visitedProgress: false,
    };
}

function getOnboardingData() {
    const data = readJson(ONBOARDING_STORAGE_KEY, null);

    if (!data || typeof data !== "object") {
        return getDefaultOnboardingData();
    }

    const toolsUsed = data.toolsUsed ?? {};

    return {
        collapsed: Boolean(data.collapsed),
        toolsUsed: {
            reveal: Boolean(toolsUsed.reveal),
            "first-letter": Boolean(toolsUsed["first-letter"]),
            type: Boolean(toolsUsed.type),
        },
        visitedProgress: Boolean(data.visitedProgress),
    };
}

function saveOnboardingData(data) {
    writeJson(ONBOARDING_STORAGE_KEY, data);
}

function setGettingStartedCollapsed(collapsed) {
    const data = getOnboardingData();
    data.collapsed = collapsed;
    saveOnboardingData(data);
}

function toggleGettingStartedCollapsed() {
    const data = getOnboardingData();
    data.collapsed = !data.collapsed;
    saveOnboardingData(data);
}

function markOnboardingToolUsed(toolId) {
    if (!toolId || !(toolId in getOnboardingData().toolsUsed)) {
        return;
    }

    const data = getOnboardingData();

    if (data.toolsUsed[toolId]) {
        return;
    }

    data.toolsUsed[toolId] = true;
    saveOnboardingData(data);
}

function markOnboardingProgressVisited() {
    const data = getOnboardingData();

    if (data.visitedProgress) {
        return;
    }

    data.visitedProgress = true;
    saveOnboardingData(data);
}

function hasPracticeSettings(script) {
    if (!script) {
        return false;
    }

    const settings = getScriptSettings(script.id);

    return (
        settings.practiceCharacters.length > 0 &&
        !(Array.isArray(settings.practiceScenes) && settings.practiceScenes.length === 0)
    );
}

function syncOnboardingFromAppState() {
    const data = getOnboardingData();
    const script = getActiveScript();

    if (!script || !hasPracticeSettings(script)) {
        return;
    }

    const settings = getScriptSettings(script.id);
    const summary = getPracticeProgressSummary(
        script,
        settings.practiceCharacters,
        settings.practiceScenes
    );

    if (summary.practicedCount > 0 && !data.toolsUsed.reveal) {
        data.toolsUsed.reveal = true;
        saveOnboardingData(data);
    }
}

const GETTING_STARTED_STEPS = [
    {
        id: "add-script",
        label: "Add a script",
        description: "Upload or paste your script JSON in Settings.",
        href: "/app/settings/",
    },
    {
        id: "settings",
        label: "Choose practice characters and scenes",
        description: "Pick who you are learning and which scenes to include.",
        href: "/app/settings/",
    },
    {
        id: "reveal",
        label: "Try Reveal",
        description: "Read the cue, remember your line, then reveal it.",
        href: "/app/practice/?tool=reveal",
    },
    {
        id: "first-letter-or-type",
        label: "Try First Letter or Type",
        description: "Type your lines with help (First Letter) or from memory (Type).",
        href: "/app/practice/?tool=first-letter",
    },
    {
        id: "progress",
        label: "Review your progress",
        description: "See mastery by character and scene on the Progress page.",
        href: "/app/progress/",
    },
];

function isGettingStartedStepComplete(stepId) {
    const data = getOnboardingData();
    const scriptsData = getScriptsData();
    const script = getActiveScript();

    if (stepId === "add-script") {
        return scriptsData.scripts.length > 0;
    }

    if (stepId === "settings") {
        return hasPracticeSettings(script);
    }

    if (stepId === "reveal") {
        return data.toolsUsed.reveal;
    }

    if (stepId === "first-letter-or-type") {
        return data.toolsUsed["first-letter"] || data.toolsUsed.type;
    }

    if (stepId === "progress") {
        return data.visitedProgress;
    }

    return false;
}

function getGettingStartedStatus() {
    const data = getOnboardingData();
    const steps = GETTING_STARTED_STEPS.map((step) => ({
        ...step,
        complete: isGettingStartedStepComplete(step.id),
    }));
    const allComplete = steps.every((step) => step.complete);

    const completedCount = steps.filter((step) => step.complete).length;

    return {
        collapsed: data.collapsed,
        steps,
        allComplete,
        completedCount,
        totalCount: steps.length,
    };
}
