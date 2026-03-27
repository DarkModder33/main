# Build stage
FROM node:24-alpine AS builder

WORKDIR /app/web

# Copy web directory package files
COPY web/package*.json ./

# Install dependencies
RUN npm ci

# Copy entire project
COPY . ..

# Build the application
RUN npm run build

# Runtime stage
FROM node:24-alpine

WORKDIR /app

# Install dumb-init and a simple HTTP server
RUN apk add --no-cache dumb-init

# Create non-root user for security
RUN addgroup -g 1001 -S nodejs && \
    adduser -S nextjs -u 1001

# Copy only necessary files from builder
COPY --from=builder --chown=nextjs:nodejs /app/web/dist ./dist

# Copy environment template
COPY --chown=nextjs:nodejs .env.example ./

# Switch to non-root user
USER nextjs

# Expose port
EXPOSE 3000

# Health check
HEALTHCHECK --interval=30s --timeout=3s --start-period=5s --retries=3 \
  CMD node -e "require('http').get('http://localhost:3000', (r) => {if (r.statusCode !== 200) throw new Error(r.statusCode)})" || exit 1

# Use dumb-init to handle signals properly
ENTRYPOINT ["dumb-init", "--"]

# Serve dist folder with a simple Node HTTP server
CMD ["node", "-e", "const http = require('http'); const fs = require('fs'); const path = require('path'); const server = http.createServer((req, res) => { let file = req.url === '/' ? '/index.html' : req.url; const filepath = path.join('/app/dist', file); if (fs.existsSync(filepath) && fs.statSync(filepath).isFile()) { res.writeHead(200, { 'Content-Type': 'text/html' }); res.end(fs.readFileSync(filepath)); } else if (fs.existsSync(path.join('/app/dist', 'index.html'))) { res.writeHead(200, { 'Content-Type': 'text/html' }); res.end(fs.readFileSync(path.join('/app/dist', 'index.html'))); } else { res.writeHead(404); res.end(); } }); server.listen(3000, () => { console.log('Server running on port 3000'); });"]
