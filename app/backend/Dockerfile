# ============================================================
# Dockerfile — BACKEND (Node.js API)
# ============================================================
# A Dockerfile is like a RECIPE to build a container image.
# Think of it as: "Instructions to set up a brand new computer
# that ONLY runs our backend app."
#
# Each line creates a LAYER (like a step in the recipe).
# Docker caches layers, so unchanged steps are instant on rebuild.
#
# BUILD:  docker build -t taskmanager-backend .
# RUN:    docker run -p 5000:5000 --env-file .env taskmanager-backend
# ============================================================

# ---------- STEP 1: Start from a base image ----------
# "node:18-alpine" = a tiny Linux (Alpine) with Node.js 18 pre-installed
# Alpine is only ~5MB vs ~900MB for Ubuntu. Smaller = faster deploys.
# Think of it as: "Start with a fresh mini-computer that has Node installed"
FROM node:18-alpine

# ---------- STEP 2: Set the working directory ----------
# All following commands run INSIDE this folder in the container
# Like doing: mkdir /app && cd /app
WORKDIR /app

# ---------- STEP 3: Copy package files FIRST ----------
# WHY separate from copying all files?
# Docker caches each layer. If package.json hasn't changed,
# Docker skips "npm install" on rebuild (saves minutes!)
COPY package.json package-lock.json* ./

# ---------- STEP 4: Install dependencies ----------
# --production = don't install devDependencies (nodemon etc.)
# This downloads all libraries listed in package.json
RUN npm install --production

# ---------- STEP 5: Copy the rest of the app code ----------
# Now copy server.js, models/, routes/ into the container
COPY . .

# ---------- STEP 6: Tell Docker which port the app uses ----------
# This is documentation — it doesn't actually open the port
# You still need -p 5000:5000 when running the container
EXPOSE 5000

# ---------- STEP 7: The command to START the app ----------
# When the container starts, run this command
# Same as typing "node server.js" in a terminal
CMD ["node", "server.js"]
