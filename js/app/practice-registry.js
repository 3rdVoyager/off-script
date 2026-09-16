const PRACTICE_TOOL_REGISTRY = [
    {
        id: "read",
        label: "Read",
        icon: "menu_book",
        href: "/app/practice/?tool=read",
        description:
            "Read the cue, try to remember your line, then reveal it. Use arrow keys to move between lines.",
    },
    {
        id: "recite",
        label: "Recite",
        icon: "keyboard",
        href: "/app/practice/?tool=recite",
        description:
            "Read the cue, then type your line — the first letter of each word fills in the rest. Use arrow keys to move between lines.",
    },
    {
        id: "recall",
        label: "Recall",
        icon: "psychology",
        href: "/app/practice/?tool=recall",
        description:
            "Read the cue, then type your full line from memory. Use arrow keys to move between lines.",
    },
];

function getPracticeToolsForNav() {
    return PRACTICE_TOOL_REGISTRY;
}

function getPracticeToolMeta(toolId) {
    return PRACTICE_TOOL_REGISTRY.find((tool) => tool.id === toolId) ?? null;
}
