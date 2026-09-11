const header = `
    <header class="site-header">
        <div class="site-header-inner">
            <a href="/" class="site-brand">
                <img src="/assets/favicon/web-app-manifest-512x512.png" alt="" width="44" height="44" />
                <span>OffScript!</span>
            </a>
            <nav aria-label="Site">
                <a href="/app/" class="button-primary site-header-cta">Get Started</a>
            </nav>
        </div>
    </header>
`;

const footer = `
    <footer class="site-footer">
        <div class="site-footer-inner">
            <p class="site-footer-brand">OffScript!</p>
            <p class="site-footer-tagline">From reading to remembering.</p>
            <p class="site-footer-copy">&copy; ${new Date().getFullYear()} Joshua C.</p>
        </div>
    </footer>
`;

document.body.insertAdjacentHTML("afterbegin", header);
document.body.insertAdjacentHTML("beforeend", footer);
