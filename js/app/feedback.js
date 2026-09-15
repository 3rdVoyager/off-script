const TOAST_DURATION_MS = 4000;

let toastContainer = null;

function getToastContainer() {
    if (!toastContainer) {
        toastContainer = document.createElement("div");
        toastContainer.className = "toast-container";
        toastContainer.setAttribute("aria-live", "polite");
        toastContainer.setAttribute("aria-atomic", "true");
        document.body.appendChild(toastContainer);
    }

    return toastContainer;
}

function showFeedback(message, type = "success") {
    const container = getToastContainer();
    const toast = document.createElement("div");

    toast.className = `toast toast--${type}`;
    toast.textContent = message;
    toast.setAttribute("role", "status");

    container.appendChild(toast);

    requestAnimationFrame(() => {
        toast.classList.add("is-visible");
    });

    window.setTimeout(() => {
        toast.classList.remove("is-visible");

        window.setTimeout(() => {
            toast.remove();
        }, 200);
    }, TOAST_DURATION_MS);
}
