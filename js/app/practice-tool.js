function formatPracticeMeta(item, index, total) {
    return `${item.line.actTitle} · ${item.line.sceneTitle} · Line ${index + 1} of ${total}`;
}

function renderPracticeCue(cueSection, cue) {
    cueSection.replaceChildren();

    const label = document.createElement("p");
    label.className = "practice-section-label";
    label.textContent = "Cue";
    cueSection.appendChild(label);

    if (!cue) {
        const empty = document.createElement("p");
        empty.className = "practice-cue-empty";
        empty.textContent = "Start of script.";
        cueSection.appendChild(empty);
        return;
    }

    if (cue.type === "direction") {
        const direction = document.createElement("p");
        direction.className = "practice-cue-direction";
        direction.textContent = cue.text;
        cueSection.appendChild(direction);
        return;
    }

    const character = document.createElement("p");
    character.className = "practice-cue-character";
    character.textContent = cue.character;
    cueSection.appendChild(character);

    const text = document.createElement("p");
    text.className = "practice-cue-text";
    text.textContent = cue.text;
    cueSection.appendChild(text);
}

function createPracticeToolShell({ onPrev, onNext }) {
    const wrapper = document.createElement("div");
    wrapper.className = "practice-tool";

    const meta = document.createElement("p");
    meta.className = "practice-meta";
    meta.setAttribute("data-practice-meta", "");
    wrapper.appendChild(meta);

    const card = document.createElement("article");
    card.className = "card practice-card";

    const cueSection = document.createElement("section");
    cueSection.className = "practice-cue";
    cueSection.setAttribute("data-practice-cue", "");
    card.appendChild(cueSection);

    const contentSection = document.createElement("section");
    contentSection.className = "practice-content";
    contentSection.setAttribute("data-practice-content", "");
    card.appendChild(contentSection);

    wrapper.appendChild(card);

    const nav = document.createElement("nav");
    nav.className = "practice-nav";
    nav.setAttribute("aria-label", "Line navigation");

    const prevButton = document.createElement("button");
    prevButton.type = "button";
    prevButton.className = "practice-nav-button";
    prevButton.setAttribute("data-practice-prev", "");
    prevButton.setAttribute("aria-label", "Previous line");
    prevButton.innerHTML = '<span class="material-icons" aria-hidden="true">arrow_back</span>';
    nav.appendChild(prevButton);

    const nextButton = document.createElement("button");
    nextButton.type = "button";
    nextButton.className = "practice-nav-button";
    nextButton.setAttribute("data-practice-next", "");
    nextButton.setAttribute("aria-label", "Next line");
    nextButton.innerHTML = '<span class="material-icons" aria-hidden="true">arrow_forward</span>';
    nav.appendChild(nextButton);

    wrapper.appendChild(nav);

    prevButton.addEventListener("click", onPrev);
    nextButton.addEventListener("click", onNext);

    return {
        element: wrapper,
        meta,
        cueSection,
        contentSection,
        prevButton,
        nextButton,
        updateNav(index, total) {
            prevButton.disabled = index === 0;
            nextButton.disabled = index === total - 1;
        },
    };
}

function isTypingTarget(target) {
    return target instanceof HTMLInputElement || target instanceof HTMLTextAreaElement;
}
