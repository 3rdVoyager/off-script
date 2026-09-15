const SIDEBAR_STORAGE_KEY = "offscript-sidebar-collapsed";

function getSidebarScriptTitle() {
    const activeScript = getActiveScript();

    return activeScript ? activeScript.title : "No script loaded";
}

function updateSidebarScriptTitle() {
    const titleElement = document.querySelector(".sidebar-active-script-title");

    if (!titleElement) {
        return;
    }

    titleElement.textContent = getSidebarScriptTitle();
}

const savedCollapsed = localStorage.getItem(SIDEBAR_STORAGE_KEY) === "true";
if (savedCollapsed) {
    document.body.classList.add("sidebar-collapsed");
}
const sidebarMarkup = `
    <nav class="app-sidebar" aria-label="Main navigation">
        <div class="sidebar-top">
            <header>
                <div class="app-sidebar-header-brand">
                    <img src="/assets/favicon/web-app-manifest-512x512.png" />
                    <h1>OffScript!</h1>
                </div>
                <button class="sidebar-toggle" type="button" aria-label="Collapse navigation" aria-expanded="true">
                    <span class="material-icons" aria-hidden="true">chevron_left</span>
                </button>
            </header>
            <div class="sidebar-active-script">
                <p class="sidebar-section-label">Active Script</p>
                <p class="sidebar-active-script-title">${getSidebarScriptTitle()}</p>
            </div>
        </div>
        <ul>
            <li><a href="/app/" title="Dashboard"><span class="material-icons" aria-hidden="true">dashboard</span><span class="nav-link-label">Dashboard</span></a></li>
        </ul>
        <div>
            <p class="sidebar-section-label">Script Tools</p>
            <ul>
                <li><a href="/app/overview/" title="Overview"><span class="material-icons" aria-hidden="true">book</span><span class="nav-link-label">Overview</span></a></li>
                <li><a href="/app/practice/" title="Practice"><span class="material-icons" aria-hidden="true">mic</span><span class="nav-link-label">Practice</span></a></li>
                <li><a href="/app/progress/" title="Progress"><span class="material-icons" aria-hidden="true">trending_up</span><span class="nav-link-label">Progress</span></a></li>
            </ul>
        </div>
        <div class="nav-section--bottom">
            <p class="sidebar-section-label">Settings</p>
            <ul>
                <li><a href="/app/scripts/" title="Manage Scripts"><span class="material-icons" aria-hidden="true">library_books</span><span class="nav-link-label">Manage Scripts</span></a></li>
                <li><a href="/app/settings/" title="Settings"><span class="material-icons" aria-hidden="true">settings</span><span class="nav-link-label">Settings</span></a></li>
            </ul>
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

    document.querySelectorAll(".app-sidebar a[href]").forEach((link) => {
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
