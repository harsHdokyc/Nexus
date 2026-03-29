import { Platform } from "@/lib/platform-config";
import gmailLogo from "@/assets/logos/gmail.svg";
import slackLogo from "@/assets/logos/slack.svg";
import twitterLogo from "@/assets/logos/twitter.svg";
import teamsLogo from "@/assets/logos/teams.svg";
import meetLogo from "@/assets/logos/meet.svg";
import { Inbox } from "lucide-react";
import { cn } from "@/lib/utils";

const logoMap: Record<Platform, string> = {
  gmail: gmailLogo,
  slack: slackLogo,
  twitter: twitterLogo,
  teams: teamsLogo,
  meet: meetLogo,
};

interface PlatformLogoProps {
  platform: Platform | "all";
  size?: "sm" | "md" | "lg";
  className?: string;
}

const sizeClasses = {
  sm: "w-4 h-4",
  md: "w-5 h-5",
  lg: "w-6 h-6",
};

export function PlatformLogo({ platform, size = "md", className }: PlatformLogoProps) {
  if (platform === "all") {
    return <Inbox className={cn(sizeClasses[size], className)} />;
  }

  const logo = logoMap[platform];
  
  return (
    <img 
      src={logo} 
      alt={`${platform} logo`}
      className={cn(sizeClasses[size], className)}
    />
  );
}
