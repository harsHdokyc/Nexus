import { motion } from "framer-motion";
import { format } from "date-fns";
import { Star, Paperclip } from "lucide-react";
import { Message } from "@/lib/mock-data";
import { platforms, Platform } from "@/lib/platform-config";
import { PlatformLogo } from "@/components/PlatformLogo";
import { cn } from "@/lib/utils";

interface MessageListProps {
  messages: Message[];
  selectedId?: string;
  onSelect: (message: Message) => void;
  activePlatform?: Platform | "all";
}

export function MessageList({ messages, selectedId, onSelect, activePlatform = "all" }: MessageListProps) {
  return (
    <div className="w-full md:w-[400px] lg:w-[450px] border-r border-border flex flex-col bg-background">
      {/* List header */}
      <div 
        className={cn(
          "h-12 flex items-center justify-between px-4 border-b transition-colors duration-300",
          activePlatform !== "all" ? "border-b" : "border-border"
        )}
        style={activePlatform !== "all" ? { 
          backgroundColor: `hsl(var(--${activePlatform}) / 0.03)`,
          borderBottomColor: `hsl(var(--${activePlatform}) / 0.2)`
        } : undefined}
      >
        <span className="text-sm font-medium">
          {activePlatform === "all" ? "All Messages" : platforms[activePlatform].name}
        </span>
        <span className="text-xs text-muted-foreground">{messages.length} messages</span>
      </div>

      {/* Messages */}
      <div className="flex-1 overflow-y-auto">
        {messages.length === 0 ? (
          <div className="flex flex-col items-center justify-center h-full text-center p-8">
            <p className="text-lg font-medium mb-1">No messages</p>
            <p className="text-muted-foreground">
              You're all caught up!
            </p>
          </div>
        ) : (
          messages.map((message, index) => {
            const platform = platforms[message.platform];
            const isSelected = selectedId === message.id;
            
            return (
              <motion.button
                key={message.id}
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: index * 0.02 }}
                onClick={() => onSelect(message)}
                className={cn(
                  "w-full p-4 text-left border-b border-border hover:bg-muted/50 transition-all duration-200",
                  isSelected && "bg-muted",
                  !message.isRead && "bg-muted/30"
                )}
                style={isSelected && activePlatform !== "all" ? {
                  backgroundColor: `hsl(var(--${activePlatform}) / 0.08)`,
                  borderLeftWidth: "3px",
                  borderLeftColor: `hsl(var(--${activePlatform}))`
                } : undefined}
              >
                <div className="flex items-start gap-3">
                  {/* Avatar / Platform icon */}
                  {message.sender.avatar ? (
                    <img 
                      src={message.sender.avatar} 
                      alt={message.sender.name}
                      className="w-10 h-10 rounded-full object-cover"
                    />
                  ) : (
                    <div 
                      className={cn(
                        "w-10 h-10 rounded-full flex items-center justify-center",
                        platform.bgClass
                      )}
                    >
                      <PlatformLogo platform={message.platform} size="sm" />
                    </div>
                  )}

                  <div className="flex-1 min-w-0">
                    {/* Header row */}
                    <div className="flex items-center gap-2 mb-1">
                      <span className={cn(
                        "font-medium truncate flex-1",
                        !message.isRead && "font-semibold"
                      )}>
                        {message.sender.name}
                      </span>
                      <span className="text-xs text-muted-foreground whitespace-nowrap">
                        {format(message.timestamp, "MMM d")}
                      </span>
                    </div>

                    {/* Subject */}
                    {message.subject && (
                      <p className={cn(
                        "text-sm truncate mb-1",
                        !message.isRead ? "font-medium" : "text-foreground"
                      )}>
                        {message.subject}
                      </p>
                    )}

                    {/* Snippet */}
                    <p className="text-sm text-muted-foreground truncate">
                      {message.snippet}
                    </p>

                    {/* Meta row */}
                    <div className="flex items-center gap-2 mt-2">
                      <div 
                        className={cn(
                          "text-xs px-1.5 py-0.5 rounded flex items-center gap-1",
                          platform.bgClass
                        )}
                      >
                        <PlatformLogo platform={message.platform} size="sm" className="w-3 h-3" />
                        <span style={{ color: `hsl(var(--${message.platform}))` }}>
                          {platform.name}
                        </span>
                      </div>
                      {message.isStarred && (
                        <Star 
                          className="w-3.5 h-3.5 fill-current"
                          style={{ color: `hsl(var(--warning))` }}
                        />
                      )}
                      {message.hasAttachments && (
                        <Paperclip className="w-3.5 h-3.5 text-muted-foreground" />
                      )}
                      {message.category === "urgent" && (
                        <span 
                          className="text-xs px-1.5 py-0.5 rounded"
                          style={{ 
                            backgroundColor: `hsl(var(--destructive) / 0.1)`,
                            color: `hsl(var(--destructive))`
                          }}
                        >
                          Urgent
                        </span>
                      )}
                    </div>
                  </div>
                </div>
              </motion.button>
            );
          })
        )}
      </div>
    </div>
  );
}
