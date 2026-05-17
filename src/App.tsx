import React, { useState, useEffect, useRef } from 'react';
import { FileUp, Clipboard, Eye, Download } from 'lucide-react';
import { parseHL7 } from './utils/hl7Parser';
import { toJSON, toXML, toCSV, toHTML, toText } from './utils/converters';

type Format = 'json' | 'xml' | 'csv' | 'html' | 'text';

function App() {
  const [input, setInput] = useState<string>('');
  const [activeFormat, setActiveFormat] = useState<Format>('json');
  const [output, setOutput] = useState<string>('');
  const [isDragging, setIsDragging] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (!input.trim()) {
      setOutput('');
      return;
    }

    try {
      const parsed = parseHL7(input);
      switch (activeFormat) {
        case 'json': setOutput(toJSON(parsed)); break;
        case 'xml': setOutput(toXML(parsed)); break;
        case 'csv': setOutput(toCSV(parsed)); break;
        case 'html': setOutput(toHTML(parsed)); break;
        case 'text': setOutput(toText(parsed)); break;
      }
    } catch (err) {
      setOutput('Error parsing HL7: ' + (err as Error).message);
    }
  }, [input, activeFormat]);

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = (ev) => {
        setInput(ev.target?.result as string);
      };
      reader.readAsText(file);
    }
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
    const file = e.dataTransfer.files[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = (ev) => {
        setInput(ev.target?.result as string);
      };
      reader.readAsText(file);
    }
  };

  const downloadOutput = () => {
    const extensions: Record<Format, string> = {
      json: 'json', xml: 'xml', csv: 'csv', html: 'html', text: 'txt'
    };
    const blob = new Blob([output], { type: 'text/plain' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `converted_hl7.${extensions[activeFormat]}`;
    a.click();
  };

  const copyToClipboard = () => {
    navigator.clipboard.writeText(output);
  };

  return (
    <div className="app-container">
      <header>
        <h1>HL7 Multi-Converter</h1>
        <p>Seamlessly convert HL7 messages to JSON, XML, CSV, HTML, and Text</p>
      </header>

      <div className="main-grid">
        <div className="card">
          <h2><Clipboard size={20} /> Input HL7 Message</h2>
          <div 
            className={`file-upload-zone ${isDragging ? 'dragging' : ''}`}
            onDragOver={(e) => { e.preventDefault(); setIsDragging(true); }}
            onDragLeave={() => setIsDragging(false)}
            onDrop={handleDrop}
            onClick={() => fileInputRef.current?.click()}
          >
            <FileUp size={40} color="var(--primary)" style={{ marginBottom: '1rem' }} />
            <p>Click to upload or drag & drop .hl7 / .txt files</p>
            <input 
              type="file" 
              ref={fileInputRef} 
              style={{ display: 'none' }} 
              onChange={handleFileUpload}
              accept=".hl7,.txt"
            />
          </div>
          <textarea 
            placeholder="Paste your HL7 message here... (e.g. MSH|^~&|...)"
            value={input}
            onChange={(e) => setInput(e.target.value)}
          />
        </div>

        <div className="card">
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1rem' }}>
            <h2 style={{ margin: 0 }}><Eye size={20} /> Preview Output</h2>
            <div className="btn-group" style={{ margin: 0 }}>
              <button className="btn btn-primary" onClick={downloadOutput} disabled={!output}>
                <Download size={16} /> Download
              </button>
            </div>
          </div>

          <div className="tabs">
            {(['json', 'xml', 'csv', 'html', 'text'] as Format[]).map(fmt => (
              <button 
                key={fmt}
                className={`tab ${activeFormat === fmt ? 'active' : ''}`}
                onClick={() => setActiveFormat(fmt)}
              >
                {fmt.toUpperCase()}
              </button>
            ))}
          </div>

          <div className="output-container">
            <button className="copy-btn" onClick={copyToClipboard} disabled={!output}>Copy</button>
            {activeFormat === 'html' ? (
              <div className="output-pre" dangerouslySetInnerHTML={{ __html: output }} />
            ) : (
              <pre className="output-pre">{output}</pre>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}

export default App;
