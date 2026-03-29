#!/bin/bash

# Nexus - Database Types Generation Script
# Generates TypeScript types from Supabase schema

set -e

echo "🔧 Generating TypeScript types from Supabase schema..."

# Check if Supabase CLI is installed
if ! command -v supabase &> /dev/null; then
    echo "❌ Supabase CLI not found. Please install it first:"
    echo "   npm install -g supabase"
    echo "   or"
    echo "   brew install supabase/tap/supabase"
    exit 1
fi

# Check if .env file exists
if [ ! -f .env ]; then
    echo "❌ .env file not found. Please copy .env.example to .env and configure it."
    exit 1
fi

# Load environment variables
source .env

# Check if required variables are set
if [ -z "$VITE_SUPABASE_URL" ] || [ -z "$VITE_SUPABASE_ANON_KEY" ]; then
    echo "❌ Missing required environment variables in .env:"
    echo "   VITE_SUPABASE_URL"
    echo "   VITE_SUPABASE_ANON_KEY"
    exit 1
fi

# Create types directory if it doesn't exist
mkdir -p src/types

# Generate types
echo "📡 Connecting to Supabase project..."
supabase gen types typescript \
  --project-id "$VITE_SUPABASE_URL" \
  --schema public \
  > src/types/database.types.ts

echo "✅ Types generated successfully at src/types/database.types.ts"

# Create a more user-friendly types file
cat > src/types/index.ts << 'EOF'
// Nexus - Database Types
// Auto-generated from Supabase schema

export type Database = typeof import('./database.types.ts').Database

// Common types extracted for easier usage
export type Profile = Database['public']['Tables']['profiles']['Row']
export type Integration = Database['public']['Tables']['integrations']['Row']
export type Message = Database['public']['Tables']['messages']['Row']
export type Thread = Database['public']['Tables']['threads']['Row']
export type Attachment = Database['public']['Tables']['attachments']['Row']

// Insert types
export type ProfileInsert = Database['public']['Tables']['profiles']['Insert']
export type IntegrationInsert = Database['public']['Tables']['integrations']['Insert']
export type MessageInsert = Database['public']['Tables']['messages']['Insert']
export type ThreadInsert = Database['public']['Tables']['threads']['Insert']
export type AttachmentInsert = Database['public']['Tables']['attachments']['Insert']

// Update types
export type ProfileUpdate = Database['public']['Tables']['profiles']['Update']
export type IntegrationUpdate = Database['public']['Tables']['integrations']['Update']
export type MessageUpdate = Database['public']['Tables']['messages']['Update']
export type ThreadUpdate = Database['public']['Tables']['threads']['Update']
export type AttachmentUpdate = Database['public']['Tables']['attachments']['Update']

// Enums
export type Provider = Database['public']['Enums']['provider']
export type MessageStatus = Database['public']['Enums']['message_status']
export type IntegrationStatus = Database['public']['Enums']['integration_status']

// View types
export type MessageDetail = Database['public']['Views']['message_details']['Row']
export type UnreadCount = Database['public']['Views']['unread_counts']['Row']
EOF

echo "✅ Type exports created at src/types/index.ts"
echo "🎉 Type generation complete!"
