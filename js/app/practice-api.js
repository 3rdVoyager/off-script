function createPracticeApi(toolId) {
    const meta = getPracticeToolMeta(toolId);

    if (!meta || !PRACTICE_TOOLS[toolId]) {
        throw new Error(`Unknown practice tool: ${toolId}`);
    }

    return {
        toolId,
        meta,

        loadSession(state) {
            const script = getActiveScript();

            if (!script) {
                return { ok: false, element: createPracticeEmptyState("no-script") };
            }

            const settings = getScriptSettings(script.id);
            const practiceCharacters = settings.practiceCharacters;
            const practiceScenes = settings.practiceScenes;

            if (practiceCharacters.length === 0) {
                return { ok: false, element: createPracticeEmptyState("no-character") };
            }

            if (Array.isArray(practiceScenes) && practiceScenes.length === 0) {
                return { ok: false, element: createPracticeEmptyState("no-scenes") };
            }

            const queue = buildPracticeQueue(script, practiceCharacters, practiceScenes);

            if (queue.length === 0) {
                return {
                    ok: false,
                    element: createPracticeEmptyState("no-lines"),
                };
            }

            if (state.script?.id !== script.id) {
                state.index = 0;
            }

            state.script = script;
            state.queue = queue;
            state.practiceCharacters = practiceCharacters;
            state.index = Math.min(state.index ?? 0, queue.length - 1);

            return {
                ok: true,
                queue,
                script,
                practiceCharacters,
            };
        },

        getCurrentItem(state) {
            return state.queue?.[state.index] ?? null;
        },

        formatMeta(item, index, total) {
            return formatPracticeMeta(item, index, total);
        },

        recordSuccess(state, item) {
            if (!state.script || !item) {
                return { ok: false };
            }

            const result = recordLineProgress(
                state.script.id,
                item.line.character,
                item.line.lineId,
                toolId
            );

            if (result.ok) {
                updateInterface();
            }

            return result;
        },

        toast(message, type = "success") {
            showFeedback(message, type);
        },

        refresh() {
            updateInterface();
        },

        renderCue(cueSection, cue) {
            renderPracticeCue(cueSection, cue);
        },

        createShell({ onPrev, onNext }) {
            return createPracticeToolShell({ onPrev, onNext });
        },

        linesMatch(typedText, expectedText) {
            return linesMatch(typedText, expectedText);
        },
    };
}
