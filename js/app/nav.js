const SIDEBAR_STORAGE_KEY = "offscript-sidebar-collapsed";

const loadedScript = {
    title: "The Two Noble Kinsmen"
};

const savedCollapsed = localStorage.getItem(SIDEBAR_STORAGE_KEY) === "true";
if (savedCollapsed) {
    document.body.classList.add("sidebar-collapsed");
}
const sidebarMarkup = `
    <nav class="app-sidebar" aria-label="Main navigation">
        <header>
            <h1>OffScript!</h1>
            <button class="sidebar-toggle" type="button" aria-label="Collapse navigation" aria-expanded="true">
                <span class="material-icons" aria-hidden="true">chevron_left</span>
            </button>
        </header>
        <ul>
            <li><a href="/app/index.html" title="Dashboard"><span class="material-icons" aria-hidden="true">dashboard</span><span class="nav-link-label">Dashboard</span></a></li>
        </ul>
        <div>
            <p class="sidebar-section-label">Current Script</p>
            <p class="sidebar-section-title">${loadedScript.title}</p>
            <ul>
                <li><a href="/app/overview/index.html" title="Overview"><span class="material-icons" aria-hidden="true">book</span><span class="nav-link-label">Overview</span></a></li>
                <li><a href="/app/practice/index.html" title="Practice"><span class="material-icons" aria-hidden="true">mic</span><span class="nav-link-label">Practice</span></a></li>
                <li><a href="/app/progress/index.html" title="Progress"><span class="material-icons" aria-hidden="true">trending_up</span><span class="nav-link-label">Progress</span></a></li>
            </ul>
        </div>
        <div class="nav-section--bottom">
            <p class="sidebar-section-label">Settings</p>
            <ul>
                <li><a href="/app/scripts/index.html" title="Manage Scripts"><span class="material-icons" aria-hidden="true">library_books</span><span class="nav-link-label">Manage Scripts</span></a></li>
                <li><a href="/app/settings/index.html" title="Settings"><span class="material-icons" aria-hidden="true">settings</span><span class="nav-link-label">Settings</span></a></li>
            </ul>
        </div>
    </nav>
`;

document.body.insertAdjacentHTML("afterbegin", sidebarMarkup);

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
