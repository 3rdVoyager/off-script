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
    // Use typeof checks so pages without overview/settings page scripts don't throw on load.
    if (document.querySelector("[data-overview-root]") && typeof renderOverview === "function") {
        renderOverview();
    }

    if (
        (document.querySelector("[data-script-settings-root]") ||
            document.querySelector("[data-practice-settings-root]")) &&
        typeof renderSettingsPage === "function"
    ) {
        renderSettingsPage();
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
            action: { label: "Open Settings", href: "/app/settings/" },
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

function createStatCard(value, label) {
    const card = document.createElement("article");
    card.className = "stat-card";

    const valueElement = document.createElement("p");
    valueElement.className = "stat-card-value";
    valueElement.textContent = value;

    const labelElement = document.createElement("p");
    labelElement.className = "stat-card-label";
    labelElement.textContent = label;

    card.appendChild(valueElement);
    card.appendChild(labelElement);
    return card;
}

function createMasteryDial(percent) {
    const dial = document.createElement("div");
    dial.className = "mastery-dial";
    dial.setAttribute("role", "img");
    dial.setAttribute("aria-label", `Mastery ${percent}%`);
    dial.style.setProperty("--mastery-percent", String(percent));

    const ring = document.createElement("div");
    ring.className = "mastery-dial-ring";
    ring.setAttribute("aria-hidden", "true");
    dial.appendChild(ring);

    const value = document.createElement("span");
    value.className = "mastery-dial-value";
    value.textContent = `${percent}%`;
    dial.appendChild(value);

    return dial;
}

function createProgressBar(percent) {
    const wrap = document.createElement("div");
    wrap.className = "progress-bar-wrap";

    const bar = document.createElement("div");
    bar.className = "progress-bar";
    bar.setAttribute("role", "progressbar");
    bar.setAttribute("aria-valuemin", "0");
    bar.setAttribute("aria-valuemax", "100");
    bar.setAttribute("aria-valuenow", String(percent));
    bar.setAttribute("aria-label", `${percent}% mastery`);

    const fill = document.createElement("div");
    fill.className = "progress-bar-fill";
    fill.style.width = `${percent}%`;
    bar.appendChild(fill);

    const label = document.createElement("span");
    label.className = "progress-bar-label";
    label.textContent = `${percent}%`;

    wrap.appendChild(bar);
    wrap.appendChild(label);
    return wrap;
}

function createMultiSelectPillGroup({
    items,
    selected,
    dataAttribute,
    groupAttribute,
    ariaLabel,
    emptyMessage,
}) {
    const selectedSet = new Set(selected);
    const group = document.createElement("div");
    group.className = "settings-pill-group";
    group.setAttribute(groupAttribute, "");
    group.setAttribute("role", "group");
    group.setAttribute("aria-label", ariaLabel);

    if (items.length === 0) {
        const empty = document.createElement("p");
        empty.className = "settings-pill-empty";
        empty.textContent = emptyMessage;
        group.appendChild(empty);
        return group;
    }

    for (const item of items) {
        const pill = document.createElement("button");
        pill.type = "button";
        pill.className = "settings-pill";
        pill.setAttribute(dataAttribute, item.id);
        pill.textContent = item.label;

        const isSelected = selectedSet.has(item.id);

        if (isSelected) {
            pill.classList.add("settings-pill--selected");
        }

        pill.setAttribute("aria-pressed", isSelected ? "true" : "false");
        group.appendChild(pill);
    }

    return group;
}

function togglePill(pill) {
    const isSelected = pill.classList.toggle("settings-pill--selected");
    pill.setAttribute("aria-pressed", isSelected ? "true" : "false");
}

function getSelectedPillIds(pillGroup, dataAttribute) {
    return Array.from(
        pillGroup.querySelectorAll(".settings-pill--selected")
    ).map((button) => button.getAttribute(dataAttribute));
}

function selectRadioPill(pillGroup, selectedPill, dataAttribute) {
    for (const pill of pillGroup.querySelectorAll(`[${dataAttribute}]`)) {
        const isSelected = pill === selectedPill;

        pill.classList.toggle("settings-pill--selected", isSelected);
        pill.setAttribute("aria-checked", isSelected ? "true" : "false");
        pill.setAttribute("tabindex", isSelected ? "0" : "-1");
    }
}

function createSettingsRow({ label, hint, control, controlVariant }) {
    const row = document.createElement("div");
    row.className = "settings-row";

    if (controlVariant === "pills") {
        row.classList.add("settings-row--pills");
    }

    const info = document.createElement("div");
    info.className = "settings-row-info";

    const labelElement = document.createElement("p");
    labelElement.className = "settings-row-label";
    labelElement.textContent = label;
    info.appendChild(labelElement);

    if (hint) {
        const hintElement = document.createElement("p");
        hintElement.className = "settings-row-hint";
        hintElement.textContent = hint;
        info.appendChild(hintElement);
    }

    const controlWrap = document.createElement("div");
    controlWrap.className = "settings-row-control";

    if (controlVariant === "pills") {
        controlWrap.classList.add("settings-row-control--pills");
    }

    controlWrap.appendChild(control);

    row.appendChild(info);
    row.appendChild(controlWrap);
    return row;
}

function createPracticeToolActions({ primaryToolId = "read", primaryLabelPrefix = "Start" } = {}) {
    const actions = document.createElement("div");
    actions.className = "page-actions";

    const tools = typeof getPracticeToolsForNav === "function" ? getPracticeToolsForNav() : [];

    for (const tool of tools) {
        const link = document.createElement("a");
        link.href = tool.href;

        if (tool.id === primaryToolId) {
            link.className = "button-primary";
            link.textContent = primaryLabelPrefix ? `${primaryLabelPrefix} ${tool.label}` : tool.label;
        } else {
            link.className = "button-secondary";
            link.textContent = tool.label;
        }

        actions.appendChild(link);
    }

    return actions;
}
