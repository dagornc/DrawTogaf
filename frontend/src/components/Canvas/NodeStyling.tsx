// React import removed as strictly unused in this file

import { Layers, User, Server, Database, Box, Globe, Cpu, Sparkles, Zap, FileText, Smartphone, Package, Target, HardDrive, MonitorSmartphone } from 'lucide-react';

// ArchiMate 3.1 Standard Colors (Refined for Premium Look)
// ArchiMate 3.1 Standard Colors (Refined for Premium Look)
// Using HSL for better manipulation if needed, but defining rich gradients here.
export const LAYER_COLORS = {
    Strategy: {
        bg: 'linear-gradient(135deg, #FDF4E3 0%, #F6E6BC 100%)',
        border: '#D9C692',
        icon: '#8C7A4A',
        shadow: 'rgba(217, 198, 146, 0.4)'
    }, // Beige
    Business: {
        bg: '#FFFFB5',
        border: '#F2D600',
        icon: '#8A7A00',
        shadow: 'rgba(255, 230, 0, 0.3)'
    }, // Yellow
    Application: {
        bg: '#B5FFFF',
        border: '#00ACC1',
        icon: '#006064',
        shadow: 'rgba(0, 172, 193, 0.3)'
    }, // Blue/Cyan
    Technology: {
        bg: '#C9FFC9',
        border: '#7CB342',
        icon: '#33691E',
        shadow: 'rgba(124, 179, 66, 0.3)'
    }, // Green
    Physical: {
        bg: 'linear-gradient(135deg, #F1F8E9 0%, #C8E6C9 100%)',
        border: '#43A047',
        icon: '#1B5E20',
        shadow: 'rgba(67, 160, 71, 0.3)'
    }, // Mint
    Motivation: {
        bg: 'linear-gradient(135deg, #F3E5F5 0%, #E1BEE7 100%)',
        border: '#8E24AA',
        icon: '#4A148C',
        shadow: 'rgba(142, 36, 170, 0.3)'
    }, // Purple
    Implementation: {
        bg: 'linear-gradient(135deg, #FFEBEE 0%, #FFCDD2 100%)',
        border: '#E53935',
        icon: '#B71C1C',
        shadow: 'rgba(229, 57, 53, 0.3)'
    }, // Pink
    Composite: {
        bg: 'linear-gradient(135deg, rgba(255, 255, 255, 0.95) 0%, rgba(245, 245, 245, 0.9) 100%)',
        border: '#424242',
        icon: '#424242',
        shadow: 'rgba(0, 0, 0, 0.1)'
    }, // Neutral
    Unknown: {
        bg: '#F5F5F5',
        border: '#BDBDBD',
        icon: '#757575',
        shadow: 'rgba(0,0,0,0.1)'
    }
};

export const getElementStyle = (type: string) => {
    const t = type?.toLowerCase() || '';

    // Layer Groups
    if (t.endsWith('layer')) {
        const layerName = t.replace(' layer', '');
        const key = Object.keys(LAYER_COLORS).find(k => k.toLowerCase() === layerName);
        if (key) return LAYER_COLORS[key as keyof typeof LAYER_COLORS];
    }

    // Composite / Grouping
    if (t.includes('grouping') || t.includes('zone') || t === 'location' || t === 'plateau') {
        return LAYER_COLORS.Composite;
    }

    // Strategy
    if (['resource', 'capability', 'courseofaction', 'valuestream'].includes(t)) {
        return LAYER_COLORS.Strategy;
    }

    // Business
    if ([
        'businessactor', 'businessrole', 'businesscollaboration', 'businessinterface',
        'businessprocess', 'businessfunction', 'businessinteraction', 'businessevent',
        'businessservice', 'businessobject', 'contract', 'representation', 'product'
    ].includes(t)) {
        return LAYER_COLORS.Business;
    }

    // Application
    if ([
        'applicationcomponent', 'applicationcollaboration', 'applicationinterface',
        'applicationfunction', 'applicationinteraction', 'applicationprocess',
        'applicationevent', 'applicationservice', 'dataobject'
    ].includes(t)) {
        return LAYER_COLORS.Application;
    }

    // Technology
    if ([
        'node', 'device', 'systemsoftware', 'technologycollaboration',
        'technologyinterface', 'path', 'communicationnetwork', 'technologyfunction',
        'technologyprocess', 'technologyinteraction', 'technologyevent',
        'technologyservice', 'artifact'
    ].includes(t)) {
        return LAYER_COLORS.Technology;
    }

    // Physical
    if (['facility', 'equipment', 'distributionnetwork', 'material'].includes(t)) {
        return LAYER_COLORS.Physical;
    }

    // Motivation
    if ([
        'stakeholder', 'driver', 'assessment', 'goal', 'outcome',
        'principle', 'requirement', 'constraint', 'meaning', 'value'
    ].includes(t)) {
        return LAYER_COLORS.Motivation;
    }

    // Implementation
    if ([
        'workpackage', 'deliverable', 'implementationevent', 'plateau', 'gap'
    ].includes(t)) {
        return LAYER_COLORS.Implementation;
    }

    return LAYER_COLORS.Unknown;
};

// Shape Logic: 
// Active Structure -> Box (Sharp corners: 2px)
// Behavior -> Rounded (Large radius: 10px or 16px)
// Passive Structure -> Standard (4px)
export const getShapeStyle = (type: string): { borderRadius: string } => {
    const t = type?.toLowerCase() || '';

    // Active Structure (Substantives: Actor, Role, Component, Node, Interface)
    if (t.includes('actor') || t.includes('role') || t.includes('component') || t.includes('node') || t.includes('device') || t.includes('interface') || t.includes('collaboration')) {
        return { borderRadius: '2px' }; // Nearly sharp
    }

    // Behavior (Verbs: Service, Process, Function, Interaction, Event)
    if (t.includes('service') || t.includes('process') || t.includes('function') || t.includes('interaction') || t.includes('event')) {
        return { borderRadius: '16px' }; // Rounded/Pill-like
    }

    // Passive Structure (Object, Artifact) -> Standard rounded
    return { borderRadius: '6px' };
};

// Helper to determine Layer Name from Type
export const getLayerName = (type: string): string => {
    const t = type?.toLowerCase() || '';

    if (t.endsWith('layer')) return t.replace(' layer', '').charAt(0).toUpperCase() + t.replace(' layer', '').slice(1);

    if (['resource', 'capability', 'courseofaction', 'valuestream'].includes(t)) return 'Strategy';

    if ([
        'businessactor', 'businessrole', 'businesscollaboration', 'businessinterface',
        'businessprocess', 'businessfunction', 'businessinteraction', 'businessevent',
        'businessservice', 'businessobject', 'contract', 'representation', 'product'
    ].includes(t)) return 'Business';

    if ([
        'applicationcomponent', 'applicationcollaboration', 'applicationinterface',
        'applicationfunction', 'applicationinteraction', 'applicationprocess',
        'applicationevent', 'applicationservice', 'dataobject'
    ].includes(t)) return 'Application';

    if ([
        'node', 'device', 'systemsoftware', 'technologycollaboration',
        'technologyinterface', 'path', 'communicationnetwork', 'technologyfunction',
        'technologyprocess', 'technologyinteraction', 'technologyevent',
        'technologyservice', 'artifact'
    ].includes(t)) return 'Technology';

    if (['facility', 'equipment', 'distributionnetwork', 'material'].includes(t)) return 'Physical';

    if ([
        'stakeholder', 'driver', 'assessment', 'goal', 'outcome',
        'principle', 'requirement', 'constraint', 'meaning', 'value'
    ].includes(t)) return 'Motivation';

    if ([
        'workpackage', 'deliverable', 'implementationevent', 'plateau', 'gap'
    ].includes(t)) return 'Implementation';

    return 'Other';
};

export const getIcon = (type: string) => {
    const t = type?.toLowerCase() || '';
    switch (t) {
        // Business
        case 'businessactor': return <User size={16} />;
        case 'businessrole': return <User size={14} />;
        case 'businessprocess': return <Layers size={14} />;
        case 'businessfunction': return <Layers size={14} />;
        case 'businessinteraction': return <Globe size={14} />;
        case 'businessservice': return <Sparkles size={14} />;
        case 'businessobject': return <FileText size={14} />;

        // Application
        case 'applicationcomponent': return <Box size={14} />;
        case 'applicationservice': return <Zap size={14} />;
        case 'applicationinterface': return <MonitorSmartphone size={14} />;
        case 'dataobject': return <Database size={14} />;
        case 'artifact': return <Package size={14} />;

        // Technology
        case 'device': return <Smartphone size={14} />;
        case 'node': return <Server size={14} />;
        case 'systemsoftware': return <Cpu size={14} />;
        case 'communicationnetwork': return <Globe size={14} />;
        case 'path': return <Globe size={14} />;

        // Physical
        case 'equipment': return <HardDrive size={14} />;
        case 'material': return <Box size={14} />;
        case 'distributionnetwork': return <Target size={14} />;

        // Grouping
        case 'grouping':
        case 'location':
        case 'zone': return <Layers size={14} />;
        case 'facility': return <Layers size={14} />;

        // Layer Group
        case 'layer': return <Layers size={14} />;

        default: return <Box size={14} />;
    }
};
