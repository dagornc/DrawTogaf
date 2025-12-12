import { Trash2, Copy } from 'lucide-react';

interface ContextMenuProps {
    id: string;
    top?: number;
    left?: number;
    right?: number;
    bottom?: number;
    onClose: () => void;
    onDuplicate: () => void;
    onDelete: () => void;
    onExport: () => void;
}

export const ContextMenu = ({ top, left, right, bottom, onClose, onDuplicate, onDelete, onExport }: ContextMenuProps) => {
    return (
        <div
            style={{ top, left, right, bottom }}
            className="absolute z-50 bg-white border border-slate-200 rounded-md shadow-lg min-w-[150px] py-1 flex flex-col"
            onClick={(e) => e.stopPropagation()} // Prevent click from bubbling to canvas
        >
            <div className="px-3 py-1.5 text-xs text-slate-400 font-semibold border-b border-slate-100 mb-1">
                Node Actions
            </div>

            <button
                onClick={onDuplicate}
                className="block w-full text-left px-4 py-2 hover:bg-gray-100 dark:hover:bg-gray-700 flex items-center gap-2"
            >
                <Copy size={14} /> Duplicate
            </button>
            <button
                onClick={onExport}
                className="block w-full text-left px-4 py-2 hover:bg-gray-100 dark:hover:bg-gray-700 flex items-center gap-2"
            >
                Export to PPTX
            </button>
            <button
                onClick={onDelete}
                className="block w-full text-left px-4 py-2 hover:bg-gray-100 dark:hover:bg-gray-700 text-red-500 flex items-center gap-2"
            >
                <Trash2 size={14} /> Delete
            </button>

            <div className="border-t border-slate-100 mt-1 pt-1">
                <button onClick={onClose} className="w-full text-center text-xs text-slate-400 py-1 hover:text-slate-600">
                    Cancel
                </button>
            </div>
        </div>
    );
};
