import React, { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { Send, Sparkles } from 'lucide-react';

interface PromptFormProps {
    onSubmit: (prompt: string) => void;
    isLoading: boolean;
}

export const PromptForm: React.FC<PromptFormProps> = ({ onSubmit, isLoading }) => {
    const [prompt, setPrompt] = useState('');
    const { t } = useTranslation();

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        if (prompt.trim()) {
            onSubmit(prompt);
        }
    };

    return (
        <form onSubmit={handleSubmit} className="glass-panel" style={{ padding: '1.5rem', width: '100%', maxWidth: '800px' }}>
            <div style={{ marginBottom: '1rem' }}>
                <h3 style={{ margin: '0 0 0.5rem 0', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                    <Sparkles size={20} color="var(--accent-color)" />
                    {t('prompt.title', 'Describe your Architecture')}
                </h3>
                <p style={{ margin: 0, color: 'var(--text-secondary)', fontSize: '0.9rem' }}>
                    {t('prompt.subtitle', 'Describe your business goals, applications, and technology requirements. The AI will generate a TOGAF compliant model.')}
                </p>
            </div>

            <textarea
                value={prompt}
                onChange={(e) => setPrompt(e.target.value)}
                placeholder={t('prompt.placeholder', 'Example: A banking system with a mobile app for customers, connecting to a legacy mainframe via an API Gateway, hosted on AWS with strict GDPR compliance...')}
                disabled={isLoading}
            />

            <div style={{ display: 'flex', justifyContent: 'flex-end', marginTop: '1rem' }}>
                <button
                    type="submit"
                    className="btn-primary"
                    disabled={!prompt.trim() || isLoading}
                    style={{ opacity: !prompt.trim() || isLoading ? 0.7 : 1 }}
                >
                    {isLoading ? t('action.generating', 'Generating...') : t('action.generate', 'Generate Model')}
                    {!isLoading && <Send size={18} />}
                </button>
            </div>
        </form>
    );
};
