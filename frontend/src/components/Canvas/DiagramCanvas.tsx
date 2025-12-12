import React, { useEffect, useCallback } from 'react';
import {
    ReactFlow,
    Background,
    MiniMap,
    useNodesState,
    useEdgesState,
    useReactFlow,
    ReactFlowProvider,
    MarkerType,
    Panel,
    ConnectionLineType,
} from '@xyflow/react';
import type {
    ReactFlowInstance,
    Node,
    Edge,
} from '@xyflow/react';
import type { AppNode } from '../../utils/types';
import '@xyflow/react/dist/style.css';

import { useTranslation } from 'react-i18next';
import type { ArchitectureGraph, ArchitectureNode, ArchitectureEdge } from '../../services/api';
import { CustomNode } from './CustomNode';
import { exportToPptx } from '../../services/api';
import { getLayoutedElements } from '../../utils/layout';
import { useUndoRedo } from '../../hooks/useUndoRedo';
import { useClipboard } from '../../hooks/useClipboard';
import { ContextMenu } from './ContextMenu';
import { Undo, Redo, Copy, Clipboard as PasteIcon } from 'lucide-react';

const nodeTypes = {
    custom: CustomNode,
};

interface DiagramCanvasProps {
    data: ArchitectureGraph | null;
    isLoading: boolean;
    onNodeSelect?: (node: AppNode | null) => void;
}

const DiagramFlow: React.FC<DiagramCanvasProps & { onInitInstance: (instance: ReactFlowInstance) => void }> = ({ data, onInitInstance, onNodeSelect }) => {
    const [nodes, setNodes, onNodesChange] = useNodesState<AppNode>([]);
    const [edges, setEdges, onEdgesChange] = useEdgesState<Edge>([]);
    const reactFlowInstance = useReactFlow();

    // Selection Handling
    const onSelectionChange = useCallback(({ nodes: selectedNodes }: { nodes: Node[] }) => {
        if (onNodeSelect) {
            onNodeSelect(selectedNodes.length > 0 ? (selectedNodes[0] as AppNode) : null);
        }
    }, [onNodeSelect]);

    // Advanced Hooks
    const { takeSnapshot, undo, redo, canUndo, canRedo } = useUndoRedo();
    const { copy, paste } = useClipboard();
    const [menu, setMenu] = React.useState<{ id: string, top: number, left: number, right?: number, bottom?: number } | null>(null);

    // Context Menu Handler
    const onNodeContextMenu = useCallback(
        (event: React.MouseEvent, node: Node) => {
            event.preventDefault();
            // Calculate absolute position for the div
            setMenu({
                id: node.id,
                top: event.clientY,
                left: event.clientX,
            });
        },
        [reactFlowInstance]
    );

    const onPaneClick = useCallback(() => setMenu(null), []);

    // Snapshot on Drag Start
    const onNodeDragStart = useCallback(() => {
        takeSnapshot(nodes, edges);
    }, [nodes, edges, takeSnapshot]);

    // Keyboard Shortcuts
    useEffect(() => {
        const handleKeyDown = (e: KeyboardEvent) => {
            if ((e.metaKey || e.ctrlKey) && !e.repeat) {
                if (e.key === 'z') {
                    e.preventDefault();
                    if (e.shiftKey) {
                        const state = redo(nodes, edges);
                        if (state) {
                            setNodes(state.nodes as AppNode[]);
                            setEdges(state.edges as Edge[]);
                        }
                    } else {
                        const state = undo(nodes, edges);
                        if (state) {
                            setNodes(state.nodes as AppNode[]);
                            setEdges(state.edges as Edge[]);
                        }
                    }
                } else if (e.key === 'y') {
                    e.preventDefault();
                    const state = redo(nodes, edges);
                    if (state) {
                        setNodes(state.nodes as AppNode[]);
                        setEdges(state.edges as Edge[]);
                    }
                } else if (e.key === 'c') {
                    copy();
                } else if (e.key === 'v') {
                    if (document.activeElement?.tagName !== 'INPUT' && document.activeElement?.tagName !== 'TEXTAREA') {
                        e.preventDefault();
                        takeSnapshot(nodes, edges); // Snapshot before paste
                        paste();
                    }
                }
            }
        };
        window.addEventListener('keydown', handleKeyDown);
        return () => window.removeEventListener('keydown', handleKeyDown);
    }, [nodes, edges, undo, redo, copy, paste, takeSnapshot, setNodes, setEdges]);

    useEffect(() => {
        if (reactFlowInstance) {
            onInitInstance(reactFlowInstance);
        }
    }, [reactFlowInstance, onInitInstance]);

    useEffect(() => {
        if (data && data.nodes.length > 0) {
            const initialNodes: AppNode[] = (data?.nodes || []).map((node: any) => ({
                id: node.id,
                type: 'custom',
                position: node.position || { x: 0, y: 0 },
                data: {
                    label: node.name || node.id || 'Untitled',
                    type: node.type || 'unknown',
                    layer: node.layer || 'Default',
                    description: node.description,
                    attributes: node.attributes || {}
                },
                width: node.width,
                height: node.height
            }));

            const initialEdges: Edge[] = data.edges.map((e, idx) => ({
                id: `e${idx}`,
                source: e.source_id,
                target: e.target_id,
                type: 'smoothstep', // Orthogonal lines are cleaner for architecture
                animated: false,
                label: e.type,
                style: { strokeWidth: 2, stroke: '#94a3b8' }, // Lighter gray for cleaner look
                labelStyle: { fill: '#1e293b', fontSize: 11, fontWeight: 600, fontFamily: 'Inter, sans-serif' },
                labelShowBg: true,
                labelBgStyle: { fill: '#ffffff', fillOpacity: 0.85 },
                labelBgPadding: [6, 4],
                labelBgBorderRadius: 6,
                markerEnd: {
                    type: MarkerType.ArrowClosed,
                    width: 20,
                    height: 20,
                    color: '#94a3b8'
                },
            }));

            // Async layout calculation
            getLayoutedElements(initialNodes, initialEdges).then(({ nodes: layoutedNodes, edges: layoutedEdges }) => {
                setNodes(layoutedNodes);
                setEdges(layoutedEdges);

                // Fit view after small delay to allow render
                setTimeout(() => reactFlowInstance.fitView({ padding: 0.2, minZoom: 0.1 }), 50);
            });
        }
    }, [data, setNodes, setEdges, reactFlowInstance]);

    const onLayout = useCallback((direction: string) => {
        getLayoutedElements(nodes, edges, direction).then(({ nodes: layoutedNodes, edges: layoutedEdges }) => {
            setNodes([...layoutedNodes] as AppNode[]);
            setEdges([...layoutedEdges] as Edge[]);
            window.requestAnimationFrame(() => reactFlowInstance.fitView());
        });
    }, [nodes, edges, setNodes, setEdges, reactFlowInstance]);

    const handleExport = useCallback(() => {
        const currentNodes = reactFlowInstance.getNodes();
        const archNodes: ArchitectureNode[] = currentNodes.map(n => {
            // Safe access validation
            const label = typeof n.data.label === 'string' ? n.data.label : n.id;
            const anyNode = n as any;
            const pos = anyNode.computed?.positionAbsolute || anyNode.positionAbsolute || n.position;

            return {
                id: n.id,
                name: label,
                layer: typeof n.data.layer === 'string' ? n.data.layer : 'Default',
                type: typeof n.data.type === 'string' ? n.data.type : 'Unknown',
                attributes: (n.data.attributes || {}) as Record<string, string | number | boolean | null>,
                description: (n.data.description as string | undefined),
                position: pos,
                width: n.measured?.width ?? n.width,
                height: n.measured?.height ?? n.height
            };
        });

        const archEdges: ArchitectureEdge[] = edges.map(e => ({
            source_id: e.source,
            target_id: e.target,
            type: (e.label as string) || 'association',
            // Safe access if data is present, otherwise undefined
            description: (e.data && 'description' in e.data ? e.data.description : undefined) as string | undefined
        }));

        exportToPptx(archNodes, archEdges);
    }, [reactFlowInstance, edges]);

    return (
        <div style={{ width: '100%', height: '100%' }}>
            <ReactFlow
                nodes={nodes}
                edges={edges}
                onNodesChange={onNodesChange}
                onEdgesChange={onEdgesChange}
                onNodeDragStart={onNodeDragStart}
                onNodeContextMenu={onNodeContextMenu}
                onPaneClick={onPaneClick}
                onSelectionChange={onSelectionChange}
                nodeTypes={nodeTypes}
                connectionLineType={ConnectionLineType.SmoothStep}
                fitView
                minZoom={0.1}
                colorMode="system" // Built-in dark mode support
                className="bg-slate-50 dark:bg-slate-900"
            >
                <Background gap={24} size={1} />
                {/* Controls removed to avoid duplication with DrawingToolbar and overlap with Sidebar */}
                <MiniMap
                    position="bottom-left"
                    className="glass !border-white/20 !shadow-lg rounded-xl overflow-hidden m-4"
                    maskColor="rgba(255, 255, 255, 0.1)"
                />

                <Panel position="top-left" className="flex flex-col gap-3 pointer-events-none p-4 mt-16">
                    {/* Added mt-16 to avoid conflict with potential top-left overlays like Exit Focus Mode */}
                    <div className="glass p-3 rounded-xl shadow-lg text-xs text-muted-foreground backdrop-blur-md pointer-events-auto border border-white/10 flex items-center gap-3">
                        <span className="font-bold text-foreground">{nodes.length} Elements</span>
                        <div className="w-1 h-1 rounded-full bg-primary/50"></div>
                        <span className="font-bold text-foreground">{edges.length} Relationships</span>
                    </div>

                    <div className="glass p-2 rounded-xl shadow-lg flex flex-col gap-2 backdrop-blur-md pointer-events-auto border border-white/10">
                        <span className="text-[9px] font-bold text-muted-foreground uppercase tracking-widest px-1">Layout</span>
                        <div className="flex gap-1">
                            <button
                                onClick={() => onLayout('TB')}
                                className="px-3 py-1.5 bg-secondary/50 hover:bg-white/20 text-foreground text-[10px] uppercase font-bold tracking-wide rounded-lg transition-all flex-1"
                                title="Vertical Layout"
                            >
                                Vertical
                            </button>
                            <button
                                onClick={() => onLayout('LR')}
                                className="px-3 py-1.5 bg-secondary/50 hover:bg-white/20 text-foreground text-[10px] uppercase font-bold tracking-wide rounded-lg transition-all flex-1"
                                title="Horizontal Layout"
                            >
                                Horizontal
                            </button>
                        </div>
                    </div>

                    <div className="glass p-2 rounded-xl shadow-lg flex gap-1 backdrop-blur-md pointer-events-auto border border-white/10">
                        <button
                            onClick={() => {
                                const state = undo(nodes, edges);
                                if (state) { setNodes(state.nodes as AppNode[]); setEdges(state.edges as Edge[]); }
                            }}
                            disabled={!canUndo}
                            className={`p-1.5 rounded-lg transition-colors ${!canUndo ? 'text-muted-foreground/30' : 'hover:bg-white/10 text-foreground'}`}
                            title="Undo (Ctrl+Z)"
                        >
                            <Undo size={16} />
                        </button>
                        <button
                            onClick={() => {
                                const state = redo(nodes, edges);
                                if (state) { setNodes(state.nodes as AppNode[]); setEdges(state.edges as Edge[]); }
                            }}
                            disabled={!canRedo}
                            className={`p-1.5 rounded-lg transition-colors ${!canRedo ? 'text-muted-foreground/30' : 'hover:bg-white/10 text-foreground'}`}
                            title="Redo (Ctrl+Y)"
                        >
                            <Redo size={16} />
                        </button>
                        <div className="w-[1px] bg-white/10 mx-1" />
                        <button
                            onClick={copy}
                            className="p-1.5 hover:bg-white/10 text-foreground rounded-lg transition-colors"
                            title="Copy (Ctrl+C)"
                        >
                            <Copy size={16} />
                        </button>
                        <button
                            onClick={() => { takeSnapshot(nodes, edges); paste(); }}
                            className="p-1.5 hover:bg-white/10 text-foreground rounded-lg transition-colors"
                            title="Paste (Ctrl+V)"
                        >
                            <PasteIcon size={16} />
                        </button>
                    </div>
                </Panel>
                {menu && (
                    <ContextMenu
                        {...menu}
                        onClose={() => setMenu(null)}
                        onExport={() => {
                            handleExport();
                            setMenu(null);
                        }}
                        onDuplicate={() => {
                            const node = nodes.find(n => n.id === menu?.id);
                            if (node && node.data) {
                                takeSnapshot(nodes, edges);
                                const newNode: AppNode = {
                                    ...node,
                                    id: `${node.id}-dup-${Date.now()}`,
                                    position: {
                                        x: node.position.x + 20,
                                        y: node.position.y + 20
                                    },
                                    selected: true,
                                    data: { ...node.data }
                                };
                                setNodes((nds) => [...nds.map(n => ({ ...n, selected: false })), newNode]);
                            }
                        }}
                        onDelete={() => {
                            takeSnapshot(nodes, edges);
                            setNodes((nds) => nds.filter((n) => n.id !== menu.id));
                            setEdges((eds) => eds.filter((e) => e.source !== menu.id && e.target !== menu.id));
                        }}
                    />
                )}
            </ReactFlow>
        </div>
    );
};

export interface DiagramCanvasHandle {
    exportPptx: () => void;
    zoomIn: () => void;
    zoomOut: () => void;
    fitView: () => void;
}

export const DiagramCanvas = React.forwardRef<DiagramCanvasHandle, DiagramCanvasProps>(({ data, isLoading, onNodeSelect }, ref) => {
    const { t } = useTranslation();
    const [rfInstance, setRfInstance] = React.useState<ReactFlowInstance | null>(null);

    React.useImperativeHandle(ref, () => ({
        exportPptx: () => {
            if (rfInstance) {
                const nodes = rfInstance.getNodes().map(n => {
                    // Cast to any to access computed/positionAbsolute if types are stuck on older version
                    const anyNode = n as any;
                    const pos = anyNode.computed?.positionAbsolute || anyNode.positionAbsolute || n.position;

                    return {
                        id: n.id,
                        name: (n.data.label as string) || (n.data.name as string) || n.id,
                        layer: (n.data.layer as string) || "Unknown",
                        type: (n.data.type as string) || "Unknown",
                        attributes: n.data.attributes as Record<string, unknown> || n.data,
                        description: n.data.description as string | undefined,
                        // Critical fixes for export
                        position: pos,
                        width: n.width ?? undefined,
                        height: n.height ?? undefined
                    } as ArchitectureNode;
                });
                const edges = rfInstance.getEdges().map(e => ({
                    source_id: e.source,
                    target_id: e.target,
                    type: e.label as string || "association",
                    description: e.data?.description as string | undefined
                }));
                exportToPptx(nodes, edges);
            }
        },
        zoomIn: () => {
            if (rfInstance) {
                rfInstance.zoomIn();
            }
        },
        zoomOut: () => {
            if (rfInstance) {
                rfInstance.zoomOut();
            }
        },
        fitView: () => {
            if (rfInstance) {
                rfInstance.fitView();
            }
        }
    }));

    if (isLoading) {
        return (
            <div className="flex flex-col items-center justify-center h-full gap-4">
                <div className="relative">
                    <div className="absolute inset-0 rounded-full blur-md bg-primary/40 animate-pulse" />
                    <div className="w-12 h-12 rounded-full border-4 border-primary/30 border-t-primary animate-spin relative z-10" />
                </div>
                <p className="text-sm font-medium text-muted-foreground animate-pulse">Generating Architecture Model...</p>
            </div>
        );
    }

    if (!data) {
        return (
            <div className="flex items-center justify-center h-full text-muted-foreground">
                <div className="text-center space-y-2">
                    <h3 className="text-lg font-semibold text-foreground">{t('nav.visualize', 'Visualize')}</h3>
                    <p className="text-sm">Enter a prompt to generate a new architecture.</p>
                </div>
            </div>
        );
    }

    return (
        <ReactFlowProvider>
            <DiagramFlow data={data} isLoading={isLoading} onInitInstance={setRfInstance} onNodeSelect={onNodeSelect} />
        </ReactFlowProvider>
    );
});
