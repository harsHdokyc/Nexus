import { useState } from "react";
import { Menu, Search, Bell, ChevronLeft } from "lucide-react";
import { Link, useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Message } from "@/lib/mock-data";
import { Platform, platforms } from "@/lib/platform-config";
import { PlatformLogo } from "@/components/PlatformLogo";
import { NotificationsPanel } from "@/components/dashboard/NotificationsPanel";
import { cn } from "@/lib/utils";

interface DashboardHeaderProps {
  onMenuClick: () => void;
  selectedMessage: Message | null;
  activePlatform?: Platform | "all";
  searchQuery: string;
  onSearchChange: (query: string) => void;
  sidebarOpen: boolean;
}

export function DashboardHeader({ 
  onMenuClick, 
  selectedMessage, 
  activePlatform = "all",
  searchQuery,
  onSearchChange,
  sidebarOpen
}: DashboardHeaderProps) {
  const [isNotificationsOpen, setIsNotificationsOpen] = useState(false);
  const navigate = useNavigate();
  const platformConfig = activePlatform !== "all" ? platforms[activePlatform] : null;
  
  return (
    <header 
      className={cn(
        "h-16 border-b flex items-center justify-between px-4 gap-4 transition-colors duration-300 relative shrink-0",
        activePlatform !== "all" ? "border-b-2" : "border-border"
      )}
      style={activePlatform !== "all" ? { 
        borderBottomColor: `hsl(var(--${activePlatform}))`,
        backgroundColor: `hsl(var(--${activePlatform}) / 0.03)`
      } : undefined}
    >
      <div className="flex items-center gap-4">
        <Button variant="ghost" size="icon" onClick={onMenuClick} className="h-9 w-9">
          {sidebarOpen ? <ChevronLeft className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
        </Button>

        {/* Platform indicator */}
        {platformConfig && (
          <div 
            className="flex items-center gap-2 px-3 py-1.5 rounded-full"
            style={{ backgroundColor: `hsl(var(--${activePlatform}) / 0.1)` }}
          >
            <PlatformLogo platform={activePlatform as Platform} size="sm" />
            <span 
              className="text-sm font-medium"
              style={{ color: `hsl(var(--${activePlatform}))` }}
            >
              {platformConfig.name}
            </span>
          </div>
        )}

        {/* Search */}
        <div className="relative w-96 hidden md:block">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
          <Input 
            placeholder="Search messages..." 
            value={searchQuery}
            onChange={(e) => onSearchChange(e.target.value)}
            className={cn(
              "pl-10 bg-muted/50 border-0 focus-visible:ring-1",
              activePlatform !== "all" && "focus-visible:ring-offset-0"
            )}
            style={activePlatform !== "all" ? { 
              "--tw-ring-color": `hsl(var(--${activePlatform}))` 
            } as React.CSSProperties : undefined}
          />
        </div>
      </div>

      <div className="flex items-center gap-2">
        <Button 
          variant="ghost" 
          size="icon" 
          className="h-9 w-9 relative"
          onClick={() => setIsNotificationsOpen(!isNotificationsOpen)}
        >
          <Bell className="w-5 h-5" />
          <span 
            className="absolute top-1 right-1 w-2 h-2 rounded-full"
            style={{ backgroundColor: activePlatform !== "all" ? `hsl(var(--${activePlatform}))` : `hsl(var(--destructive))` }}
          />
        </Button>
        <button 
          onClick={() => navigate("/settings")}
          className="w-9 h-9 rounded-full flex items-center justify-center text-sm font-medium cursor-pointer transition-opacity hover:opacity-80"
          style={{ 
            backgroundColor: activePlatform !== "all" ? `hsl(var(--${activePlatform}) / 0.15)` : `hsl(var(--primary) / 0.1)`,
            color: activePlatform !== "all" ? `hsl(var(--${activePlatform}))` : `hsl(var(--primary))`
          }}
        >
          JD
        </button>
      </div>

      {/* Notifications Panel */}
      <NotificationsPanel 
        isOpen={isNotificationsOpen}
        onClose={() => setIsNotificationsOpen(false)}
      />
    </header>
  );
}
