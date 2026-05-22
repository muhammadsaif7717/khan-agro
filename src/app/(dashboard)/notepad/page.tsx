"use client";

import { useState, useEffect } from "react";
import { useApp } from "@/context/AppContext";
import { 
  StickyNote, 
  Trash2, 
  Edit, 
  Plus, 
  Search, 
  Copy, 
  Check, 
  Tag, 
  Calendar,
  X,
  FileText
} from "lucide-react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";

import { Note } from "@/lib/types";

const texts = {
  bn: {
    title: "খামার নোটপ্যাড (Notes Manager)",
    subtitle: "খামারের প্রয়োজনীয় হিসাব-নিকাশ, নির্দেশনা ও পরিকল্পনা নোট করে রাখুন",
    searchPlaceholder: "নোট খুঁজুন (টাইটেল বা বিবরণ)...",
    addNote: "নতুন নোট তৈরি করুন",
    editNote: "নোট পরিবর্তন করুন",
    noteTitleLabel: "নোটের শিরোনাম (Title)",
    noteTitlePlaceholder: "শিরোনাম লিখুন...",
    noteDescLabel: "নোটের বিবরণ (Description)",
    noteDescPlaceholder: "বিস্তারিত বিবরণ লিখুন...",
    categoryLabel: "ক্যাটাগরি বা বিষয়",
    saveNote: "নোট সেভ করুন",
    cancelEdit: "বাতিল করুন",
    noNotes: "কোনো নোট খুঁজে পাওয়া যায়নি!",
    created: "তারিখ:",
    deleteConfirm: "⚠️ আপনি কি এই নোটটি ডিলিট করতে চান?",
    categories: {
      general: "সাধারণ নোট",
      milk: "দুধ বিক্রয়",
      feed: "খাদ্য ও পুষ্টি",
      finance: "আর্থিক হিসাব",
      todo: "আজকের কাজ"
    }
  },
  en: {
    title: "Farm Notepad",
    subtitle: "Note down important farm transactions, events, and tasks",
    searchPlaceholder: "Search notes by title or description...",
    addNote: "Create New Note",
    editNote: "Modify Note",
    noteTitleLabel: "Note Title",
    noteTitlePlaceholder: "Enter note title...",
    noteDescLabel: "Note Description",
    noteDescPlaceholder: "Write detailed notes here...",
    categoryLabel: "Category Tag",
    saveNote: "Save Note",
    cancelEdit: "Cancel",
    noNotes: "No notes found!",
    created: "Date:",
    deleteConfirm: "⚠️ Do you want to delete this note?",
    categories: {
      general: "General Notes",
      milk: "Milk Records",
      feed: "Feed & Care",
      finance: "Financials",
      todo: "To-Do Tasks"
    }
  }
};

const categoryStyles = {
  general: "bg-slate-500/10 text-slate-350 border-slate-500/20",
  milk: "bg-cyan-500/10 text-cyan-400 border-cyan-500/20",
  feed: "bg-emerald-500/10 text-emerald-400 border-emerald-500/20",
  finance: "bg-amber-500/10 text-amber-400 border-amber-500/20",
  todo: "bg-rose-500/10 text-rose-400 border-rose-500/20"
};

export default function NotepadPage() {
  const { language, notes, setNotes, saveAllData } = useApp();
  const lang = language === "bn" ? "bn" : "en";
  const txt = texts[lang];

  const [searchQuery, setSearchQuery] = useState("");
  
  // Editor States
  const [isEditing, setIsEditing] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [noteTitle, setNoteTitle] = useState("");
  const [noteDesc, setNoteDesc] = useState("");
  const [noteCategory, setNoteCategory] = useState<"general" | "milk" | "feed" | "finance" | "todo">("general");

  const [copiedId, setCopiedId] = useState<string | null>(null);

  const saveNotesToDB = async (newNotes: Note[]) => {
    setNotes(newNotes);
    await saveAllData(undefined, undefined, undefined, undefined, undefined, undefined, undefined, undefined, newNotes);
  };

  const handleSaveNote = (e: React.FormEvent) => {
    e.preventDefault();
    if (!noteTitle.trim() || !noteDesc.trim()) return;

    if (isEditing && editingId) {
      // Update
      const updated = notes.map((n) => 
        n.id === editingId 
          ? { 
              ...n, 
              title: noteTitle.trim(), 
              description: noteDesc.trim(), 
              category: noteCategory 
            } 
          : n
      );
      saveNotesToDB(updated);
      setIsEditing(false);
      setEditingId(null);
    } else {
      // Create new
      const newNote: Note = {
        id: Date.now().toString(),
        title: noteTitle.trim(),
        description: noteDesc.trim(),
        category: noteCategory,
        createdAt: new Date().toLocaleDateString(language === "bn" ? "bn-BD" : "en-US", {
          year: "numeric",
          month: "long",
          day: "numeric"
        })
      };
      saveNotesToDB([newNote, ...notes]);
    }

    // Reset Form
    setNoteTitle("");
    setNoteDesc("");
    setNoteCategory("general");
  };

  const handleStartEdit = (note: Note) => {
    setIsEditing(true);
    setEditingId(note.id);
    setNoteTitle(note.title);
    setNoteDesc(note.description);
    setNoteCategory(note.category);
    // Scroll form into view for mobile devices
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  const handleCancelEdit = () => {
    setIsEditing(false);
    setEditingId(null);
    setNoteTitle("");
    setNoteDesc("");
    setNoteCategory("general");
  };

  const handleDeleteNote = (id: string) => {
    if (confirm(txt.deleteConfirm)) {
      const filtered = notes.filter((n) => n.id !== id);
      saveNotesToDB(filtered);
      if (editingId === id) {
        handleCancelEdit();
      }
    }
  };

  const handleCopyToClipboard = (note: Note) => {
    const textToCopy = `${note.title}\n\n${note.description}\n\n(${txt.created} ${note.createdAt})`;
    navigator.clipboard.writeText(textToCopy);
    setCopiedId(note.id);
    setTimeout(() => setCopiedId(null), 1500);
  };

  const filteredNotes = notes.filter((n) => 
    n.title.toLowerCase().includes(searchQuery.toLowerCase()) || 
    n.description.toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <div className="space-y-6 animate-fade-in max-w-6xl mx-auto select-none pb-12">
      {/* Header Banner */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-border/80 pb-4">
        <div className="space-y-1">
          <h2 className="text-xl font-bold flex items-center gap-2 text-text-primary">
            <StickyNote className="w-6 h-6 text-emerald-400" /> {txt.title}
          </h2>
          <p className="text-xs text-text-muted font-medium">{txt.subtitle}</p>
        </div>
        <span className="text-[10px] text-text-muted font-black uppercase tracking-widest bg-emerald-500/10 px-3 py-1 border border-emerald-500/20 rounded-full w-fit">
          {notes.length} {language === "bn" ? "টি নোট সংরক্ষিত" : "Notes Saved"}
        </span>
      </div>

      {/* Main Grid: Editor vs Notes View */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
        
        {/* Note Editor Card (col-span-5) */}
        <Card className="lg:col-span-5 bg-surface/60 backdrop-blur border-border/80 shadow-2xl rounded-3xl p-5">
          <CardHeader className="p-0 pb-3 border-b border-border/60 mb-5">
            <CardTitle className="text-sm font-black flex items-center gap-2 text-text-primary">
              <FileText className="w-4 h-4 text-emerald-400" />
              {isEditing ? txt.editNote : txt.addNote}
            </CardTitle>
          </CardHeader>
          <CardContent className="p-0">
            <form onSubmit={handleSaveNote} className="space-y-4">
              {/* Note Title Input */}
              <div className="space-y-1.5">
                <label className="text-xs font-bold text-text-muted uppercase tracking-wider">{txt.noteTitleLabel}</label>
                <Input
                  type="text"
                  placeholder={txt.noteTitlePlaceholder}
                  value={noteTitle}
                  onChange={(e) => setNoteTitle(e.target.value)}
                  maxLength={70}
                  className="h-11 text-xs"
                  required
                />
              </div>

              {/* Note Category Select */}
              <div className="space-y-1.5">
                <label className="text-xs font-bold text-text-muted uppercase tracking-wider">{txt.categoryLabel}</label>
                <select
                  value={noteCategory}
                  onChange={(e: any) => setNoteCategory(e.target.value)}
                  className="flex h-11 w-full rounded-xl border border-border bg-bg px-3.5 py-2 text-xs text-text-primary outline-none focus:border-emerald-500 focus:ring-1 focus:ring-emerald-500 font-bold transition-all"
                >
                  <option value="general">{txt.categories.general}</option>
                  <option value="milk">{txt.categories.milk}</option>
                  <option value="feed">{txt.categories.feed}</option>
                  <option value="finance">{txt.categories.finance}</option>
                  <option value="todo">{txt.categories.todo}</option>
                </select>
              </div>

              {/* Note Description Input */}
              <div className="space-y-1.5">
                <label className="text-xs font-bold text-text-muted uppercase tracking-wider">{txt.noteDescLabel}</label>
                <textarea
                  placeholder={txt.noteDescPlaceholder}
                  value={noteDesc}
                  onChange={(e) => setNoteDesc(e.target.value)}
                  rows={6}
                  className="flex w-full rounded-xl border border-border bg-bg px-3.5 py-2 text-xs text-text-primary placeholder:text-text-muted outline-none focus:border-emerald-500 focus:ring-1 focus:ring-emerald-500 transition-all font-semibold resize-none"
                  required
                />
              </div>

              {/* Action Buttons */}
              <div className="flex gap-2 pt-2">
                {isEditing && (
                  <Button
                    type="button"
                    onClick={handleCancelEdit}
                    variant="outline"
                    className="flex-1 h-11 text-xs font-bold border-border hover:bg-surface-hover"
                  >
                    <X className="w-4 h-4 mr-1 text-red-400" /> {txt.cancelEdit}
                  </Button>
                )}
                <Button
                  type="submit"
                  variant="emerald"
                  className="flex-1 h-11 text-xs font-bold flex items-center justify-center gap-1.5"
                >
                  <Plus className="w-4 h-4" /> {txt.saveNote}
                </Button>
              </div>
            </form>
          </CardContent>
        </Card>

        {/* Notes Listings Dashboard Panel (col-span-7) */}
        <div className="lg:col-span-7 space-y-4">
          {/* Real-time search bar */}
          <div className="relative">
            <Search className="w-4 h-4 text-text-muted absolute left-3.5 top-1/2 -translate-y-1/2" />
            <Input
              type="text"
              placeholder={txt.searchPlaceholder}
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-10 h-11 text-xs bg-surface border-border/80 rounded-2xl"
            />
          </div>

          {/* Notes Container Grid */}
          <div className="space-y-3.5 max-h-[600px] overflow-y-auto pr-1">
            {filteredNotes.map((note) => (
              <Card 
                key={note.id} 
                className="bg-surface/45 hover:bg-surface/75 border-border hover:border-border/80 transition-all duration-300 rounded-2xl p-4 shadow-sm"
              >
                <div className="flex items-start justify-between gap-3 mb-2">
                  <div className="space-y-1">
                    <h3 className="text-sm font-black text-text-primary tracking-tight break-all">{note.title}</h3>
                    
                    {/* Meta tag / category indicators */}
                    <div className="flex flex-wrap items-center gap-2 pt-0.5">
                      <span className={`text-[8.5px] font-black uppercase tracking-wider px-2 py-0.5 rounded-md border ${categoryStyles[note.category]}`}>
                        {txt.categories[note.category]}
                      </span>
                      <span className="text-[8.5px] text-text-muted font-bold flex items-center gap-1">
                        <Calendar className="w-3 h-3 text-text-muted" /> {note.createdAt}
                      </span>
                    </div>
                  </div>

                  {/* Actions buttons */}
                  <div className="flex items-center gap-1.5 shrink-0">
                    <button
                      onClick={() => handleCopyToClipboard(note)}
                      className="p-1.5 rounded-lg border border-border/80 bg-surface-hover hover:bg-surface-hover/80 text-text-muted hover:text-text-primary transition-all"
                      title="Copy content"
                    >
                      {copiedId === note.id ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5" />}
                    </button>
                    <button
                      onClick={() => handleStartEdit(note)}
                      className="p-1.5 rounded-lg border border-border/80 bg-surface-hover hover:bg-surface-hover/80 text-text-muted hover:text-text-primary transition-all"
                      title="Edit note"
                    >
                      <Edit className="w-3.5 h-3.5 text-emerald-500" />
                    </button>
                    <button
                      onClick={() => handleDeleteNote(note.id)}
                      className="p-1.5 rounded-lg border border-border/80 bg-surface-hover hover:bg-surface-hover/80 text-text-muted hover:text-red-400 transition-all"
                      title="Delete note"
                    >
                      <Trash2 className="w-3.5 h-3.5 text-rose-500" />
                    </button>
                  </div>
                </div>

                {/* Note Description */}
                <p className="text-xs text-text-secondary font-medium leading-relaxed break-words whitespace-pre-wrap pt-1.5 border-t border-border">
                  {note.description}
                </p>
              </Card>
            ))}

            {filteredNotes.length === 0 && (
              <div className="text-center py-24 bg-surface/20 border border-dashed border-border/60 rounded-3xl">
                <StickyNote className="w-10 h-10 text-text-muted/60 mx-auto mb-2 animate-pulse" />
                <p className="text-text-muted text-xs font-semibold">{txt.noNotes}</p>
              </div>
            )}
          </div>

        </div>

      </div>
    </div>
  );
}
