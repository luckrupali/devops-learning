# Phase 1: Docker — Containerize Your App

> **Why Docker?** In Phase 0, you installed Node.js, PM2, Nginx manually on EC2.
> If you set up a SECOND server, you'd repeat all those steps.
> Docker packages your app + all its dependencies into a single "container"
> that runs the SAME way on any machine. Install once, run anywhere.

---

## What You're About to Do

```
PHASE 0 (Manual):                    PHASE 1 (Docker):
┌─────────────────────┐              ┌─────────────────────────────┐
│ EC2 Server          │              │ EC2 Server                  │
│                     │              │                             │
│  Node.js (apt)      │              │  Docker Engine              │
│  PM2 (npm global)   │              │  ┌───────────────────────┐  │
│  Nginx (apt)        │     →→→      │  │ Container: backend    │  │
│  Your code (git)    │              │  │  Node.js + your code  │  │
│  .env file          │              │  └───────────────────────┘  │
│                     │              │  ┌───────────────────────┐  │
│                     │              │  │ Container: frontend   │  │
│                     │              │  │  Nginx + dist files   │  │
│                     │              │  └───────────────────────┘  │
└─────────────────────┘              └─────────────────────────────┘
```

**Key difference:**
- Phase 0: You installed everything directly on the server (like installing apps on your Windows)
- Phase 1: Everything runs inside isolated containers (like running apps inside VMs, but lighter)

---

## Concepts You Need to Understand

### What is a Container?

A container is a **lightweight, isolated environment** that has everything needed to run your app:
- The OS libraries it needs
- The runtime (Node.js, Python, etc.)
- Your application code
- Dependencies (node_modules)

**Analogy:** Think of shipping containers on a cargo ship.
- Each container is sealed and independent
- The ship (Docker Engine) doesn't care what's inside
- Works the same on any ship (any server)

### Image vs Container

| Concept | Analogy | What it is |
|---------|---------|------------|
| **Image** | Recipe/Blueprint | A read-only template. Built from Dockerfile |
| **Container** | The actual dish | A running instance of an image |

- You BUILD an image once
- You RUN containers from that image (can run many copies)
- Like: Class (image) vs Object (container) in Java

### Dockerfile vs docker-compose.yml

| File | Purpose | Analogy |
|------|---------|---------|
| `Dockerfile` | Recipe for ONE image | Cooking recipe for one dish |
| `docker-compose.yml` | Run MULTIPLE containers together | Menu for the whole meal |

---

## New Files Created

```
devops-learning/
├── docker-compose.yml          ← Orchestrates all containers
├── app/
│   ├── backend/
│   │   ├── Dockerfile          ← How to build backend image
│   │   └── .dockerignore       ← Files to exclude from image
│   └── frontend/
│       ├── Dockerfile          ← How to build frontend image (multi-stage)
│       ├── nginx.conf          ← Nginx config for the frontend container
│       └── .dockerignore       ← Files to exclude from image
```

---

## PART A: Understand the Dockerfiles

### Backend Dockerfile (`app/backend/Dockerfile`)

```dockerfile
FROM node:18-alpine          # Start with Node.js on tiny Alpine Linux
WORKDIR /app                 # Create and enter /app directory
COPY package.json ./         # Copy package.json first (for caching)
RUN npm install --production # Install dependencies
COPY . .                     # Copy the rest of the code
EXPOSE 5000                  # Document which port is used
CMD ["node", "server.js"]    # Start the app
```

**What each layer does:**
1. Downloads a mini Linux with Node.js already installed (~50MB)
2. Creates a working directory inside the container
3. Copies ONLY package.json (so Docker can cache the next step)
4. Installs node_modules (cached if package.json unchanged!)
5. Copies your actual code (server.js, routes/, models/)
6. Documents that the app uses port 5000
7. Starts the server when the container launches

### Frontend Dockerfile (`app/frontend/Dockerfile`) — Multi-Stage

```dockerfile
# STAGE 1: Build the React app
FROM node:18-alpine AS builder
WORKDIR /app
COPY package.json ./
RUN npm install
COPY . .
RUN npm run build              # Creates dist/ folder

# STAGE 2: Serve with Nginx
FROM nginx:alpine
COPY nginx.conf /etc/nginx/conf.d/default.conf
COPY --from=builder /app/dist /usr/share/nginx/html
CMD ["nginx", "-g", "daemon off;"]
```

**Why two stages?**
- Building needs Node.js (300MB+)
- Serving only needs Nginx (25MB)
- Final image = just Nginx + your tiny dist/ files
- Result: ~30MB image instead of ~500MB

---

## PART B: Deploy with Docker on EC2

### Step 1: SSH into EC2

```powershell
ssh -i "C:\Users\Rupali\Downloads\devops-learning-key.pem" ubuntu@YOUR_EC2_PUBLIC_IP
```

### Step 2: Stop the Old Manual Deployment

```bash
# Stop PM2 (we're replacing it with Docker)
pm2 stop all
pm2 delete all

# Stop Nginx (Docker will run its own Nginx inside a container)
sudo systemctl stop nginx
sudo systemctl disable nginx
```

### Step 3: Pull Latest Code

```bash
cd ~/devops-learning
git pull origin main
```

### Step 4: Create the .env File (for Docker Compose)

Docker Compose reads `.env` from the same directory as `docker-compose.yml`:

```bash
cd ~/devops-learning

# Create .env in the project root (where docker-compose.yml is)
nano .env
```

Add your MongoDB connection string:
```
MONGODB_URI=mongodb+srv://taskadmin:YourPassword@taskmanager.pnxua9p.mongodb.net/taskmanager?retryWrites=true&w=majority
```

Save: `Ctrl+X` → `Y` → `Enter`

### Step 5: Build and Start Everything

```bash
cd ~/devops-learning

# Build images and start containers (detached mode)
docker compose up -d --build
```

**What this does:**
1. Reads `docker-compose.yml`
2. Builds backend image from `app/backend/Dockerfile`
3. Builds frontend image from `app/frontend/Dockerfile`
4. Creates a Docker network (so containers can talk to each other)
5. Starts backend container (port 5000)
6. Waits for backend health check to pass
7. Starts frontend container (port 80)

**First time takes 2-3 minutes** (downloading base images). After that, rebuilds are fast due to caching.

### Step 6: Verify It's Running

```bash
# See running containers
docker compose ps
# Should show:
# NAME                    STATUS          PORTS
# taskmanager-backend     Up (healthy)    0.0.0.0:5000->5000/tcp
# taskmanager-frontend    Up              0.0.0.0:80->80/tcp

# Check backend logs
docker compose logs backend
# Should show: ✅ Connected to MongoDB
#              🚀 Server running on port 5000

# Check frontend logs
docker compose logs frontend

# Test backend directly
curl http://localhost:5000/health
# {"status":"ok","timestamp":"..."}

# Test through frontend (Nginx in container)
curl http://localhost/api/tasks
# []
```

### Step 7: Open in Browser

Go to `http://YOUR_EC2_PUBLIC_IP` — you should see the Task Manager app!

---

## PART C: Common Docker Commands

```bash
# ── Lifecycle ──
docker compose up -d              # Start all containers (background)
docker compose down               # Stop and remove all containers
docker compose restart             # Restart all containers
docker compose up -d --build      # Rebuild images + restart

# ── Monitoring ──
docker compose ps                  # Show running containers
docker compose logs -f             # Follow all logs (Ctrl+C to stop)
docker compose logs backend        # Logs for one service
docker compose logs -f --tail=20 backend  # Last 20 lines, follow

# ── Debugging ──
docker compose exec backend sh     # Open shell INSIDE backend container
docker compose exec frontend sh    # Open shell INSIDE frontend container
# (type "exit" to leave)

# ── Images ──
docker images                      # List all images on this machine
docker image prune -a              # Remove unused images (free space)

# ── Nuclear option ──
docker compose down --volumes --rmi all  # Remove EVERYTHING (clean start)
```

---

## PART D: Updating Your App (New Deployment Flow)

**Before (Phase 0 — 6 commands):**
```bash
cd ~/server && git pull && npm install && pm2 restart backend
cd ~/client && git pull
```

**Now (Phase 1 — 2 commands):**
```bash
cd ~/devops-learning
git pull && docker compose up -d --build
```

That's it! Docker rebuilds only what changed (cached layers make it fast).

---

## What Just Happened (Docker Version)

```
1. Browser → http://EC2-IP (port 80)
         │
         ▼
2. Docker routes port 80 → frontend container
         │
         ▼
3. Nginx (inside frontend container) receives request
   URL is "/" → serves /usr/share/nginx/html/index.html
         │
         ▼
4. React loads, calls fetch('/api/tasks')
         │
         ▼
5. Nginx sees /api/* → proxy_pass to http://backend:5000
   "backend" = Docker DNS → resolves to backend container's IP
         │
         ▼
6. Node.js (inside backend container) handles the request
   → queries MongoDB Atlas → returns JSON
         │
         ▼
7. Response: backend container → frontend container → browser
```

**Key difference from Phase 0:** Nginx now talks to `backend` (Docker service name) instead of `localhost:5000`. Docker's internal network handles the routing.

---

## Troubleshooting

| Problem | How to Check | Fix |
|---------|-------------|-----|
| Container won't start | `docker compose logs backend` | Check error message |
| MongoDB connection failed | `docker compose logs backend` | Check .env file in project root |
| Port 80 already in use | `ss -tlnp \| grep :80` | `sudo systemctl stop nginx` (the host Nginx) |
| Frontend can't reach backend | `docker compose logs frontend` | Make sure backend is "healthy" in `docker compose ps` |
| Old images taking space | `docker images` | `docker image prune -a` |
| Need clean start | — | `docker compose down --volumes --rmi all` then rebuild |
| Build fails (npm install) | Check Dockerfile | Make sure .dockerignore excludes node_modules |

---

## What You Learned in Phase 1

- ✅ What Docker is and why it's used (consistency, portability)
- ✅ Image vs Container (blueprint vs running instance)
- ✅ How to write a Dockerfile (recipe for an image)
- ✅ Multi-stage builds (build big, ship small)
- ✅ Docker Compose (orchestrate multiple containers)
- ✅ How containers communicate (Docker internal DNS)
- ✅ New deployment workflow (git pull + docker compose up)

---

## Key Takeaway for Interviews

> "We containerized our Node.js backend and React frontend using Docker.
> The backend runs in a Node.js Alpine container, and the frontend uses a
> multi-stage build — compiles React with Node, then serves the static files
> with Nginx Alpine. Docker Compose orchestrates both services with health
> checks and automatic restarts. Deployment is just `git pull && docker compose up --build`."

---

## What's Next?

**Phase 2: CI/CD (GitHub Actions)** — Instead of SSH + git pull + docker compose up manually,
GitHub will AUTOMATICALLY build and deploy when you push code. Tell me when you're ready!
