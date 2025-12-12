import React, { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { Send, Sparkles, Layers, FileType } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Select } from '@/components/ui/select';
import { Textarea } from '@/components/ui/textarea';
import type { AppNode } from '../../utils/types';
import { NodeDetails } from './NodeDetails';

interface RightSidebarProps {
    onGenerate: (prompt: string, type: string) => void;
    isGenerating: boolean;
    selectedNode?: AppNode | null;
    onCloseDetails?: () => void;
    visibleLayers?: Record<string, boolean>;
    onToggleLayer?: (layer: string) => void;
    onFocusNode?: (nodeId: string) => void;
}

export const RightSidebar: React.FC<RightSidebarProps> = ({ onGenerate, isGenerating, selectedNode, onCloseDetails, visibleLayers, onToggleLayer, onFocusNode }) => {
    const { } = useTranslation();
    const [prompt, setPrompt] = useState('');
    const [schemaType, setSchemaType] = useState('application_cooperation');

    if (selectedNode && onCloseDetails) {
        return <NodeDetails node={selectedNode} onClose={onCloseDetails} onFocus={onFocusNode} />;
    }

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        if (prompt.trim()) {
            onGenerate(prompt, schemaType);
        }
    };

    return (
        <div className="flex flex-col h-full bg-transparent p-5 gap-6 relative">
            {/* Header Area */}
            <div className="space-y-1 pb-4 border-b border-white/5 flex-shrink-0">
                <div className="flex items-center justify-between">
                    <h3 className="flex items-center gap-2 text-sm font-bold tracking-tight text-foreground/90 uppercase">
                        <Sparkles size={14} className="text-primary animate-pulse-glow" />
                        AI Architect
                    </h3>
                    <span className="text-[10px] bg-primary/10 text-primary px-1.5 py-0.5 rounded border border-primary/20 font-mono">
                        BETA
                    </span>
                </div>
                <p className="text-xs text-muted-foreground/70 leading-relaxed font-medium">
                    Describe your system to generate a TOGAF model.
                </p>
            </div>

            <form onSubmit={handleSubmit} className="flex-1 flex flex-col gap-4 overflow-hidden">
                <div className="flex-1 overflow-y-auto pr-1 flex flex-col gap-5">
                    {/* Viewpoint Selector */}
                    <div className="space-y-2">
                        <label className="text-[10px] font-bold uppercase tracking-widest text-muted-foreground/60 flex items-center gap-1.5 ml-1">
                            <Layers size={12} />
                            Target Viewpoint
                        </label>
                        <div className="relative group">
                            <div className="absolute -inset-0.5 bg-gradient-to-r from-primary/20 to-accent/20 rounded-xl blur opacity-0 group-hover:opacity-30 transition duration-500"></div>
                            <Select
                                value={schemaType}
                                onChange={(e) => setSchemaType(e.target.value)}
                                className="w-full bg-black/20 backdrop-blur-xl border border-white/10 hover:border-primary/40 text-sm font-medium rounded-xl h-11 shadow-inner transition-all text-foreground/90 focus:ring-1 focus:ring-primary/50 px-3 appearance-none"
                            >
                                <optgroup label="Core Architecture">
                                    <option value="application_cooperation">Application Cooperation</option>
                                    <option value="application_structure">Application Structure</option>
                                    <option value="technology">Technology Infrastructure</option>
                                    <option value="layered">Multi-Level Layered</option>
                                </optgroup>
                                <optgroup label="Detailed Views">
                                    <option value="physical">Physical Viewpoint</option>
                                    <option value="logical_data">Logical Data</option>
                                    <option value="data_dissemination">Data Dissemination</option>
                                    <option value="process_realization">Process Realization</option>
                                    <option value="application_usage">Application Usage</option>
                                </optgroup>
                            </Select>
                        </div>

                        {/* Layer Filters */}
                        {visibleLayers && onToggleLayer && (
                            <div className="pt-2">
                                <label className="text-[9px] font-bold uppercase tracking-widest text-muted-foreground/60 mb-2 block ml-1">
                                    Visible Layers
                                </label>
                                <div className="grid grid-cols-2 gap-1.5">
                                    {Object.entries(visibleLayers).map(([layer, isVisible]) => (
                                        <label key={layer}
                                            className={`
                                                flex items-center gap-2 text-[10px] cursor-pointer transition-all p-1.5 rounded-lg border
                                                ${isVisible
                                                    ? 'bg-primary/5 border-primary/20 text-foreground'
                                                    : 'bg-transparent border-transparent text-muted-foreground/50 hover:bg-white/5'}
                                            `}
                                        >
                                            <div className={`w-2 h-2 rounded-full ${isVisible ? 'bg-primary shadow-[0_0_8px_rgba(var(--primary-rgb),0.5)]' : 'bg-muted-foreground/30'}`} />
                                            {layer}
                                            <input
                                                type="checkbox"
                                                checked={isVisible}
                                                onChange={() => onToggleLayer(layer)}
                                                className="sr-only"
                                            />
                                        </label>
                                    ))}
                                </div>
                            </div>
                        )}
                    </div>

                    {/* Prompt Input */}
                    <div className="space-y-2 flex-1 flex flex-col min-h-[120px]">
                        <label className="text-[10px] font-bold uppercase tracking-widest text-muted-foreground/60 flex items-center gap-1.5 ml-1">
                            <FileType size={12} />
                            System Description
                        </label>
                        <div className="flex-1 relative group flex flex-col">
                            <div className="absolute -inset-0.5 bg-gradient-to-b from-primary/10 to-transparent rounded-xl blur opacity-0 group-hover:opacity-30 transition duration-500"></div>
                            <Textarea
                                value={prompt}
                                onChange={(e) => setPrompt(e.target.value)}
                                onKeyDown={(e) => {
                                    if (e.key === 'Enter' && !e.shiftKey) {
                                        e.preventDefault();
                                        if (prompt.trim()) {
                                            onGenerate(prompt, schemaType);
                                        }
                                    }
                                }}
                                placeholder="Describe the system architecture, components, and relationships..."
                                className="flex-1 w-full bg-black/20 backdrop-blur-xl border border-white/10 hover:border-primary/30 focus:border-primary/50 text-sm font-medium leading-relaxed rounded-xl p-4 shadow-inner resize-none transition-all placeholder:text-muted-foreground/30"
                            />
                        </div>
                    </div>
                </div>

                {/* Submit Button */}
                <div className="pt-2 flex-shrink-0">
                    <Button
                        type="submit"
                        disabled={!prompt.trim() || isGenerating}
                        className={`
                            w-full h-12 text-sm font-bold tracking-wide rounded-xl shadow-lg transition-all duration-300 border border-transparent
                            ${!prompt.trim() || isGenerating
                                ? 'bg-muted/10 text-muted-foreground/50 cursor-not-allowed border-white/5'
                                : 'bg-gradient-to-r from-primary via-primary/90 to-primary/80 hover:brightness-110 text-primary-foreground shadow-neon hover:shadow-neon-lg hover:translate-y-[-1px]'}
                        `}
                    >
                        <span className="flex items-center gap-2">
                            {isGenerating ? (
                                <>
                                    <Sparkles className="animate-spin" size={16} />
                                    Generating...
                                </>
                            ) : (
                                <>
                                    Generate
                                    <Send size={14} className="ml-1 opacity-80" />
                                </>
                            )}
                        </span>
                    </Button>
                </div>
            </form>
        </div>
    );
};
