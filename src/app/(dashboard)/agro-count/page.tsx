"use client";

import { useState } from "react";
import { useApp } from "@/context/AppContext";
import { 
  Layers, 
  Trash2, 
  Edit, 
  Plus, 
  Search, 
  Calendar,
  X,
  FileSpreadsheet,
  PlusCircle
} from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";

import { Asset } from "@/lib/types";

const texts = {
  bn: {
    title: "এগ্রো কাউন্ট (Agro Count)",
    subtitle: "খামারের মোট গবাদি পশু, হাঁস-মুরগি, মৎস্য ও অন্যান্য সম্পদের সঠিক তালিকা রাখুন",
    searchPlaceholder: "সম্পদ বা পশুর নাম দিয়ে খুঁজুন...",
    addAsset: "নতুন খামার সম্পদ যোগ করুন",
    editAsset: "সম্পদের তথ্য পরিবর্তন করুন",
    assetNameLabel: "সম্পদ বা পশুর নাম",
    assetNamePlaceholder: "যেমন: গরু, ছাগল, হাঁস, পুকুর, ট্রাক্টর ইত্যাদি...",
    assetQtyLabel: "পরিমাণ (সংখ্যা)",
    assetQtyPlaceholder: "পরিমাণ লিখুন...",
    saveAsset: "সেভ করুন",
    cancelEdit: "বাতিল করুন",
    noAssets: "খামারের কোনো সম্পদ এখনও তালিকাভুক্ত করা হয়নি!",
    updated: "সর্বশেষ আপডেট:",
    deleteConfirm: "⚠️ আপনি কি এই সম্পদটি তালিকা থেকে ডিলিট করতে চান?",
    totalAssets: "মোট ক্যাটাগরি:",
    totalQty: "মোট সম্পদের সংখ্যা:",
  },
  en: {
    title: "Agro Count",
    subtitle: "Keep an accurate inventory of your livestock, poultry, ponds, and other farm assets",
    searchPlaceholder: "Search assets by name...",
    addAsset: "Register New Asset",
    editAsset: "Modify Asset Details",
    assetNameLabel: "Asset/Livestock Name",
    assetNamePlaceholder: "e.g., Cow, Goat, Chicken, Pond, Tractor...",
    assetQtyLabel: "Quantity",
    assetQtyPlaceholder: "Enter quantity...",
    saveAsset: "Save Asset",
    cancelEdit: "Cancel",
    noAssets: "No farm assets registered yet!",
    updated: "Last Updated:",
    deleteConfirm: "⚠️ Do you want to delete this asset from the list?",
    totalAssets: "Total Categories:",
    totalQty: "Total Quantity:",
  }
};

export default function AgroCountPage() {
  const { language, assets, setAssets, saveAllData } = useApp();
  const lang = language === "bn" ? "bn" : "en";
  const txt = texts[lang];

  const [searchQuery, setSearchQuery] = useState("");

  // Editor states
  const [isEditing, setIsEditing] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [assetName, setAssetName] = useState("");
  const [assetQty, setAssetQty] = useState("");

  const saveAssetsToDB = async (newAssets: Asset[]) => {
    setAssets(newAssets);
    await saveAllData(undefined, undefined, undefined, undefined, undefined, undefined, undefined, undefined, undefined, newAssets);
  };

  const handleSaveAsset = (e: React.FormEvent) => {
    e.preventDefault();
    if (!assetName.trim() || !assetQty.trim()) return;

    const qtyVal = parseInt(assetQty, 10);
    if (isNaN(qtyVal) || qtyVal < 0) return;

    const formattedDate = new Date().toLocaleDateString(language === "bn" ? "bn-BD" : "en-US", {
      year: "numeric",
      month: "short",
      day: "numeric"
    });

    if (isEditing && editingId) {
      // Update
      const updated = assets.map((a) =>
        a.id === editingId
          ? {
              ...a,
              name: assetName.trim(),
              quantity: qtyVal,
              updatedAt: formattedDate
            }
          : a
      );
      saveAssetsToDB(updated);
      setIsEditing(false);
      setEditingId(null);
    } else {
      // Create
      const newAsset: Asset = {
        id: Date.now().toString(),
        name: assetName.trim(),
        quantity: qtyVal,
        updatedAt: formattedDate
      };
      saveAssetsToDB([newAsset, ...assets]);
    }

    // Reset
    setAssetName("");
    setAssetQty("");
  };

  const handleStartEdit = (asset: Asset) => {
    setIsEditing(true);
    setEditingId(asset.id);
    setAssetName(asset.name);
    setAssetQty(asset.quantity.toString());
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  const handleCancelEdit = () => {
    setIsEditing(false);
    setEditingId(null);
    setAssetName("");
    setAssetQty("");
  };

  const handleDeleteAsset = (id: string) => {
    if (confirm(txt.deleteConfirm)) {
      const filtered = assets.filter((a) => a.id !== id);
      saveAssetsToDB(filtered);
      if (editingId === id) {
        handleCancelEdit();
      }
    }
  };

  // Instant increment / decrement count handler
  const handleAdjustQuantity = (id: string, delta: number) => {
    const formattedDate = new Date().toLocaleDateString(language === "bn" ? "bn-BD" : "en-US", {
      year: "numeric",
      month: "short",
      day: "numeric"
    });

    const updated = assets.map((a) => {
      if (a.id === id) {
        const newQty = Math.max(0, a.quantity + delta);
        return {
          ...a,
          quantity: newQty,
          updatedAt: formattedDate
        };
      }
      return a;
    });
    saveAssetsToDB(updated);
  };

  const filteredAssets = assets.filter((a) =>
    a.name.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const totalQuantitySum = assets.reduce((sum, a) => sum + a.quantity, 0);

  return (
    <div className="space-y-6 animate-fade-in max-w-6xl mx-auto select-none pb-12">
      
      {/* Page Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-border/80 pb-4">
        <div className="space-y-1">
          <h2 className="text-xl font-bold flex items-center gap-2 text-text-primary">
            <Layers className="w-6 h-6 text-emerald-400" /> {txt.title}
          </h2>
          <p className="text-xs text-text-muted font-medium">{txt.subtitle}</p>
        </div>
      </div>

      {/* Analytics Summary Row */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        {/* Categories Card */}
        <Card className="bg-surface/40 backdrop-blur border-border shadow p-4 flex items-center justify-between">
          <div className="space-y-1">
            <span className="text-[10px] text-text-muted font-bold uppercase tracking-wider">{txt.totalAssets}</span>
            <h3 className="text-2xl font-black font-mono text-text-primary">{assets.length}</h3>
          </div>
          <div className="p-3 bg-emerald-500/10 rounded-xl border border-emerald-500/20 text-emerald-400">
            <Layers className="w-5 h-5" />
          </div>
        </Card>

        {/* Total Quantity Card */}
        <Card className="bg-surface/40 backdrop-blur border-border shadow p-4 flex items-center justify-between">
          <div className="space-y-1">
            <span className="text-[10px] text-text-muted font-bold uppercase tracking-wider">{txt.totalQty}</span>
            <h3 className="text-2xl font-black font-mono text-emerald-450">{totalQuantitySum.toLocaleString()}</h3>
          </div>
          <div className="p-3 bg-emerald-500/10 rounded-xl border border-emerald-500/20 text-emerald-400">
            <PlusCircle className="w-5 h-5" />
          </div>
        </Card>
      </div>

      {/* Form and List Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
        
        {/* Editor Form Card (col-span-5) */}
        <Card className="lg:col-span-5 bg-surface/60 backdrop-blur border-border/80 shadow-2xl rounded-3xl p-5">
          <CardHeader className="p-0 pb-3 border-b border-border/60 mb-5">
            <CardTitle className="text-sm font-black flex items-center gap-2 text-text-primary">
              <FileSpreadsheet className="w-4 h-4 text-emerald-400" />
              {isEditing ? txt.editAsset : txt.addAsset}
            </CardTitle>
          </CardHeader>
          <CardContent className="p-0">
            <form onSubmit={handleSaveAsset} className="space-y-4">
              
              {/* Asset Name Input */}
              <div className="space-y-1.5">
                <label className="text-xs font-bold text-text-muted uppercase tracking-wider">{txt.assetNameLabel}</label>
                <Input
                  type="text"
                  placeholder={txt.assetNamePlaceholder}
                  value={assetName}
                  onChange={(e) => setAssetName(e.target.value)}
                  maxLength={50}
                  className="h-11 text-xs"
                  required
                />
              </div>

              {/* Asset Quantity Input */}
              <div className="space-y-1.5">
                <label className="text-xs font-bold text-text-muted uppercase tracking-wider">{txt.assetQtyLabel}</label>
                <Input
                  type="number"
                  min="0"
                  placeholder={txt.assetQtyPlaceholder}
                  value={assetQty}
                  onChange={(e) => setAssetQty(e.target.value)}
                  className="h-11 text-xs"
                  required
                />
              </div>

              {/* Actions Row */}
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
                  <Plus className="w-4 h-4" /> {txt.saveAsset}
                </Button>
              </div>

            </form>
          </CardContent>
        </Card>

        {/* Assets List View Panel (col-span-7) */}
        <div className="lg:col-span-7 space-y-4">
          
          {/* Live Search bar */}
          <div className="relative">
            <Search className="w-4 h-4 text-text-muted absolute left-3.5 top-1/2 -translate-y-1/2" />
            <Input
              type="text"
              placeholder={txt.searchPlaceholder}
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-10 h-11 text-xs bg-surface/40 border-border/80 rounded-2xl"
            />
          </div>

          {/* scrollable assets lists */}
          <div className="space-y-3.5 max-h-[500px] overflow-y-auto pr-1">
            {filteredAssets.map((asset) => (
              <Card 
                key={asset.id}
                className="bg-surface/45 hover:bg-surface/75 border-border hover:border-border/80 transition-all duration-300 rounded-2xl p-4 shadow-sm"
              >
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                  
                  {/* Info block */}
                  <div className="space-y-1.5 flex-1">
                    <h3 className="text-sm font-black text-text-primary tracking-tight break-all">{asset.name}</h3>
                    <span className="text-[8.5px] text-text-muted font-bold flex items-center gap-1 uppercase tracking-wider">
                      <Calendar className="w-3 h-3 text-text-muted" /> {txt.updated} {asset.updatedAt}
                    </span>
                  </div>

                  {/* Quantity adjustment & Actions row */}
                  <div className="flex items-center justify-between sm:justify-end gap-6 border-t border-border sm:border-0 pt-3 sm:pt-0">
                    
                    {/* Taps adjustment controls */}
                    <div className="flex items-center gap-2.5">
                      <button
                        onClick={() => handleAdjustQuantity(asset.id, -1)}
                        className="w-7 h-7 rounded-full border border-border bg-bg text-rose-500 hover:bg-surface-hover hover:scale-105 active:scale-95 transition-all flex items-center justify-center font-bold text-xs"
                        title="Reduce"
                      >
                        -
                      </button>
                      <span className="text-lg font-mono font-black text-text-primary min-w-[32px] text-center">
                        {asset.quantity}
                      </span>
                      <button
                        onClick={() => handleAdjustQuantity(asset.id, 1)}
                        className="w-7 h-7 rounded-full border border-border bg-bg text-emerald-400 hover:bg-surface-hover hover:scale-105 active:scale-95 transition-all flex items-center justify-center font-bold text-xs"
                        title="Increase"
                      >
                        +
                      </button>
                    </div>

                    {/* Edit/Delete controls */}
                    <div className="flex items-center gap-1.5">
                      <button
                        onClick={() => handleStartEdit(asset)}
                        className="p-1.5 rounded-lg border border-border/80 bg-surface-hover hover:bg-surface-hover/80 text-text-muted hover:text-emerald-400 transition-all"
                        title="Edit asset details"
                      >
                        <Edit className="w-3.5 h-3.5" />
                      </button>
                      <button
                        onClick={() => handleDeleteAsset(asset.id)}
                        className="p-1.5 rounded-lg border border-border/80 bg-surface-hover hover:bg-surface-hover/80 text-text-muted hover:text-rose-400 transition-all"
                        title="Delete asset"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    </div>

                  </div>

                </div>
              </Card>
            ))}

            {filteredAssets.length === 0 && (
              <div className="text-center py-24 bg-surface/20 border border-dashed border-border/60 rounded-3xl">
                <Layers className="w-10 h-10 text-text-muted/60 mx-auto mb-2 animate-pulse" />
                <p className="text-text-muted text-xs font-semibold">{txt.noAssets}</p>
              </div>
            )}
          </div>

        </div>

      </div>
    </div>
  );
}
