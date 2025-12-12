import React, { useState, useRef, useEffect } from 'react';
import { GripHorizontal } from 'lucide-react';
import './WorkspaceLayout.css';

interface WorkspaceLayoutProps {
    header: React.ReactNode;
    sidebar: React.ReactNode;
    canvas: React.ReactNode;
    toolbar?: React.ReactNode;
}

export const WorkspaceLayout: React.FC<WorkspaceLayoutProps> = ({
    header,
    sidebar,
    canvas,
    toolbar
}) => {
    const [position, setPosition] = useState({ x: 0, y: 0 });
    const isDragging = useRef(false);
    const dragStart = useRef({ x: 0, y: 0 });
    const initialPosition = useRef({ x: 0, y: 0 });

    const handleMouseDown = (e: React.MouseEvent) => {
        isDragging.current = true;
        dragStart.current = { x: e.clientX, y: e.clientY };
        initialPosition.current = { ...position };

        // Disable selection/text highlighting while dragging
        document.body.style.userSelect = 'none';

        document.addEventListener('mousemove', handleMouseMove);
        document.addEventListener('mouseup', handleMouseUp);
    };

    const handleMouseMove = (e: MouseEvent) => {
        if (!isDragging.current) return;
        const dx = e.clientX - dragStart.current.x;
        const dy = e.clientY - dragStart.current.y;

        setPosition({
            x: initialPosition.current.x + dx,
            y: initialPosition.current.y + dy
        });
    };

    const handleMouseUp = () => {
        isDragging.current = false;
        document.body.style.userSelect = '';
        document.removeEventListener('mousemove', handleMouseMove);
        document.removeEventListener('mouseup', handleMouseUp);
    };

    // Cleanup
    useEffect(() => {
        return () => {
            document.removeEventListener('mousemove', handleMouseMove);
            document.removeEventListener('mouseup', handleMouseUp);
        };
    }, []);

    return (
        <div className="flex flex-col h-screen w-full bg-background text-foreground overflow-hidden relative">
            {/* Header - Stacked Top Bar */}
            <div className="z-50 p-2 pointer-events-none flex-shrink-0">
                <div className="pointer-events-auto max-w-[1920px] mx-auto">
                    {header}
                </div>
            </div>

            {/* Main Content Area */}
            <div className="flex-1 relative w-full h-full overflow-hidden">
                {/* Canvas Background */}
                <div className="absolute inset-0 z-0">
                    {canvas}
                </div>

                {/* Toolbar - Floating Bottom Center */}
                {toolbar && (
                    <div className="absolute bottom-6 left-1/2 transform -translate-x-1/2 z-40 animate-fade-in">
                        {toolbar}
                    </div>
                )}

                {/* Right Sidebar - Floating Panel (Now Left by default) */}
                <aside
                    className="absolute top-4 left-4 bottom-6 w-[380px] z-40 pointer-events-none flex flex-col transition-none"
                    style={{ transform: `translate(${position.x}px, ${position.y}px)` }}
                >
                    {/* Inner container needs pointer-events-auto to be interactable */}
                    <div className="glass-panel rounded-2xl h-full overflow-hidden flex flex-col pointer-events-auto animate-slide-in shadow-2xl backdrop-blur-xl bg-background/60 border border-white/10">
                        {/* Drag Handle */}
                        <div
                            className="bg-white/5 hover:bg-white/10 active:bg-white/20 transition-colors h-6 flex items-center justify-center cursor-move border-b border-white/5 flex-shrink-0"
                            onMouseDown={handleMouseDown}
                        >
                            <GripHorizontal size={16} className="text-white/20" />
                        </div>

                        {sidebar}
                    </div>
                </aside>
            </div>
        </div>
    );
};
