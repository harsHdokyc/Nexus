import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { X, Send, Paperclip, Image, Smile } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Platform, platforms } from "@/lib/platform-config";
import { PlatformLogo } from "@/components/PlatformLogo";
import { cn } from "@/lib/utils";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

interface ComposeModalProps {
  isOpen: boolean;
  onClose: () => void;
  defaultPlatform?: Platform;
}

export function ComposeModal({ isOpen, onClose, defaultPlatform = "gmail" }: ComposeModalProps) {
  const [selectedPlatform, setSelectedPlatform] = useState<Platform>(defaultPlatform);
  const [recipient, setRecipient] = useState("");
  const [subject, setSubject] = useState("");
  const [body, setBody] = useState("");

  const platformConfig = platforms[selectedPlatform];
  const charLimit = platformConfig.features.maxLength;
  const hasSubject = platformConfig.features.hasSubject;
  const charCount = body.length;
  const isOverLimit = charLimit ? charCount > charLimit : false;

  const handleSend = () => {
    // In a real app, this would send the message
    console.log("Sending message:", { platform: selectedPlatform, recipient, subject, body });
    onClose();
    setRecipient("");
    setSubject("");
    setBody("");
  };

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
            className="fixed inset-0 bg-background/80 backdrop-blur-sm z-50"
          />
          
          {/* Modal */}
          <motion.div
            initial={{ opacity: 0, scale: 0.95, y: 20 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.95, y: 20 }}
            transition={{ duration: 0.2 }}
            className="fixed inset-x-4 top-[10%] mx-auto max-w-2xl bg-background border border-border rounded-xl shadow-xl z-50 overflow-hidden"
          >
            {/* Header */}
            <div 
              className="flex items-center justify-between px-6 py-4 border-b"
              style={{ 
                borderBottomColor: `hsl(var(--${selectedPlatform}))`,
                backgroundColor: `hsl(var(--${selectedPlatform}) / 0.05)`
              }}
            >
              <div className="flex items-center gap-3">
                <PlatformLogo platform={selectedPlatform} size="md" />
                <h2 className="text-lg font-semibold">New Message</h2>
              </div>
              <Button variant="ghost" size="icon" onClick={onClose}>
                <X className="w-5 h-5" />
              </Button>
            </div>

            {/* Form */}
            <div className="p-6 space-y-4">
              {/* Platform Select */}
              <div className="space-y-2">
                <Label>Send via</Label>
                <Select value={selectedPlatform} onValueChange={(v) => setSelectedPlatform(v as Platform)}>
                  <SelectTrigger className="w-full">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {Object.values(platforms).map((p) => (
                      <SelectItem key={p.id} value={p.id}>
                        <div className="flex items-center gap-2">
                          <PlatformLogo platform={p.id} size="sm" />
                          <span>{p.name}</span>
                        </div>
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              {/* Recipient */}
              <div className="space-y-2">
                <Label>To</Label>
                <Input
                  placeholder={platformConfig.ui.composePlaceholder}
                  value={recipient}
                  onChange={(e) => setRecipient(e.target.value)}
                />
              </div>

              {/* Subject (only for platforms that support it) */}
              {hasSubject && (
                <div className="space-y-2">
                  <Label>Subject</Label>
                  <Input
                    placeholder="Enter subject..."
                    value={subject}
                    onChange={(e) => setSubject(e.target.value)}
                  />
                </div>
              )}

              {/* Message Body */}
              <div className="space-y-2">
                <Label>Message</Label>
                <Textarea
                  placeholder="Write your message..."
                  value={body}
                  onChange={(e) => setBody(e.target.value)}
                  className={cn(
                    "min-h-[150px] resize-none",
                    isOverLimit && "border-destructive focus-visible:ring-destructive"
                  )}
                />
                {charLimit && (
                  <div className={cn(
                    "text-xs text-right",
                    isOverLimit ? "text-destructive" : "text-muted-foreground"
                  )}>
                    {charCount}/{charLimit}
                  </div>
                )}
              </div>
            </div>

            {/* Footer */}
            <div className="flex items-center justify-between px-6 py-4 border-t border-border bg-muted/30">
              <div className="flex items-center gap-2">
                <Button variant="ghost" size="icon" className="h-9 w-9">
                  <Paperclip className="w-4 h-4" />
                </Button>
                <Button variant="ghost" size="icon" className="h-9 w-9">
                  <Image className="w-4 h-4" />
                </Button>
                <Button variant="ghost" size="icon" className="h-9 w-9">
                  <Smile className="w-4 h-4" />
                </Button>
              </div>
              <div className="flex items-center gap-3">
                <Button variant="outline" onClick={onClose}>
                  Cancel
                </Button>
                <Button 
                  onClick={handleSend}
                  disabled={!recipient || !body || isOverLimit}
                  style={{ 
                    backgroundColor: `hsl(var(--${selectedPlatform}))`,
                  }}
                  className="text-white hover:opacity-90"
                >
                  <Send className="w-4 h-4 mr-2" />
                  Send
                </Button>
              </div>
            </div>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
}
