import React, { useState, useEffect } from 'react';
import './App.css';
import Highlighter from 'react-highlight-words';
const APP_URL = "http://localhost:8000";


function App() {
  const [namespaces, setNamespaces] = useState([]);
  const [pods, setPods] = useState([]);
  const [containers, setContainers] = useState([]);
  const [logs, setLogs] = useState("No logs found.");
  
  const [selectedNamespace, setSelectedNamespace] = useState("");
  const [selectedPod, setSelectedPod] = useState("");
  const [selectedContainer, setSelectedContainer] = useState("");
  const [searchKeyword, setSearchKeyword] = useState("");

  useEffect(() => {
    fetchNamespaces();
  }, []);

  useEffect(() => {
    if (selectedNamespace) {
      fetchPods(selectedNamespace);
    }
  }, [selectedNamespace]);

  useEffect(() => {
    if (selectedNamespace && selectedPod) {
      fetchContainers(selectedNamespace, selectedPod);
    }
  }, [selectedPod]);

  const fetchNamespaces = async () => {
    try {
      const response = await fetch(`${APP_URL}/api/namespaces`);
      const data = await response.json();
      setNamespaces(data.namespaces);
    } catch (error) {
      console.error("Error fetching namespaces:", error);
    }
  };

  const fetchPods = async (namespace) => {
    try {
      const response = await fetch(`${APP_URL}/api/pods?namespace=${namespace}`);
      const data = await response.json();
      setPods(data.pods);
      setSelectedPod("");
      setContainers([]);
    } catch (error) {
      console.error("Error fetching pods:", error);
    }
  };

  const fetchContainers = async (namespace, pod) => {
    try {
      const response = await fetch(`${APP_URL}/api/containers?namespace=${namespace}&pod=${pod}`);
      const data = await response.json();
      setContainers(data.containers);
      setSelectedContainer("");
    } catch (error) {
      console.error("Error fetching containers:", error);
    }
  };

  const fetchLogs = async () => {
    try {
      const response = await fetch(
        `${APP_URL}/api/logs?namespace=${selectedNamespace}&pod=${selectedPod}&container=${selectedContainer}&tail=100`
      );
      const data = await response.json();
      setLogs(data.logs || "No logs found.");
    } catch (error) {
      console.error("Error fetching logs:", error);
      setLogs("Error fetching logs");
    }
  };

  return (
    <div className="app-container">
      <h1>KubeFlare - Kubernetes Log Viewer</h1>
      
      <div className="controls">
        <div className="select-group">
          <label htmlFor="namespaceSelect">Select Namespace</label>
          <select 
            id="namespaceSelect" 
            value={selectedNamespace}
            onChange={(e) => setSelectedNamespace(e.target.value)}
          >
            <option value="">Select Namespace</option>
            {namespaces.map(ns => (
              <option key={ns} value={ns}>{ns}</option>
            ))}
          </select>
        </div>
        
        <div className="select-group">
          <label htmlFor="podSelect">Select Pod</label>
          <select 
            id="podSelect" 
            value={selectedPod}
            onChange={(e) => setSelectedPod(e.target.value)}
            disabled={!selectedNamespace}
          >
            <option value="">Select Pod</option>
            {pods.map(pod => (
              <option key={pod} value={pod}>{pod}</option>
            ))}
          </select>
        </div>
        
        <div className="select-group">
          <label htmlFor="containerSelect">Select Container</label>
          <select 
            id="containerSelect" 
            value={selectedContainer}
            onChange={(e) => setSelectedContainer(e.target.value)}
            disabled={!selectedPod}
          >
            <option value="">Select Container</option>
            {containers.map(container => (
              <option key={container} value={container}>{container}</option>
            ))}
          </select>
        </div>
        
        <button 
          id="fetchLogsBtn" 
          onClick={fetchLogs}
          disabled={!selectedContainer}
        >
          Fetch Logs
        </button>
      </div>
      
      <div className="search-container">
      <input
        type="text"
        className="search-input"
        placeholder="Search logs..."
        value={searchKeyword}
        onChange={(e) => setSearchKeyword(e.target.value)}
      />
    </div>
      
      <div className="log-viewer-container">
          <pre id="logViewer">
          {typeof logs === 'string' ? (
            searchKeyword ? (
              <Highlighter
                highlightClassName="highlighted-text"
                searchWords={[searchKeyword]}
                autoEscape={true}
                textToHighlight={logs}
              />
            ) : (
              logs
            )
          ) : (
            "No logs found."
          )}
        </pre>
      </div>
    </div>
  );
}

export default App;

