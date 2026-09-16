const addScriptForm = document.querySelector(".add-script-form");
const fileInput = document.querySelector("#script-file");
const fileNameDisplay = document.querySelector("[data-file-name]");

if (!addScriptForm) {
    throw new Error("Add script form not found.");
}

if (fileInput && fileNameDisplay) {
    fileInput.addEventListener("change", () => {
        const file = fileInput.files?.[0];
        fileNameDisplay.textContent = file ? file.name : "";
    });
}

addScriptForm.addEventListener("submit", async (event) => {
    event.preventDefault();

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

    updateInterface();
});
