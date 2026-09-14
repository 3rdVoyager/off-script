const addScriptForm = document.querySelector(".add-script-form");
const uploadFeedback = document.querySelector(".upload-feedback");

if (!addScriptForm) {
    throw new Error("Add script form not found.");
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
