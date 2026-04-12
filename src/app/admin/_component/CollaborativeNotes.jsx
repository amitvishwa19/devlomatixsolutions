"use client";

import { useState, useRef } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Send, AtSign, MessageSquare, Clock, Reply } from "lucide-react";
import { useAts } from "../_context/AtsContext";
import { toast } from "sonner";

const teamMembers = [
  { id: "1", name: "Rajesh Kumar", role: "Hiring Manager", avatar: "RK" },
  { id: "2", name: "Priya Sharma", role: "Recruiter", avatar: "PS" },
  { id: "3", name: "Amit Verma", role: "Tech Lead", avatar: "AV" },
  { id: "4", name: "Neha Kapoor", role: "HR Director", avatar: "NK" },
  { id: "5", name: "Design Lead", role: "Design Manager", avatar: "DL" },
];

const CollaborativeNotes = ({ candidateId, existingNotes }) => {
  const { addCandidateNote } = useAts();
  const [input, setInput] = useState("");
  const [showMentions, setShowMentions] = useState(false);
  const [mentionFilter, setMentionFilter] = useState("");
  const [replyingTo, setReplyingTo] = useState(null);
  const [replyText, setReplyText] = useState("");
  const inputRef = useRef(null);

  const [notes, setNotes] = useState(
    (existingNotes || []).map((n, i) => ({
      id: `note-${i}`,
      text: n,
      author: teamMembers[i % teamMembers.length].name,
      authorAvatar: teamMembers[i % teamMembers.length].avatar,
      timestamp: new Date(Date.now() - ((existingNotes || []).length - i) * 86400000),
      mentions: [],
      reactions: [],
      replies: [],
    }))
  );

  const handleInput = (value) => {
    setInput(value);
    const lastAtIndex = value.lastIndexOf("@");
    if (lastAtIndex >= 0 && lastAtIndex === value.length - 1 - (value.length - 1 - lastAtIndex)) {
      const afterAt = value.slice(lastAtIndex + 1);
      if (!afterAt.includes(" ")) {
        setShowMentions(true);
        setMentionFilter(afterAt);
        return;
      }
    }
    setShowMentions(false);
  };

  const insertMention = (member) => {
    const lastAtIndex = input.lastIndexOf("@");
    const newInput = input.slice(0, lastAtIndex) + `@${member.name} `;
    setInput(newInput);
    setShowMentions(false);
    inputRef.current?.focus();
  };

  const handleSubmit = () => {
    if (!input.trim()) return;
    const mentions = teamMembers.filter((m) => input.includes(`@${m.name}`)).map((m) => m.name);
    
    const newNote = {
      id: `note-${Date.now()}`,
      text: input,
      author: "You",
      authorAvatar: "YO",
      timestamp: new Date(),
      mentions,
      reactions: [],
      replies: [],
    };
    
    setNotes((prev) => [newNote, ...prev]);
    addCandidateNote(candidateId, input);
    setInput("");
    
    if (mentions.length > 0) {
      toast.success(`Notified ${mentions.join(", ")}`);
    } else {
      toast.success("Note added");
    }
  };

  const toggleReaction = (noteId, emoji) => {
    setNotes((prev) => prev.map((n) => {
      if (n.id !== noteId) return n;
      const existing = n.reactions.find((r) => r.emoji === emoji);
      if (existing) {
        return {
          ...n,
          reactions: n.reactions.map((r) =>
            r.emoji === emoji
              ? { ...r, count: r.reacted ? r.count - 1 : r.count + 1, reacted: !r.reacted }
              : r
          ).filter((r) => r.count > 0),
        };
      }
      return { ...n, reactions: [...n.reactions, { emoji, count: 1, reacted: true }] };
    }));
  };

  const addReply = (noteId) => {
    if (!replyText.trim()) return;
    setNotes((prev) => prev.map((n) => {
      if (n.id !== noteId) return n;
      return {
        ...n,
        replies: [...n.replies, { text: replyText, author: "You", authorAvatar: "YO", timestamp: new Date() }],
      };
    }));
    setReplyText("");
    setReplyingTo(null);
    toast.success("Reply added");
  };

  const filteredMembers = teamMembers.filter((m) =>
    m.name.toLowerCase().includes(mentionFilter.toLowerCase())
  );

  const renderText = (text) => {
    const parts = text.split(/(@\w+\s\w+)/g);
    return parts.map((part, i) => {
      if (part.startsWith("@") && teamMembers.some((m) => `@${m.name}` === part.trim())) {
        return <span key={i} className="text-primary font-medium bg-primary/10 rounded px-0.5">{part}</span>;
      }
      return part;
    });
  };

  const formatTime = (date) => {
    const now = new Date();
    const diff = now.getTime() - date.getTime();
    if (diff < 3600000) return `${Math.floor(diff / 60000)}m ago`;
    if (diff < 86400000) return `${Math.floor(diff / 3600000)}h ago`;
    return date.toLocaleDateString();
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle className="text-base flex items-center gap-2">
          <MessageSquare className="h-4 w-4" /> Collaborative Notes
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        {/* Input */}
        <div className="relative">
          <div className="flex gap-2">
            <div className="relative flex-1">
              <Input
                ref={inputRef}
                value={input}
                onChange={(e) => handleInput(e.target.value)}
                onKeyDown={(e) => {
                  if (e.key === "Enter" && !showMentions) handleSubmit();
                  if (e.key === "@") {
                    setShowMentions(true);
                    setMentionFilter("");
                  }
                  if (e.key === "Escape") setShowMentions(false);
                }}
                placeholder="Add a note... Use @ to mention team members"
              />
              {showMentions && filteredMembers.length > 0 && (
                <div className="absolute z-10 bottom-full mb-1 w-full rounded-md border bg-popover shadow-lg">
                  {filteredMembers.map((m) => (
                    <button
                      key={m.id}
                      onClick={() => insertMention(m)}
                      className="flex items-center gap-2 w-full px-3 py-2 hover:bg-muted text-left"
                    >
                      <div className="h-6 w-6 rounded-full bg-primary/10 flex items-center justify-center text-xs font-medium text-primary">{m.avatar}</div>
                      <div>
                        <div className="text-sm font-medium text-foreground">{m.name}</div>
                        <div className="text-xs text-muted-foreground">{m.role}</div>
                      </div>
                    </button>
                  ))}
                </div>
              )}
            </div>
            <Button onClick={handleSubmit} size="sm" className="gap-1">
              <Send className="h-3.5 w-3.5" />
            </Button>
          </div>
          <div className="flex items-center gap-1 mt-1">
            <AtSign className="h-3 w-3 text-muted-foreground" />
            <span className="text-xs text-muted-foreground">Type @ to mention team members</span>
          </div>
        </div>

        {/* Notes List */}
        <div className="space-y-3">
          {notes.map((note) => (
            <div key={note.id} className="rounded-lg border p-3 space-y-2">
              <div className="flex items-start justify-between">
                <div className="flex items-center gap-2">
                  <div className="h-7 w-7 rounded-full bg-primary/10 flex items-center justify-center text-xs font-medium text-primary">{note.authorAvatar}</div>
                  <div>
                    <span className="text-sm font-medium text-foreground">{note.author}</span>
                    <span className="text-xs text-muted-foreground ml-2 flex items-center gap-1 inline-flex">
                      <Clock className="h-3 w-3" /> {formatTime(note.timestamp)}
                    </span>
                  </div>
                </div>
              </div>
              
              <p className="text-sm text-foreground pl-9">{renderText(note.text)}</p>

              {/* Actions */}
              <div className="flex items-center gap-2 pl-9">
                <div className="flex gap-1">
                  {["👍", "❤️", "🎉"].map((emoji) => {
                    const reaction = note.reactions.find((r) => r.emoji === emoji);
                    return (
                      <button
                        key={emoji}
                        onClick={() => toggleReaction(note.id, emoji)}
                        className={`text-xs rounded-full px-1.5 py-0.5 border transition-colors ${
                          reaction?.reacted ? "bg-primary/10 border-primary/20" : "hover:bg-muted border-transparent"
                        }`}
                      >
                        {emoji} {reaction && reaction.count > 0 && reaction.count}
                      </button>
                    );
                  })}
                </div>
                <button
                  onClick={() => setReplyingTo(replyingTo === note.id ? null : note.id)}
                  className="text-xs text-muted-foreground hover:text-foreground flex items-center gap-1"
                >
                  <Reply className="h-3 w-3" /> Reply
                </button>
              </div>

              {/* Replies */}
              {note.replies.length > 0 && (
                <div className="pl-9 space-y-2 border-l-2 border-muted ml-9">
                  {note.replies.map((reply, i) => (
                    <div key={i} className="pl-3 py-1">
                      <div className="flex items-center gap-1.5">
                        <div className="h-5 w-5 rounded-full bg-muted flex items-center justify-center text-[10px] font-medium">{reply.authorAvatar}</div>
                        <span className="text-xs font-medium text-foreground">{reply.author}</span>
                        <span className="text-xs text-muted-foreground">{formatTime(reply.timestamp)}</span>
                      </div>
                      <p className="text-xs text-foreground mt-0.5 pl-6">{reply.text}</p>
                    </div>
                  ))}
                </div>
              )}

              {/* Reply Input */}
              {replyingTo === note.id && (
                <div className="flex gap-2 pl-9">
                  <Input
                    value={replyText}
                    onChange={(e) => setReplyText(e.target.value)}
                    onKeyDown={(e) => e.key === "Enter" && addReply(note.id)}
                    placeholder="Write a reply..."
                    className="h-8 text-xs"
                    autoFocus
                  />
                  <Button size="sm" className="h-8 text-xs" onClick={() => addReply(note.id)}>Reply</Button>
                </div>
              )}
            </div>
          ))}
          {notes.length === 0 && <p className="text-sm text-muted-foreground text-center py-4">No notes yet. Start the conversation!</p>}
        </div>
      </CardContent>
    </Card>
  );
};

export default CollaborativeNotes;
