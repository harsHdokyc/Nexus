import { Mail, MessageSquare, AtSign, Users, Video, Inbox } from "lucide-react";

export type Platform = "gmail" | "slack" | "twitter" | "teams" | "meet";

export interface PlatformConfig {
  id: Platform;
  name: string;
  icon: typeof Mail;
  colorClass: string;
  bgClass: string;
  features: {
    hasSubject: boolean;
    hasThreading: boolean;
    hasRichText: boolean;
    maxLength?: number;
  };
  ui: {
    composePlaceholder: string;
    replyLabel: string;
  };
}

export const platforms: Record<Platform, PlatformConfig> = {
  gmail: {
    id: "gmail",
    name: "Gmail",
    icon: Mail,
    colorClass: "text-gmail",
    bgClass: "bg-gmail/10",
    features: {
      hasSubject: true,
      hasThreading: true,
      hasRichText: true,
    },
    ui: {
      composePlaceholder: "recipient@email.com",
      replyLabel: "Reply",
    },
  },
  slack: {
    id: "slack",
    name: "Slack",
    icon: MessageSquare,
    colorClass: "text-slack",
    bgClass: "bg-slack/10",
    features: {
      hasSubject: false,
      hasThreading: true,
      hasRichText: true,
    },
    ui: {
      composePlaceholder: "#channel or @user",
      replyLabel: "Reply in thread",
    },
  },
  twitter: {
    id: "twitter",
    name: "Twitter/X",
    icon: AtSign,
    colorClass: "text-twitter",
    bgClass: "bg-twitter/10",
    features: {
      hasSubject: false,
      hasThreading: true,
      hasRichText: false,
      maxLength: 280,
    },
    ui: {
      composePlaceholder: "@username",
      replyLabel: "Reply",
    },
  },
  teams: {
    id: "teams",
    name: "Teams",
    icon: Users,
    colorClass: "text-teams",
    bgClass: "bg-teams/10",
    features: {
      hasSubject: false,
      hasThreading: true,
      hasRichText: true,
    },
    ui: {
      composePlaceholder: "Search for people",
      replyLabel: "Reply",
    },
  },
  meet: {
    id: "meet",
    name: "Google Meet",
    icon: Video,
    colorClass: "text-meet",
    bgClass: "bg-meet/10",
    features: {
      hasSubject: true,
      hasThreading: false,
      hasRichText: false,
    },
    ui: {
      composePlaceholder: "Enter email to invite",
      replyLabel: "Message",
    },
  },
};

export const allPlatformsConfig = {
  id: "all" as const,
  name: "All Messages",
  icon: Inbox,
  colorClass: "text-foreground",
  bgClass: "bg-muted",
};
