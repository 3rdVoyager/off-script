const script = {
    title: "The Two Noble Kinsmen"
};

const sidebar = `
    <nav class="app-sidebar">
        <header>
            <h1>OffScript!</h1>
        </header>
        <ul>
            <li><a href="/app/index.html">Dashboard</a></li>
        </ul>
        <ul>
            <h3>${script.title}</h3>
            <li><a href="/app/practice/index.html">Practice</a></li>
            <li><a href="/app/progress/index.html">Progress</a></li>
        </ul>
        <ul>
            <li><a href="/app/scripts/index.html">Scripts</a></li>
            <li><a href="/app/settings/index.html">Settings</a></li>
        </ul>
    </nav>
`;

document.querySelector("body").insertAdjacentHTML("afterbegin", sidebar);
