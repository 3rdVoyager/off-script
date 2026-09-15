const PRACTICE_TOOLS = {
    read: {
        label: "Read",
        weight: 0.15,
        maxContribution: 0.2,
    },
    recite: {
        label: "Recite",
        weight: 0.25,
        maxContribution: 0.5,
    },
    recall: {
        label: "Recall",
        weight: 0.4,
        maxContribution: 1,
    },
};

const DEV_CONFIG = {
    logScoring: false,
};

function applyPracticeScore(lineMastery, toolName) {
    const tool = PRACTICE_TOOLS[toolName];

    if (!tool) {
        return lineMastery;
    }

    if (lineMastery >= tool.maxContribution) {
        return lineMastery;
    }

    const nextScore = lineMastery + tool.weight * (tool.maxContribution - lineMastery);

    if (DEV_CONFIG.logScoring) {
        console.log(`[scoring] ${toolName}: ${lineMastery.toFixed(3)} → ${nextScore.toFixed(3)}`);
    }

    return nextScore;
}
