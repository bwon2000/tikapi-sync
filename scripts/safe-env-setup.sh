#!/bin/bash
# TikAPI Sync - Safe Environment Setup
# Safely creates .env file without overwriting existing credentials

set -e

echo "🔒 Safe Environment Setup"
echo ""

# Check if .env already exists
if [ -f .env ]; then
    echo "⚠️  EXISTING .env file detected!"
    echo "   Current file size: $(wc -c < .env) bytes"
    echo "   Last modified: $(stat -f %Sm .env)"
    echo ""
    
    # Ask for confirmation
    read -p "Do you want to backup and replace it? (y/N): " -n 1 -r
    echo
    
    if [[ $REPLY =~ ^[Yy]$ ]]; then
        # Create timestamped backup
        BACKUP_FILE=".env.backup.$(date +%Y%m%d_%H%M%S)"
        cp .env "$BACKUP_FILE"
        echo "✅ Backed up to: $BACKUP_FILE"
    else
        echo "❌ Aborted. Your .env file is safe."
        exit 0
    fi
fi

# Copy template
if [ -f .env.example ]; then
    cp .env.example .env
    echo "✅ Created .env from template"
    echo ""
    echo "📝 Next steps:"
    echo "1. Edit .env with your real credentials:"
    echo "   - SUPABASE_URL (from Supabase dashboard)"
    echo "   - SUPABASE_SERVICE_ROLE_KEY (from Supabase API settings)"
    echo "   - TIKAPI_KEY (from tikapi.io dashboard)"
    echo ""
    echo "2. Restart your server: node index.mjs"
else
    echo "❌ .env.example not found!"
    exit 1
fi
