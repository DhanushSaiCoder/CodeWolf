import React, { useEffect, useState } from 'react';
import "../styles/CodeEditor.css";
import MonacoEditor from 'react-monaco-editor';
import Loader from './Loader';

export default function CodeEditor({ question, matchDoc: matchObj, handleCodeOutput }) {
  const [code, setCode] = useState("");
  const [runningCode, setRunningCode] = useState(false)

  // Update code state when editor content changes
  const onChange = (newValue) => {
    setCode(newValue);
    localStorage.setItem("code", JSON.stringify({ code, match_id: matchObj._id }))
  };

  useEffect(() => {
    if (question == null || !JSON.parse(localStorage.getItem('code'))) return

    const codeLs = JSON.parse(localStorage.getItem('code'))
    if (codeLs.match_id == matchObj._id) setCode(codeLs.code)
  }, [question])

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

  const handleRunCode = () => {
    setRunningCode(true)
    // code runnning logic goes here
    let url = process.env.REACT_APP_BACKEND_URL
    switch (matchObj.language) {
      case 'js':
        url += '/run/js'
        break
      case 'java':
        url += '/run/java'
        break
      case 'c':
        url += '/run/c'
        break
    }
    fetch(url, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({ code: code, question_id: question._id })
    })
      .then(response => response.json())
      .then(data => {
        console.log("code output data: ", data)
        setRunningCode(false)
        handleCodeOutput(data)

      })
      .catch(error => {
        console.error('Error running code:', error);
      });

  }



  return (
    <div className='CodeEditor'>
      <div className='CodeEditorHeader'>
        <h3>
          <span><svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" class="lucide lucide-code-xml-icon lucide-code-xml"><path d="m18 16 4-4-4-4" /><path d="m6 8-4 4 4 4" /><path d="m14.5 4-5 16" /></svg></span> Code
        </h3>
        <div className='code_editor_header_buttonsDiv'>
          <button onClick={handleRunCode} className='runBtn'>
            {!runningCode ? "Run" : <Loader />}
          </button>
          <button className='submitBtn'>Submit</button>
        </div>
      </div>
      <div className='CodeEditorContent'>
        {question != null ? <MonacoEditor
          width="100%"
          height="100%"
          scrollbarWidth="none"
          borderRadius="20px"
          language={question?.question_programming_language}
          theme="night-owl"
          value={code}
          options={options}
          onChange={onChange}
          editorDidMount={editorDidMount}
          minimap={{ enabled: false }}
        /> : <p>Loading...</p>}
      </div>

    </div>
  );
}
