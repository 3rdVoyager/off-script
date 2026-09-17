const PRACTICE_TOOL_DEFINITIONS = [
    {
        id: "reveal",
        label: "Reveal",
        icon: "menu_book",
        description:
            "Read the cue, try to remember your line, then reveal it. Use arrow keys to move between lines.",
        scoring: {
            weight: 0.15,
            maxContribution: 0.2,
        },
    },
    {
        id: "first-letter",
        label: "First Letter",
        icon: "keyboard",
        description:
            "Read the cue, then type your line — the first letter of each word fills in the rest. Use arrow keys to move between lines.",
        scoring: {
            weight: 0.25,
            maxContribution: 0.5,
        },
    },
    {
        id: "type",
        label: "Type",
        icon: "psychology",
        description:
            "Read the cue, then type your full line from memory. Use arrow keys to move between lines.",
        scoring: {
            weight: 0.4,
            maxContribution: 1,
        },
    },
];

const practiceToolMounts = {};

function getPracticeToolDefinition(toolId) {
    return PRACTICE_TOOL_DEFINITIONS.find((tool) => tool.id === toolId) ?? null;
}

function getPracticeToolHref(toolId) {
    return `/app/practice/?tool=${toolId}`;
}

function getPracticeToolsForNav() {
    return PRACTICE_TOOL_DEFINITIONS.map((tool) => ({
        id: tool.id,
        label: tool.label,
        icon: tool.icon,
        description: tool.description,
        href: getPracticeToolHref(tool.id),
    }));
}

function getPracticeToolMeta(toolId) {
    const tool = getPracticeToolDefinition(toolId);

    if (!tool) {
        return null;
    }

    return {
        id: tool.id,
        label: tool.label,
        icon: tool.icon,
        description: tool.description,
        href: getPracticeToolHref(tool.id),
    };
}

function registerPracticeToolMount(toolId, mount) {
    const tool = getPracticeToolDefinition(toolId);

    if (!tool) {
        throw new Error(`Unknown practice tool: ${toolId}`);
    }

    if (typeof mount !== "function") {
        throw new Error(`Practice tool mount must be a function: ${toolId}`);
    }

    practiceToolMounts[toolId] = mount;
}

function getPracticeToolMount(toolId) {
    return practiceToolMounts[toolId] ?? null;
}

function applyPracticeScore(lineMastery, toolName) {
    const tool = getPracticeToolDefinition(toolName);

    if (!tool) {
        return lineMastery;
    }

    const { weight, maxContribution } = tool.scoring;

    if (lineMastery >= maxContribution) {
        return lineMastery;
    }

    const nextScore = lineMastery + weight * (maxContribution - lineMastery);

    if (typeof DEV_CONFIG !== "undefined" && DEV_CONFIG.logScoring) {
        console.log(`[scoring] ${toolName}: ${lineMastery.toFixed(3)} → ${nextScore.toFixed(3)}`);
    }

    return nextScore;
}
