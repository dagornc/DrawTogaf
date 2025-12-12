import axios from 'axios';

const API_URL = 'http://localhost:8000/api';

export interface ArchitectureNode {
    id: string;
    name: string;
    description?: string;
    layer: string;
    type: string;
    attributes?: Record<string, string | number | boolean | null>;
    position?: { x: number; y: number };
    width?: number;
    height?: number;
}

export interface ArchitectureEdge {
    source_id: string;
    target_id: string;
    type: string;
    description?: string;
    bidirectional?: boolean;
}

export interface ArchitectureGraph {
    nodes: ArchitectureNode[];
    edges: ArchitectureEdge[];
}

export interface ComplianceIssue {
    severity: string;
    element: string;
    message: string;
}

export interface ComplianceReport {
    score: number;
    issues: ComplianceIssue[];
    compliant: boolean;
}

export interface GenerateResponse {
    graph: ArchitectureGraph;
    compliance: ComplianceReport;
}


export const generateArchitecture = async (prompt: string, schemaType: string, model?: string): Promise<GenerateResponse> => {
    const response = await axios.post<GenerateResponse>(`${API_URL}/generate`, {
        prompt,
        schema_type: schemaType,
        model
    });
    return response.data;
};


export const exportToPptx = async (nodes: ArchitectureNode[], edges: ArchitectureEdge[]) => {
    try {
        const response = await axios.post(`${API_URL}/export/pptx`, {
            nodes,
            edges
        }, {
            responseType: 'blob'
        });

        const url = window.URL.createObjectURL(new Blob([response.data]));
        const link = document.createElement('a');
        link.href = url;
        link.setAttribute('download', 'architecture.pptx');
        document.body.appendChild(link);
        link.click();
        link.parentNode?.removeChild(link);
    } catch (error) {
        console.error("Export failed", error);
        throw error;
    }
};

export const checkHealth = async () => {
    try {
        const response = await axios.get(`${API_URL.replace('/api', '')}/`);
        return response.data;
    } catch (error) {
        console.error("Backend health check failed", error);
        return null;
    }
};
