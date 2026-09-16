function createEmptyState(message, options = {}) {
    const { action, variant = "boxed", centered = Boolean(action), wrapInSection = false } = options;

    let root;

    if (variant === "minimal") {
        root = document.createElement("p");
        root.className = "empty-state-minimal";
        root.textContent = message;
    } else {
        root = document.createElement("div");
        root.className = "empty-state";

        if (centered) {
            root.classList.add("empty-state--centered");
        }

        const text = document.createElement("p");
        text.textContent = message;
        root.appendChild(text);

        if (action) {
            const link = document.createElement("a");
            link.href = action.href;
            link.className = "button-primary";
            link.textContent = action.label;
            root.appendChild(link);
        }
    }

    if (wrapInSection) {
        const section = document.createElement("section");
        section.className = "page-section";
        section.appendChild(root);
        return section;
    }

    return root;
}

function updateInterface() {
    if (typeof updateSidebarScriptTitle === "function") {
        updateSidebarScriptTitle();
    } else if (typeof updateSidebarMasteryDial === "function") {
        updateSidebarMasteryDial();
    }

    // Practice tools keep their own session state; only refresh passive pages here.
    // Use typeof checks so pages without overview.js / scripts.js don't throw on load.
    if (document.querySelector("[data-overview-root]") && typeof renderOverview === "function") {
        renderOverview();
    }

    if (document.querySelector("[data-script-list]") && typeof renderScriptList === "function") {
        renderScriptList();
    }
}

function createPracticeEmptyState(reason, options = {}) {
    const states = {
        "no-script": {
            message: "No active script.",
            action: { label: "Manage Scripts", href: "/app/scripts/" },
        },
        "no-character": {
            message: "Choose at least one practice character in Settings before practicing.",
            action: { label: "Open Settings", href: "/app/settings/" },
        },
        "no-lines": {
            message: "No lines found for your selected characters.",
            action: { label: "Open Settings", href: "/app/settings/" },
        },
    };

    const state = states[reason];

    if (!state) {
        return createEmptyState("Something went wrong.", { centered: true });
    }

    return createEmptyState(state.message, {
        action: state.action,
        centered: true,
    });
}
