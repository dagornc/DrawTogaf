import { memo } from 'react';
import type { NodeProps } from '@xyflow/react';
import { GroupNode } from './GroupNode';
import { ElementNode } from './ElementNode';
import type { AppNode } from '../../utils/types';

// Safe type checking helper
const isGroupNode = (type?: string) => {
    if (!type) return false;
    const t = type.toLowerCase();
    return t.includes('grouping') || t.includes('zone') || t === 'location' || t.includes('layer');
};

export const CustomNode = memo((props: NodeProps<AppNode>) => {
    const { data } = props;
    const isGrouping = isGroupNode(data.type);

    if (isGrouping) {
        return <GroupNode {...props} />;
    }

    return <ElementNode {...props} />;
});
