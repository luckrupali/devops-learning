# ============================================================
# Dockerfile — FRONTEND (React app served by Nginx)
# ============================================================
# This is a MULTI-STAGE build (two steps in one Dockerfile):
#
# Stage 1 ("builder"): Install Node, run "npm run build"
#   → Produces the dist/ folder (static HTML/CSS/JS)
#
# Stage 2 ("production"): Copy dist/ into a tiny Nginx image
#   → Serves files on port 80. No Node.js needed at runtime!
#
# Why multi-stage?
#   - Build needs Node.js (big: ~300MB)
#   - Running only needs Nginx (small: ~25MB)
#   - Final image is TINY — faster to deploy
#
# BUILD:  docker build -t taskmanager-frontend .
# RUN:    docker run -p 80:80 taskmanager-frontend
# ============================================================

# ==================== STAGE 1: BUILD ====================
# Install dependencies and build the React app
FROM node:18-alpine AS builder

WORKDIR /app

# Copy package files first (for Docker layer caching)
COPY package.json package-lock.json* ./

# Install ALL dependencies (including dev — need vite to build)
RUN npm install

# Copy source code
COPY . .

# Build the production bundle (creates dist/ folder)
# This is the same as running "npm run build" on your laptop
RUN npm run build

# ==================== STAGE 2: SERVE ====================
# Use a tiny Nginx image to serve the built files
FROM nginx:alpine

# Copy our custom Nginx config
# This handles React routing (try_files → /index.html)
COPY nginx.conf /etc/nginx/conf.d/default.conf

# Copy the built files from Stage 1 into Nginx's serve folder
COPY --from=builder /app/dist /usr/share/nginx/html

# Nginx listens on port 80 by default
EXPOSE 80

# Start Nginx in the foreground (Docker requirement)
CMD ["nginx", "-g", "daemon off;"]
