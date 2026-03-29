import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Layers, Inbox, Star, Archive, Clock, Plus, GripVertical, Trash2 } from "lucide-react";
import { Link } from "react-router-dom";
import { DragDropContext, Droppable, Draggable, DropResult } from "@hello-pangea/dnd";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { platforms, Platform } from "@/lib/platform-config";
import { platformStats } from "@/lib/mock-data";
import { PlatformLogo } from "@/components/PlatformLogo";
import { cn } from "@/lib/utils";

export type FilterType = "all" | "starred" | "scheduled" | "archived";

interface DashboardSidebarProps {
  activePlatform: Platform | "all";
  onPlatformChange: (platform: Platform | "all") => void;
  isOpen: boolean;
  onToggle: () => void;
  onCompose: () => void;
  activeFilter: FilterType;
  onFilterChange: (filter: FilterType) => void;
}

interface LocalCategory {
  id: string;
  name: string;
  color: string;
}

const CATEGORY_COLORS = ["#6366f1", "#ec4899", "#f59e0b", "#10b981", "#3b82f6", "#8b5cf6"];

export function DashboardSidebar({ 
  activePlatform, onPlatformChange, isOpen, onToggle, onCompose, activeFilter, onFilterChange
}: DashboardSidebarProps) {
  const totalUnread = Object.values(platformStats).reduce((acc, p) => acc + p.unread, 0);
  const [categories, setCategories] = useState<LocalCategory[]>([
    { id: "1", name: "Work", color: "#6366f1" },
    { id: "2", name: "Personal", color: "#ec4899" },
    { id: "3", name: "Urgent", color: "#f59e0b" },
  ]);
  const [isAddingCategory, setIsAddingCategory] = useState(false);
  const [newCategoryName, setNewCategoryName] = useState("");

  const handleDragEnd = (result: DropResult) => {
    if (!result.destination) return;
    const items = Array.from(categories);
    const [reordered] = items.splice(result.source.index, 1);
    items.splice(result.destination.index, 0, reordered);
    setCategories(items);
  };

  const handleAddCategory = () => {
    if (!newCategoryName.trim()) return;
    const color = CATEGORY_COLORS[categories.length % CATEGORY_COLORS.length];
    setCategories(prev => [...prev, { id: crypto.randomUUID(), name: newCategoryName.trim(), color }]);
    setNewCategoryName("");
    setIsAddingCategory(false);
  };

  const handleDeleteCategory = (id: string) => {
    setCategories(prev => prev.filter(c => c.id !== id));
  };

  return (
    <AnimatePresence mode="wait">
      {isOpen && (
        <motion.aside
          initial={{ width: 0, opacity: 0 }}
          animate={{ width: 280, opacity: 1 }}
          exit={{ width: 0, opacity: 0 }}
          transition={{ duration: 0.2 }}
          className="border-r border-border bg-sidebar flex flex-col overflow-hidden sticky top-0 h-screen shrink-0"
        >
          <div className="h-16 flex items-center justify-between px-4 border-b border-sidebar-border shrink-0">
            <Link to="/" className="flex items-center gap-2">
              <div className="w-8 h-8 rounded-lg bg-foreground flex items-center justify-center">
                <Layers className="w-5 h-5 text-background" />
              </div>
              <span className="text-lg font-semibold">Nexus</span>
            </Link>
          </div>

          <div className="flex-1 overflow-y-auto p-3">
            <Button
              className="w-full mb-4 justify-start gap-2"
              style={activePlatform !== "all" ? { backgroundColor: `hsl(var(--${activePlatform}))` } : undefined}
              onClick={onCompose}
            >
              <Plus className="w-4 h-4" /> Compose
            </Button>

            <div className="mb-6">
              <button onClick={() => { onPlatformChange("all"); onFilterChange("all"); }} className={cn("w-full flex items-center gap-3 px-3 py-2.5 rounded-lg transition-colors", activePlatform === "all" && activeFilter === "all" ? "bg-sidebar-accent text-sidebar-accent-foreground font-medium" : "hover:bg-sidebar-accent/50 text-sidebar-foreground")}>
                <Inbox className="w-5 h-5" />
                <span>All Messages</span>
                {totalUnread > 0 && <span className="ml-auto text-xs bg-foreground text-background rounded-full px-2 py-0.5 min-w-[20px] text-center">{totalUnread}</span>}
              </button>
            </div>

            <div className="mb-6">
              <h3 className="text-xs font-medium text-muted-foreground uppercase tracking-wider px-3 mb-2">Platforms</h3>
              <div className="space-y-1">
                {Object.values(platforms).map((platform) => {
                  const stats = platformStats[platform.id];
                  const isActive = activePlatform === platform.id && activeFilter === "all";
                  return (
                    <button key={platform.id} onClick={() => { onPlatformChange(platform.id); onFilterChange("all"); }} className={cn("w-full flex items-center gap-3 px-3 py-2.5 rounded-lg transition-all duration-200", isActive ? "font-medium" : "hover:bg-sidebar-accent/50 text-sidebar-foreground")} style={isActive ? { backgroundColor: `hsl(var(--${platform.id}) / 0.15)`, color: `hsl(var(--${platform.id}))` } : undefined}>
                      <div className={cn("w-8 h-8 rounded-lg flex items-center justify-center transition-all duration-200", isActive ? "bg-white shadow-sm" : platform.bgClass)}>
                        <PlatformLogo platform={platform.id} size="md" />
                      </div>
                      <span>{platform.name}</span>
                      {stats.unread > 0 && <span className={cn("ml-auto text-xs rounded-full px-2 py-0.5 min-w-[20px] text-center", isActive ? "text-white" : "text-muted-foreground")} style={isActive ? { backgroundColor: `hsl(var(--${platform.id}))` } : undefined}>{stats.unread}</span>}
                    </button>
                  );
                })}
              </div>
            </div>

            <div className="mb-6">
              <div className="flex items-center justify-between px-3 mb-2">
                <h3 className="text-xs font-medium text-muted-foreground uppercase tracking-wider">Categories</h3>
                <button onClick={() => setIsAddingCategory(true)} className="text-muted-foreground hover:text-foreground transition-colors"><Plus className="w-4 h-4" /></button>
              </div>
              {isAddingCategory && (
                <div className="px-3 mb-2 flex gap-2">
                  <Input value={newCategoryName} onChange={(e) => setNewCategoryName(e.target.value)} placeholder="Category name" className="h-8 text-sm" autoFocus onKeyDown={(e) => { if (e.key === "Enter") handleAddCategory(); if (e.key === "Escape") setIsAddingCategory(false); }} />
                  <Button size="sm" className="h-8 px-2" onClick={handleAddCategory}>Add</Button>
                </div>
              )}
              <DragDropContext onDragEnd={handleDragEnd}>
                <Droppable droppableId="categories">
                  {(provided) => (
                    <div ref={provided.innerRef} {...provided.droppableProps} className="space-y-1">
                      {categories.map((category, index) => (
                        <Draggable key={category.id} draggableId={category.id} index={index}>
                          {(provided, snapshot) => (
                            <div ref={provided.innerRef} {...provided.draggableProps} className={cn("group flex items-center gap-2 px-3 py-2 rounded-lg transition-colors", snapshot.isDragging ? "bg-sidebar-accent shadow-lg" : "hover:bg-sidebar-accent/50")}>
                              <div {...provided.dragHandleProps} className="cursor-grab active:cursor-grabbing"><GripVertical className="w-4 h-4 text-muted-foreground" /></div>
                              <div className="w-3 h-3 rounded-full shrink-0" style={{ backgroundColor: category.color }} />
                              <span className="text-sm text-sidebar-foreground truncate flex-1">{category.name}</span>
                              <button onClick={() => handleDeleteCategory(category.id)} className="opacity-0 group-hover:opacity-100 transition-opacity text-muted-foreground hover:text-destructive"><Trash2 className="w-3.5 h-3.5" /></button>
                            </div>
                          )}
                        </Draggable>
                      ))}
                      {provided.placeholder}
                    </div>
                  )}
                </Droppable>
              </DragDropContext>
            </div>

            <div>
              <h3 className="text-xs font-medium text-muted-foreground uppercase tracking-wider px-3 mb-2">Filters</h3>
              <div className="space-y-1">
                {([["starred", Star, "Starred"], ["scheduled", Clock, "Scheduled"], ["archived", Archive, "Archived"]] as const).map(([filter, Icon, label]) => (
                  <button key={filter} onClick={() => onFilterChange(filter)} className={cn("w-full flex items-center gap-3 px-3 py-2.5 rounded-lg transition-colors", activeFilter === filter ? "bg-sidebar-accent text-sidebar-accent-foreground font-medium" : "hover:bg-sidebar-accent/50 text-sidebar-foreground")}>
                    <Icon className="w-5 h-5" /><span>{label}</span>
                  </button>
                ))}
              </div>
            </div>
          </div>
        </motion.aside>
      )}
    </AnimatePresence>
  );
}
