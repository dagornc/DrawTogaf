import React, { memo, useState, useRef, useEffect, useCallback } from 'react';
import { Handle, Position, NodeResizer, NodeToolbar, useReactFlow } from '@xyflow/react';
import type { NodeProps } from '@xyflow/react';
import { Trash2, Edit2 } from 'lucide-react';
import { getElementStyle, getIcon, getShapeStyle } from './NodeStyling';
import type { AppNode } from '../../utils/types';

// Interface including style since explicit style might be passed or inferred
type ElementNodeProps = NodeProps<AppNode> & { style?: React.CSSProperties };

export const ElementNode = memo(({ data, id, selected, style }: ElementNodeProps) => {
    const { setNodes } = useReactFlow();
    const styleRef = getElementStyle(data.type);
    const shapeStyle = getShapeStyle(data.type);
    const { bg, border, icon: iconColor, shadow } = styleRef as any; // Cast to any to access new shadow property safely if types aren't fully updated yet

    const [isEditing, setIsEditing] = useState(false);
    const [label, setLabel] = useState(data.label);
    const inputRef = useRef<HTMLTextAreaElement>(null);

    useEffect(() => {
        setLabel(data.label);
    }, [data.label]);

    useEffect(() => {
        if (isEditing && inputRef) {
            // small delay to ensure render
            setTimeout(() => {
                inputRef.current?.focus();
                inputRef.current?.select();
            }, 50);
        }
    }, [isEditing]);

    const onLabelChange = useCallback((evt: React.ChangeEvent<HTMLTextAreaElement>) => {
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

    const onDelete = useCallback(() => {
        setNodes((nds) => nds.filter((node) => node.id !== id));
    }, [id, setNodes]);

    const onStartEdit = useCallback(() => {
        setIsEditing(true);
    }, []);

    // Base Style
    const nodeStyle: React.CSSProperties = {
        minWidth: '140px',
        minHeight: '70px',
        width: style?.width,
        height: style?.height,
        background: bg, // Now handles gradients
        border: `1px solid ${border}`, // Thinner, more elegant border
        borderRadius: shapeStyle.borderRadius,
        // improved premium shadow with color reflection
        boxShadow: selected
            ? `0 0 0 2px ${border}, 0 8px 24px ${shadow || 'rgba(0,0,0,0.1)'}`
            : `0 4px 12px -2px ${shadow || 'rgba(0,0,0,0.05)'}, 0 2px 4px -2px rgba(0,0,0,0.05)`,
        display: 'flex',
        flexDirection: 'column',
        justifyContent: 'center',
        alignItems: 'center',
        padding: '16px',
        position: 'relative',
        transition: 'all 0.3s cubic-bezier(0.25, 0.8, 0.25, 1)',
        backdropFilter: 'blur(12px)',
        WebkitBackdropFilter: 'blur(12px)',
        fontFamily: 'Inter, sans-serif',
        ...style,
    };

    return (
        <>
            <NodeResizer
                color="#0288D1"
                isVisible={selected}
                minWidth={120}
                minHeight={60}
            />

            <NodeToolbar isVisible={selected} position={Position.Top} offset={10}>
                <div className="flex gap-1 bg-white p-1 rounded-md shadow border border-slate-200">
                    <button
                        onClick={onStartEdit}
                        className="p-1 hover:bg-blue-50 text-blue-600 rounded"
                        title="Edit Label"
                    >
                        <Edit2 size={14} />
                    </button>
                    <div className="w-[1px] bg-slate-200 mx-1" />
                    <button
                        onClick={onDelete}
                        className="p-1 hover:bg-red-50 text-red-600 rounded"
                        title="Delete Element"
                    >
                        <Trash2 size={14} />
                    </button>
                </div>
            </NodeToolbar>

            <div
                style={nodeStyle}
                onDoubleClick={onStartEdit}
                className="group"
            >
                <Handle type="target" position={Position.Top} style={{ background: '#555', zIndex: 10, top: -4, width: 8, height: 8 }} />

                <div className={`flex items-center justify-center mb-2 pointer-events-none transition-opacity ${isEditing ? 'opacity-0 absolute' : 'opacity-100'}`} style={{ color: iconColor }}>
                    <div className="relative">
                        {getIcon(data.type)}
                        {/* Glowing dot constraint */}
                        <div className="absolute -top-1 -right-1 w-1.5 h-1.5 rounded-full bg-current opacity-60 animate-pulse" style={{ backgroundColor: border }} />
                    </div>
                    <div className="flex flex-col ml-2">
                        <span className="text-[10px] uppercase font-bold tracking-widest opacity-90 leading-none" style={{ textShadow: '0 1px 2px rgba(255,255,255,0.5)' }}>
                            {data.type}
                        </span>
                        {/* Render key attributes if present (e.g. OS, Version) */}
                        {data.attributes && Object.keys(data.attributes).length > 0 && (
                            <span className="text-[8px] opacity-70 leading-tight truncate max-w-[90px] mt-0.5 font-medium">
                                {Object.values(data.attributes)[0] as string}
                            </span>
                        )}
                    </div>
                </div>

                {isEditing ? (
                    <textarea
                        ref={inputRef}
                        value={label}
                        onChange={onLabelChange}
                        onBlur={onLabelBlur}
                        onKeyDown={(e) => {
                            if (e.key === 'Enter' && !e.shiftKey) {
                                e.preventDefault();
                                onLabelBlur();
                            }
                        }}
                        className="text-[13px] font-bold text-center bg-white/50 border border-blue-400 rounded p-1 w-full h-full outline-none resize-none overflow-hidden absolute inset-0 m-1"
                        style={{ background: 'rgba(255,255,255,0.8)' }}
                    />
                ) : (
                    <div className="text-[14px] font-semibold text-slate-900 text-center leading-snug whitespace-pre-wrap break-words px-1 z-10 w-full overflow-hidden text-ellipsis line-clamp-3 font-sans" style={{ textShadow: '0 0 20px rgba(255,255,255,0.5)' }}>
                        {data.label}
                    </div>
                )}

                <Handle type="source" position={Position.Bottom} style={{ background: '#555', zIndex: 10, bottom: -4, width: 8, height: 8 }} />

                {/* Hover Effect Helper */}
                <div className="absolute inset-0 bg-white opacity-0 group-hover:opacity-10 pointer-events-none rounded duration-200" />
            </div>
        </>
    );
});
