import dagre from '@dagrejs/dagre';
import { Position } from '@xyflow/react';

const NODE_WIDTH = 250;
const NODE_HEIGHT = 180;

/**
 * Computes hierarchical layout using Dagre
 * @param {Array} nodes - ReactFlow nodes
 * @param {Array} edges - ReactFlow edges
 * @param {string} direction - 'TB' (Top to Bottom) | 'LR' (Left to Right)
 * @returns {{ nodes: Array, edges: Array }}
 */
export function getLayoutedOrgElements(nodes = [], edges = [], direction = 'TB') {
  const isHorizontal = direction === 'LR';
  const dagreGraph = new dagre.graphlib.Graph();
  dagreGraph.setDefaultEdgeLabel(() => ({}));

  dagreGraph.setGraph({
    rankdir: direction,
    ranksep: 80,
    nodesep: 40,
    align: 'UL',
  });

  nodes.forEach((node) => {
    dagreGraph.setNode(node.id, {
      width: node.width || NODE_WIDTH,
      height: node.height || NODE_HEIGHT,
    });
  });

  edges.forEach((edge) => {
    dagreGraph.setEdge(edge.source, edge.target);
  });

  dagre.layout(dagreGraph);

  const layoutedNodes = nodes.map((node) => {
    const nodeWithPosition = dagreGraph.node(node.id);
    const targetPosition = isHorizontal ? Position.Left : Position.Top;
    const sourcePosition = isHorizontal ? Position.Right : Position.Bottom;

    // Center node position around Dagre's computed center
    const x = nodeWithPosition
      ? nodeWithPosition.x - (node.width || NODE_WIDTH) / 2
      : node.position?.x || 0;
    const y = nodeWithPosition
      ? nodeWithPosition.y - (node.height || NODE_HEIGHT) / 2
      : node.position?.y || 0;

    return {
      ...node,
      targetPosition,
      sourcePosition,
      position: { x, y },
    };
  });

  return { nodes: layoutedNodes, edges };
}
