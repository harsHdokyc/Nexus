import { Platform } from "./platform-config";

export interface Message {
  id: string;
  platform: Platform;
  sender: {
    name: string;
    email?: string;
    avatar?: string;
  };
  subject?: string;
  body: string;
  snippet: string;
  timestamp: Date;
  isRead: boolean;
  isStarred: boolean;
  isArchived?: boolean;
  isScheduled?: boolean;
  priority: number;
  category: "work" | "social" | "newsletter" | "urgent";
  hasAttachments?: boolean;
}

export const mockMessages: Message[] = [
  {
    id: "1",
    platform: "gmail",
    sender: {
      name: "Sarah Chen",
      email: "sarah@company.com",
      avatar: "https://i.pravatar.cc/40?img=1",
    },
    subject: "Q1 Product Roadmap Review",
    body: "Hi team, I've attached the updated Q1 roadmap for your review. Please take a look and let me know your thoughts before our meeting tomorrow.",
    snippet: "Hi team, I've attached the updated Q1 roadmap for your review...",
    timestamp: new Date(Date.now() - 1000 * 60 * 15),
    isRead: false,
    isStarred: true,
    isArchived: false,
    isScheduled: false,
    priority: 85,
    category: "work",
    hasAttachments: true,
  },
  {
    id: "2",
    platform: "slack",
    sender: {
      name: "Alex Rivera",
      avatar: "https://i.pravatar.cc/40?img=2",
    },
    body: "Hey! Quick question about the API integration. Are we still on track for the Friday deadline? The client is asking for an update.",
    snippet: "Hey! Quick question about the API integration...",
    timestamp: new Date(Date.now() - 1000 * 60 * 45),
    isRead: false,
    isStarred: false,
    isArchived: false,
    isScheduled: false,
    priority: 70,
    category: "work",
  },
  {
    id: "3",
    platform: "twitter",
    sender: {
      name: "@designlead",
      avatar: "https://i.pravatar.cc/40?img=3",
    },
    body: "Love what you're building! Would love to chat about potential collaboration opportunities. DM me when you get a chance 🚀",
    snippet: "Love what you're building! Would love to chat...",
    timestamp: new Date(Date.now() - 1000 * 60 * 120),
    isRead: true,
    isStarred: false,
    isArchived: true,
    isScheduled: false,
    priority: 45,
    category: "social",
  },
  {
    id: "4",
    platform: "teams",
    sender: {
      name: "Mike Thompson",
      avatar: "https://i.pravatar.cc/40?img=4",
    },
    body: "The security audit results are in. We need to schedule a follow-up meeting to discuss the findings. When are you available this week?",
    snippet: "The security audit results are in. We need to schedule...",
    timestamp: new Date(Date.now() - 1000 * 60 * 180),
    isRead: false,
    isStarred: true,
    isArchived: false,
    isScheduled: false,
    priority: 90,
    category: "urgent",
  },
  {
    id: "5",
    platform: "gmail",
    sender: {
      name: "Newsletter Weekly",
      email: "news@techweekly.com",
    },
    subject: "This Week in Tech: AI Revolution Continues",
    body: "Your weekly roundup of the most important tech news, featuring the latest in AI developments, startup funding rounds, and product launches.",
    snippet: "Your weekly roundup of the most important tech news...",
    timestamp: new Date(Date.now() - 1000 * 60 * 300),
    isRead: true,
    isStarred: false,
    isArchived: false,
    isScheduled: true,
    priority: 20,
    category: "newsletter",
  },
  {
    id: "6",
    platform: "slack",
    sender: {
      name: "Emily Watson",
      avatar: "https://i.pravatar.cc/40?img=5",
    },
    body: "Just pushed the new feature branch. Ready for code review when you have time! 🎉",
    snippet: "Just pushed the new feature branch. Ready for code review...",
    timestamp: new Date(Date.now() - 1000 * 60 * 60 * 4),
    isRead: true,
    isStarred: false,
    isArchived: true,
    isScheduled: false,
    priority: 55,
    category: "work",
  },
  {
    id: "7",
    platform: "meet",
    sender: {
      name: "Google Meet",
      email: "calendar@google.com",
    },
    subject: "Reminder: Design Review in 30 minutes",
    body: "Your meeting 'Design Review - Sprint 23' is starting soon. Join with Google Meet.",
    snippet: "Your meeting 'Design Review - Sprint 23' is starting soon...",
    timestamp: new Date(Date.now() - 1000 * 60 * 60 * 6),
    isRead: true,
    isStarred: false,
    isArchived: false,
    isScheduled: true,
    priority: 75,
    category: "work",
  },
];

export const platformStats = {
  gmail: { unread: 12, total: 156 },
  slack: { unread: 8, total: 89 },
  twitter: { unread: 3, total: 24 },
  teams: { unread: 5, total: 67 },
  meet: { unread: 1, total: 12 },
};
