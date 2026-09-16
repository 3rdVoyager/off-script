const ONBOARDING_STORAGE_KEY = "offscript-onboarding";

function getDefaultOnboardingData() {
    return {
        collapsed: false,
        toolsUsed: {
            read: false,
            recite: false,
            recall: false,
        },
        visitedProgress: false,
    };
}

function getOnboardingData() {
    const data = readJson(ONBOARDING_STORAGE_KEY, null);

    if (!data || typeof data !== "object") {
        return getDefaultOnboardingData();
    }

    return {
        collapsed: data.collapsed !== undefined ? Boolean(data.collapsed) : Boolean(data.dismissed),
        toolsUsed: {
            read: Boolean(data.toolsUsed?.read),
            recite: Boolean(data.toolsUsed?.recite),
            recall: Boolean(data.toolsUsed?.recall),
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

    if (summary.practicedCount > 0 && !data.toolsUsed.read) {
        data.toolsUsed.read = true;
        saveOnboardingData(data);
    }
}

const GETTING_STARTED_STEPS = [
    {
        id: "add-script",
        label: "Add a script",
        description: "Upload or paste your script JSON on Manage Scripts.",
        href: "/app/scripts/",
    },
    {
        id: "settings",
        label: "Choose practice characters and scenes",
        description: "Pick who you are learning and which scenes to include.",
        href: "/app/settings/",
    },
    {
        id: "read",
        label: "Try Read",
        description: "Read the cue, remember your line, then reveal it.",
        href: "/app/practice/?tool=read",
    },
    {
        id: "recite-or-recall",
        label: "Try Recite or Recall",
        description: "Type your lines with help (Recite) or from memory (Recall).",
        href: "/app/practice/?tool=recite",
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

    if (stepId === "read") {
        return data.toolsUsed.read;
    }

    if (stepId === "recite-or-recall") {
        return data.toolsUsed.recite || data.toolsUsed.recall;
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
