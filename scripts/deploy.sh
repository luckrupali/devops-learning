#!/bin/bash
# ============================================================
# scripts/deploy.sh — DEPLOYMENT SCRIPT
# ============================================================
# This script automates what you currently do manually:
#   1. Pull latest backend code
#   2. Install any new dependencies
#   3. Restart the backend (via PM2)
#   4. Pull latest frontend code (dist folder)
#
# HOW TO USE:
#   chmod +x scripts/deploy.sh    (make it executable — one time only)
#   ./scripts/deploy.sh           (run it whenever you need to deploy)
#
# This is YOUR FIRST AUTOMATION:
#   Before: You type 6-7 commands manually
#   After:  You run ONE script
#
# Later, GitHub Actions will run this script AUTOMATICALLY
# when code is pushed. But for now, you run it manually via SSH.
# ============================================================

# "set -e" means: STOP the script if ANY command fails
# Without this, the script would continue even after errors
set -e

echo "========================================="
echo "🚀 DEPLOYMENT STARTED"
echo "   Time: $(date)"
echo "========================================="

# ---------- STEP 1: Deploy Backend ----------
echo ""
echo "📦 Step 1: Updating backend..."
cd ~/server

# Pull latest code from GitHub
echo "   → Running git pull..."
git pull origin main

# Install new dependencies (if package.json changed)
echo "   → Running npm install..."
npm install --production  # --production = skip dev dependencies (smaller)

# Restart the backend via PM2
echo "   → Restarting backend via PM2..."
pm2 restart backend || pm2 start server.js --name backend
# "||" means: if restart fails (app not started yet), then start it fresh

echo "   ✅ Backend deployed!"

# ---------- STEP 2: Deploy Frontend ----------
echo ""
echo "🎨 Step 2: Updating frontend..."
cd ~/client

# Pull latest dist files from GitHub
echo "   → Running git pull..."
git pull origin main

echo "   ✅ Frontend deployed!"

# ---------- STEP 3: Verify ----------
echo ""
echo "🔍 Step 3: Verifying deployment..."

# Check if backend is responding
sleep 2  # Wait 2 seconds for PM2 to restart
if curl -s http://localhost:5000/health | grep -q "ok"; then
    echo "   ✅ Backend health check: PASSED"
else
    echo "   ❌ Backend health check: FAILED"
    echo "   Check logs: pm2 logs backend"
    exit 1
fi

# Show PM2 status
echo ""
echo "📊 PM2 Status:"
pm2 list

echo ""
echo "========================================="
echo "✅ DEPLOYMENT COMPLETE!"
echo "========================================="
