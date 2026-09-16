const SIDEBAR_STORAGE_KEY = "offscript-sidebar-collapsed";

function getSidebarScriptTitle() {
    const activeScript = getActiveScript();

    return activeScript ? activeScript.title : "No script loaded";
}

function getSidebarMasteryDisplay() {
    const activeScript = getActiveScript();

    if (!activeScript) {
        return { percent: 0, label: "—" };
    }

    if (typeof getScriptSettings !== "function" || typeof getScriptMasteryPercent !== "function") {
        return { percent: 0, label: "0%" };
    }

    const settings = getScriptSettings(activeScript.id);

    if (settings.practiceCharacters.length === 0) {
        return { percent: 0, label: "—" };
    }

    const percent = getScriptMasteryPercent(
        activeScript,
        settings.practiceCharacters,
        settings.practiceScenes
    );

    return { percent, label: `${percent}%` };
}

function updateSidebarScriptTitle() {
    const titleElement = document.querySelector(".sidebar-active-script-title");

    if (titleElement) {
        titleElement.textContent = getSidebarScriptTitle();
    }

    updateSidebarMasteryDial();
}

function updateSidebarMasteryDial() {
    const dial = document.querySelector("[data-mastery-dial]");

    if (!dial) {
        return;
    }

    const valueElement = dial.querySelector(".sidebar-mastery-dial-value");
    const { percent, label } = getSidebarMasteryDisplay();

    dial.style.setProperty("--mastery-percent", String(percent));
    dial.setAttribute("aria-label", `Mastery ${label}`);

    if (valueElement) {
        valueElement.textContent = label;
    }
}

const savedCollapsed = localStorage.getItem(SIDEBAR_STORAGE_KEY) === "true";
if (savedCollapsed) {
    document.body.classList.add("sidebar-collapsed");
}
const sidebarMarkup = `
    <nav class="app-sidebar" aria-label="Main navigation">
        <header>
            <div class="app-sidebar-header-brand">
                <img src="/assets/favicon/web-app-manifest-512x512.png" />
                <h1>OffScript!</h1>
            </div>
            <button class="sidebar-toggle" type="button" aria-label="Collapse navigation" aria-expanded="true">
                <span class="material-icons" aria-hidden="true">chevron_left</span>
            </button>
        </header>
        <ul>
            <li><a href="/app/" title="Dashboard"><span class="material-icons" aria-hidden="true">dashboard</span><span class="nav-link-label">Dashboard</span></a></li>
        </ul>
        <div>
            <p class="sidebar-section-label">Practice</p>
            <ul>
                <li><a href="/app/practice/read/" title="Read"><span class="material-icons" aria-hidden="true">menu_book</span><span class="nav-link-label">Read</span></a></li>
                <li><a href="/app/practice/recite/" title="Recite"><span class="material-icons" aria-hidden="true">keyboard</span><span class="nav-link-label">Recite</span></a></li>
                <li><a href="/app/practice/recall/" title="Recall"><span class="material-icons" aria-hidden="true">psychology</span><span class="nav-link-label">Recall</span></a></li>
            </ul>
        </div>
        <div class="sidebar-footer">
            <p class="sidebar-active-script-title">${getSidebarScriptTitle()}</p>
            <div class="sidebar-mastery-dial" data-mastery-dial role="img" aria-label="Mastery —" style="--mastery-percent: 0">
                <div class="sidebar-mastery-dial-ring" aria-hidden="true"></div>
                <span class="sidebar-mastery-dial-value">—</span>
            </div>
            <nav class="sidebar-footer-actions" aria-label="Quick links">
                <a href="/app/overview/" class="sidebar-footer-action" title="Overview">
                    <span class="material-icons" aria-hidden="true">book</span>
                </a>
                <a href="/app/progress/" class="sidebar-footer-action" title="Progress">
                    <span class="material-icons" aria-hidden="true">trending_up</span>
                </a>
                <a href="/app/scripts/" class="sidebar-footer-action" title="Manage Scripts">
                    <span class="material-icons" aria-hidden="true">library_books</span>
                </a>
                <a href="/app/settings/" class="sidebar-footer-action" title="Settings">
                    <span class="material-icons" aria-hidden="true">settings</span>
                </a>
            </nav>
        </div>
    </nav>
`;

document.body.insertAdjacentHTML("afterbegin", sidebarMarkup);

function normalizePath(pathname) {
    let path = pathname;

    if (path.endsWith("/index.html")) {
        path = path.slice(0, -"/index.html".length);
    }

    if (path.length > 1 && path.endsWith("/")) {
        path = path.slice(0, -1);
    }

    return path || "/";
}

function setActiveNavLink() {
    const currentPath = normalizePath(window.location.pathname);

    document.querySelectorAll(".app-sidebar a[href], .sidebar-footer-action[href]").forEach((link) => {
        const linkPath = normalizePath(link.getAttribute("href"));
        const isActive = currentPath === linkPath;

        link.classList.toggle("is-active", isActive);

        if (isActive) {
            link.setAttribute("aria-current", "page");
        } else {
            link.removeAttribute("aria-current");
        }
    });
}

setActiveNavLink();
updateInterface();

const toggleButton = document.querySelector(".sidebar-toggle");
const toggleIcon = toggleButton.querySelector(".material-icons");

function setSidebarCollapsed(isCollapsed) {
    document.body.classList.toggle("sidebar-collapsed", isCollapsed);
    localStorage.setItem(SIDEBAR_STORAGE_KEY, String(isCollapsed));
    toggleButton.setAttribute("aria-expanded", String(!isCollapsed));
    toggleButton.setAttribute(
        "aria-label",
        isCollapsed ? "Expand navigation" : "Collapse navigation"
    );
    toggleIcon.textContent = isCollapsed ? "chevron_right" : "chevron_left";
}

setSidebarCollapsed(savedCollapsed);

toggleButton.addEventListener("click", () => {
    const isCollapsed = document.body.classList.contains("sidebar-collapsed");
    setSidebarCollapsed(!isCollapsed);
});
