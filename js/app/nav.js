const loadedScript = {
    title: "The Two Noble Kinsmen"
};

const sidebar = `
    <nav class="app-sidebar">
        <header>
            <h1>OffScript!</h1>
        </header>
        <ul>
            <li><a href="/app/index.html"><span class="material-icons" aria-hidden="true">dashboard</span>Dashboard</a></li>
        </ul>
        <div>
            <p class="sidebar-section-label">Current Script</p>
            <p class="sidebar-section-title">${loadedScript.title}</p>
            <ul>
                <li><a href="/app/overview/index.html"><span class="material-icons" aria-hidden="true">book</span>Overview</a></li>
                <li><a href="/app/practice/index.html"><span class="material-icons" aria-hidden="true">mic</span>Practice</a></li>
                <li><a href="/app/progress/index.html"><span class="material-icons" aria-hidden="true">trending_up</span>Progress</a></li>
            </ul>
        </div>
        <div class="nav-section--bottom">
            <p class="sidebar-section-label">Settings</p>
            <ul>
                <li><a href="/app/scripts/index.html"><span class="material-icons" aria-hidden="true">library_books</span>Manage Scripts</a></li>
                <li><a href="/app/settings/index.html"><span class="material-icons" aria-hidden="true">settings</span>Settings</a></li>
            </ul>
        </div>
    </nav>
`;

document.querySelector("body").insertAdjacentHTML("afterbegin", sidebar);
