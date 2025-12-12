import { useState, useEffect, useRef, useMemo } from 'react';
import axios from 'axios';

import { ThemeProvider } from './context/ThemeContext';
import './i18n';
import './index.css';

import { WorkspaceLayout } from './layout/WorkspaceLayout';
import { RightSidebar } from './components/Sidebar/RightSidebar';
import { DiagramCanvas } from './components/Canvas/DiagramCanvas';
import { TldrawCanvas } from './components/Canvas/TldrawCanvas';
import type { DiagramCanvasHandle } from './components/Canvas/DiagramCanvas';
import { DrawingToolbar } from './components/Toolbar/DrawingToolbar';
import { Header } from './components/Layout/Header';
import { SettingsModal } from './components/Settings/SettingsModal';
import { generateArchitecture, checkHealth } from './services/api';
import type { GenerateResponse, ArchitectureGraph, ComplianceReport } from './services/api';

import type { AppNode } from './utils/types';

function App() {
  const [isSettingsOpen, setIsSettingsOpen] = useState(false);
  const [isGenerating, setIsGenerating] = useState(false);
  const [backendOnline, setBackendOnline] = useState(false);
  const [graphData, setGraphData] = useState<ArchitectureGraph | null>(null);
  const [complianceData, setComplianceData] = useState<ComplianceReport | null>(null);
  const [isExporting, setIsExporting] = useState(false);
  const [viewMode, setViewMode] = useState<'diagram' | 'whiteboard'>('diagram');
  const [selectedNode, setSelectedNode] = useState<AppNode | null>(null);
  const [focusedNodeId, setFocusedNodeId] = useState<string | null>(null);

  // Layer Visibility State
  const [visibleLayers, setVisibleLayers] = useState<Record<string, boolean>>({
    Strategy: true,
    Business: true,
    Application: true,
    Technology: true,
    Physical: true,
    Implementation: true,
    Other: true
  });

  const toggleLayer = (layer: string) => {
    setVisibleLayers(prev => ({ ...prev, [layer]: !prev[layer] }));
  };

  const handleFocusNode = (nodeId: string) => {
    setFocusedNodeId(nodeId);
    // Optional: Reset selections or just keep it
  };

  const handleClearFocus = () => {
    setFocusedNodeId(null);
  };

  const canvasRef = useRef<DiagramCanvasHandle>(null);

  const [selectedModel, setSelectedModel] = useState<string>('tngtech/deepseek-r1t2-chimera:free');

  useEffect(() => {
    // Initial health check
    checkHealth().then(data => setBackendOnline(!!data));
  }, []);

  const handleGenerate = async (prompt: string, type: string) => {
    console.log("Generating:", prompt, "Type:", type, "Model:", selectedModel);
    setIsGenerating(true);
    setGraphData(null);
    setComplianceData(null);
    setSelectedNode(null); // Clear selection on new generation
    setFocusedNodeId(null); // Clear focus

    try {
      const response: GenerateResponse = await generateArchitecture(prompt, type, selectedModel);
      console.log("Received Graph Data:", response.graph);
      setGraphData(response.graph);
      setComplianceData(response.compliance);
    } catch (error: unknown) {
      console.error("Generation failed:", error);
      let errorMessage = "Failed to generate architecture.";
      if (axios.isAxiosError(error) && error.response?.data?.detail) {
        errorMessage = error.response.data.detail;
      } else if (error instanceof Error) {
        errorMessage = error.message;
      }
      alert(`Error: ${errorMessage}`);
    } finally {
      setIsGenerating(false);
    }
  };

  const handleExport = async () => {
    if (canvasRef.current) {
      setIsExporting(true);
      try {
        await canvasRef.current.exportPptx();
      } catch (error) {
        console.error("Export failed:", error);
        alert("Failed to export PowerPoint presentation.");
      } finally {
        setIsExporting(false);
      }
    }
  };

  const handleZoomIn = () => canvasRef.current?.zoomIn();
  const handleZoomOut = () => canvasRef.current?.zoomOut();
  const handleFitView = () => canvasRef.current?.fitView();

  // Helper to extract CURRENT nodes/edges from reference or state? 
  // Ideally DiagramCanvas should lift state up, but for now we rely on graphData. 
  // Note: graphData does NOT have positions unless generated. 
  // We need the layouted positions.
  // The DiagramCanvas computes layout internally. 
  // To sync, we should probably refactor to have layout state in App or use a context.
  // For this MVP, we will pass graphData and let TldrawCanvas re-layout using the same ELK util.
  // Or better: DiagramCanvas exposes nodes via ref? No, easier to re-layout.

  // Filter Graph Data based on visible layers AND focus (neighborhood)
  const filteredGraphData = useMemo(() => {
    if (!graphData) return null;

    let nodes = graphData.nodes;
    let edges = graphData.edges;

    // 1. Filter by Focused Node (Neighborhood)
    if (focusedNodeId) {
      // Find neighbors
      const neighborIds = new Set<string>();
      neighborIds.add(focusedNodeId);

      edges.forEach(e => {
        if (e.source_id === focusedNodeId) neighborIds.add(e.target_id);
        if (e.target_id === focusedNodeId) neighborIds.add(e.source_id);
      });

      nodes = nodes.filter(n => neighborIds.has(n.id));
    }

    // 2. Filter by Layer
    nodes = nodes.filter(n => {
      const layer = n.layer || 'Other';
      return visibleLayers[layer] !== false;
    });

    // 3. Filter Edges (must connect existing nodes)
    const nodeIds = new Set(nodes.map(n => n.id));
    edges = edges.filter(e => nodeIds.has(e.source_id) && nodeIds.has(e.target_id));

    return { nodes, edges };
  }, [graphData, visibleLayers, focusedNodeId]);

  // Transform graphData for TldrawCanvas (it expects AppNode[])
  const appNodes = filteredGraphData ? filteredGraphData.nodes.map(n => ({
    id: n.id,
    type: 'custom',
    position: n.position || { x: 0, y: 0 },
    data: {
      label: n.name,
      type: n.type,
      layer: n.layer,
    },
    width: n.width,
    height: n.height
  })) : [];

  const appEdges = filteredGraphData ? filteredGraphData.edges.map((e, idx) => ({
    id: `e${idx}`,
    source: e.source_id,
    target: e.target_id,
    label: e.type
  })) : [];

  // We need to run layout once for Tldraw if we want it to match initially,
  // or TldrawCanvas can run the same ELK function.

  return (
    <ThemeProvider>
      <WorkspaceLayout
        header={<Header
          onOpenSettings={() => setIsSettingsOpen(true)}
          isBackendOnline={backendOnline}
          compliance={complianceData}
        />}
        sidebar={
          <RightSidebar
            onGenerate={handleGenerate}
            isGenerating={isGenerating}
            selectedNode={selectedNode}
            onCloseDetails={() => setSelectedNode(null)}
            visibleLayers={visibleLayers}
            onToggleLayer={toggleLayer}
            onFocusNode={handleFocusNode}
          />
        }
        canvas={
          viewMode === 'diagram' ? (
            <div className="relative w-full h-full">
              {focusedNodeId && (
                <div className="absolute top-4 left-4 z-50">
                  <button
                    onClick={handleClearFocus}
                    className="bg-primary text-primary-foreground px-4 py-2 rounded-xl shadow-lg font-bold text-xs animate-in fade-in zoom-in hover:bg-primary/90 transition-colors"
                  >
                    Exit Focus Mode
                  </button>
                </div>
              )}
              <DiagramCanvas
                ref={canvasRef}
                data={filteredGraphData || graphData} // Use filtered data, fallback to raw if null (logic handled above)
                isLoading={isGenerating}
                onNodeSelect={setSelectedNode}
              />
            </div>
          ) : (
            <TldrawCanvas nodes={appNodes} edges={appEdges} />
          )
        }
        toolbar={
          <DrawingToolbar
            onExport={handleExport}
            isExporting={isExporting}
            onZoomIn={handleZoomIn}
            onZoomOut={handleZoomOut}
            onFitView={handleFitView}
            viewMode={viewMode}
            onToggleView={() => setViewMode(v => v === 'diagram' ? 'whiteboard' : 'diagram')}
          />
        }
      />
      <SettingsModal
        isOpen={isSettingsOpen}
        onClose={() => setIsSettingsOpen(false)}
        selectedModel={selectedModel}
        onSelectModel={setSelectedModel}
      />
    </ThemeProvider>
  );
}

export default App;
