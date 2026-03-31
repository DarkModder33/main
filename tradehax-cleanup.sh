#!/bin/bash
# ============================================================
# TradeHax Repo Cleanup Script
# Run from the ROOT of your cloned repo:
#   cd /path/to/your/main
#   bash tradehax-cleanup.sh
# ============================================================

set -e
echo "🧹 TradeHax Repo Cleanup Starting..."
echo "======================================"

# --------------------------------------------------------------
# STEP 1: Fix .env security issue
# --------------------------------------------------------------
echo ""
echo "🔐 STEP 1: Securing .env file..."

if git ls-files --error-unmatch .env 2>/dev/null; then
  git rm --cached .env
  echo "✅ .env removed from git tracking"
else
  echo "ℹ️  .env was not tracked by git"
fi

# Ensure .env is in .gitignore
if ! grep -qx ".env" .gitignore 2>/dev/null; then
  echo ".env" >> .gitignore
  echo "✅ Added .env to .gitignore"
fi

# Also make sure .env.local is ignored
if ! grep -qx ".env.local" .gitignore 2>/dev/null; then
  echo ".env.local" >> .gitignore
  echo "✅ Added .env.local to .gitignore"
fi

# --------------------------------------------------------------
# STEP 2: Remove duplicate AI tool config folders
# --------------------------------------------------------------
echo ""
echo "🤖 STEP 2: Removing duplicate AI tool folders..."

AI_FOLDERS=(
  ".agents"
  ".augment"
  ".continue"
  ".junie"
  ".windsurf"
  ".zencoder"
  ".zenflow"
)

for folder in "${AI_FOLDERS[@]}"; do
  if [ -d "$folder" ]; then
    git rm -rf --cached "$folder" 2>/dev/null || true
    rm -rf "$folder"
    echo "✅ Removed $folder"
  else
    echo "ℹ️  $folder not found, skipping"
  fi
done

# --------------------------------------------------------------
# STEP 3: Remove junk/stray folders
# --------------------------------------------------------------
echo ""
echo "🗑️  STEP 3: Removing junk folders..."

JUNK_FOLDERS=(
  "1"
  "_safe_backup"
  "archive"
  "k8s"
  "tradehax-repo"
  "main"
  "ai-micro"
  ".devcontainer"
  ".idea"
  ".vscode-extension"
)

for folder in "${JUNK_FOLDERS[@]}"; do
  if [ -d "$folder" ]; then
    git rm -rf --cached "$folder" 2>/dev/null || true
    rm -rf "$folder"
    echo "✅ Removed $folder"
  else
    echo "ℹ️  $folder not found, skipping"
  fi
done

# --------------------------------------------------------------
# STEP 4: Remove junk root-level markdown files
# (Keep: README.md, LICENSE, DOCS_INDEX.md, QUICK_START.md)
# --------------------------------------------------------------
echo ""
echo "📄 STEP 4: Cleaning up root-level markdown clutter..."

JUNK_DOCS=(
  "90_DAY_EXECUTION_PLAN.md"
  "AGENTS.md"
  "AI_ENVIRONMENT_STANDARDS.md"
  "AI_ENVIRONMENT_TEMPLATE.env"
  "AI_LIVE_ENV_BLUEPRINT.env"
  "AI_NAVIGATOR_IMPLEMENTATION_PLAN.md"
  "AI_SETUP_SUMMARY.md"
  "BLOG_PAGE_VERIFICATION.md"
  "BUILD_COMPLETE.md"
  "CLEANUP_SUMMARY.md"
  "COMPLETE_AUTOMATION_GUIDE.md"
  "COMPLETE_DEPLOYMENT_GUIDE.md"
  "CUSTOM_LLM_MODEL_PLAN.md"
  "DEPLOYMENT_CHECKLIST.md"
  "DEPLOYMENT_FINAL_SUMMARY.md"
  "DEPLOYMENT_FIX_CHECKLIST.md"
  "DEPLOYMENT_FIX_SUMMARY.md"
  "DEPLOYMENT_PATHS.md"
  "DEPLOYMENT_READY.txt"
  "DIGITAL_EMPIRE_STRATEGY.md"
  "DISCORD_APP_SETUP.md"
  "DNS_COMPARISON_TABLE.md"
  "DNS_CONFIGURATION_SUMMARY.md"
  "DNS_INDEX.md"
  "DNS_INSPECTION_REPORT.md"
  "DNS_QUICK_FIX.md"
  "EXECUTION_SUMMARY.md"
  "FINAL_STATUS_REPORT.md"
  "FINTECH_PAYMENT_RAILS_SETUP.md"
  "GITHUB_SECRETS_SETUP.md"
  "GITHUB_SYNC_COMPLETE.md"
  "GITLAB_AGENT_DEPLOYMENT.md"
  "HANDOFF_BUNDLE.md"
  "HARD_LAUNCH_RUNBOOK.md"
  "HF_DATASET_UPLOAD.md"
  "HF_FINE_TUNING_WORKFLOW.md"
  "HF_INTEGRATION_GUIDE.md"
  "HF_SETUP_GUIDE.md"
  "IDE_AUTOMATION_WORKFLOW.md"
  "IDE_PIPELINE_READY.md"
  "IDE_PIPELINE_WORKFLOW.md"
  "INTELLIGENCE_BUILD_LOG.md"
  "KUBERNETES_DEPLOYMENT_STATUS.md"
  "KUBERNETES_READY.md"
  "LOCAL_REPO_WORKFLOW.md"
  "NAMECHEAP_CPANEL_DEPLOYMENT.md"
  "NAMECHEAP_MIGRATION_CHECKLIST.md"
  "PERMISSIVE_CONFIG.md"
  "PIPELINE_QUICKSTART.md"
  "API_DOCUMENTATION.md"
  "INTEGRATION_GUIDE.md"
  "MONETIZATION_GUIDE.md"
)

# Move useful docs to /docs before deleting root clutter
mkdir -p docs
KEEP_IN_DOCS=(
  "DEPLOYMENT_QUICKSTART.md"
  "DEPLOYMENT_GUIDE.md"
  "VERCEL_DOMAIN_SETUP.md"
  "VERCEL_DEPLOYMENT_TROUBLESHOOTING.md"
  "VERCEL_API_SETUP.md"
  "AI_LLM_INTEGRATION.md"
  "DNS_CONFIGURATION_SUMMARY.md"
)

for doc in "${KEEP_IN_DOCS[@]}"; do
  if [ -f "$doc" ]; then
    mv "$doc" "docs/$doc"
    git rm --cached "$doc" 2>/dev/null || true
    echo "📁 Moved $doc → docs/"
  fi
done

for doc in "${JUNK_DOCS[@]}"; do
  if [ -f "$doc" ]; then
    git rm --cached "$doc" 2>/dev/null || true
    rm -f "$doc"
    echo "✅ Deleted $doc"
  fi
done

# --------------------------------------------------------------
# STEP 5: Add useful .gitignore rules
# --------------------------------------------------------------
echo ""
echo "📋 STEP 5: Updating .gitignore..."

cat >> .gitignore << 'EOF'

# AI tool folders (keep .claude only)
.agents/
.augment/
.continue/
.junie/
.windsurf/
.zencoder/
.zenflow/

# IDE
.idea/
.vscode-extension/

# Backups & archives
_safe_backup/
archive/

# Build artifacts
.artifacts/

# Env files
.env
.env.local
AI_ENVIRONMENT_TEMPLATE.env
AI_LIVE_ENV_BLUEPRINT.env
EOF

echo "✅ .gitignore updated"

# --------------------------------------------------------------
# STEP 6: Commit everything
# --------------------------------------------------------------
echo ""
echo "💾 STEP 6: Committing cleanup..."

git add -A
git commit -m "chore: major repo cleanup

- Remove .env from git tracking (security fix)
- Delete duplicate AI tool folders (.agents, .augment, .continue, .junie, .windsurf, .zencoder, .zenflow)
- Remove junk folders (1/, _safe_backup/, archive/, k8s/, tradehax-repo/, main/, ai-micro/)
- Delete 50+ stale root-level markdown files
- Move useful deployment docs to /docs
- Update .gitignore with comprehensive rules"

echo ""
echo "🚀 STEP 7: Pushing to GitHub..."
git push origin main

echo ""
echo "======================================"
echo "✅ CLEANUP COMPLETE!"
echo ""
echo "Summary of what was done:"
echo "  🔐 .env secured and removed from git"
echo "  🤖 7 duplicate AI tool folders removed"
echo "  🗑️  Junk folders deleted"
echo "  📄 50+ stale markdown files deleted"
echo "  📁 Useful docs moved to /docs"
echo "  📋 .gitignore updated"
echo "  💾 Changes committed and pushed"
echo ""
echo "⚠️  NEXT STEPS (manual):"
echo "  1. Go to GitHub → Settings → Secrets and rotate any API keys"
echo "     that were in your .env file (they were public!)"
echo "  2. Fix the triple navbar — let Claude know and share app/layout.tsx"
echo "======================================"
