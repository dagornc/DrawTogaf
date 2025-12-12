import React from 'react';
import { useTranslation } from 'react-i18next';
import { X, Info, Tag, Database } from 'lucide-react';
import type { AppNode } from '../../utils/types';
import { getIcon, getLayerName } from '../Canvas/NodeStyling';
import { Button } from '@/components/ui/button';

interface NodeDetailsProps {
    node: AppNode;
    onClose: () => void;
    onFocus?: (nodeId: string) => void;
}

export const NodeDetails: React.FC<NodeDetailsProps> = ({ node, onClose, onFocus }) => {
    const { t } = useTranslation();
    const layerName = getLayerName(node.data.type || '');
    const Icon = getIcon(node.data.type || '');

    return (
        <div className="flex flex-col h-full bg-transparent p-5 gap-6 relative animate-slide-in-right">
            {/* Header */}
            <div className="flex items-start justify-between pb-4 border-b border-white/10">
                <div className="flex gap-3">
                    <div className={`
                        w-10 h-10 rounded-xl flex items-center justify-center shadow-inner
                        ${layerName === 'Business' ? 'bg-yellow-100 text-yellow-700' :
                            layerName === 'Application' ? 'bg-cyan-100 text-cyan-700' :
                                layerName === 'Technology' ? 'bg-green-100 text-green-700' :
                                    layerName === 'Strategy' ? 'bg-orange-100 text-orange-700' :
                                        'bg-slate-100 text-slate-700'}
                    `}>
                        {Icon}
                    </div>
                    <div>
                        <span className="text-[10px] font-bold uppercase tracking-widest text-muted-foreground/70">
                            {layerName} {t('details.layer', 'Layer')}
                        </span>
                        <h3 className="text-lg font-bold text-foreground leading-tight mt-0.5">
                            {node.data.label}
                        </h3>
                        <span className="text-xs font-mono text-primary/80 bg-primary/10 px-1.5 py-0.5 rounded mt-1 inline-block">
                            {node.data.type}
                        </span>
                    </div>
                </div>
                <button
                    onClick={onClose}
                    className="p-1 hover:bg-white/10 rounded-lg transition-colors text-muted-foreground hover:text-foreground"
                >
                    <X size={18} />
                </button>
            </div>

            {/* Content Scrolling Area */}
            <div className="flex-1 overflow-y-auto pr-1 space-y-6">

                {/* Description */}
                <div className="space-y-2">
                    <h4 className="text-xs font-bold uppercase flex items-center gap-2 text-muted-foreground">
                        <Info size={12} />
                        {t('details.description', 'Description')}
                    </h4>
                    <p className="text-sm text-foreground/80 leading-relaxed bg-white/5 p-3 rounded-xl border border-white/5">
                        {typeof node.data.description === 'string' ? node.data.description : t('details.noDescription', "No description provided for this element.")}
                    </p>
                </div>

                {/* Attributes (Key Metadata) */}
                <div className="space-y-3">
                    <h4 className="text-xs font-bold uppercase flex items-center gap-2 text-muted-foreground">
                        <Database size={12} />
                        Properties
                    </h4>

                    <div className="grid grid-cols-1 gap-2">
                        {node.data.attributes && Object.entries(node.data.attributes).length > 0 ? (
                            Object.entries(node.data.attributes).map(([key, value]) => (
                                <div key={key} className="flex justify-between items-center bg-white/5 px-3 py-2 rounded-lg border border-white/5 hover:border-primary/20 transition-colors group">
                                    <span className="text-xs font-medium text-muted-foreground capitalize group-hover:text-primary/80 transition-colors">
                                        {key.replace(/_/g, ' ')}
                                    </span>
                                    <span className="text-xs font-semibold text-foreground text-right truncate max-w-[150px]" title={String(value)}>
                                        {String(value)}
                                    </span>
                                </div>
                            ))
                        ) : (
                            <div className="flex flex-col items-center justify-center py-6 text-muted-foreground/50 border border-dashed border-white/10 rounded-xl bg-white/5">
                                <Tag size={24} className="mb-2 opacity-50" />
                                <span className="text-xs">No extended properties</span>
                            </div>
                        )}
                    </div>
                </div>

                {/* Automation / Actions Placeholder */}
                <div className="bg-gradient-to-br from-primary/10 to-transparent p-4 rounded-xl border border-primary/10">
                    <h4 className="text-xs font-bold text-primary mb-2">Detailed Analysis</h4>
                    <p className="text-[10px] text-muted-foreground">
                        Focus on this element to see its direct relationships and isolate it from the rest of the architecture.
                    </p>
                    <Button
                        onClick={() => onFocus && onFocus(node.id)}
                        className="w-full mt-3 h-8 text-xs bg-primary/20 hover:bg-primary/30 text-primary border border-primary/20"
                    >
                        Focus View (Neighborhood)
                    </Button>
                </div>
            </div>
        </div>
    );
};
