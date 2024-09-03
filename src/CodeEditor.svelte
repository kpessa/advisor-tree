<script>
    import { onMount, afterUpdate } from 'svelte';
    import * as monaco from 'monaco-editor';

    export let code = '';
    export let language = 'json';

    let editorContainer;
    let editor;

    function initMonaco() {
        if (editor) {
            editor.dispose();
        }

        // Ensure JSON language is registered
        monaco.languages.register({ id: 'json' });
        monaco.languages.setMonarchTokensProvider('json', {
            tokenizer: {
                root: [
                    [/"[^"]*"/, 'string'],
                    [/[{}\[\]]/, 'delimiter.bracket'],
                    [/[0-9]+/, 'number'],
                    [/true|false|null/, 'keyword'],
                ]
            }
        });

        editor = monaco.editor.create(editorContainer, {
            value: code,
            language: language,
            theme: 'vs-dark',
            minimap: { enabled: false },
            automaticLayout: true,
            folding: true,
            foldingStrategy: 'indentation',
            scrollBeyondLastLine: false,
            wordWrap: 'on',
            lineNumbers: 'on',
            renderIndentGuides: true,
            readOnly: true
        });

        editor.getModel().updateOptions({ tabSize: 2 });
    }

    onMount(() => {
        initMonaco();
    });

    afterUpdate(() => {
        if (editor) {
            const model = editor.getModel();
            model.setValue(code);
            monaco.editor.setModelLanguage(model, language);
        }
    });

    function collapseFields() {
        if (!editor) return;
        const model = editor.getModel();
        const lines = model.getLinesContent();
        lines.forEach((line, index) => {
            if (line.includes('"SUB": "[...]"') || line.includes('"children": "[...]"')) {
                const lineNumber = index + 1;
                const range = new monaco.Range(lineNumber, 1, lineNumber, 1);
                editor.getAction('editor.fold').run();
            }
        });
    }

    $: if (editor && code) {
        editor.setValue(code);
        collapseFields();
    }
</script>

<div bind:this={editorContainer} class="editor-container"></div>

<style>
    .editor-container {
        height: 500px;
        border: 1px solid #ccc;
        margin-top: 10px;
    }
</style>