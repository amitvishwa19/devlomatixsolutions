'use client'

import { useCallback, useEffect, useRef } from "react";

export function useWorkflowKeyboard(
  nodes,
  edges,
  setNodes,
  setEdges,
  selectedNode,
  setSelectedNode
) {
  const clipboardRef = useRef([]);
  const undoStackRef = useRef([]);

  const saveUndo = useCallback(() => {
    undoStackRef.current.push({
      nodes: nodes.map((n) => ({ ...n })),
      edges: edges.map((e) => ({ ...e })),
    });
    if (undoStackRef.current.length > 20) undoStackRef.current.shift();
  }, [nodes, edges]);

  useEffect(() => {
    const handler = (e) => {
      const target = e.target;
      if (target.tagName === "INPUT" || target.tagName === "TEXTAREA" || target.isContentEditable) return;

      if ((e.key === "Delete" || e.key === "Backspace") && selectedNode) {
        e.preventDefault();
        saveUndo();
        const id = selectedNode.id;
        setNodes((nds) => nds.filter((n) => n.id !== id));
        setEdges((eds) => eds.filter((ed) => ed.source !== id && ed.target !== id));
        setSelectedNode(null);
      }

      if ((e.ctrlKey || e.metaKey) && e.key === "c" && selectedNode) {
        e.preventDefault();
        clipboardRef.current = [{ ...selectedNode }];
      }

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
