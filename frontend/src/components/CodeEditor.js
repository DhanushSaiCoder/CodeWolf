import React, { useState } from 'react';
import "../styles/CodeEditor.css";
import MonacoEditor from 'react-monaco-editor';

export default function CodeEditor(props) {

  const [code, setCode] = useState(
    'function hello() {\n  console.log("Hello, world!");\n}'
  );

  // Update code state when editor content changes
  const onChange = (newValue) => {
    setCode(newValue);
  };

  const editorDidMount = (editor, monaco) => {
    // Define and register the Night Owl theme
    const nightOwlTheme = {
      base: 'vs-dark',
      inherit: true,
      rules: [
        { token: '', foreground: 'D4D4D4', background: '011627' },
        { token: 'comment', foreground: '7a7a7a', fontStyle: 'italic' },
        { token: 'keyword', foreground: '82AAFF' },
        { token: 'number', foreground: 'FFCB6B' },
        { token: 'string', foreground: 'C3E88D' },
      ],
      colors: {
        'editor.background': '#011627',
      }
    };
    monaco.editor.defineTheme('night-owl', nightOwlTheme);

    // Disable the context menu
    editor.updateOptions({ contextmenu: false });

    // Get the editor's DOM node and disable native copy/cut/paste events
    const domNode = editor.getDomNode();
    if (domNode) {
      domNode.addEventListener('copy', (e) => e.preventDefault());
      domNode.addEventListener('cut', (e) => e.preventDefault());
      domNode.addEventListener('paste', (e) => e.preventDefault());
    }

    // Intercept keydown events to block keyboard shortcuts (Ctrl/Cmd+C, Ctrl/Cmd+X, Ctrl/Cmd+V)
    editor.onKeyDown((e) => {
      const ctrlCmd = e.ctrlKey || e.metaKey;
      if (ctrlCmd) {
        if (
          e.keyCode === monaco.KeyCode.KeyC ||
          e.keyCode === monaco.KeyCode.KeyX ||
          e.keyCode === monaco.KeyCode.KeyV
        ) {
          e.preventDefault();
        }
      }
    });

    // Focus the editor once mounted
    editor.focus();
  };

  // Editor options
  const options = {
    selectOnLineNumbers: true,
    automaticLayout: true,
  };

  return (
    <div className='CodeEditor'>
      <div className='CodeEditorHeader'>
        <h3>
          <span>{"</>"}</span> Code
        </h3>
        <button className='runBtn'>Run</button>
      </div>
      <div className='CodeEditorContent'>
        <MonacoEditor
          width="100%"
          height="100%"
          scrollbarWidth="none"
          borderRadius="20px"
          language="javascript"
          theme="night-owl"
          value={code}
          options={options}
          onChange={onChange}
          editorDidMount={editorDidMount}
          minimap={{ enabled: false }}
        />
      </div>

    </div>
  );
}
