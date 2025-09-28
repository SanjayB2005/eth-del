#!/bin/bash

# Git cleanup script for eth-del project
# This script will properly reset Git and apply the new .gitignore rules

echo "🧹 Cleaning up Git staging area..."

# Reset all staged changes
git reset HEAD .

echo "✅ Git staging area cleared"

# Show current untracked files
echo ""
echo "📋 Files that will now be ignored by Git:"
git status --porcelain | grep "??" | head -10

echo ""
echo "📋 Modified files to be committed:"
git status --porcelain | grep -E "^[AMD]" | head -10

echo ""
echo "🎯 To commit your cleaned-up project, run:"
echo "   git add ."
echo "   git commit -m 'feat: cleanup project and update .gitignore'"
echo "   git push"

echo ""
echo "✅ Cleanup complete! Your .gitignore is now properly configured."