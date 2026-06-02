# Phase 0: Manual Deployment — Step by Step (Ubuntu EC2)

> **This is what you already do at work. Now understand EVERY step.**
> **This guide uses Ubuntu EC2 (not Amazon Linux)**

---

## What You're About to Do

```
YOUR LAPTOP                    GITHUB                         EC2 (Ubuntu)
┌──────────┐   git push   ┌──────────┐   git pull (you)   ┌──────────────┐
│ Write    │ ───────────► │ Stores   │ ◄──── SSH ──────── │ Runs the app │
│ code     │              │ code     │                     │ PM2 + Nginx  │
└──────────┘              └──────────┘                     └──────────────┘
                                                                  │
                                                                  ▼
                                                           ┌──────────────┐
                                                           │ MongoDB Atlas│
                                                           │ (cloud DB)   │
                                                           └──────────────┘
```

---

## PART A: AWS SETUP (Creating the EC2 Instance)

> Do this ONCE. Follow every step exactly. Screenshots not needed — the steps are precise.

### A1. Log into AWS Console

1. Go to https://console.aws.amazon.com
2. Sign in with your client's AWS account
3. **Top-right corner:** Make sure your region is set (e.g., `ap-south-1` Mumbai or whichever is closest to you)

### A2. Create a Key Pair (For SSH Access)

**What is a Key Pair?**
- It's like a lock and key for your server
- AWS keeps the lock (public key) on the server
- You keep the key (private .pem file) on your laptop
- Without this file, nobody can SSH into your server

**Steps:**
1. Go to **EC2 Dashboard** (search "EC2" in top search bar)
2. Left sidebar → **Network & Security** → **Key Pairs**
3. Click **Create key pair**
4. Settings:
   - Name: `devops-learning-key`
   - Key pair type: **RSA**
   - Private key file format: **.pem** (for SSH from PowerShell/terminal)
5. Click **Create key pair**
6. **A .pem file downloads automatically** — save it safely!
   - Move it to: `C:\Users\Rupali\Downloads\devops-learning-key.pem`
   - **NEVER share this file or push it to GitHub**

### A3. Create a Security Group (Firewall Rules)

**What is a Security Group?**
- It's a firewall around your EC2 instance
- It controls which traffic can reach your server
- Without proper rules, nobody can access your app

**Steps:**
1. EC2 Dashboard → Left sidebar → **Network & Security** → **Security Groups**
2. Click **Create security group**
3. Settings:
   - Security group name: `devops-learning-sg`
   - Description: `Allow SSH, HTTP, and app port`
   - VPC: Leave default
4. **Inbound rules** (who can connect TO your server) — click "Add rule" for each:

```
| Type          | Port  | Source        | Why                              |
|---------------|-------|---------------|----------------------------------|
| SSH           | 22    | My IP         | Only YOU can SSH in              |
| HTTP          | 80    | 0.0.0.0/0    | Anyone can see your website      |
| HTTPS         | 443   | 0.0.0.0/0    | Anyone (future: SSL)             |
| Custom TCP    | 5000  | 0.0.0.0/0    | Direct API access (for testing)  |
```

5. **Outbound rules:** Leave as default (Allow all) — your server can connect anywhere
6. Click **Create security group**

**"My IP" means:** Only your current laptop IP can SSH in. If your IP changes (different WiFi), you'll need to update this rule.

### A4. Launch the EC2 Instance

1. EC2 Dashboard → Click **Launch instance** (orange button)
2. Fill in:

**Name:**
```
devops-learning
```

**Application and OS Images (AMI):**
- Click **Ubuntu**
- Select: **Ubuntu Server 22.04 LTS** (or 24.04 LTS) — Free tier eligible
- Architecture: **64-bit (x86)**

**Instance type:**
- Select: **t2.micro** (Free tier eligible — 1 vCPU, 1 GB RAM)
- This is enough for our learning project

**Key pair:**
- Select: `devops-learning-key` (the one you just created)

**Network settings:**
- Click **Edit**
- Auto-assign public IP: **Enable** (you need this to access your server)
- Select existing security group: Choose `devops-learning-sg`

**Configure storage:**
- Change to: **20 GiB** gp3 (Free tier allows up to 30GB)
- This gives enough space for Docker, Node, etc.

3. Click **Launch instance**
4. Wait 1-2 minutes for it to start

### A5. Find Your EC2 Public IP

1. Go to EC2 Dashboard → **Instances**
2. Click on your `devops-learning` instance
3. In the details panel, find: **Public IPv4 address**
   - Example: `13.235.48.123`
   - **Write this down** — you'll use it for SSH and accessing your app
   - NOTE: This IP changes every time you stop/start the instance
     (To get a fixed IP, you'd use Elastic IP — we'll do that later)

### A6. SSH into Your Instance (First Time)

**From your laptop (PowerShell or Windows Terminal):**

```powershell
# First, fix the key file permissions (Windows requires this)
# Navigate to where the .pem file is:
cd C:\Users\Rupali\Downloads

# Connect! Replace the IP with YOUR instance's public IP:
ssh -i "devops-learning-key.pem" ubuntu@13.235.48.123
```

**First time you'll see:**
```
The authenticity of host '13.235.48.123' can't be established.
Are you sure you want to continue connecting (yes/no)?
```
**Type: `yes`** and press Enter.

**You're now inside your EC2 instance!** You should see:
```
ubuntu@ip-172-31-xx-xx:~$
```

**Key differences from Amazon Linux:**
| Amazon Linux | Ubuntu | What |
|---|---|---|
| `ec2-user` | `ubuntu` | Default username |
| `yum install` | `apt install` | Install software |
| `/etc/nginx/conf.d/` | `/etc/nginx/sites-available/` | Nginx config location |
| Amazon Linux 2023 | Ubuntu 22.04/24.04 | OS version |

### A7. Run the Setup Script

```bash
# On EC2 (after SSH):

# Create a temporary directory for setup
mkdir -p ~/setup && cd ~/setup

# Download the setup script (or paste it manually)
# Option 1: If your repo is already on GitHub:
# git clone https://github.com/YOUR_USERNAME/devops-learning.git
# chmod +x devops-learning/scripts/setup-ec2.sh
# ./devops-learning/scripts/setup-ec2.sh

# Option 2: Copy-paste commands one by one:
# (Copy the contents of scripts/setup-ec2.sh and run them)

# Let's do it step by step so you understand each one:

# Update Ubuntu's package list (like Windows Update)
sudo apt update && sudo apt upgrade -y

# Install basic tools
sudo apt install -y curl wget git unzip

# Install Node.js 18
curl -fsSL https://deb.nodesource.com/setup_18.x | sudo -E bash -
sudo apt install -y nodejs

# Verify Node
node --version    # Should show v18.x.x
npm --version     # Should show 9.x.x or 10.x.x

# Install PM2 (process manager)
sudo npm install -g pm2

# Install Nginx (web server)
sudo apt install -y nginx
sudo systemctl enable nginx
sudo systemctl start nginx

# Verify Nginx is running (should show "active (running)")
sudo systemctl status nginx

# Install Docker
sudo apt install -y ca-certificates gnupg
sudo install -m 0755 -d /etc/apt/keyrings
curl -fsSL https://download.docker.com/linux/ubuntu/gpg | sudo gpg --dearmor -o /etc/apt/keyrings/docker.gpg
sudo chmod a+r /etc/apt/keyrings/docker.gpg
echo "deb [arch=$(dpkg --print-architecture) signed-by=/etc/apt/keyrings/docker.gpg] https://download.docker.com/linux/ubuntu $(. /etc/os-release && echo "$VERSION_CODENAME") stable" | sudo tee /etc/apt/sources.list.d/docker.list > /dev/null
sudo apt update
sudo apt install -y docker-ce docker-ce-cli containerd.io docker-buildx-plugin docker-compose-plugin

# Allow running Docker without sudo
sudo usermod -aG docker ubuntu

# Create project folders
mkdir -p ~/server ~/client

# LOG OUT AND LOG BACK IN (for Docker group to take effect)
exit
```

Then SSH back in:
```powershell
ssh -i "devops-learning-key.pem" ubuntu@YOUR_EC2_IP
```

Verify everything:
```bash
node --version          # v18.x.x
npm --version           # 9.x.x or 10.x.x
pm2 --version           # 5.x.x
docker --version        # Docker version 24.x.x or 27.x.x
docker compose version  # Docker Compose version v2.x.x
nginx -v                # nginx/1.x.x
git --version           # git version 2.x.x
```

**If all commands show versions → your server is ready!**

### A8. Set Billing Alarm (PROTECT YOUR CREDITS!)

**IMPORTANT:** Billing metrics only work in the **us-east-1 (N. Virginia)** region.

**Step 1: Enable Billing Alerts (one time)**
1. Go to AWS Console → top-right click your account name → **Billing and Cost Management**
2. Left sidebar → **Billing preferences** (or **Preferences**)
3. Check/Enable: **Receive CloudWatch Billing Alerts**
4. Click **Save preferences**
5. Wait 15 minutes for metrics to start appearing

**Step 2: Switch to N. Virginia region**
1. Top-right corner of AWS Console → click the region dropdown
2. Select: **US East (N. Virginia) us-east-1**

**Step 3: Create the alarm**
1. Search "CloudWatch" in top search bar → open CloudWatch
2. Left sidebar → **Alarms** → **All alarms**
3. Click **Create alarm**
4. Click **Select metric**
5. You should now see **Billing** → click it → **Total Estimated Charge** → **USD**
6. Check the box → Click **Select metric**
7. Conditions:
   - Threshold type: Static
   - Whenever EstimatedCharges is **Greater than** `5` (dollars)
8. Click **Next**
9. Notification:
   - Select: **Create new topic**
   - Topic name: `billing-alarm`
   - Email: **your email address**
10. Click **Create topic** → Click **Next**
11. Alarm name: `spending-over-5-dollars`
12. Click **Create alarm**
13. **Check your email** and click the confirmation link!

**If you still don't see "Billing" in metrics:**
- You're likely on an account where billing access is restricted (client's account)
- Alternative: Go to **Billing** → **Budgets** → **Create budget**
  - Budget type: **Cost budget**
  - Budget amount: `10` (or `5`)
  - Alert threshold: `80%`
  - Email: your email
  - This works even without CloudWatch billing metrics!

**You'll now get an email before credits run out.**

---

## PART B: Prerequisites (MongoDB + GitHub)

### B1. MongoDB Atlas — Free Database

**Steps:**
1. Go to https://www.mongodb.com/atlas
2. Create free account (or sign in with Google)
3. Click **Build a Database**
4. Choose: **M0 FREE** (Shared) → Click **Create**
5. Provider: AWS, Region: closest to you (e.g., Mumbai ap-south-1)
6. Cluster name: Leave default or name it `taskmanager`
7. Click **Create Deployment**

**Create Database User:**
1. Left sidebar → **Database Access**
2. Click **Add New Database User**
3. Authentication: Password
   - Username: `taskadmin`
   - Password: Click **Autogenerate** or type a strong password
   - **SAVE THIS PASSWORD** somewhere safe
4. Database User Privileges: **Read and write to any database**
5. Click **Add User**

**Allow Network Access:**
1. Left sidebar → **Network Access**
2. Click **Add IP Address**
3. Click **Allow Access from Anywhere** (adds 0.0.0.0/0)
   - This is fine for learning. In production, you'd restrict to your EC2 IP only.
4. Click **Confirm**

**Get Connection String:**
1. Left sidebar → **Database** (or **Deployments**)
2. Click **Connect** on your cluster
3. Choose **Drivers**
4. Driver: Node.js, Version: 5.5 or later
5. Copy the connection string. It looks like:
```
mongodb+srv://taskadmin:<password>@cluster0.abc123.mongodb.net/?retryWrites=true&w=majority
```
6. Replace `<password>` with your actual password
7. Add the database name before the `?`:
```
mongodb+srv://taskadmin:YourPassword123@cluster0.abc123.mongodb.net/taskmanager?retryWrites=true&w=majority
```

**Save this connection string!**

### B2. GitHub Repository

1. Go to https://github.com → Sign up or Sign in
2. Click **+** (top right) → **New repository**
3. Repository name: `devops-learning`
4. Keep it **Public** (free GitHub Actions)
5. **DON'T check** "Add a README file" (we already have our code)
6. Click **Create repository**
7. You'll see a page with instructions — **leave this tab open**, we'll use the URL shown there

---

## PART C: PUSH CODE TO GITHUB (From Your Laptop)

> **Yes, you need to push this project folder to GitHub.**
> Why? Because on EC2 you'll run `git clone` to download the code from GitHub.
> The flow is: Your Laptop → GitHub → EC2

### Step C1: Install Git on Windows (If Not Already Installed)

**Check if Git is installed:**
1. Open VS Code
2. Press `` Ctrl+` `` to open the terminal (or Terminal → New Terminal)
3. Type:
```powershell
git --version
```
4. If you see `git version 2.x.x` → Git is already installed, skip to Step C2
5. If you see an error → install Git:
   - Go to https://git-scm.com/download/win
   - Download and run the installer
   - Use all default options (just keep clicking Next)
   - After install, **close and reopen VS Code**
   - Try `git --version` again

### Step C2: Configure Git (One Time Only)

In VS Code terminal (PowerShell):
```powershell
# Tell Git who you are (use your name and email):
git config --global user.name "Rupali"
git config --global user.email "your-email@example.com"
```

### Step C3: Open the Project in VS Code

1. Open VS Code
2. File → Open Folder
3. Navigate to: `C:\Users\Rupali\Downloads\devops-learning`
4. Click **Select Folder**
5. You should see all the project files in the left sidebar (Explorer)

### Step C4: Initialize Git and Push to GitHub

Open the terminal in VS Code (`` Ctrl+` ``) and run these commands **one by one**:

```powershell
# Make sure you're in the right folder:
cd C:\Users\Rupali\Downloads\devops-learning

# Step 1: Initialize Git in this folder
git init
# Output: "Initialized empty Git repository in ..."

# Step 2: Add ALL files to Git (stage them for commit)
git add .
# No output means success

# Step 3: Create your first commit (save point)
git commit -m "Initial commit: Task Manager app with DevOps setup"
# Output: Shows files committed

# Step 4: Rename the branch to "main" (Git standard)
git branch -M main

# Step 5: Connect to your GitHub repo
# ⚠️ REPLACE YOUR_USERNAME with your actual GitHub username!
git remote add origin https://github.com/YOUR_USERNAME/devops-learning.git

# Step 6: Push your code to GitHub!
git push -u origin main
```

### Step C5: Authentication (When Asked for Password)

When you run `git push`, Git will ask for credentials.

**GitHub no longer accepts regular passwords.** You need a Personal Access Token (PAT):

1. Go to GitHub → click your profile picture (top right) → **Settings**
2. Scroll down left sidebar → **Developer settings**
3. **Personal access tokens** → **Tokens (classic)**
4. Click **Generate new token** → **Generate new token (classic)**
5. Settings:
   - Note: `devops-learning-laptop`
   - Expiration: 90 days (or "No expiration" for learning)
   - Scopes: check **repo** (full control of repositories)
6. Click **Generate token**
7. **COPY THE TOKEN NOW** (you won't see it again!)
   - It looks like: `ghp_xxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxx`
   - Save it somewhere safe (Notepad or password manager)

**When Git asks:**
```
Username: YOUR_GITHUB_USERNAME
Password: ghp_xxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxx   ← paste your token here
```

**Windows may show a popup "Git Credential Manager"** — just paste the token there.

### Step C6: Verify It Worked

1. Go to `https://github.com/YOUR_USERNAME/devops-learning` in your browser
2. You should see all your project files there!
3. You should see: `app/`, `docs/`, `nginx/`, `scripts/`, `ROADMAP.md`, `.gitignore`

**If you see them → SUCCESS! Your code is on GitHub.**

### Future Pushes (After Making Changes)

Whenever you edit files later, push changes with:
```powershell
git add .
git commit -m "describe what you changed"
git push
```

---

## PART D: DEPLOY THE APP ON EC2 (Step by Step)

### Step 1: SSH into EC2

```powershell
# From your laptop (PowerShell):
ssh -i "C:\Users\Rupali\Downloads\devops-learning-key.pem" ubuntu@YOUR_EC2_PUBLIC_IP
```

### Step 2: Clone Your Code on EC2

```bash
# On EC2:
cd ~

# Clone your GitHub repo
git clone https://github.com/YOUR_USERNAME/devops-learning.git

# Copy backend to ~/server
cp -r ~/devops-learning/app/backend/* ~/server/
cp ~/devops-learning/app/backend/.env.example ~/server/
cp ~/devops-learning/app/backend/.gitignore ~/server/

# Copy frontend dist to ~/client/dist
mkdir -p ~/client
cp -r ~/devops-learning/app/frontend/dist ~/client/

# Verify:
ls ~/server/          # Should show: server.js, package.json, models/, routes/
ls ~/client/dist/     # Should show: index.html, assets/
```

### Step 3: Set Up .env File (Your Secrets)

```bash
# On EC2:
cd ~/server

# Create .env from the example template
cp .env.example .env

# Edit it with your REAL MongoDB connection string
nano .env
```

**In nano, replace the contents with:**
```
MONGODB_URI=mongodb+srv://taskadmin:YourPassword123@cluster0.abc123.mongodb.net/taskmanager?retryWrites=true&w=majority
PORT=5000
```
(Use YOUR actual connection string from MongoDB Atlas)

**Save: Press Ctrl+X → Press Y → Press Enter**

### Step 4: Install Dependencies & Start Backend

```bash
# On EC2:
cd ~/server

# Download all libraries (reads package.json → installs into node_modules/)
npm install

# You'll see a progress bar, then:
# "added 85 packages in 5s"

# Start the app with PM2:
pm2 start server.js --name backend

# Check it's running:
pm2 list
# ┌────┬──────────┬─────────────┬─────────┬───────────┐
# │ id │ name     │ status      │ cpu     │ memory    │
# ├────┼──────────┼─────────────┼─────────┼───────────┤
# │ 0  │ backend  │ online      │ 0%      │ 45MB      │
# └────┴──────────┴─────────────┴─────────┴───────────┘

# Check logs (look for success messages):
pm2 logs backend --lines 10
# Should show:
# ✅ Connected to MongoDB
# 🚀 Server running on port 5000

# Test it with curl:
curl http://localhost:5000/health
# Should return: {"status":"ok","timestamp":"2026-06-01T..."}

curl http://localhost:5000/api/tasks
# Should return: []  (empty array — no tasks yet)

# Make PM2 auto-start on reboot:
pm2 save
pm2 startup
# It will print a command starting with "sudo env PATH=..."
# Copy and run that command!
```

**If you see errors in `pm2 logs`:**
- "MongoDB connection failed" → your .env connection string is wrong
- "Cannot find module" → run `npm install` again
- "EADDRINUSE port 5000" → something else is using port 5000. Run `pm2 kill` then try again.

### Step 5: Configure Nginx

```bash
# On EC2:

# Ubuntu Nginx config goes in /etc/nginx/sites-available/
# Edit the default site:
sudo nano /etc/nginx/sites-available/default
```

**Delete everything in the file (Ctrl+K repeatedly, or select all)** and paste:

```nginx
server {
    listen 80;
    server_name _;

    # Serve frontend (React dist folder)
    location / {
        root /home/ubuntu/client/dist;
        index index.html;
        try_files $uri $uri/ /index.html;
    }

    # Forward API requests to Node.js backend
    location /api/ {
        proxy_pass http://localhost:5000;
        proxy_http_version 1.1;
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;
    }
}
```

**Save: Ctrl+X → Y → Enter**

```bash
# Test the config is valid:
sudo nginx -t
# Should say: "syntax is ok" and "test is successful"

# If it says error → you made a typo. Edit again.

# Restart Nginx to apply:
sudo systemctl restart nginx

# Check it's running:
sudo systemctl status nginx
# Should say "active (running)"
```

### Step 6: Fix Permissions (Important on Ubuntu!)

```bash
# Nginx runs as user "www-data" and needs to READ your files
# Give it access to your home directory and dist files:
chmod 755 /home/ubuntu
chmod -R 755 /home/ubuntu/client
```

### Step 7: Test Everything!

```bash
# On EC2 — test backend directly:
curl http://localhost:5000/health
# Expected: {"status":"ok","timestamp":"..."}

curl http://localhost:5000/api/tasks
# Expected: []

# Test through Nginx (port 80):
curl http://localhost/api/tasks
# Expected: []

# Test frontend:
curl http://localhost/ | head -5
# Expected: <!DOCTYPE html>...
```

**From your browser (on laptop):**
- Open: `http://YOUR_EC2_PUBLIC_IP`
- You should see the Task Manager app!
- Try adding a task!

**If you see "Welcome to nginx" default page:**
- The old default config is still active
- Run: `sudo rm /etc/nginx/sites-enabled/default && sudo ln -s /etc/nginx/sites-available/default /etc/nginx/sites-enabled/default && sudo systemctl restart nginx`

---

## What Just Happened (The Full Picture)

```
1. You typed "http://EC2-IP" in browser
         │
         ▼
2. Browser sends GET request to port 80
         │
         ▼
3. EC2 Security Group allows port 80 → passes through
         │
         ▼
4. Nginx receives request on port 80
   URL is "/" → serve /home/ubuntu/client/dist/index.html
         │
         ▼
5. Browser receives index.html
   Sees: <script src="/assets/index-DZl6fR7a.js">
   Downloads that JS file from Nginx too
         │
         ▼
6. JavaScript runs in browser → React app starts
   React calls: fetch('/api/tasks')
         │
         ▼
7. Browser sends GET /api/tasks to port 80
         │
         ▼
8. Nginx sees /api/* → forwards to localhost:5000
         │
         ▼
9. Node.js (managed by PM2) receives the request
   Route handler runs → queries MongoDB Atlas
         │
         ▼
10. MongoDB Atlas returns data → Node.js sends JSON response
          │
          ▼
11. Response goes back: Node.js → Nginx → Browser
          │
          ▼
12. React receives JSON → updates the page (shows tasks)
```

---

## Your Daily Deployment (After Initial Setup)

When a developer pushes new code:

```bash
# SSH into EC2:
ssh -i "devops-learning-key.pem" ubuntu@YOUR_EC2_IP

# Deploy backend:
cd ~/server && git pull && npm install && pm2 restart backend

# Deploy frontend:
cd ~/client && git pull

# OR use the deploy script (one command):
~/deploy.sh
```

---

## IMPORTANT: Stop EC2 When Not Using!

**From AWS Console:**
1. EC2 → Instances → Select your instance
2. Instance State → **Stop instance**
3. It's now "Stopped" — you're NOT charged for compute (only pennies for storage)

**To start again later:**
1. Instance State → **Start instance**
2. ⚠️ **The Public IP will CHANGE!** Check the new IP in instance details.
3. SSH with the new IP

**Want a fixed IP?** (Optional, free while instance is running):
1. EC2 → Elastic IPs → Allocate Elastic IP
2. Associate it with your instance
3. Now the IP stays the same even after stop/start
4. ⚠️ Elastic IP costs $0.005/hr if NOT associated with a running instance — release it if you stop for days

---

## Common Problems & Fixes

| Problem | How to Check | Fix |
|---------|-------------|-----|
| Can't SSH | Connection timeout | Check Security Group has port 22 open for your IP |
| Can't SSH | Permission denied | Check you're using `ubuntu@` (not `ec2-user@`) |
| Can't SSH | Key file error | Fix permissions: in PowerShell run `icacls "your-key.pem" /inheritance:r /grant:r "$($env:USERNAME):(R)"` |
| App not responding | `pm2 list` → is it "online"? | `pm2 logs backend` to see error |
| MongoDB connection failed | Check pm2 logs | Fix .env connection string |
| Nginx 502 Bad Gateway | Backend not running | `pm2 restart backend` |
| Nginx 403 Forbidden | Permission issue | `chmod 755 /home/ubuntu && chmod -R 755 ~/client` |
| "Welcome to nginx" page | Default config active | See Step 6 — overwrite the default site config |
| Port already in use | `ss -tlnp \| grep 5000` | `pm2 kill` then `pm2 start server.js --name backend` |
| Can't access from browser | Security Group | Check port 80 is open to 0.0.0.0/0 |
| IP changed after restart | Normal behavior | Check new IP in EC2 Console |

---

## What's Next?

You've completed Phase 0! You understand:
- ✅ How to create an EC2 instance from scratch
- ✅ What each file does
- ✅ How the request flows from browser to database
- ✅ How to deploy manually
- ✅ How to troubleshoot common issues

**Next: Phase 1 (Docker)** — We'll package this entire app into containers so deployment becomes even simpler. Tell me when you're ready!
