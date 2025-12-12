import React from 'react';
import { ZoomIn, ZoomOut, Maximize, Save, Grid, Undo, Redo, FileText, Monitor, PenTool } from 'lucide-react';
import { Button } from '@/components/ui/button';

interface DrawingToolbarProps {
    onExport?: () => void;
    isExporting?: boolean;
    onZoomIn?: () => void;
    onZoomOut?: () => void;
    onFitView?: () => void;
    viewMode?: 'diagram' | 'whiteboard';
    onToggleView?: () => void;
}


export const DrawingToolbar: React.FC<DrawingToolbarProps> = ({
    onExport,
    isExporting,
    onZoomIn,
    onZoomOut,
    onFitView,
    viewMode = 'diagram',
    onToggleView
}) => {
    return (
        <div className="glass-panel rounded-full px-2 py-1.5 flex gap-1 items-center shadow-2xl border border-white/20 scale-100 hover:scale-[1.02] transition-transform duration-300">
            {/* View Switcher */}
            <div className="flex gap-1 pr-2 mr-1 border-r border-border/40">
                <Button
                    variant={viewMode === 'diagram' ? "secondary" : "ghost"}
                    size="icon"
                    className={`h-9 w-9 rounded-full transition-all ${viewMode === 'diagram' ? 'bg-primary/20 text-primary hover:bg-primary/30' : 'text-muted-foreground hover:text-foreground hover:bg-white/10'}`}
                    title="Diagram Mode"
                    onClick={viewMode === 'whiteboard' ? onToggleView : undefined}
                >
                    <Monitor size={18} />
                </Button>
                <Button
                    variant={viewMode === 'whiteboard' ? "secondary" : "ghost"}
                    size="icon"
                    className={`h-9 w-9 rounded-full transition-all ${viewMode === 'whiteboard' ? 'bg-primary/20 text-primary hover:bg-primary/30' : 'text-muted-foreground hover:text-foreground hover:bg-white/10'}`}
                    title="Whiteboard Mode"
                    onClick={viewMode === 'diagram' ? onToggleView : undefined}
                >
                    <PenTool size={18} />
                </Button>
            </div>

            {/* Zoom Controls */}
            <div className="flex gap-1 px-1 border-r border-border/40 pr-2 mr-1">
                <Button variant="ghost" size="icon" className="h-9 w-9 rounded-full hover:bg-white/10 hover:text-primary transition-colors" title="Zoom In" onClick={onZoomIn}><ZoomIn size={18} /></Button>
                <Button variant="ghost" size="icon" className="h-9 w-9 rounded-full hover:bg-white/10 hover:text-primary transition-colors" title="Zoom Out" onClick={onZoomOut}><ZoomOut size={18} /></Button>
                <Button variant="ghost" size="icon" className="h-9 w-9 rounded-full hover:bg-white/10 hover:text-primary transition-colors" title="Fit View" onClick={onFitView}><Maximize size={18} /></Button>
            </div>

            {/* History */}
            <div className="flex gap-1 px-1 border-r border-border/40 pr-2 mr-1">
                <Button variant="ghost" size="icon" className="h-9 w-9 rounded-full hover:bg-white/10 hover:text-primary transition-colors" title="Undo"><Undo size={18} /></Button>
                <Button variant="ghost" size="icon" className="h-9 w-9 rounded-full hover:bg-white/10 hover:text-primary transition-colors" title="Redo"><Redo size={18} /></Button>
            </div>

            {/* Actions */}
            <div className="flex gap-1">
                <Button variant="ghost" size="icon" className="h-9 w-9 rounded-full hover:bg-white/10 hover:text-primary transition-colors" title="Toggle Grid"><Grid size={18} /></Button>
                <Button variant="ghost" size="icon" className="h-9 w-9 rounded-full hover:bg-white/10 hover:text-primary transition-colors" title="Save"><Save size={18} /></Button>
                <Button
                    variant="ghost"
                    size="icon"
                    className={`h-9 w-9 rounded-full hover:bg-white/10 hover:text-primary transition-colors ${isExporting ? 'animate-pulse text-primary' : ''}`}
                    title={isExporting ? "Exporting..." : "Export PPTX"}
                    onClick={onExport}
                    disabled={isExporting}
                >
                    <FileText size={18} />
                </Button>
            </div>
        </div>
    );
};
