import type { Node, NodeProps } from '@xyflow/react';

export interface AppNodeData extends Record<string, unknown> {
    label: string;
    type: string;
    layer: string;
    attributes?: Record<string, any>;
}

export type AppNode = Node<AppNodeData>;
export type AppNodeProps = NodeProps<AppNode>;
