import React, { memo, useState, useRef, useEffect, useCallback } from 'react';
import { Handle, Position, NodeResizer, useReactFlow } from '@xyflow/react';
import type { NodeProps } from '@xyflow/react';
import { ChevronDown, ChevronRight } from 'lucide-react';
import { getElementStyle, getIcon } from './NodeStyling';
import type { AppNode } from '../../utils/types';


type GroupNodeProps = NodeProps<AppNode> & { style?: React.CSSProperties };

export const GroupNode = memo(({ data, id, selected, style }: GroupNodeProps) => {
    const { setNodes } = useReactFlow();
    const [isCollapsed, setIsCollapsed] = useState(data.isCollapsed || false);
    const [isEditing, setIsEditing] = useState(false);
    const [label, setLabel] = useState(data.label);
    const inputRef = useRef<HTMLInputElement>(null);

    const styleRef = getElementStyle(data.type);
    const { border, icon: iconColor } = styleRef;

    useEffect(() => {
        setLabel(data.label);
    }, [data.label]);

    // Update node data when collapse state changes (could trigger layout updates)
    useEffect(() => {
        // Implement "cheap" hiding by updating local definition if needed, 
        // but primarily we use this state to render differently.
    }, [isCollapsed]);

    const onToggleCollapse = useCallback((e: React.MouseEvent) => {
        e.stopPropagation();
        setIsCollapsed((prev: boolean) => !prev);
        // In a full implementation, we would bubble this up to re-layout / hide children
    }, []);

    const onLabelChange = useCallback((evt: React.ChangeEvent<HTMLInputElement>) => {
        setLabel(evt.target.value);
    }, []);

    const onLabelBlur = useCallback(() => {
        setIsEditing(false);
        setNodes((nds) =>
            nds.map((node) => {
                if (node.id === id) {
                    return {
                        ...node,
                        data: {
                            ...node.data,
                            label: label,
                        },
                    };
                }
                return node;
            })
        );
    }, [id, label, setNodes]);

    const onKeyDown = useCallback((evt: React.KeyboardEvent) => {
        if (evt.key === 'Enter') {
            onLabelBlur();
        }
    }, [onLabelBlur]);

    // Dynamic style based on collapse state
    const currentStyle: React.CSSProperties = {
        minWidth: '200px',
        width: style?.width,
        height: isCollapsed ? '40px' : style?.height,
        transition: 'all 0.3s ease',
        ...style, // apply layout dimensions mostly, but height overrides if collapsed
    };

    if (isCollapsed) {
        currentStyle.height = '40px';
    }

    return (
        <>
            <NodeResizer
                color="#555"
                isVisible={selected && !isCollapsed}
                minWidth={200}
                minHeight={100}
            />
            <div
                style={currentStyle}
                onDoubleClick={() => setIsEditing(true)}
                className="group relative"
            >
                <div className="flex flex-col w-full h-full relative overflow-visible">

                    {/* Header Tab */}
                    <div className="flex items-end h-[34px] absolute -top-[34px] left-0 right-0">
                        {/* Tab Shape */}
                        <div
                            style={{
                                background: 'linear-gradient(to bottom, #ffffff, #f8f9fa)',
                                borderTop: `1px solid ${border}`,
                                borderLeft: `1px solid ${border}`,
                                borderRight: `1px solid ${border}`,
                                boxShadow: '0 -2px 10px rgba(0,0,0,0.02)'
                            }}
                            className="flex items-center px-3 py-1.5 rounded-t-lg z-20 h-full min-w-[140px] max-w-full"
                        >
                            <button
                                onClick={onToggleCollapse}
                                className="mr-2 p-0.5 hover:bg-slate-200 rounded-full text-slate-500 transition-colors"
                            >
                                {isCollapsed ? <ChevronRight size={16} /> : <ChevronDown size={16} />}
                            </button>

                            <span style={{ color: iconColor }} className="mr-2 flex items-center justify-center opacity-80">
                                {getIcon(data.type)}
                            </span>

                            {isEditing ? (
                                <input
                                    ref={inputRef}
                                    value={label}
                                    onChange={onLabelChange}
                                    onBlur={onLabelBlur}
                                    onKeyDown={onKeyDown}
                                    className="text-[12px] font-bold bg-transparent outline-none w-full uppercase tracking-wide text-slate-700"
                                    autoFocus
                                />
                            ) : (
                                <span className="text-[12px] font-bold text-slate-700 uppercase truncate select-none tracking-wide">
                                    {data.label}
                                </span>
                            )}
                        </div>
                        {/* Connecting Line to Right */}
                        <div style={{ borderBottom: `1px solid ${border}` }} className="flex-1 h-full translate-y-[1px]" />
                    </div>

                    {/* Content Box */}
                    <div
                        style={{
                            border: `1px solid ${border}`,
                            background: 'linear-gradient(145deg, rgba(255,255,255,0.4) 0%, rgba(255,255,255,0.1) 100%)',
                            backdropFilter: 'blur(4px)',
                            boxShadow: 'inset 0 0 20px rgba(255,255,255,0.2)'
                        }}
                        className={`flex-1 w-full relative z-10 transition-all duration-300 rounded-b-lg rounded-tr-lg ${isCollapsed ? 'h-0 opacity-0 border-0' : 'h-full opacity-100'}`}
                    >
                        {!isCollapsed && (
                            <div className="absolute inset-0 pointer-events-none">
                                {/* Children fit here */}
                            </div>
                        )}
                    </div>
                </div>

                <Handle type="target" position={Position.Top} style={{ background: '#555', zIndex: 10, top: -32, opacity: 0 }} />
                <Handle type="source" position={Position.Bottom} style={{ background: '#555', zIndex: 10, bottom: -4, opacity: 0 }} />
            </div>
        </>
    );
});
