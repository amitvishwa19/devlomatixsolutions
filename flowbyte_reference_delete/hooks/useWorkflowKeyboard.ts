import { useCallback, useEffect, useRef } from "react";
import type { Node, Edge } from "@xyflow/react";

type SetNodes = React.Dispatch<React.SetStateAction<Node[]>>;
type SetEdges = React.Dispatch<React.SetStateAction<Edge[]>>;

interface UndoState {
  nodes: Node[];
  edges: Edge[];
}

export function useWorkflowKeyboard(
  nodes: Node[],
  edges: Edge[],
  setNodes: SetNodes,
  setEdges: SetEdges,
  selectedNode: Node | null,
  setSelectedNode: (n: Node | null) => void
) {
  const clipboardRef = useRef<Node[]>([]);
  const undoStackRef = useRef<UndoState[]>([]);

  const saveUndo = useCallback(() => {
    undoStackRef.current.push({
      nodes: nodes.map((n) => ({ ...n })),
      edges: edges.map((e) => ({ ...e })),
    });
    if (undoStackRef.current.length > 20) undoStackRef.current.shift();
  }, [nodes, edges]);

  useEffect(() => {
    const handler = (e: KeyboardEvent) => {
      const target = e.target as HTMLElement;
      if (target.tagName === "INPUT" || target.tagName === "TEXTAREA" || target.isContentEditable) return;

      // Delete / Backspace
      if ((e.key === "Delete" || e.key === "Backspace") && selectedNode) {
        e.preventDefault();
        saveUndo();
        const id = selectedNode.id;
        setNodes((nds) => nds.filter((n) => n.id !== id));
        setEdges((eds) => eds.filter((ed) => ed.source !== id && ed.target !== id));
        setSelectedNode(null);
      }

      // Ctrl+C / Cmd+C
      if ((e.ctrlKey || e.metaKey) && e.key === "c" && selectedNode) {
        e.preventDefault();
        clipboardRef.current = [{ ...selectedNode }];
      }

      // Ctrl+V / Cmd+V
      if ((e.ctrlKey || e.metaKey) && e.key === "v" && clipboardRef.current.length > 0) {
        e.preventDefault();
        saveUndo();
        const pasted = clipboardRef.current.map((n) => ({
          ...n,
          id: `${Date.now()}-${Math.random().toString(36).slice(2, 6)}`,
          position: { x: n.position.x + 60, y: n.position.y + 60 },
          data: { ...n.data, status: "idle" },
          selected: false,
        }));
        setNodes((nds) => [...nds, ...pasted]);
      }

      // Ctrl+Z / Cmd+Z
      if ((e.ctrlKey || e.metaKey) && e.key === "z" && !e.shiftKey) {
        e.preventDefault();
        const prev = undoStackRef.current.pop();
        if (prev) {
          setNodes(prev.nodes);
          setEdges(prev.edges);
          setSelectedNode(null);
        }
      }
    };

    window.addEventListener("keydown", handler);
    return () => window.removeEventListener("keydown", handler);
  }, [selectedNode, saveUndo, setNodes, setEdges, setSelectedNode]);
}
