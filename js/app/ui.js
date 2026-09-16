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

function createDataTable({ columns, rows, wrapClassName = "" }) {
    const tableWrap = document.createElement("div");
    tableWrap.className = "data-table-wrap";

    if (wrapClassName) {
        tableWrap.classList.add(wrapClassName);
    }

    const table = document.createElement("table");
    table.className = "data-table";

    const thead = document.createElement("thead");
    const headerRow = document.createElement("tr");

    for (const label of columns) {
        const th = document.createElement("th");
        th.scope = "col";
        th.textContent = label;
        headerRow.appendChild(th);
    }

    thead.appendChild(headerRow);
    table.appendChild(thead);

    const tbody = document.createElement("tbody");

    for (const row of rows) {
        const tableRow = document.createElement("tr");

        if (row.rowClassName) {
            tableRow.classList.add(row.rowClassName);
        }

        const labelCell = document.createElement("th");
        labelCell.scope = "row";
        labelCell.textContent = row.label;
        tableRow.appendChild(labelCell);

        for (const cell of row.cells) {
            const td = document.createElement("td");

            if (cell instanceof HTMLElement) {
                td.appendChild(cell);
            } else {
                td.textContent = String(cell);
            }

            tableRow.appendChild(td);
        }

        tbody.appendChild(tableRow);
    }

    table.appendChild(tbody);
    tableWrap.appendChild(table);
    return tableWrap;
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

    if (document.querySelector("[data-progress-root]") && typeof renderProgress === "function") {
        renderProgress();
    }

    if (document.querySelector("[data-dashboard-root]") && typeof renderDashboard === "function") {
        renderDashboard();
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
        "no-scenes": {
            message: "Choose at least one practice scene in Settings before practicing.",
            action: { label: "Open Settings", href: "/app/settings/" },
        },
        "no-lines": {
            message: "No lines found for your selected characters and scenes.",
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
