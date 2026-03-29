import { useState, useMemo, useCallback } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { DashboardSidebar, FilterType } from "@/components/dashboard/DashboardSidebar";
import { DashboardHeader } from "@/components/dashboard/DashboardHeader";
import { MessageList } from "@/components/dashboard/MessageList";
import { MessageDetail } from "@/components/dashboard/MessageDetail";
import { ComposeModal } from "@/components/dashboard/ComposeModal";
import { mockMessages, Message } from "@/lib/mock-data";
import { Platform } from "@/lib/platform-config";
import { cn } from "@/lib/utils";

const Dashboard = () => {
  const [activePlatform, setActivePlatform] = useState<Platform | "all">("all");
  const [activeFilter, setActiveFilter] = useState<FilterType>("all");
  const [selectedMessage, setSelectedMessage] = useState<Message | null>(null);
  const [sidebarOpen, setSidebarOpen] = useState(true);
  const [searchQuery, setSearchQuery] = useState("");
  const [isComposeOpen, setIsComposeOpen] = useState(false);
  const [messages, setMessages] = useState<Message[]>(mockMessages);

  const handleArchive = useCallback((messageId: string) => {
    setMessages(prev => prev.map(m => m.id === messageId ? { ...m, isArchived: true } : m));
  }, []);

  const handleDelete = useCallback((messageId: string) => {
    setMessages(prev => prev.filter(m => m.id !== messageId));
  }, []);

  const handleStar = useCallback((messageId: string) => {
    setMessages(prev => prev.map(m => m.id === messageId ? { ...m, isStarred: !m.isStarred } : m));
  }, []);

  const filteredMessages = useMemo(() => {
    let filtered = activePlatform === "all" ? messages : messages.filter(m => m.platform === activePlatform);
    if (activeFilter === "starred") filtered = filtered.filter(m => m.isStarred);
    else if (activeFilter === "archived") filtered = filtered.filter(m => m.isArchived);
    else if (activeFilter === "scheduled") filtered = filtered.filter(m => m.isScheduled);
    else filtered = filtered.filter(m => !m.isArchived);

    if (searchQuery.trim()) {
      const query = searchQuery.toLowerCase();
      filtered = filtered.filter(m =>
        m.sender.name.toLowerCase().includes(query) ||
        m.body.toLowerCase().includes(query) ||
        m.subject?.toLowerCase().includes(query) ||
        m.sender.email?.toLowerCase().includes(query)
      );
    }
    return filtered;
  }, [activePlatform, activeFilter, searchQuery, messages]);

  const getPlatformThemeClass = () => activePlatform === "all" ? "" : `platform-${activePlatform}`;
  const getPlatformAccentStyles = () => activePlatform === "all" ? {} : { "--active-platform-color": `hsl(var(--${activePlatform}))` } as React.CSSProperties;

  return (
    <div className={cn("min-h-screen flex bg-background transition-colors duration-300", getPlatformThemeClass())} style={getPlatformAccentStyles()}>
      <DashboardSidebar
        activePlatform={activePlatform}
        onPlatformChange={(platform) => { setActivePlatform(platform); setSelectedMessage(null); }}
        isOpen={sidebarOpen}
        onToggle={() => setSidebarOpen(!sidebarOpen)}
        onCompose={() => setIsComposeOpen(true)}
        activeFilter={activeFilter}
        onFilterChange={setActiveFilter}
      />
      <div className="flex-1 flex flex-col min-w-0 h-screen overflow-hidden">
        <DashboardHeader
          onMenuClick={() => setSidebarOpen(!sidebarOpen)}
          selectedMessage={selectedMessage}
          activePlatform={activePlatform}
          searchQuery={searchQuery}
          onSearchChange={setSearchQuery}
          sidebarOpen={sidebarOpen}
        />
        <div className="flex-1 flex overflow-hidden">
          <AnimatePresence mode="wait">
            <motion.div key={activePlatform + activeFilter} initial={{ opacity: 0, x: -20 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: 20 }} transition={{ duration: 0.2 }} className="flex-1 flex overflow-hidden">
              <MessageList messages={filteredMessages} selectedId={selectedMessage?.id} onSelect={setSelectedMessage} activePlatform={activePlatform} />
              <AnimatePresence>
                {selectedMessage && (
                  <MessageDetail message={selectedMessage} onClose={() => setSelectedMessage(null)} onArchive={handleArchive} onDelete={handleDelete} onStar={handleStar} />
                )}
              </AnimatePresence>
            </motion.div>
          </AnimatePresence>
        </div>
      </div>
      <ComposeModal isOpen={isComposeOpen} onClose={() => setIsComposeOpen(false)} defaultPlatform={activePlatform === "all" ? "gmail" : activePlatform} />
    </div>
  );
};

export default Dashboard;
