import { useState, useCallback } from 'react';
import type { Node, Edge } from '@xyflow/react';
import { useReactFlow } from '@xyflow/react';

interface ClipboardData {
    nodes: Node[];
    edges: Edge[];
}

export const useClipboard = () => {
    const { getNodes, getEdges, addNodes, addEdges } = useReactFlow();
    const [clipboard, setClipboard] = useState<ClipboardData | null>(null);

    const copy = useCallback(() => {
        const selectedNodes = getNodes().filter((n) => n.selected);
        const selectedEdges = getEdges().filter((e) => e.selected);

        if (selectedNodes.length === 0 && selectedEdges.length === 0) {
            return;
        }

        const data: ClipboardData = {
            nodes: selectedNodes.map(n => JSON.parse(JSON.stringify(n))),
            edges: selectedEdges.map(e => JSON.parse(JSON.stringify(e))),
        };

        setClipboard(data);
        console.log('Copied to clipboard', data);
    }, [getNodes, getEdges]);

    const paste = useCallback(() => {
        if (!clipboard) return;

        // Calculate offset to avoid exact overlap
        const offset = 20;

        const newNodes = clipboard.nodes.map((node) => {
            const id = `${node.id}-copy-${Date.now()}`;
            return {
                ...node,
                id,
                position: {
                    x: node.position.x + offset,
                    y: node.position.y + offset,
                },
                selected: true, // Select the pasted nodes
                data: { ...node.data, label: `${node.data.label} (Copy)` } // Optional: indicate copy
            };
        });

        // Better approach for edges: Map oldId -> newId
        const idMap = new Map<string, string>();
        clipboard.nodes.forEach((n, i) => {
            idMap.set(n.id, newNodes[i].id);
        });

        const reconstructedEdges = clipboard.edges.reduce((acc, edge) => {
            const newSource = idMap.get(edge.source);
            const newTarget = idMap.get(edge.target);

            if (newSource && newTarget) {
                acc.push({
                    ...edge,
                    id: `${edge.id}-copy-${Date.now()}`,
                    source: newSource,
                    target: newTarget,
                    selected: true
                });
            }
            return acc;
        }, [] as Edge[]);


        // Deselect current nodes
        // (Accessing setNodes/setEdges via instance would be better, but addNodes handles "add". 
        // We probably want to deselect others first)

        addNodes(newNodes);
        addEdges(reconstructedEdges);
    }, [clipboard, addNodes, addEdges]);

    return {
        copy,
        paste,
        hasCopied: !!clipboard
    };
};
