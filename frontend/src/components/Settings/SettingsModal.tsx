import React from 'react';
import { X, Cpu, Key } from 'lucide-react';

interface SettingsModalProps {
    isOpen: boolean;
    onClose: () => void;
    selectedModel: string;
    onSelectModel: (model: string) => void;
}

interface Model {
    id: string;
    name: string;
}

export const SettingsModal: React.FC<SettingsModalProps> = ({ isOpen, onClose, selectedModel, onSelectModel }) => {
    // const { t } = useTranslation(); // Unused for now



    const [models, setModels] = React.useState<Model[]>([]);
    const [loadingModels, setLoadingModels] = React.useState(false);
    const [selectedProvider, setSelectedProvider] = React.useState<string>('openrouter');
    const [showFreeOnly, setShowFreeOnly] = React.useState<boolean>(false);

    React.useEffect(() => {
        if (isOpen) {
            fetchModels();
        }
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [isOpen, selectedProvider]);

    const fetchModels = () => {
        setLoadingModels(true);

        if (selectedProvider === 'openrouter') {
            fetch('http://localhost:8000/api/models')
                .then(res => res.json())
                .then(data => {
                    if (data && data.data) {
                        setModels(data.data);
                    }
                })
                .catch(err => console.error("Failed to fetch models", err))
                .finally(() => setLoadingModels(false));
        } else if (selectedProvider === 'local') {
            // Mock local support or try to fetch from ollama default port
            // For now, we simulate a few local models since we can't guarantee backend proxy
            setModels([
                { id: 'llama2', name: 'Llama 2 (Local)' },
                { id: 'mistral', name: 'Mistral (Local)' },
                { id: 'codellama', name: 'CodeLlama (Local)' }
            ]);
            setLoadingModels(false);
        } else if (selectedProvider === 'gemini') {
            // Mock Gemini models or filter existing if we had them
            setModels([
                { id: 'google/gemini-pro', name: 'Gemini Pro' },
                { id: 'google/gemini-pro-vision', name: 'Gemini Pro Vision' }
            ]);
            setLoadingModels(false);
        }
    };

    const getProcessedModels = () => {
        let processed = [...models];

        // Filter
        if (showFreeOnly) {
            processed = processed.filter(m => {
                // Check for explicit "free" in ID or name, or :free suffix
                const id = m.id.toLowerCase();
                const name = (m.name || "").toLowerCase();
                return id.includes(":free") || name.includes("free");
            });
        }

        // Sort Alphabetically
        processed.sort((a, b) => {
            const nameA = (a.name || a.id).toLowerCase();
            const nameB = (b.name || b.id).toLowerCase();
            return nameA.localeCompare(nameB);
        });

        return processed;
    };

    const displayModels = getProcessedModels();

    if (!isOpen) return null;

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm">
            <div className="w-full max-w-[500px] bg-background border border-border rounded-lg shadow-lg p-6">
                <div className="flex justify-between items-center mb-6">
                    <h2 className="m-0 text-lg font-semibold flex items-center gap-2 text-foreground">
                        <Cpu size={20} />
                        LLM Configuration
                    </h2>
                    <button onClick={onClose} className="p-2 hover:bg-secondary rounded-full transition-colors text-muted-foreground hover:text-foreground">
                        <X size={20} />
                    </button>
                </div>

                <div className="flex flex-col gap-6">

                    {/* Provider Selection */}
                    <div>
                        <label className="block mb-2 font-medium text-foreground">Provider</label>
                        <select
                            value={selectedProvider}
                            onChange={(e) => {
                                setSelectedProvider(e.target.value);
                                // Optional: Reset selected model or pick defaults per provider
                            }}
                            className="w-full p-3 rounded-md border border-input bg-background text-foreground focus:ring-2 focus:ring-primary focus:outline-none"
                        >
                            <option value="openrouter">OpenRouter (Recommended)</option>
                            <option value="gemini">Google Gemini</option>
                            <option value="local">Local (Ollama)</option>
                        </select>
                    </div>

                    {/* Filters */}
                    <div className="flex items-center gap-2">
                        <input
                            type="checkbox"
                            id="free-filter"
                            checked={showFreeOnly}
                            onChange={(e) => setShowFreeOnly(e.target.checked)}
                            className="w-4 h-4 text-primary border-input rounded focus:ring-primary"
                        />
                        <label htmlFor="free-filter" className="cursor-pointer select-none text-foreground">
                            Show Free Models Only
                        </label>
                    </div>

                    {/* Model Selection */}
                    <div>
                        <label className="block mb-2 font-medium text-foreground">Model</label>
                        <select
                            className="w-full p-3 rounded-md border border-input bg-background text-foreground focus:ring-2 focus:ring-primary focus:outline-none disabled:opacity-50"
                            disabled={loadingModels}
                            value={selectedModel}
                            onChange={(e) => onSelectModel(e.target.value)}
                        >
                            {loadingModels ? (
                                <option>Loading models...</option>
                            ) : (
                                displayModels.length > 0 ? (
                                    displayModels.map((model: Model) => (
                                        <option key={model.id} value={model.id}>
                                            {model.name || model.id}
                                        </option>
                                    ))
                                ) : (
                                    <option disabled>No models found</option>
                                )
                            )}
                        </select>
                        <small className="text-muted-foreground mt-1 block">
                            {displayModels.length} models available
                        </small>
                    </div>

                    {/* API Key */}
                    <div>
                        <label className="block mb-2 font-medium text-foreground">
                            API Key (Optional override)
                        </label>
                        <div className="flex items-center gap-2 p-3 rounded-md border border-input bg-background focus-within:ring-2 focus-within:ring-primary">
                            <Key size={16} className="text-muted-foreground" />
                            <input
                                type="password"
                                placeholder="sk-..."
                                className="flex-1 bg-transparent border-none text-foreground outline-none placeholder:text-muted-foreground"
                            />
                        </div>
                        <small className="text-muted-foreground mt-2 block">
                            Leave empty to use server-side environment variable.
                        </small>
                    </div>

                </div>

                <div className="mt-8 flex justify-end gap-4">
                    <button onClick={onClose} className="px-4 py-2 rounded-md hover:bg-secondary text-foreground transition-colors">Cancel</button>
                    <button className="px-4 py-2 bg-primary text-primary-foreground rounded-md hover:bg-primary/90 transition-colors font-medium shadow-sm" onClick={onClose}>Save Configuration</button>
                </div>
            </div>
        </div>
    );
};
