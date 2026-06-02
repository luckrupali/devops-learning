#!/bin/bash
# ============================================================
# scripts/setup-ec2.sh — EC2 INITIAL SETUP (Ubuntu 22.04/24.04)
# ============================================================
# Run this ONCE on a fresh Ubuntu EC2 instance to install everything.
# After this, your server is ready to deploy the app.
#
# HOW TO USE (on EC2 after SSH):
#   chmod +x setup-ec2.sh
#   ./setup-ec2.sh
#
# NOTE: Ubuntu uses "apt" (not "yum" like Amazon Linux)
#       Ubuntu user is "ubuntu" (not "ec2-user")
# ============================================================

set -e  # Stop on any error

echo "========================================="
echo "🔧 EC2 INITIAL SETUP (Ubuntu)"
echo "========================================="

# ---------- Update system packages ----------
echo "📦 Updating system..."
sudo apt update && sudo apt upgrade -y

# ---------- Install essential tools ----------
echo "📦 Installing essential tools..."
sudo apt install -y curl wget git unzip software-properties-common

# ---------- Install Node.js 18 ----------
echo "📦 Installing Node.js 18..."
curl -fsSL https://deb.nodesource.com/setup_18.x | sudo -E bash -
sudo apt install -y nodejs
echo "   Node version: $(node --version)"
echo "   npm version: $(npm --version)"

# ---------- Install PM2 ----------
echo "📦 Installing PM2..."
sudo npm install -g pm2
echo "   PM2 version: $(pm2 --version)"

# ---------- Install Nginx ----------
echo "📦 Installing Nginx..."
sudo apt install -y nginx
sudo systemctl enable nginx  # Start on boot
sudo systemctl start nginx
echo "   Nginx installed and started"

# ---------- Install Docker ----------
echo "📦 Installing Docker..."
# Remove old versions if any
sudo apt remove -y docker docker-engine docker.io containerd runc 2>/dev/null || true

# Add Docker's official GPG key and repository
sudo apt install -y ca-certificates gnupg
sudo install -m 0755 -d /etc/apt/keyrings
curl -fsSL https://download.docker.com/linux/ubuntu/gpg | sudo gpg --dearmor -o /etc/apt/keyrings/docker.gpg
sudo chmod a+r /etc/apt/keyrings/docker.gpg

echo "deb [arch=$(dpkg --print-architecture) signed-by=/etc/apt/keyrings/docker.gpg] https://download.docker.com/linux/ubuntu $(. /etc/os-release && echo "$VERSION_CODENAME") stable" | sudo tee /etc/apt/sources.list.d/docker.list > /dev/null

sudo apt update
sudo apt install -y docker-ce docker-ce-cli containerd.io docker-buildx-plugin docker-compose-plugin

# Allow running docker without sudo
sudo usermod -aG docker ubuntu
echo "   Docker version: $(docker --version)"
echo "   Docker Compose: $(docker compose version)"

# ---------- Create project directories ----------
echo "📁 Creating project directories..."
mkdir -p ~/server
mkdir -p ~/client

# ---------- Summary ----------
echo ""
echo "========================================="
echo "✅ SETUP COMPLETE!"
echo "========================================="
echo ""
echo "Installed:"
echo "  • Node.js $(node --version)"
echo "  • npm $(npm --version)"
echo "  • PM2 $(pm2 --version)"
echo "  • Nginx"
echo "  • Docker $(docker --version)"
echo "  • Docker Compose ($(docker compose version))"
echo "  • Git $(git --version)"
echo ""
echo "Directories created:"
echo "  • ~/server  (for backend code)"
echo "  • ~/client  (for frontend dist)"
echo ""
echo "⚠️  IMPORTANT: Log out and log back in for Docker group to take effect:"
echo "  exit"
echo "  Then SSH back in"
echo ""
echo "NEXT STEPS:"
echo "  1. Clone your backend repo into ~/server"
echo "  2. Clone your frontend dist into ~/client"
echo "  3. Set up .env in ~/server"
echo "  4. Copy nginx config to /etc/nginx/conf.d/"
echo "  5. Start the app with PM2"
