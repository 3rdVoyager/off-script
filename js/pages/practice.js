const DEFAULT_PRACTICE_TOOL = "reveal";

function getToolIdFromUrl() {
    const toolId = new URLSearchParams(window.location.search).get("tool");

    if (!toolId) {
        return DEFAULT_PRACTICE_TOOL;
    }

    return toolId;
}

function mountPracticeTool() {
    const root = document.querySelector("[data-practice-root]");

    if (!root) {
        return;
    }

    const toolId = getToolIdFromUrl();
    const meta = getPracticeToolMeta(toolId);

    if (!meta) {
        const url = new URL(window.location.href);
        url.searchParams.set("tool", DEFAULT_PRACTICE_TOOL);
        window.location.replace(url.toString());
        return;
    }

    const titleElement = document.querySelector("[data-practice-title]");
    const descriptionElement = document.querySelector("[data-practice-description]");

    if (titleElement) {
        titleElement.textContent = meta.label;
    }

    if (descriptionElement) {
        descriptionElement.textContent = meta.description;
    }

    document.title = `OffScript! | ${meta.label}`;

    const mount = getPracticeToolMount(toolId);

    if (mount) {
        mount(root);
    }
}

document.addEventListener("DOMContentLoaded", mountPracticeTool);
