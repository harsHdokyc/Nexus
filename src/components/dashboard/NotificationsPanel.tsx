import { motion, AnimatePresence } from "framer-motion";
import { X, Bell, CheckCheck } from "lucide-react";
import { Button } from "@/components/ui/button";
import { ScrollArea } from "@/components/ui/scroll-area";
import { PlatformLogo } from "@/components/PlatformLogo";
import { Platform } from "@/lib/platform-config";
import { formatDistanceToNow } from "date-fns";

interface Notification {
  id: string;
  platform: Platform;
  title: string;
  message: string;
  timestamp: Date;
  isRead: boolean;
}

const mockNotifications: Notification[] = [
  {
    id: "1",
    platform: "gmail",
    title: "New email from Sarah Chen",
    message: "Q1 Product Roadmap Review",
    timestamp: new Date(Date.now() - 1000 * 60 * 5),
    isRead: false,
  },
  {
    id: "2",
    platform: "slack",
    title: "Alex Rivera mentioned you",
    message: "Hey! Quick question about the API...",
    timestamp: new Date(Date.now() - 1000 * 60 * 15),
    isRead: false,
  },
  {
    id: "3",
    platform: "teams",
    title: "Meeting reminder",
    message: "Security audit follow-up in 30 min",
    timestamp: new Date(Date.now() - 1000 * 60 * 30),
    isRead: false,
  },
  {
    id: "4",
    platform: "twitter",
    title: "New DM from @designlead",
    message: "Love what you're building!",
    timestamp: new Date(Date.now() - 1000 * 60 * 60),
    isRead: true,
  },
  {
    id: "5",
    platform: "meet",
    title: "Meeting started",
    message: "Design Review - Sprint 23",
    timestamp: new Date(Date.now() - 1000 * 60 * 120),
    isRead: true,
  },
];

interface NotificationsPanelProps {
  isOpen: boolean;
  onClose: () => void;
}

export function NotificationsPanel({ isOpen, onClose }: NotificationsPanelProps) {
  const unreadCount = mockNotifications.filter(n => !n.isRead).length;

  return (
    <AnimatePresence>
      {isOpen && (
        <>
          {/* Backdrop */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={onClose}
            className="fixed inset-0 z-40"
          />
          
          {/* Panel */}
          <motion.div
            initial={{ opacity: 0, y: -10, x: 50 }}
            animate={{ opacity: 1, y: 0, x: 0 }}
            exit={{ opacity: 0, y: -10, x: 50 }}
            transition={{ duration: 0.2 }}
            className="absolute right-0 top-14 w-96 bg-background border border-border rounded-xl shadow-xl z-50 overflow-hidden"
          >
            {/* Header */}
            <div className="flex items-center justify-between px-4 py-3 border-b border-border">
              <div className="flex items-center gap-2">
                <Bell className="w-5 h-5" />
                <h3 className="font-semibold">Notifications</h3>
                {unreadCount > 0 && (
                  <span className="px-2 py-0.5 text-xs font-medium bg-destructive text-destructive-foreground rounded-full">
                    {unreadCount}
                  </span>
                )}
              </div>
              <div className="flex items-center gap-1">
                <Button variant="ghost" size="sm" className="text-xs">
                  <CheckCheck className="w-4 h-4 mr-1" />
                  Mark all read
                </Button>
                <Button variant="ghost" size="icon" className="h-8 w-8" onClick={onClose}>
                  <X className="w-4 h-4" />
                </Button>
              </div>
            </div>

            {/* Notifications List */}
            <ScrollArea className="h-[400px]">
              <div className="divide-y divide-border">
                {mockNotifications.map((notification) => (
                  <motion.div
                    key={notification.id}
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    className={`p-4 hover:bg-muted/50 cursor-pointer transition-colors ${
                      !notification.isRead ? "bg-muted/30" : ""
                    }`}
                  >
                    <div className="flex gap-3">
                      <div 
                        className="w-10 h-10 rounded-lg flex items-center justify-center flex-shrink-0"
                        style={{ backgroundColor: `hsl(var(--${notification.platform}) / 0.1)` }}
                      >
                        <PlatformLogo platform={notification.platform} size="sm" />
                      </div>
                      <div className="flex-1 min-w-0">
                        <div className="flex items-start justify-between gap-2">
                          <p className={`text-sm ${!notification.isRead ? "font-medium" : ""}`}>
                            {notification.title}
                          </p>
                          {!notification.isRead && (
                            <span 
                              className="w-2 h-2 rounded-full flex-shrink-0 mt-1.5"
                              style={{ backgroundColor: `hsl(var(--${notification.platform}))` }}
                            />
                          )}
                        </div>
                        <p className="text-sm text-muted-foreground truncate">
                          {notification.message}
                        </p>
                        <p className="text-xs text-muted-foreground mt-1">
                          {formatDistanceToNow(notification.timestamp, { addSuffix: true })}
                        </p>
                      </div>
                    </div>
                  </motion.div>
                ))}
              </div>
            </ScrollArea>

            {/* Footer */}
            <div className="px-4 py-3 border-t border-border">
              <Button variant="ghost" className="w-full text-sm">
                View all notifications
              </Button>
            </div>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
}
