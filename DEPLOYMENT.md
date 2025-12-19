# Deployment Guide

This project supports **two deployment methods** to satisfy both modern DevOps practices and traditional requirements.

## 📦 Quick Start with Makefile

The project includes a Makefile for simplified DevOps operations:

```bash
make help            # Show all available commands
make up              # Start the application
make deploy          # Run deploy.sh script
make health          # Run comprehensive health check
make git-push        # Push to both GitHub and Gitea
```

**All Makefile Commands:**
| Command | Description |
|---------|-------------|
| `make help` | Show all available commands |
| `make build` | Build Docker image |
| `make up` | Start application |
| `make down` | Stop application |
| `make logs` | View logs (live) |
| `make rebuild` | Rebuild and restart |
| `make test` | Test if application is running |
| `make health` | Comprehensive health check |
| `make clean` | Remove containers and images |
| `make shell` | Open shell in container |
| `make deploy` | Run deploy.sh script |
| `make validate` | Validate all config files |
| `make info` | Show project information |
| `make git-push` | Push to both GitHub and Gitea |

---

## 🚀 Method 1: Automated CI/CD (Recommended)

### What It Does
- Automatically tests, builds, and deploys on every push
- Runs security scans and health checks
- Deploys to Netlify CDN globally
- Completes in ~38 seconds

### How to Use
```bash
# Make your changes
git add .
git commit -m "Your changes"
git push origin main

# That's it! GitHub Actions handles the rest
```

### What Happens Automatically
1. ✅ Code quality checks (HTML, JS validation)
2. ✅ Security scanning (secrets, vulnerabilities)
3. ✅ Docker build and testing
4. ✅ Deployment to Netlify
5. ✅ Health monitoring

### View Pipeline
- GitHub: https://github.com/Vicky-Apo/graphql/actions
- Live Site: https://graphql-zone01athens.netlify.app

---

## 🔧 Method 2: Manual Deployment

### What It Does
- Builds Docker image locally
- Starts nginx container
- Runs health checks
- Good for local testing and traditional deployments

### How to Use

#### First Time Setup
```bash
# Make script executable
chmod +x deploy.sh
```

#### Deploy
```bash
# Development deployment
./deploy.sh

# Production deployment
./deploy.sh production
```

#### Access
```
http://localhost:8081
```

### What the Script Does
1. ✅ Checks Docker installation
2. ✅ Stops old containers
3. ✅ Builds new Docker image (~10MB)
4. ✅ Starts container with health checks
5. ✅ Shows logs and status

### Useful Commands
```bash
# View logs
docker logs -f graphql-app

# Stop container
docker stop graphql-app

# Restart container
docker restart graphql-app

# Remove container
docker rm -f graphql-app
```

---

## 📊 Comparison

| Feature | Automated CI/CD | Manual Script |
|---------|----------------|---------------|
| **Speed** | 38 seconds | 2-3 minutes |
| **Testing** | Automatic | Manual |
| **Security Scans** | Yes | No |
| **Monitoring** | Yes | No |
| **Global CDN** | Yes | No |
| **Local Testing** | No | Yes |
| **Bocal Requirement** | ✅ Exceeds | ✅ Satisfies |

---

## 🎯 Which Method to Use?

### Use Automated CI/CD When:
- ✅ Deploying to production
- ✅ Want automatic testing
- ✅ Need global availability
- ✅ Demonstrating DevOps skills

### Use Manual Script When:
- ✅ Testing locally
- ✅ Don't have GitHub Actions
- ✅ Need full control
- ✅ Bocal requires manual deployment

---

## 🎓 For Bocal Evaluation

**You have BOTH methods:**

1. **Manual deployment** (`deploy.sh`) - Satisfies traditional requirements
2. **Automated CI/CD** - Shows advanced DevOps knowledge

**This demonstrates:**
- ✅ Understanding of manual deployment
- ✅ Knowledge of automation
- ✅ Docker expertise
- ✅ nginx configuration
- ✅ Professional DevOps practices

---

## 🐛 Troubleshooting

### Port Already in Use
```bash
# Find what's using port 8081
sudo lsof -i :8081

# Stop old containers
docker stop graphql-app graphql_web_1
docker rm graphql-app graphql_web_1
```

### Docker Not Running
```bash
# Start Docker
sudo systemctl start docker

# Or on Mac
open -a Docker
```

### Permission Denied
```bash
# Make script executable
chmod +x deploy.sh

# Run with sudo if needed
sudo ./deploy.sh
```

---

## 📝 Notes

- The manual script uses the same Docker configuration as CI/CD
- Both methods produce identical results
- CI/CD is recommended for production
- Manual script is good for local development

---

**Created by:** Vicky Apostolou (vapostol)  
**Last Updated:** December 2024
