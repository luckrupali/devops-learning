# DevOps Learning Plan — From Current Level to Industry Ready

---

## 📊 YOUR CURRENT LEVEL (Honest Assessment)

**What you CAN do today:**
- SSH into EC2 instance
- Run `git pull` to get latest code
- Edit `.env` files
- Run `pm2 start/restart`
- Copy-paste Nginx config (with GPT help)
- Basic AWS Console navigation (launch EC2, security groups)
- Some Python scripting (2024, no practice since)

**What you DON'T understand yet:**
- WHY these commands work (just following patterns)
- Linux fundamentals (file system, permissions, processes, networking)
- How Node.js/React code works (just deploying it blindly)
- Shell scripting (automation basics)
- Docker, CI/CD, Terraform, Ansible, Kubernetes
- Networking (ports, DNS, load balancing, firewalls)
- How the internet actually works (HTTP, requests, responses)

**Why you fail interviews:**
- You can't EXPLAIN what you're doing — only that you do it
- No hands-on experience with Docker, CI/CD, IaC, monitoring
- Can't troubleshoot because you don't understand the fundamentals
- No scripting/automation skills to show

---

## 🎯 THE PLAN: 4 Stages (In This Exact Order)

```
STAGE 1: FOUNDATIONS          → Understand what you're already doing
  (Linux, Networking, Git, Shell basics)

STAGE 2: CODE UNDERSTANDING   → Read and understand the app you deploy
  (Node.js basics, how React works, APIs, databases)

STAGE 3: DEVOPS TOOLS         → Learn industry tools one by one
  (Docker → CI/CD → Terraform → Ansible → Monitoring)

STAGE 4: ADVANCED + INTERVIEW → Put it all together
  (Kubernetes basics, full pipeline, interview prep)
```

**Why this order?**
- You can't automate what you don't understand
- You can't debug deployments if you don't know how the app works
- Tools are useless if you can't explain WHY you're using them

---

## 🖥️ Your Learning Environment

**On your laptop (128GB — keep it light, ~230MB total):**
- VS Code (already installed)
- Git (push code to GitHub)
- SSH key (connect to EC2)
- This project folder

**On EC2 (all heavy work happens here):**
- One t2.micro instance (free tier or ~$0.01/hr)
- 20GB storage
- All tools installed here (Node, Docker, Nginx, etc.)
- **STOP the instance when not practicing** — saves credits

**Cost: ~$1-3/month with $10 credits = 3+ months of learning**

---
---

# STAGE 1: FOUNDATIONS (Do This First)

> **Goal:** Understand what you're ALREADY doing. Stop copy-pasting blindly.

---

## 1.1 — Linux Fundamentals

You SSH into Linux every day but don't understand it. Fix that.

### What is Linux? (Simple version)
- An operating system (like Windows) that runs on servers
- Almost ALL servers in the world run Linux
- EC2 instances run Ubuntu (a type of Linux)
- Commands are typed (no mouse clicking like Windows)

### The File System (Where things live)

```
/                          ← Root (like C:\ in Windows)
├── home/
│   └── ubuntu/            ← YOUR home folder (like C:\Users\Rupali)
│       ├── server/        ← Your backend code lives here
│       └── client/        ← Your frontend dist lives here
├── etc/
│   └── nginx/
│       └── nginx.conf     ← Nginx configuration
├── var/
│   └── log/               ← Log files (errors, access logs)
├── usr/
│   └── bin/               ← Installed programs (node, npm, git)
└── tmp/                   ← Temporary files (auto-deleted)
```

### Essential Commands (What They ACTUALLY Do)

```bash
# NAVIGATION (Moving around)
pwd                    # "Print Working Directory" — shows where you ARE
ls                     # "List" — shows files in current folder
ls -la                 # Shows ALL files including hidden ones + permissions
cd /home/ubuntu        # "Change Directory" — move to this folder
cd ..                  # Go up one folder
cd ~                   # Go to your home folder (/home/ubuntu)

# FILES (Create, read, edit, delete)
cat file.txt           # Print file contents (like opening in notepad)
nano file.txt          # Edit file (simple text editor, Ctrl+X to save/exit)
vim file.txt           # Advanced editor (press i to edit, Esc then :wq to save)
cp file.txt backup.txt # Copy a file
mv old.txt new.txt     # Rename/move a file
rm file.txt            # DELETE a file (no recycle bin! Gone forever!)
mkdir myfolder         # Create a folder
rm -rf myfolder        # Delete folder and everything inside (DANGEROUS)

# PERMISSIONS (Who can do what)
chmod 755 script.sh    # Make a file executable (can be run as program)
chown ubuntu file      # Change who owns a file
# Permission numbers: 7=read+write+execute, 5=read+execute, 4=read only

# PROCESSES (What's running on the server)
ps aux                 # Show ALL running processes
ps aux | grep node     # Find processes with "node" in the name
kill 1234              # Stop process with ID 1234
kill -9 1234           # FORCE stop (when normal kill doesn't work)
top                    # Live view of CPU/memory usage (press q to exit)

# NETWORKING (Ports, connections)
curl http://localhost:5000/api/tasks    # Make HTTP request (like a browser)
netstat -tlnp          # Show which ports are in use
ss -tlnp               # Same as above (newer command)
# Example output: Node.js listening on port 5000, Nginx on port 80

# SYSTEM
sudo <command>         # Run as admin (like "Run as Administrator" in Windows)
systemctl status nginx # Check if Nginx is running
systemctl restart nginx # Restart Nginx
journalctl -u nginx    # Read Nginx error logs
df -h                  # Check disk space
free -h                # Check RAM usage
```

### What is a "Port"? (You use this daily but may not understand it)

```
Think of your EC2 instance as an apartment building:
- The building has ONE address (your EC2 public IP: 3.14.xx.xx)
- But it has many doors (ports): 22, 80, 443, 5000, 3000...

Port 22   → SSH door (you enter through here)
Port 80   → HTTP door (web browsers knock here)
Port 443  → HTTPS door (secure web traffic)
Port 5000 → Your Node.js app is listening here
Port 27017 → MongoDB listens here (but yours is on Atlas, not local)

Nginx sits at door 80 and says:
  "Want /api/*? Go talk to the app at door 5000"
  "Want anything else? Here's the dist/ folder"
```

### What is a "Process"?

```
A process = a running program

When you run `pm2 start server.js`:
  → A new PROCESS is created
  → It gets a unique Process ID (PID), like 1234
  → It occupies memory and CPU
  → It listens on a port (5000)
  → PM2 watches it — if it dies, PM2 starts a new one

When you run `pm2 restart backend`:
  → PM2 kills the old process (PID 1234)
  → PM2 starts a new process (PID 5678)
  → New process reads the latest code from disk
  → That's why git pull + pm2 restart = deploys new code
```

### Practice Exercise (Do this on your EC2):

```bash
# 1. Check what's running
pm2 list                          # See your apps
ps aux | grep node                # See Node.js processes
ss -tlnp                          # See what's listening on which port

# 2. Check Nginx
sudo systemctl status nginx       # Is it running?
sudo cat /etc/nginx/nginx.conf    # Read the config YOU set up
sudo nginx -t                     # Test if config is valid

# 3. Check your app
curl http://localhost:5000         # Does backend respond?
ls -la ~/server/                  # What files are there?
cat ~/server/.env                 # What secrets are configured?
cat ~/server/package.json         # What dependencies does app need?

# 4. Check system resources
df -h                             # How much disk space used?
free -h                           # How much RAM?
```

---

## 1.2 — Networking Basics (How the Internet Works)

### The Journey of a Web Request

```
User types: https://yourapp.com/api/tasks

1. Browser asks DNS: "What's the IP of yourapp.com?"
   DNS responds: "It's 3.14.56.78" (your EC2 IP)

2. Browser sends HTTP request to 3.14.56.78:443 (HTTPS = port 443)
   Request: GET /api/tasks

3. Request hits your EC2's Security Group (AWS firewall):
   "Is port 443 allowed?" → YES → let it through

4. Nginx receives the request on port 80/443:
   "Path starts with /api/" → forward to localhost:5000

5. Node.js receives the request:
   "GET /api/tasks" → run the handler function
   → query MongoDB Atlas → get data → send response

6. Response travels back: Node.js → Nginx → Internet → Browser
```

### Security Group = Firewall

```
Your EC2 Security Group rules:
┌──────────────────────────────────────────┐
│ Type        Port    Source    Meaning     │
├──────────────────────────────────────────┤
│ SSH         22      Your IP   Only YOU can SSH │
│ HTTP        80      0.0.0.0/0 Anyone can view website │
│ HTTPS       443     0.0.0.0/0 Anyone (secure) │
│ Custom TCP  5000    0.0.0.0/0 Direct API access │
└──────────────────────────────────────────┘

0.0.0.0/0 = "anyone in the world"
Your IP/32 = "only your laptop"
```

### HTTP Methods (What your API uses)

```
GET    = "Give me data"         (Read)
POST   = "Create something new" (Create)
PUT    = "Update this thing"    (Update)
DELETE = "Remove this thing"    (Delete)

Example:
GET    /api/tasks       → Get all tasks
POST   /api/tasks       → Create a new task (send data in body)
PUT    /api/tasks/123   → Update task with ID 123
DELETE /api/tasks/123   → Delete task with ID 123
```

---

## 1.3 — Git Fundamentals (You Use It Daily, Now Understand It)

### What Git Actually Does

```
Git = a time machine for your code

Without Git:
  myproject_v1.zip
  myproject_v2_final.zip
  myproject_v2_final_FINAL.zip   ← chaos

With Git:
  Every change is recorded with:
  - WHO changed it
  - WHEN they changed it
  - WHAT they changed
  - WHY (commit message)
  You can go back to ANY point in time
```

### Commands You Use (Now Understand Them)

```bash
# What you do on EC2:
git pull                    # Download latest changes from GitHub
                            # = git fetch (download) + git merge (apply)

# What happens on developer's machine:
git add .                   # "Stage" files (prepare for save)
git commit -m "add login"   # Save a snapshot (with message)
git push                    # Upload to GitHub

# Useful for you:
git log --oneline -5        # See last 5 changes (who did what)
git status                  # See if there are uncommitted changes
git diff                    # See what changed (before committing)
git stash                   # Temporarily save changes without committing
```

### Branches (Interview Question)

```
main branch     ────●────●────●────●──── (production code)
                              \
feature branch                 ●────●──── (developer's new feature)
                                        \
                     merge back ─────────●── (feature added to main)

Why branches?
- Developer works on feature without breaking main
- When ready, they merge (or create Pull Request for review)
- You deploy from "main" branch (stable code)
```

---

## 1.4 — Shell Scripting Basics (Your First Automation)

### Why Learn This?
Instead of typing 5 commands every deployment, write ONE script:

```bash
#!/bin/bash
# deploy.sh — Automates what you do manually

echo "🚀 Deploying backend..."
cd ~/server
git pull origin main
npm install
pm2 restart backend

echo "🚀 Deploying frontend..."
cd ~/client
git pull origin main

echo "✅ Deployment complete!"
```

**Now instead of 7 commands, you run ONE:** `bash deploy.sh`

### Shell Script Basics

```bash
#!/bin/bash
# ↑ This line tells Linux "use bash to run this script"

# Variables (no spaces around =)
NAME="Rupali"
PORT=5000
echo "Hello $NAME, app runs on port $PORT"

# If/else (check conditions)
if [ -f ".env" ]; then
    echo ".env file exists"
else
    echo "WARNING: .env file missing!"
    exit 1    # Stop script with error
fi

# Loops
for service in backend frontend; do
    echo "Restarting $service..."
    pm2 restart $service
done

# Command result check
git pull origin main
if [ $? -eq 0 ]; then
    echo "Git pull successful"
else
    echo "Git pull FAILED!"
    exit 1
fi
```

### Practice: Create Your First Deploy Script

```bash
# On EC2, create the script:
nano ~/deploy.sh

# Paste this content:
#!/bin/bash
set -e  # Stop on any error

echo "=== Starting Deployment ==="
echo "Time: $(date)"

# Pull backend
cd ~/server
echo "Pulling backend code..."
git pull origin main

# Install new dependencies if package.json changed
echo "Installing dependencies..."
npm install

# Restart backend
echo "Restarting backend..."
pm2 restart backend

# Pull frontend
cd ~/client
echo "Pulling frontend..."
git pull origin main

echo "=== Deployment Complete ==="
pm2 status

# Save and exit (Ctrl+X, then Y, then Enter)
# Make it executable:
chmod +x ~/deploy.sh

# Now use it:
~/deploy.sh
```

**Congratulations — you just automated your first deployment!**
This is literally what CI/CD does, but triggered automatically.

---
---

# STAGE 2: CODE UNDERSTANDING

> **Goal:** Understand the app you deploy. You don't need to WRITE code, but you must READ and understand it.

---

## 2.1 — JavaScript/Node.js Basics (Just Enough to Understand)

### You Knew Java. JavaScript is Similar But Different.

```javascript
// JAVA (what you learned)              // JAVASCRIPT (what devs write now)
// int x = 5;                           let x = 5;
// String name = "Rupali";              const name = "Rupali";
// int[] arr = {1,2,3};                 const arr = [1, 2, 3];

// Java: public void greet(String n)    // JS: 
function greet(name) {                  // No types needed
    return "Hello " + name;
}

// Java: HashMap<String, Object>        // JS: Object (like a map)
const task = {
    id: 1,
    title: "Learn Docker",
    completed: false
};

// Java: ArrayList                      // JS: Array
const tasks = [
    { id: 1, title: "Learn Docker", completed: false },
    { id: 2, title: "Learn CI/CD", completed: true }
];
```

### async/await (The Most Confusing Part for Java Devs)

```javascript
// In Java, code runs line by line and waits automatically
// In JavaScript, some things are ASYNCHRONOUS (don't block)

// Database query — takes time, doesn't block other code:
const tasks = await Task.find();    // "await" = WAIT for result
//                                     Without await, you'd get a Promise (empty box)

// Same as Java:
// List<Task> tasks = taskRepository.findAll();  // Java waits automatically
```

**Rule:** When you see `await` → it means "this takes time (DB query, API call), wait for it"

### What Does the Backend Code Look Like?

```javascript
// server.js — Entry point (like Main.java)

const express = require('express');    // Import Express (like import in Java)
const mongoose = require('mongoose');  // Import Mongoose (DB library)
require('dotenv').config();           // Load .env file into process.env

const app = express();                 // Create the web server

// Middleware (runs before every request — like Java Filters)
app.use(express.json());              // Parse JSON request bodies
app.use(cors());                      // Allow frontend to call this API

// Routes (like @RequestMapping in Spring)
app.use('/api/tasks', require('./routes/tasks'));

// Connect to MongoDB and start server
mongoose.connect(process.env.MONGODB_URI)
    .then(() => {
        app.listen(process.env.PORT || 5000, () => {
            console.log('Server running on port 5000');
        });
    });
```

```javascript
// routes/tasks.js — API endpoints (like @RestController)

const router = require('express').Router();
const Task = require('../models/Task');

// GET /api/tasks — get all tasks
router.get('/', async (req, res) => {
    const tasks = await Task.find();       // Query MongoDB
    res.json(tasks);                       // Send as JSON response
});

// POST /api/tasks — create a task
router.post('/', async (req, res) => {
    const task = new Task({
        title: req.body.title,            // Get title from request body
        completed: false
    });
    await task.save();                    // Save to MongoDB
    res.status(201).json(task);           // Send back created task
});

// PUT /api/tasks/:id — update a task
router.put('/:id', async (req, res) => {
    const task = await Task.findByIdAndUpdate(
        req.params.id,                    // Get ID from URL
        req.body,                         // New data from request body
        { new: true }                     // Return updated version
    );
    res.json(task);
});

// DELETE /api/tasks/:id — delete a task
router.delete('/:id', async (req, res) => {
    await Task.findByIdAndDelete(req.params.id);
    res.json({ message: 'Task deleted' });
});

module.exports = router;
```

```javascript
// models/Task.js — Database schema (like @Entity in Java)

const mongoose = require('mongoose');

const taskSchema = new mongoose.Schema({
    title: { type: String, required: true },     // Must have a title
    completed: { type: Boolean, default: false }, // Default: not done
    createdAt: { type: Date, default: Date.now }  // Auto-set timestamp
});

module.exports = mongoose.model('Task', taskSchema);
// This creates a "tasks" collection in MongoDB
// (like a "tasks" table in MySQL)
```

### What You Need to Know (Not Write)

As a DevOps engineer, you should be able to:
1. Open `package.json` → know what dependencies the app needs
2. Open `server.js` → find what PORT the app listens on
3. Open `.env.example` → know what environment variables to set
4. Read error logs → understand if it's a code bug or infra issue
5. Know that `npm install` downloads dependencies, `npm start` runs the app

---

## 2.2 — React Frontend (What You Need to Know)

### You Don't Deploy React Code. You Deploy the BUILD Output.

```
Developer's machine:                    Your EC2:
┌──────────────────────┐               ┌──────────────────┐
│ src/                  │               │ dist/             │
│   App.jsx (React)     │  npm run      │   index.html     │
│   components/         │  build        │   assets/        │
│   pages/              │  ──────────►  │     main.js      │
│   styles/             │               │     style.css    │
│                       │               │                  │
│ (Human-readable code) │               │ (Minified mess)  │
└──────────────────────┘               └──────────────────┘
                                         ↑
                                    You only deal with THIS
```

**Key insight:** You never need to understand React source code in detail. You just serve the `dist/` folder with Nginx. It's just static files.

**But if something breaks, you should know:**
- If the API URL is wrong in the frontend build, the frontend can't talk to backend
- The frontend calls the backend via URLs like `/api/tasks`
- If Nginx proxy_pass is wrong, frontend gets errors

---

## 2.3 — MongoDB Basics (Your Database)

```
SQL (MySQL/Oracle you may know)    →    MongoDB (NoSQL)
─────────────────────────────────────────────────────────
Database                            →    Database
Table                               →    Collection
Row                                 →    Document
Column                              →    Field
SQL queries                         →    MongoDB queries

MySQL:                                   MongoDB:
┌─────┬──────────────┬───────────┐      {
│ id  │ title        │ completed │        "_id": "abc123",
├─────┼──────────────┼───────────┤        "title": "Learn Docker",
│ 1   │ Learn Docker │ false     │        "completed": false,
│ 2   │ Learn CI/CD  │ true      │        "createdAt": "2026-06-01"
└─────┴──────────────┴───────────┘      }
```

**Why MongoDB Atlas (cloud)?**
- Free tier: 512MB storage (plenty for learning)
- No need to install MongoDB on your EC2
- Your app connects to it via a URL (in .env file)
- Less things to manage on your server

---
---

# STAGE 3: DEVOPS TOOLS (The Main Learning)

> **Goal:** Learn one tool at a time. Each tool solves ONE specific problem.

---

## Phase 1: Docker (Containerization)

### The Problem It Solves
```
Without Docker:
  "I installed Node 18 on EC2 but the app needs Node 16"
  "It works on my laptop but crashes on server"
  "I need to install 15 things just to run this app"

With Docker:
  App + ALL its dependencies = ONE package (container)
  Runs the SAME way on any computer
  No "it works on my machine" problems
```

### Concept in Simple Words
```
Docker Image  = Recipe (like a frozen pizza — has everything inside)
Docker Container = Running instance (the pizza, baked and ready to eat)
Dockerfile = Instructions to build the image (the recipe card)

Real example:
  Dockerfile says:
    1. Start with Node.js 18 (base image)
    2. Copy my code into the container
    3. Run npm install (download dependencies)
    4. When started, run "node server.js"
  
  Result: ONE file (image) that has Node.js 18 + your code + all dependencies
  Anyone can run it with ONE command: docker run my-app
```

### What You'll Practice
1. Write a Dockerfile for the backend
2. Build an image (`docker build`)
3. Run a container (`docker run`)
4. Write docker-compose.yml (run backend + frontend together)
5. Understand volumes, ports, networks

### Key Commands
```bash
docker build -t my-backend .           # Build image from Dockerfile
docker run -p 5000:5000 my-backend     # Run container, expose port
docker ps                              # See running containers
docker logs <container-id>             # See container output
docker stop <container-id>             # Stop a container
docker-compose up -d                   # Start all services defined in compose file
docker-compose down                    # Stop all services
```

**Interview answer:** "Docker packages the application with all dependencies into an isolated container that runs consistently across any environment, eliminating environment-specific issues."

---

## Phase 2: CI/CD (GitHub Actions)

### The Problem It Solves
```
Without CI/CD (what you do now):
  Developer pushes code → tells you → you SSH → git pull → pm2 restart
  Takes 5-10 minutes, manual, error-prone

With CI/CD:
  Developer pushes code → AUTOMATICALLY:
    1. Tests run (catch bugs before deploy)
    2. Docker image built
    3. Deployed to EC2
    4. You get notified only if something fails
  Takes 2-3 minutes, zero manual work
```

### Concept in Simple Words
```
CI = Continuous Integration
  "Every time code is pushed, automatically test it"
  Catches bugs BEFORE they reach production

CD = Continuous Deployment
  "After tests pass, automatically deploy to server"
  No manual SSH needed

GitHub Actions = Free CI/CD tool built into GitHub
  You write a .yml file that says:
    "When code is pushed to main branch:
      1. Run tests
      2. Build Docker image
      3. SSH to EC2 and deploy"
```

### What You'll Practice
1. Write a GitHub Actions workflow file
2. Auto-run tests on push
3. Auto-deploy to EC2 on push to main
4. Store secrets (SSH key, server IP) in GitHub Secrets
5. Understand workflow, jobs, steps

**Interview answer:** "CI/CD automates the build, test, and deployment process. On every push, GitHub Actions runs tests to catch issues early, then deploys to production automatically, reducing manual effort and human error."

---

## Phase 3: Terraform (Infrastructure as Code)

### The Problem It Solves
```
Without Terraform (what you do now):
  Open AWS Console → click buttons to create EC2
  Can't remember exact settings next time
  If server dies, recreate manually from memory
  No version control of infrastructure

With Terraform:
  Write code that DESCRIBES your infrastructure
  Run one command → AWS creates everything
  Infrastructure is version-controlled (like code in Git)
  Can recreate entire setup in minutes
  Can destroy everything when done (save money)
```

### Concept in Simple Words
```
Terraform file says:
  "I want:
    - 1 EC2 instance, t2.micro, Ubuntu
    - 1 Security Group allowing ports 22, 80, 5000
    - 1 Key Pair for SSH access"

You run: terraform apply
Result: AWS creates all of the above automatically

You run: terraform destroy
Result: Everything deleted (no cost when not using)
```

### What You'll Practice
1. Install Terraform
2. Write `.tf` files for EC2 + Security Group
3. `terraform init` → `terraform plan` → `terraform apply`
4. `terraform destroy` (save money!)
5. Understand state file, variables, outputs

**Interview answer:** "Terraform enables Infrastructure as Code — I define cloud resources in declarative config files, version-control them with Git, and can reproducibly create or destroy entire environments with a single command."

---

## Phase 4: Ansible (Configuration Management)

### The Problem It Solves
```
Without Ansible (what you do now):
  SSH into new server → manually install Node, Nginx, Docker, PM2
  Type 20+ commands
  Forget a step → app doesn't work
  New server? Do it ALL again from memory

With Ansible:
  Write a "playbook" that lists ALL setup steps
  Run ONE command → server is fully configured
  Idempotent: run it 10 times, same result (safe to re-run)
  New server? Same playbook, instant setup
```

### Concept in Simple Words
```
Ansible playbook says:
  "On the target server:
    1. Install Node.js 18
    2. Install Nginx
    3. Install PM2
    4. Copy nginx.conf to /etc/nginx/
    5. Start Nginx service
    6. Clone the repo
    7. Run npm install
    8. Start app with PM2"

You run: ansible-playbook setup.yml
Result: Server goes from blank to fully running in 3 minutes
```

### What You'll Practice
1. Write a playbook to install Node + Nginx + PM2
2. Write a playbook to deploy the app
3. Understand inventory (which servers to configure)
4. Understand roles (reusable playbook modules)

**Interview answer:** "Ansible automates server configuration. I write idempotent playbooks in YAML that install software, configure services, and deploy applications. Being agentless, it only needs SSH access to the target servers."

---

## Phase 5: Docker Compose (Multi-Container Apps)

### The Problem It Solves
```
Your app has: Backend + Frontend + (maybe) Redis/DB
Running them separately: start each one manually, configure networking

With Docker Compose:
  ONE file (docker-compose.yml) defines ALL services
  ONE command (docker-compose up) starts EVERYTHING
  Containers can talk to each other by name
  Health checks auto-restart crashed containers
```

### What You'll Practice
1. Write docker-compose.yml with backend + nginx (serving frontend)
2. Configure container networking
3. Add health checks
4. Understand volumes for persistent data

---

## Phase 6: Monitoring & Logging

### The Problem It Solves
```
Without monitoring (what you do now):
  User says "app is down" → you SSH → check manually
  No idea if app is slow, using too much memory, or erroring

With monitoring:
  Dashboard shows CPU, memory, request count, error rate
  Alert fires BEFORE user notices → you fix proactively
  Logs are searchable → find errors in seconds
```

### What You'll Practice
1. CloudWatch basics (free tier — CPU, disk, network metrics)
2. Application logging (structured logs from Node.js)
3. (Optional) Prometheus + Grafana in Docker containers on EC2
4. Set up alerts (email when CPU > 80%)

**Interview answer:** "I use monitoring to proactively detect issues. CloudWatch tracks infrastructure metrics, application logs provide request-level visibility, and alerts notify the team before users are impacted."

---

## Phase 7: Kubernetes Basics (Concepts + Minikube)

### The Problem It Solves
```
Docker Compose: good for 1 server
Kubernetes: good for 10-1000 servers

Kubernetes handles:
  - Auto-restart crashed containers
  - Scale up/down based on traffic
  - Rolling updates (zero downtime deploys)
  - Service discovery (containers find each other)
  - Secret management
```

### What You'll Practice (On EC2 with Minikube)
1. Understand Pods, Deployments, Services
2. Write YAML manifests
3. Deploy your app on Minikube
4. kubectl commands

**Note:** Real K8s (EKS) costs ~$70/month. Use Minikube on EC2 for learning (free).

---
---

# STAGE 4: PUTTING IT ALL TOGETHER

---

## The Full Pipeline (What You'll Have Built)

```
Developer pushes code to GitHub
         │
         ▼
GitHub Actions triggers:
  ├── Run tests
  ├── Build Docker image
  ├── Push to Docker Hub (or ECR)
  └── SSH to EC2 and deploy
         │
         ▼
EC2 (created by Terraform, configured by Ansible):
  ├── Docker pulls new image
  ├── docker-compose restarts services
  ├── Health check passes
  └── Nginx routes traffic
         │
         ▼
Monitoring:
  ├── CloudWatch tracks metrics
  ├── Logs collected
  └── Alerts if anything fails
         │
         ▼
You: sleeping peacefully, get alerted only if something breaks 😄
```

---
---

# 📅 IMPLEMENTATION ORDER (Step by Step)

> Do EXACTLY this order. Don't skip. Don't jump ahead.

## Week 1-2: Foundations + App Setup

| Day | What To Do | Where |
|-----|-----------|-------|
| 1 | Launch EC2, SSH in, run install commands | AWS Console + Terminal |
| 2 | Practice Linux commands from Stage 1.1 | EC2 |
| 3 | Practice networking concepts (curl, ports, security groups) | EC2 |
| 4 | Set up GitHub repo, practice git commands | EC2 + GitHub |
| 5 | Clone the Task Manager app, deploy manually (Phase 0) | EC2 |
| 6 | Write deploy.sh script (Stage 1.4) | EC2 |
| 7 | Read and understand the backend code (Stage 2.1) | VS Code |
| 8-14 | Practice: break things, fix them, understand error messages | EC2 |

**Milestone:** You can explain EVERY step of your current deployment process.

## Week 3-4: Docker

| Day | What To Do | Where |
|-----|-----------|-------|
| 15 | Learn Docker concepts (read Phase 1 section above) | Theory |
| 16 | Write Dockerfile for backend | VS Code → EC2 |
| 17 | Build image, run container, test it | EC2 |
| 18 | Write Dockerfile for frontend (Nginx + dist) | VS Code → EC2 |
| 19 | Write docker-compose.yml (both services) | VS Code → EC2 |
| 20 | Deploy app using docker-compose instead of PM2 | EC2 |
| 21-28 | Practice: modify code, rebuild image, redeploy | EC2 |

**Milestone:** App runs in Docker containers. You can explain Docker vs PM2.

## Week 5-6: CI/CD

| Day | What To Do | Where |
|-----|-----------|-------|
| 29 | Learn GitHub Actions concepts | Theory |
| 30 | Write first workflow: run tests on push | GitHub |
| 31 | Add deployment step: SSH to EC2, pull, restart | GitHub |
| 32 | Store secrets in GitHub (SSH key, server IP) | GitHub Settings |
| 33 | Full pipeline: push code → auto deploy | Test end-to-end |
| 34-42 | Practice: push code changes, watch auto deployment | GitHub + EC2 |

**Milestone:** Push code → app auto deploys. No manual SSH needed.

## Week 7-8: Terraform + Ansible

| Day | What To Do | Where |
|-----|-----------|-------|
| 43 | Learn Terraform concepts | Theory |
| 44 | Write main.tf for EC2 + Security Group | VS Code |
| 45 | terraform init → plan → apply (create EC2 from code!) | EC2/Laptop |
| 46 | terraform destroy (save money!) | Terminal |
| 47 | Learn Ansible concepts | Theory |
| 48 | Write playbook to install Node + Nginx + Docker | VS Code |
| 49 | Run playbook against your EC2 | Terminal |
| 50-56 | Practice: destroy infra, recreate with Terraform, configure with Ansible | Full cycle |

**Milestone:** One command creates server. Another configures it. Destroy when done.

## Week 9-10: Monitoring + Kubernetes Basics

| Day | What To Do | Where |
|-----|-----------|-------|
| 57 | Set up CloudWatch monitoring for EC2 | AWS Console |
| 58 | Add application logging to Node.js | Code |
| 59 | (Optional) Run Prometheus + Grafana in Docker | EC2 |
| 60 | Learn Kubernetes concepts | Theory |
| 61 | Install Minikube on EC2 | EC2 |
| 62 | Write deployment.yml and service.yml | VS Code |
| 63 | Deploy app on Minikube | EC2 |
| 64-70 | Practice kubectl, scale pods, roll back deployments | EC2 |

**Milestone:** You understand K8s concepts and can demo a basic deployment.

---

## 🎤 After 10 Weeks — Interview Ready

You can now confidently explain:

| Question | Your Answer |
|----------|-------------|
| "Walk me through your deployment pipeline" | Code push → GitHub Actions runs tests → builds Docker image → deploys to EC2 via SSH → monitoring confirms health |
| "How do you manage infrastructure?" | Terraform creates EC2/SG/VPC from code, Ansible configures it, everything version-controlled |
| "What if the server dies?" | Terraform recreate + Ansible configure = new server in 5 min |
| "How do you handle secrets?" | .env locally, GitHub Secrets in CI/CD, never committed to code |
| "Docker vs VM?" | Docker is lightweight (shares OS kernel), starts in seconds, consistent across environments |
| "What monitoring do you use?" | CloudWatch for infra metrics, application logs for debugging, alerts for proactive response |
| "Kubernetes experience?" | Understand pods/deployments/services, practiced with Minikube, know kubectl commands |

---

## ⏭️ WHAT TO DO RIGHT NOW

1. **Read Stage 1 completely** — understand what you're already doing
2. **Launch EC2** (or use your existing one)
3. **Practice Linux commands** from section 1.1 — don't just read, TYPE them
4. **Tell me when ready** — I'll create the actual Task Manager app code for you to deploy
5. **Follow the week-by-week plan** — don't skip ahead

**Rules:**
- STOP EC2 when not practicing (save credits)
- Practice 1-2 hours daily (consistency > marathon sessions)
- If stuck, ask me — I'll explain at your level
- Don't just copy-paste — type commands, read output, understand what happened
