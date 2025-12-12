import ELK from 'elkjs/lib/elk.bundled.js';
import type { Edge } from '@xyflow/react';
import type { AppNode } from './types';

// Initialize ELK
const elk = new ELK();

// Standard ArchiMate Layer Order
const LAYER_ORDER = [
    'Motivation',
    'Strategy',
    'Business',
    'Application',
    'Technology',
    'Physical',
    'Implementation',
    'Other',
    'Composite'
];
const LAYER_PRIORITY = Object.fromEntries(LAYER_ORDER.map((l, i) => [l.toLowerCase(), i]));

export const isStructuralRelationship = (type: string) => {
    const t = type?.toLowerCase();
    // Composition, Aggregation, Assignment, Nesting
    return ['composition', 'aggregation', 'assignment', 'nesting', 'composed of', 'assigned to'].includes(t);
};

// Helper: Estimate text width to ensure nodes are wide enough
const estimateNodeDimensions = (label: string, isGroup: boolean) => {
    const baseWidth = isGroup ? 300 : 160;
    const baseHeight = isGroup ? 200 : 80;

    // Crude estimation: ~8px per character for average font
    const textLength = label?.length || 0;
    const estimatedTextWidth = textLength * 8;

    return {
        width: Math.max(baseWidth, estimatedTextWidth + 40), // 40px padding
        height: baseHeight
    };
};

// Helper to determine layer
const getLayerName = (type?: string): string => {
    if (!type) return 'Other';
    const t = type.toLowerCase();
    if (['resource', 'capability', 'goal', 'objective', 'principle', 'constraint', 'requirement'].includes(t)) return 'Motivation';
    if (['course of action', 'strategy', 'tactic'].includes(t)) return 'Strategy';
    if (['business service', 'business process', 'business function', 'business interaction', 'business event', 'business object', 'representation', 'contract', 'business role', 'business actor', 'business collaboration', 'business interface'].includes(t)) return 'Business';
    if (['application service', 'application function', 'application interaction', 'application event', 'data object', 'application component', 'application collaboration', 'application interface'].includes(t)) return 'Application';
    if (['technology service', 'technology function', 'technology interaction', 'technology event', 'artifact', 'technology component', 'technology collaboration', 'technology interface', 'node', 'device', 'system software', 'path', 'communication network'].includes(t)) return 'Technology';
    if (['physical element', 'equipment', 'facility', 'distribution network', 'material'].includes(t)) return 'Physical';
    if (['work package', 'deliverable', 'implementation event', 'plateau', 'gap'].includes(t)) return 'Implementation';
    if (['group', 'grouping', 'junction', 'location'].includes(t)) return 'Composite';
    return 'Other';
};

export const getLayoutedElements = async (nodes: AppNode[], edges: Edge[], direction = 'DOWN') => {
    // 1. Identify Existing Structural Relationships (Parents from Edges)
    const logicalParents: Record<string, string> = {};
    const structuralEdges = new Set<string>();

    const VALID_CONTAINER_TYPES = [
        'group', 'grouping', 'zone', 'location',
        'layer', 'plateau', 'gap',
        'device', 'node', 'facility', 'equipment',
        'system software', 'path',
        'composite'
    ];

    const isContainer = (type?: string) => {
        const t = (type || '').toLowerCase();
        return VALID_CONTAINER_TYPES.some(valid => t.includes(valid));
    };

    const nodeTypeMap = new Map(nodes.map(n => [n.id, n.data?.type || '']));

    // Identify implementation parents
    edges.forEach(edge => {
        const type = (typeof edge.label === 'string' ? edge.label : '')?.toLowerCase() || '';
        if (isStructuralRelationship(type)) {
            const sourceType = nodeTypeMap.get(edge.source);
            if (isContainer(sourceType)) {
                if (!logicalParents[edge.target]) {
                    logicalParents[edge.target] = edge.source;
                    structuralEdges.add(edge.id);
                }
            }
        }
    });

    // 2. Identify Layers and Create Layer Groups
    // Only Root nodes (no structural parent) are candidates for Layer grouping
    const rootNodes = nodes.filter(n => !logicalParents[n.id]);
    const layersToCreate = new Set<string>();

    // Augment nodes with inferred layer if missing
    nodes.forEach(n => {
        if (!n.data.layer && n.data.type) {
            n.data.layer = getLayerName(n.data.type);
        }
    });

    rootNodes.forEach(n => {
        // Skip Layer Grouping for explicit Containers/Groups (Silos)
        if (isContainer(n.data?.type)) return;

        if (n.data?.layer) {
            const l = n.data.layer.toLowerCase();
            if (Object.keys(LAYER_PRIORITY).includes(l) && l !== 'other') {
                layersToCreate.add(l);
            }
        }
    });

    const sortedLayers = Array.from(layersToCreate).sort((a, b) => {
        return (LAYER_PRIORITY[a] ?? 999) - (LAYER_PRIORITY[b] ?? 999);
    });

    const layerGroups: AppNode[] = [];
    const layerGroupIds = new Set<string>();

    sortedLayers.forEach(layerName => {
        const label = layerName.charAt(0).toUpperCase() + layerName.slice(1) + ' Layer';
        const layerId = `LAYER_GROUP_${layerName}`;
        layerGroupIds.add(layerId);

        layerGroups.push({
            id: layerId,
            type: 'custom',
            data: {
                label: label,
                type: `${layerName} Layer`, // Ensures getIcon works or returns generic
                layer: layerName,
                isLayerGroup: true,
                isCollapsed: false // Default open
            },
            position: { x: 0, y: 0 },
            style: { width: 300, height: 200 } // Initial size, ELK will resize
        });
    });

    const allNodes = [...nodes, ...layerGroups];

    // 3. Build ELK Graph Hierarchy
    const elkGenericNodes: any[] = [];
    const elkNodeMap = new Map<string, any>();

    // Define Port Constraints based on direction
    const portConstraints = direction === 'DOWN'
        ? 'FIXED_SIDE' // Connections constrained to Top/Bottom
        : 'FREE';

    // Create ELK nodes for all AppNodes
    allNodes.forEach(node => {
        const isGroup = node.data?.isLayerGroup || isContainer(node.data?.type);
        const labelStr = typeof node.data.label === 'string' ? node.data.label : node.id;
        const dimensions = estimateNodeDimensions(labelStr, !!isGroup);

        const elkNode = {
            id: node.id,
            width: node.data?.width || node.width || dimensions.width,
            height: node.data?.height || node.height || dimensions.height,
            children: [],
            edges: [],
            layoutOptions: {
                // Node-specific padding and constraints
                'elk.padding': isGroup ? '[top=60,left=30,bottom=30,right=30]' : '[top=10,left=10,bottom=10,right=10]',
                'elk.portConstraints': portConstraints,
                ...(isGroup ? {
                    'elk.nodeSize.constraints': 'MINIMUM_SIZE',
                    'elk.direction': direction, // Keep internal flow consistent
                    'elk.algorithm': 'layered', // CRITICAL: Recursively apply layered layout inside groups
                    'elk.layered.spacing.nodeNodeBetweenLayers': '80',
                    'elk.spacing.nodeNode': '60'
                } : {})
            }
        };
        elkNodeMap.set(node.id, elkNode);
    });

    // Assign hierarchy
    allNodes.forEach(node => {
        if (node.data?.isLayerGroup) {
            return; // Layer groups are roots
        }

        let parentId: string | undefined = logicalParents[node.id];

        // If no structural parent, try to assign to Layer Group
        if (!parentId && node.data?.layer) {
            const l = node.data.layer.toLowerCase();
            if (layersToCreate.has(l)) {
                parentId = `LAYER_GROUP_${l}`;
                logicalParents[node.id] = parentId; // Update logical map for later React Flow 'parentNode'
            }
        }

        const elkNode = elkNodeMap.get(node.id);

        if (parentId) {
            const parentElkNode = elkNodeMap.get(parentId);
            if (parentElkNode) {
                parentElkNode.children.push(elkNode);
            } else {
                elkGenericNodes.push(elkNode);
            }
        } else {
            elkGenericNodes.push(elkNode);
        }
    });

    // Add Layer Groups to root
    layerGroups.forEach(lg => {
        const elkNode = elkNodeMap.get(lg.id);
        elkGenericNodes.push(elkNode);
    });

    // 4. Edges
    const elkEdges: any[] = [];
    const validNodeIds = new Set(allNodes.map(n => n.id));

    // A. Invisible edges to enforce Layer Order (Top-Down Flow)
    // Only add these if we are in Vertical mode and have layers
    if (direction === 'DOWN') {
        for (let i = 0; i < sortedLayers.length - 1; i++) {
            const sourceId = `LAYER_GROUP_${sortedLayers[i]}`;
            const targetId = `LAYER_GROUP_${sortedLayers[i + 1]}`;
            // Add a constraint edge
            elkEdges.push({
                id: `LAYER_ORDER_${i}`,
                sources: [sourceId],
                targets: [targetId],
                layoutOptions: {
                    'elk.edge.type': 'DIRECTED',
                }
            });
        }
    }

    // B. Real edges
    const visibleEdges = edges.filter(e => !structuralEdges.has(e.id));

    visibleEdges.forEach(edge => {
        if (validNodeIds.has(edge.source) && validNodeIds.has(edge.target) && edge.source !== edge.target) {
            elkEdges.push({
                id: edge.id,
                sources: [edge.source],
                targets: [edge.target]
            });
        }
    });

    // 5. Construct Root Graph
    // Pro-Level Layout Configuration
    const rootGraph = {
        id: 'root',
        layoutOptions: {
            'elk.algorithm': 'layered',
            'elk.direction': direction,

            // Spacing - Increased for clarity
            'elk.spacing.nodeNode': '100', // Increased horizontal spacing
            'elk.layered.spacing.nodeNodeBetweenLayers': '100', // Increased vertical spacing (within group)
            'elk.spacing.edgeNode': '60',
            'elk.spacing.edgeEdge': '60',

            // Layered options
            'elk.layered.layering.strategy': 'NETWORK_SIMPLEX', // Often better compaction than LONGEST_PATH
            'elk.layered.nodePlacement.strategy': 'BRANDES_KOEPF', // Balanced placement, fewer doglegs
            'elk.layered.crossingMinimization.strategy': 'LAYER_SWEEP',

            // Routing
            'elk.edgeRouting': 'ORTHOGONAL', // Professional right-angle edges
            'elk.layered.spline': 'true', // Sometimes helps with smoothness depending on renderer, but orthogonal is key

            // Hierarchy handling
            'elk.hierarchyHandling': 'INCLUDE_CHILDREN',
            'elk.padding': '[top=60,left=60,bottom=60,right=60]', // Global padding

            // Additional Tuning
            'elk.layered.feedbackEdges': 'true', // Better handling of cycles if any
            'elk.layered.wrapping.additionalEdgeSpacing': '30'
        },
        children: elkGenericNodes,
        edges: elkEdges
    };

    // 6. Run Layout
    try {
        const layoutedGraph = await elk.layout(rootGraph);

        // 7. Flatten and Apply Positions
        const layoutedNodes: AppNode[] = [];

        // Recursive function to extract nodes with relative positions
        const processNode = (node: any, parentId?: string) => {
            const originalNode = allNodes.find(n => n.id === node.id);
            if (originalNode) {
                layoutedNodes.push({
                    ...originalNode,
                    position: { x: node.x, y: node.y }, // ELK returns relative x,y for children
                    style: {
                        ...originalNode.style,
                        width: node.width,
                        height: node.height,
                    },
                    data: {
                        ...originalNode.data,
                        width: node.width,
                        height: node.height,
                    },
                    // Critical React Flow Nesting Props
                    ...(parentId ? { parentId: parentId, extent: 'parent' } : { extent: undefined, parentId: undefined })
                });
            }

            if (node.children) {
                node.children.forEach((child: any) => processNode(child, node.id));
            }
        };

        if (layoutedGraph.children) {
            layoutedGraph.children.forEach((child: any) => processNode(child, undefined));
        }

        return { nodes: layoutedNodes, edges: visibleEdges };

    } catch (error) {
        console.error("ELK Layout failed:", error);
        return { nodes: allNodes, edges: visibleEdges };
    }
};

