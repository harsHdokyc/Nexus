import { motion } from "framer-motion";
import { platforms, Platform } from "@/lib/platform-config";
import { mockMessages } from "@/lib/mock-data";
import { formatDistanceToNow } from "date-fns";
import { Star, Inbox } from "lucide-react";

export function Demo() {
  return (
    <section className="py-24">
      <div className="container px-6">
        <div className="text-center mb-16">
          <motion.h2
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.5 }}
            className="text-3xl sm:text-4xl font-bold mb-4"
          >
            See it in action
          </motion.h2>
          <motion.p
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.5, delay: 0.1 }}
            className="text-lg text-muted-foreground"
          >
            A unified view of all your messages, beautifully organized.
          </motion.p>
        </div>

        <motion.div
          initial={{ opacity: 0, y: 40 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6, delay: 0.2 }}
          className="max-w-5xl mx-auto"
        >
          <div className="rounded-xl border border-border bg-background shadow-2xl shadow-black/5 overflow-hidden">
            {/* Mock header */}
            <div className="h-14 border-b border-border flex items-center px-4 gap-3">
              <div className="flex gap-1.5">
                <div className="w-3 h-3 rounded-full bg-destructive/50" />
                <div className="w-3 h-3 rounded-full bg-warning/50" />
                <div className="w-3 h-3 rounded-full bg-success/50" />
              </div>
              <div className="flex-1 flex items-center justify-center">
                <div className="px-4 py-1.5 rounded-lg bg-muted text-sm text-muted-foreground">
                  nexus.app/inbox
                </div>
              </div>
            </div>

            {/* Mock app */}
            <div className="flex min-h-[500px]">
              {/* Sidebar */}
              <div className="w-64 border-r border-border bg-surface p-4 hidden md:block">
                <div className="flex items-center gap-3 px-3 py-2 rounded-lg bg-background mb-4">
                  <Inbox className="w-5 h-5" />
                  <span className="font-medium">All Messages</span>
                  <span className="ml-auto text-xs bg-foreground text-background rounded-full px-2 py-0.5">
                    29
                  </span>
                </div>
                
                <div className="space-y-1">
                  {Object.values(platforms).map((platform) => {
                    const Icon = platform.icon;
                    return (
                      <div
                        key={platform.id}
                        className="flex items-center gap-3 px-3 py-2 rounded-lg hover:bg-background transition-colors cursor-pointer"
                      >
                        <Icon className={`w-5 h-5 ${platform.colorClass}`} />
                        <span className="text-sm">{platform.name}</span>
                      </div>
                    );
                  })}
                </div>
              </div>

              {/* Message list */}
              <div className="flex-1">
                {mockMessages.slice(0, 5).map((message, index) => {
                  const platform = platforms[message.platform];
                  const Icon = platform.icon;
                  
                  return (
                    <motion.div
                      key={message.id}
                      initial={{ opacity: 0, x: 20 }}
                      whileInView={{ opacity: 1, x: 0 }}
                      viewport={{ once: true }}
                      transition={{ duration: 0.3, delay: index * 0.1 }}
                      className={`flex items-start gap-4 p-4 border-b border-border hover:bg-muted/50 transition-colors cursor-pointer ${
                        !message.isRead ? "bg-surface" : ""
                      }`}
                    >
                      <div className={`w-10 h-10 rounded-full ${platform.bgClass} flex items-center justify-center shrink-0`}>
                        <Icon className={`w-5 h-5 ${platform.colorClass}`} />
                      </div>
                      
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-2 mb-1">
                          <span className={`font-medium ${!message.isRead ? "text-foreground" : "text-muted-foreground"}`}>
                            {message.sender.name}
                          </span>
                          <span className="text-xs text-muted-foreground">
                            {formatDistanceToNow(message.timestamp, { addSuffix: true })}
                          </span>
                          {message.isStarred && (
                            <Star className="w-4 h-4 text-warning fill-warning" />
                          )}
                        </div>
                        {message.subject && (
                          <p className={`text-sm ${!message.isRead ? "font-medium" : ""}`}>
                            {message.subject}
                          </p>
                        )}
                        <p className="text-sm text-muted-foreground truncate">
                          {message.snippet}
                        </p>
                      </div>
                    </motion.div>
                  );
                })}
              </div>
            </div>
          </div>
        </motion.div>
      </div>
    </section>
  );
}
