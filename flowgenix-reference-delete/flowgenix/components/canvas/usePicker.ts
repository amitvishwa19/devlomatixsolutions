import { useCallback, useState } from "react";
import type { Edge, Node } from "@xyflow/react";
import type { NodeKind } from "./NodePickerSheet";

export const FIRST_NODE_ID = "__add_first__";

export type PickerState =
  | { open: false }
  | { open: true; mode: "first" }
  | { open: true; mode: "after"; sourceId: string }
  | { open: true; mode: "tool"; agentId: string }
  | { open: true; mode: "all"; position?: { x: number; y: number } };

type Setters = {
  setNodes: React.Dispatch<React.SetStateAction<Node[]>>;
  setEdges: React.Dispatch<React.SetStateAction<Edge[]>>;
};

export function usePicker(nodes: Node[], edges: Edge[], { setNodes, setEdges }: Setters) {
  const [picker, setPicker] = useState<PickerState>({ open: false });

  const openForFirst = useCallback(() => setPicker({ open: true, mode: "first" }), []);
  const openAfter = useCallback((sourceId: string) => setPicker({ open: true, mode: "after", sourceId }), []);
  const openForTool = useCallback((agentId: string) => setPicker({ open: true, mode: "tool", agentId }), []);
  const openAll = useCallback((position?: { x: number; y: number }) => setPicker({ open: true, mode: "all", position }), []);
  const close = useCallback(() => setPicker({ open: false }), []);

  const handlePick = useCallback(
    (kind: NodeKind) => {
      const id = `${kind.type}_${Math.random().toString(36).slice(2, 8)}`;

      if (picker.open && picker.mode === "tool") {
        const agent = nodes.find((n) => n.id === picker.agentId);
        if (!agent) return;
        const siblings = edges.filter((e) => e.source === picker.agentId).length;
        const newNode: Node = {
          id,
          type: "tool",
          position: { x: agent.position.x - 80 + siblings * 180, y: agent.position.y + 200 },
          data: { label: kind.label, icon: kind.icon, kind: kind.id },
        };
        setNodes((ns) => [...ns, newNode]);
        setEdges((es) => [
          ...es,
          {
            id: `e_${picker.agentId}_${id}`,
            source: picker.agentId,
            target: id,
            type: "deletable",
            animated: true,
            style: { strokeDasharray: "4 4" },
          },
        ]);
        close();
        return;
      }

      if (picker.open && picker.mode === "first") {
        const placeholder = nodes.find((n) => n.id === FIRST_NODE_ID);
        const pos = placeholder?.position ?? { x: 0, y: 0 };
        const newNode: Node = {
          id,
          type: kind.type,
          position: pos,
          data: { label: kind.label, icon: kind.icon, kind: kind.id, description: kind.description },
        };
        setNodes((ns) => ns.filter((n) => n.id !== FIRST_NODE_ID).concat(newNode));
        close();
        return;
      }

      if (picker.open && picker.mode === "after") {
        const source = nodes.find((n) => n.id === picker.sourceId);
        if (!source) return;
        const newNode: Node = {
          id,
          type: kind.type,
          position: { x: source.position.x + 320, y: source.position.y },
          data: { label: kind.label, icon: kind.icon, kind: kind.id, description: kind.description },
        };
        setNodes((ns) => [...ns, newNode]);
        setEdges((es) => [
          ...es,
          { id: `e_${picker.sourceId}_${id}`, source: picker.sourceId, target: id, type: "deletable", animated: true },
        ]);
        close();
        return;
      }

      if (picker.open && picker.mode === "all") {
        // If user picked a trigger AND no trigger exists yet, fill the FIRST placeholder.
        const hasTrigger = nodes.some((n) => n.type === "trigger");
        if (kind.type === "trigger" && !hasTrigger) {
          const placeholder = nodes.find((n) => n.id === FIRST_NODE_ID);
          const pos = placeholder?.position ?? picker.position ?? { x: 0, y: 0 };
          const newNode: Node = {
            id,
            type: kind.type,
            position: pos,
            data: { label: kind.label, icon: kind.icon, kind: kind.id, description: kind.description },
          };
          setNodes((ns) => ns.filter((n) => n.id !== FIRST_NODE_ID).concat(newNode));
          close();
          return;
        }
        // tools: drop near the first agent if any
        if (kind.type === "tool") {
          const agent = nodes.find((n) => n.type === "agent");
          const pos = agent
            ? { x: agent.position.x, y: agent.position.y + 200 }
            : picker.position ?? { x: 0, y: 0 };
          const newNode: Node = {
            id,
            type: "tool",
            position: pos,
            data: { label: kind.label, icon: kind.icon, kind: kind.id },
          };
          setNodes((ns) => [...ns, newNode]);
          if (agent) {
            setEdges((es) => [
              ...es,
              {
                id: `e_${agent.id}_${id}`,
                source: agent.id,
                target: id,
                type: "deletable",
                animated: true,
                style: { strokeDasharray: "4 4" },
              },
            ]);
          }
          close();
          return;
        }
        const pos = picker.position ?? { x: 0, y: 0 };
        const newNode: Node = {
          id,
          type: kind.type,
          position: pos,
          data: { label: kind.label, icon: kind.icon, kind: kind.id, description: kind.description },
        };
        setNodes((ns) => [...ns, newNode]);
        close();
      }
    },
    [picker, nodes, edges, setNodes, setEdges, close],
  );

  return { picker, setPicker, openForFirst, openAfter, openForTool, openAll, close, handlePick };
}
