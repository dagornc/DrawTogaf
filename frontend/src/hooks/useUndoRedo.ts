import { useState, useCallback } from 'react';
import type { Node, Edge } from '@xyflow/react';

interface HistoryState {
    nodes: Node[];
    edges: Edge[];
}

export const useUndoRedo = () => {
    // History stacks
    const [past, setPast] = useState<HistoryState[]>([]);
    const [future, setFuture] = useState<HistoryState[]>([]);

    // We intentionally don't store "present" in state here to avoid double-rendering source of truth.
    // Instead, the "present" is passed in when taking a snapshot.

    const takeSnapshot = useCallback((nodes: Node[], edges: Edge[]) => {
        setPast((prev) => {
            // Limit history depth if needed, e.g. 50
            const newPast = [...prev, { nodes: JSON.parse(JSON.stringify(nodes)), edges: JSON.parse(JSON.stringify(edges)) }];
            return newPast.length > 50 ? newPast.slice(newPast.length - 50) : newPast;
        });
        setFuture([]); // New action clears future
    }, []);

    const canUndo = past.length > 0;
    const canRedo = future.length > 0;

    const undo = useCallback((currentNodes: Node[], currentEdges: Edge[]) => {
        if (past.length === 0) return null;

        const newPast = [...past];
        const previousState = newPast.pop();

        if (!previousState) return null;

        setPast(newPast);
        setFuture((prev) => [{ nodes: currentNodes, edges: currentEdges }, ...prev]);

        return previousState;
    }, [past]);

    const redo = useCallback((currentNodes: Node[], currentEdges: Edge[]) => {
        if (future.length === 0) return null;

        const newFuture = [...future];
        const nextState = newFuture.shift();

        if (!nextState) return null;

        setFuture(newFuture);
        setPast((prev) => [...prev, { nodes: currentNodes, edges: currentEdges }]);

        return nextState;
    }, [future]);

    return {
        takeSnapshot,
        undo,
        redo,
        canUndo,
        canRedo,
        historyPast: past,
        historyFuture: future
    };
};
