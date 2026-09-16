const PRACTICE_TOOL_REGISTRY = [
    {
        id: "read",
        label: "Read",
        icon: "menu_book",
        href: "/app/practice/read/",
    },
    {
        id: "recite",
        label: "Recite",
        icon: "keyboard",
        href: "/app/practice/recite/",
    },
    {
        id: "recall",
        label: "Recall",
        icon: "psychology",
        href: "/app/practice/recall/",
    },
];

function getPracticeToolsForNav() {
    return PRACTICE_TOOL_REGISTRY;
}

function getPracticeToolMeta(toolId) {
    return PRACTICE_TOOL_REGISTRY.find((tool) => tool.id === toolId) ?? null;
}
