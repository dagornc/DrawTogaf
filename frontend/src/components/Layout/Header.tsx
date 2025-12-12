import { useTranslation } from 'react-i18next';
import { Moon, Sun, Globe, Zap, Settings, ShieldCheck, AlertTriangle, Activity } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { useTheme } from '@/context/ThemeContext';
import type { ComplianceReport } from '@/services/api';

interface HeaderProps {
    onOpenSettings: () => void;
    isBackendOnline: boolean;
    compliance: ComplianceReport | null;
}

export const Header = ({
    onOpenSettings,
    isBackendOnline,
    compliance
}: HeaderProps) => {
    const { theme, toggleTheme } = useTheme();
    const { t, i18n } = useTranslation();

    const changeLanguage = () => {
        const langs = ['fr', 'en', 'es', 'de'];
        const current = langs.indexOf(i18n.language);
        const next = langs[(current + 1) % langs.length];
        i18n.changeLanguage(next);
    };

    return (
        <header className="glass-panel rounded-2xl flex justify-between items-center px-6 py-2 mx-auto w-[98%] max-w-[1900px]">
            {/* Logo Section */}
            <div className="flex items-center gap-4">
                <div className="p-2.5 rounded-xl bg-primary/10 border border-primary/20 shadow-neon-sm relative overflow-hidden group hover:shadow-neon transition-all duration-500">
                    <div className="absolute inset-0 bg-primary/20 blur-xl group-hover:bg-primary/30 transition-all opacity-50" />
                    <Zap className="text-primary relative z-10 animate-pulse-glow" size={20} />
                </div>
                <div>
                    <h1 className="m-0 text-lg font-bold tracking-tight bg-clip-text text-transparent bg-gradient-to-r from-foreground to-foreground/70">
                        {t('app.title', 'DrawTogaf Architecte')}
                    </h1>
                    <div className="flex items-center gap-2 text-[10px] font-medium tracking-wider uppercase text-muted-foreground/80">
                        <Activity size={10} className={isBackendOnline ? 'text-emerald-500' : 'text-rose-500'} />
                        {isBackendOnline ? 'System Online' : 'Offline'}
                    </div>
                </div>
            </div>

            {/* Status & Compliance Center */}
            <div className="flex items-center gap-4">
                {compliance && (
                    <div className={`flex items-center gap-3 px-4 py-1.5 rounded-full border backdrop-blur-md transition-all duration-300 hover:scale-105 ${compliance.compliant
                        ? 'border-emerald-500/30 bg-emerald-500/10 shadow-[0_0_15px_rgba(16,185,129,0.15)]'
                        : 'border-amber-500/30 bg-amber-500/10 shadow-[0_0_15px_rgba(245,158,11,0.15)]'
                        }`}>
                        {compliance.compliant ? <ShieldCheck size={16} className="text-emerald-500" /> : <AlertTriangle size={16} className="text-amber-500" />}
                        <div className="flex flex-col items-start leading-none">
                            <span className="text-[9px] font-bold uppercase opacity-70 mb-0.5">Compliance</span>
                            <span className="text-xs font-bold font-mono">{compliance.score}/100</span>
                        </div>
                    </div>
                )}
            </div>

            {/* Actions */}
            <div className="flex items-center gap-2">
                {/* Language Toggler */}
                <Button
                    variant="ghost"
                    size="sm"
                    onClick={changeLanguage}
                    className="h-9 px-3 rounded-xl hover:bg-secondary/50 font-mono text-xs gap-2 border border-transparent hover:border-border transition-all"
                >
                    <Globe size={14} />
                    {i18n.language.toUpperCase()}
                </Button>

                {/* Theme Toggler */}
                <Button
                    variant="ghost"
                    size="icon"
                    onClick={toggleTheme}
                    className="h-9 w-9 rounded-xl hover:bg-secondary/50 border border-transparent hover:border-border transition-all"
                >
                    {theme === 'light' ? <Moon size={18} /> : <Sun size={18} />}
                </Button>

                <div className="w-px h-6 bg-border/50 mx-1" />

                {/* Settings */}
                <Button
                    variant="ghost"
                    size="icon"
                    onClick={onOpenSettings}
                    className="h-9 w-9 rounded-xl hover:bg-primary/10 hover:text-primary transition-all group"
                >
                    <Settings size={18} className="group-hover:rotate-90 transition-transform duration-500" />
                </Button>
            </div>
        </header>
    );
};
