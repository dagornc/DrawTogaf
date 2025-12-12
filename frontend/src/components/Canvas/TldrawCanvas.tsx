import {
    Tldraw,
    useEditor,
    createShapeId,
    toRichText,
} from 'tldraw';
import 'tldraw/tldraw.css';
import { useEffect, useState } from 'react';
import type { AppNode } from '../../utils/types';
import type { Edge } from '@xyflow/react';
import { getLayoutedElements } from '../../utils/layout';

interface TldrawCanvasProps {
    nodes: AppNode[];
    edges: Edge[];
}

// Separate component to access the editor context
const TldrawManager = ({ nodes: rawNodes, edges: rawEdges }: TldrawCanvasProps) => {
    const editor = useEditor();
    const [processed, setProcessed] = useState<{ nodes: AppNode[], edges: Edge[] } | null>(null);

    // Run layout on mount or data change
    useEffect(() => {
        const runLayout = async () => {
            // Clone to avoid mutation issues
            const n = rawNodes.map(x => ({ ...x }));
            const e = rawEdges.map(x => ({ ...x }));
            // Use our improved ELK layout
            const { nodes: layoutedNodes, edges: layoutedEdges } = await getLayoutedElements(n, e, 'DOWN');
            setProcessed({ nodes: layoutedNodes, edges: layoutedEdges });
        };
        runLayout();
    }, [rawNodes, rawEdges]);

    useEffect(() => {
        if (!editor || !processed) return;

        const { nodes, edges } = processed;
        if (nodes.length === 0) return;

        editor.run(() => {
            // Helper to get absolute position recursively
            const getAbsolutePosition = (node: AppNode): { x: number, y: number } => {
                let x = node.position.x;
                let y = node.position.y;
                let currentParentId = node.parentId;

                while (currentParentId) {
                    const parent = nodes.find(n => n.id === currentParentId);
                    if (parent) {
                        x += parent.position.x;
                        y += parent.position.y;
                        currentParentId = parent.parentId;
                    } else {
                        break;
                    }
                }
                return { x, y };
            };

            // 1. Convert Nodes
            const shapes = nodes.map(node => {
                const shapeId = createShapeId(node.id);
                const { x, y } = getAbsolutePosition(node);

                // Styles
                let color = 'grey';
                let fill = 'none';
                if (node.data?.layer === 'Business') color = 'yellow';
                if (node.data?.layer === 'Application') color = 'light-blue';
                if (node.data?.layer === 'Technology') color = 'light-green';

                // Group Styling
                const isGroup = node.data?.isLayerGroup;

                return {
                    id: shapeId,
                    type: 'geo',
                    x: x,
                    y: y,
                    props: {
                        w: node.width || (isGroup ? 300 : 200),
                        h: node.height || (isGroup ? 200 : 100),
                        geo: 'rectangle',
                        color: color,
                        fill: fill,
                        dash: isGroup ? 'dashed' : 'draw',
                        richText: toRichText(String(node.data?.label || node.id)),
                        size: 'm',
                    }
                };
            });

            // 2. Convert Edges
            const arrows = edges.map(edge => {
                const shapeId = createShapeId(edge.id);
                const sourceId = createShapeId(edge.source);
                const targetId = createShapeId(edge.target);

                return {
                    id: shapeId,
                    type: 'arrow',
                    props: {
                        start: { type: 'binding', boundShapeId: sourceId, normalizedAnchor: { x: 0.5, y: 0.5 }, isExact: false },
                        end: { type: 'binding', boundShapeId: targetId, normalizedAnchor: { x: 0.5, y: 0.5 }, isExact: false },
                        richText: toRichText(String(edge.label || '')),
                        size: 'm'
                    }
                };
            });

            // Clear existing page
            const existingShapeIds = Array.from(editor.getCurrentPageShapeIds());
            if (existingShapeIds.length > 0) {
                editor.deleteShapes(existingShapeIds);
            }

            // Add new shapes
            editor.createShapes([...shapes, ...arrows]);

            // Zoom to fit
            setTimeout(() => {
                editor.zoomToFit();
            }, 100);
        });

    }, [editor, processed]);

    return null;
};

export const TldrawCanvas = ({ nodes, edges }: TldrawCanvasProps) => {
    return (
        <div style={{ width: '100%', height: '100%' }}>
            <Tldraw persistenceKey="drawtogaf-tldraw">
                <TldrawManager nodes={nodes} edges={edges} />
            </Tldraw>
        </div>
    );
};
