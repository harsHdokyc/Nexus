import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { format } from "date-fns";
import { X, Reply, Forward, Star, Archive, Trash2, MoreHorizontal, Paperclip, Send, ChevronDown, ChevronUp } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Message } from "@/lib/mock-data";
import { platforms, Platform } from "@/lib/platform-config";
import { PlatformLogo } from "@/components/PlatformLogo";
import { cn } from "@/lib/utils";
import { Textarea } from "@/components/ui/textarea";
import { Input } from "@/components/ui/input";
import { toast } from "sonner";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";

interface MessageDetailProps {
  message: Message;
  onClose: () => void;
  onArchive?: (messageId: string) => void;
  onDelete?: (messageId: string) => void;
  onStar?: (messageId: string) => void;
}

type ReplyMode = "none" | "reply" | "forward";

interface ThreadMessage {
  id: string;
  sender: string;
  body: string;
  timestamp: Date;
  isCurrentUser: boolean;
}

// Mock thread data
const getMockThread = (message: Message): ThreadMessage[] => [
  {
    id: "thread-1",
    sender: message.sender.name,
    body: message.body,
    timestamp: message.timestamp,
    isCurrentUser: false,
  },
];

export function MessageDetail({ 
  message, 
  onClose, 
  onArchive, 
  onDelete, 
  onStar 
}: MessageDetailProps) {
  const platform = platforms[message.platform];
  const [replyMode, setReplyMode] = useState<ReplyMode>("none");
  const [replyText, setReplyText] = useState("");
  const [forwardTo, setForwardTo] = useState("");
  const [isStarred, setIsStarred] = useState(message.isStarred);
  const [thread, setThread] = useState<ThreadMessage[]>(getMockThread(message));
  const [showThread, setShowThread] = useState(true);

  const handleArchive = () => {
    onArchive?.(message.id);
    toast.success("Message archived", {
      description: "The message has been moved to archive.",
      action: {
        label: "Undo",
        onClick: () => toast.info("Archive undone"),
      },
    });
    onClose();
  };

  const handleDelete = () => {
    onDelete?.(message.id);
    toast.success("Message deleted", {
      description: "The message has been moved to trash.",
      action: {
        label: "Undo",
        onClick: () => toast.info("Delete undone"),
      },
    });
    onClose();
  };

  const handleStar = () => {
    setIsStarred(!isStarred);
    onStar?.(message.id);
    toast.success(isStarred ? "Star removed" : "Message starred");
  };

  const handleSendReply = () => {
    if (!replyText.trim()) return;

    const newMessage: ThreadMessage = {
      id: `thread-${Date.now()}`,
      sender: "You",
      body: replyText,
      timestamp: new Date(),
      isCurrentUser: true,
    };

    setThread([...thread, newMessage]);
    setReplyText("");
    setReplyMode("none");
    toast.success("Reply sent", {
      description: `Your reply to ${message.sender.name} was sent via ${platform.name}.`,
    });
  };

  const handleForward = () => {
    if (!forwardTo.trim() || !replyText.trim()) return;

    toast.success("Message forwarded", {
      description: `Message forwarded to ${forwardTo} via ${platform.name}.`,
    });
    setForwardTo("");
    setReplyText("");
    setReplyMode("none");
  };

  const handleMarkUnread = () => {
    toast.success("Marked as unread");
    onClose();
  };

  const handleMuteThread = () => {
    toast.success("Thread muted", {
      description: "You won't receive notifications for this thread.",
    });
  };

  return (
    <div className="w-[500px] flex flex-col bg-background border-l border-border hidden md:flex h-full">
      {/* Header */}
      <div className="h-14 flex items-center justify-between px-4 border-b border-border shrink-0">
        <div className="flex items-center gap-3">
          <div className={cn("px-2 py-1 rounded-md text-xs font-medium", platform.bgClass, platform.colorClass)}>
            {platform.name}
          </div>
          {message.category === "urgent" && (
            <span className="px-2 py-1 rounded-md text-xs font-medium bg-destructive/10 text-destructive">
              Urgent
            </span>
          )}
        </div>
        <div className="flex items-center gap-1">
          <Button 
            variant="ghost" 
            size="icon" 
            className="h-8 w-8"
            onClick={handleArchive}
            title="Archive"
          >
            <Archive className="w-4 h-4" />
          </Button>
          <Button 
            variant="ghost" 
            size="icon" 
            className="h-8 w-8 text-destructive hover:text-destructive"
            onClick={handleDelete}
            title="Delete"
          >
            <Trash2 className="w-4 h-4" />
          </Button>
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="ghost" size="icon" className="h-8 w-8">
                <MoreHorizontal className="w-4 h-4" />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end" className="w-48">
              <DropdownMenuItem onClick={handleStar}>
                <Star className={cn("w-4 h-4 mr-2", isStarred && "fill-warning text-warning")} />
                {isStarred ? "Remove star" : "Star message"}
              </DropdownMenuItem>
              <DropdownMenuItem onClick={handleMarkUnread}>
                Mark as unread
              </DropdownMenuItem>
              <DropdownMenuItem onClick={handleMuteThread}>
                Mute thread
              </DropdownMenuItem>
              <DropdownMenuSeparator />
              <DropdownMenuItem onClick={() => setReplyMode("forward")}>
                <Forward className="w-4 h-4 mr-2" />
                Forward
              </DropdownMenuItem>
              <DropdownMenuSeparator />
              <DropdownMenuItem className="text-destructive" onClick={handleDelete}>
                <Trash2 className="w-4 h-4 mr-2" />
                Delete
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
          <Button variant="ghost" size="icon" className="h-8 w-8" onClick={onClose}>
            <X className="w-4 h-4" />
          </Button>
        </div>
      </div>

      {/* Content - scrollable */}
      <div className="flex-1 overflow-y-auto p-6">
        {/* Subject */}
        {message.subject && (
          <h2 className="text-xl font-semibold mb-4">{message.subject}</h2>
        )}

        {/* Thread toggle */}
        {thread.length > 1 && (
          <button
            onClick={() => setShowThread(!showThread)}
            className="flex items-center gap-2 text-sm text-muted-foreground mb-4 hover:text-foreground transition-colors"
          >
            {showThread ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
            {thread.length} messages in thread
          </button>
        )}

        {/* Thread messages */}
        <div className="space-y-6">
          <AnimatePresence>
            {thread.map((msg, index) => (
              <motion.div
                key={msg.id}
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -10 }}
                transition={{ delay: index * 0.05 }}
                className={cn(
                  "rounded-lg p-4",
                  msg.isCurrentUser 
                    ? "bg-primary/10 ml-8" 
                    : "bg-muted/50"
                )}
              >
                {/* Sender info */}
                <div className="flex items-start gap-3 mb-3">
                  {msg.isCurrentUser ? (
                    <div className="w-10 h-10 rounded-full bg-primary/20 flex items-center justify-center text-sm font-medium text-primary">
                      You
                    </div>
                  ) : message.sender.avatar ? (
                    <img 
                      src={message.sender.avatar} 
                      alt={msg.sender}
                      className="w-10 h-10 rounded-full object-cover"
                    />
                  ) : (
                    <div className={cn(
                      "w-10 h-10 rounded-full flex items-center justify-center",
                      platform.bgClass
                    )}>
                      <PlatformLogo platform={message.platform} size="md" />
                    </div>
                  )}
                  
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2">
                      <span className="font-semibold">{msg.sender}</span>
                      {!msg.isCurrentUser && isStarred && index === 0 && (
                        <Star className="w-4 h-4 text-warning fill-warning" />
                      )}
                    </div>
                    {!msg.isCurrentUser && message.sender.email && index === 0 && (
                      <p className="text-sm text-muted-foreground">{message.sender.email}</p>
                    )}
                    <p className="text-xs text-muted-foreground mt-0.5">
                      {format(msg.timestamp, "MMMM d, yyyy 'at' h:mm a")}
                    </p>
                  </div>
                </div>

                {/* Body */}
                <p className="text-foreground leading-relaxed whitespace-pre-wrap text-sm">
                  {msg.body}
                </p>
              </motion.div>
            ))}
          </AnimatePresence>
        </div>

        {/* Attachments */}
        {message.hasAttachments && (
          <div className="mt-6 p-4 rounded-lg bg-muted/50 border border-border">
            <h4 className="text-sm font-medium mb-3 flex items-center gap-2">
              <Paperclip className="w-4 h-4" />
              Attachments
            </h4>
            <div className="flex flex-wrap gap-2">
              <button className="px-3 py-2 rounded-md bg-background border border-border text-sm hover:bg-muted transition-colors">
                Q1_Roadmap.pdf
              </button>
              <button className="px-3 py-2 rounded-md bg-background border border-border text-sm hover:bg-muted transition-colors">
                Timeline.xlsx
              </button>
            </div>
          </div>
        )}
      </div>

      {/* Reply/Forward section */}
      <div className="p-4 border-t border-border bg-muted/30 shrink-0">
        {/* Action buttons */}
        {replyMode === "none" && (
          <div className="flex items-center gap-2 mb-3">
            <Button 
              size="sm" 
              className="gap-2"
              onClick={() => setReplyMode("reply")}
              style={{ backgroundColor: `hsl(var(--${message.platform}))` }}
            >
              <Reply className="w-4 h-4" />
              Reply
            </Button>
            <Button 
              variant="outline" 
              size="sm" 
              className="gap-2"
              onClick={() => setReplyMode("forward")}
            >
              <Forward className="w-4 h-4" />
              Forward
            </Button>
          </div>
        )}

        {/* Reply input */}
        {replyMode === "reply" && (
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            className="space-y-3"
          >
            <div className="flex items-center justify-between">
              <span className="text-sm font-medium">Reply to {message.sender.name}</span>
              <Button variant="ghost" size="sm" onClick={() => setReplyMode("none")}>
                Cancel
              </Button>
            </div>
            <Textarea 
              placeholder={`Write your reply...`}
              value={replyText}
              onChange={(e) => setReplyText(e.target.value)}
              className="min-h-[80px] bg-background resize-none"
              autoFocus
            />
            <div className="flex justify-end">
              <Button 
                size="sm" 
                onClick={handleSendReply}
                disabled={!replyText.trim()}
                style={{ backgroundColor: `hsl(var(--${message.platform}))` }}
                className="gap-2"
              >
                <Send className="w-4 h-4" />
                Send Reply
              </Button>
            </div>
          </motion.div>
        )}

        {/* Forward input */}
        {replyMode === "forward" && (
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            className="space-y-3"
          >
            <div className="flex items-center justify-between">
              <span className="text-sm font-medium">Forward message</span>
              <Button variant="ghost" size="sm" onClick={() => setReplyMode("none")}>
                Cancel
              </Button>
            </div>
            <Input
              placeholder="Enter recipient..."
              value={forwardTo}
              onChange={(e) => setForwardTo(e.target.value)}
              className="bg-background"
              autoFocus
            />
            <Textarea 
              placeholder="Add a note (optional)..."
              value={replyText}
              onChange={(e) => setReplyText(e.target.value)}
              className="min-h-[60px] bg-background resize-none"
            />
            <div className="flex justify-end">
              <Button 
                size="sm" 
                onClick={handleForward}
                disabled={!forwardTo.trim()}
                style={{ backgroundColor: `hsl(var(--${message.platform}))` }}
                className="gap-2"
              >
                <Forward className="w-4 h-4" />
                Forward
              </Button>
            </div>
          </motion.div>
        )}

        {/* Quick reply when no mode selected */}
        {replyMode === "none" && (
          <div 
            onClick={() => setReplyMode("reply")}
            className="px-4 py-3 rounded-lg border border-border bg-background text-muted-foreground text-sm cursor-text hover:border-muted-foreground/50 transition-colors"
          >
            Reply to {message.sender.name}...
          </div>
        )}
      </div>
    </div>
  );
}
