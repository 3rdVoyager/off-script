
const header = `
    <header>
        <nav>
            <ul>
                <li><a href="/app/" class="button-primary">Get Started</a></li>
            </ul>
        </nav>
    </header>
`;

const footer = `
    <footer>
    </footer>
`;

document.querySelector('body').insertAdjacentHTML('afterbegin', header);
document.querySelector('body').insertAdjacentHTML('beforeend', footer);