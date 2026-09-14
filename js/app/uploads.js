const addScriptForm = document.querySelector(".add-script-form");
const uploadFeedback = document.querySelector(".upload-feedback");
const fileInput = document.querySelector("#script-file");
const fileNameDisplay = document.querySelector("[data-file-name]");
const dropzone = document.querySelector(".add-script-form-dropzone");

if (!addScriptForm) {
    throw new Error("Add script form not found.");
}

if (fileInput && fileNameDisplay) {
    fileInput.addEventListener("change", () => {
        const file = fileInput.files?.[0];
        fileNameDisplay.textContent = file ? file.name : "";
    });
}

if (dropzone && fileInput) {
    dropzone.addEventListener("dragover", (event) => {
        event.preventDefault();
        dropzone.classList.add("is-dragover");
    });

    dropzone.addEventListener("dragleave", () => {
        dropzone.classList.remove("is-dragover");
    });

    dropzone.addEventListener("drop", (event) => {
        event.preventDefault();
        dropzone.classList.remove("is-dragover");

        const file = event.dataTransfer?.files?.[0];

        if (!file) {
            return;
        }

        fileInput.files = event.dataTransfer.files;
        fileNameDisplay.textContent = file.name;
    });
}

addScriptForm.addEventListener("submit", async (event) => {
    event.preventDefault();
    clearFeedback();

    const formData = new FormData(addScriptForm);
    const file = formData.get("script-file");
    const jsonText = String(formData.get("script-json") || "").trim();

    let script;

    try {
        if (file instanceof File && file.size > 0) {
            const text = await file.text();
            script = JSON.parse(text);
        } else if (jsonText) {
            script = JSON.parse(jsonText);
        } else {
            showFeedback("Choose a JSON file or paste script JSON.", "error");
            return;
        }
    } catch {
        showFeedback("That file or text is not valid JSON.", "error");
        return;
    }

    const result = saveScript(script);

    if (!result.ok) {
        showFeedback(result.error, "error");
        return;
    }

    showFeedback(`"${result.script.title}" saved.`, "success");
    addScriptForm.reset();

    if (fileNameDisplay) {
        fileNameDisplay.textContent = "";
    }

    renderScriptList();
});

function showFeedback(message, type) {
    if (!uploadFeedback) {
        return;
    }

    uploadFeedback.textContent = message;
    uploadFeedback.className = `upload-feedback upload-feedback--${type}`;
    uploadFeedback.hidden = false;
}

function clearFeedback() {
    if (!uploadFeedback) {
        return;
    }

    uploadFeedback.textContent = "";
    uploadFeedback.hidden = true;
    uploadFeedback.className = "upload-feedback";
}
