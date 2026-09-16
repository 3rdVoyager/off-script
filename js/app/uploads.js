const ADD_SCRIPT_CHATBOT_PROMPT = `Convert my script into JSON for OffScript, a line memorization tool that can be accessed at off-script.pages.dev. Return only valid JSON, with no markdown fences and no extra commentary.

Use this structure:

{
  "schemaVersion": 1,
  "type": "play",
  "title": "Play title here",
  "notes": "",
  "acts": [
    {
      "title": "Act I",
      "scenes": [
        {
          "title": "Scene 1",
          "lines": [
            { "type": "direction", "text": "Stage direction here." },
            { "type": "line", "character": "Character Name", "text": "Spoken line here." }
          ]
        }
      ]
    }
  ]
}

Rules:
- schemaVersion must be 1 and type must be "play"
- Each act needs a title and at least one scene; each scene needs a title and a lines array
- Every line is either type "direction" (text only) or type "line" (character + text)
- Use the same character name spelling and capitalization throughout
- Do not include an "id" field; OffScript assigns that when you import
- Keep stage directions as separate direction lines, not mixed into spoken lines

My script:

[Paste or attach your script here]`;

function createAddScriptRow() {
    const row = document.createElement("div");
    row.className = "settings-row settings-row--add-script";

    const info = document.createElement("div");
    info.className = "settings-row-info";

    const label = document.createElement("p");
    label.className = "settings-row-label";
    label.textContent = "Add script";
    info.appendChild(label);

    const hint = document.createElement("p");
    hint.className = "settings-row-hint";
    hint.textContent =
        "Import OffScript JSON from a file or paste below. Only have a PDF or Word doc? Copy the chatbot prompt, convert your script elsewhere, then import the JSON here.";
    info.appendChild(hint);

    const form = document.createElement("form");
    form.className = "settings-add-script-form";
    form.setAttribute("data-add-script-form", "");

    const toolbar = document.createElement("div");
    toolbar.className = "settings-add-script-toolbar";

    const copyPromptButton = document.createElement("button");
    copyPromptButton.type = "button";
    copyPromptButton.className = "button-secondary settings-copy-prompt";
    copyPromptButton.setAttribute("data-copy-prompt", "");
    copyPromptButton.innerHTML =
        '<span class="material-icons" aria-hidden="true">content_copy</span><span>Copy chatbot prompt</span>';
    toolbar.appendChild(copyPromptButton);

    const fileLabel = document.createElement("label");
    fileLabel.className = "button-secondary settings-add-script-file-label";
    fileLabel.setAttribute("for", "script-file");
    fileLabel.textContent = "Choose JSON file";

    const fileInput = document.createElement("input");
    fileInput.type = "file";
    fileInput.id = "script-file";
    fileInput.name = "script-file";
    fileInput.accept = ".json,application/json";
    fileInput.hidden = true;
    fileLabel.appendChild(fileInput);
    toolbar.appendChild(fileLabel);

    const fileNameDisplay = document.createElement("span");
    fileNameDisplay.className = "settings-add-script-file-name";
    fileNameDisplay.setAttribute("data-file-name", "");
    toolbar.appendChild(fileNameDisplay);

    const submitButton = document.createElement("button");
    submitButton.type = "submit";
    submitButton.className = "button-primary settings-add-script-submit";
    submitButton.textContent = "Add script";
    toolbar.appendChild(submitButton);

    form.appendChild(toolbar);

    const textarea = document.createElement("textarea");
    textarea.id = "script-json";
    textarea.name = "script-json";
    textarea.className = "settings-add-script-textarea";
    textarea.rows = 3;
    textarea.placeholder = "Or paste JSON here";
    form.appendChild(textarea);

    row.appendChild(info);
    row.appendChild(form);

    return row;
}

async function copyChatbotPrompt(button) {
    try {
        await navigator.clipboard.writeText(ADD_SCRIPT_CHATBOT_PROMPT);
        showFeedback("Chatbot prompt copied.", "success");

        const label = button.querySelector("span:last-child");

        if (label) {
            const originalText = label.textContent;
            label.textContent = "Copied!";
            window.setTimeout(() => {
                label.textContent = originalText;
            }, 2000);
        }
    } catch {
        showFeedback("Could not copy to clipboard.", "error");
    }
}

function wireAddScriptForm(container) {
    const addScriptForm = container.querySelector("[data-add-script-form]") ?? container;
    const fileInput = container.querySelector("#script-file");
    const fileNameDisplay = container.querySelector("[data-file-name]");
    const copyPromptButton = container.querySelector("[data-copy-prompt]");

    if (copyPromptButton) {
        copyPromptButton.addEventListener("click", () => {
            copyChatbotPrompt(copyPromptButton);
        });
    }

    if (!addScriptForm) {
        return;
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
}
