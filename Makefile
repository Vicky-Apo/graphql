# Variables - can be customized
IMAGE_NAME = graphql-profile
CONTAINER_NAME = graphql-app
PORT = 8081
NETLIFY_URL = https://graphql-zone01athens.netlify.app

# Default target (runs when you just type 'make')
.DEFAULT_GOAL := help

# Help target - shows all available commands
help: ## Show this help message
	@echo "=========================================="
	@echo "  GraphQL Profile - Available Commands"
	@echo "=========================================="
	@echo ""
	@grep -E '^[a-zA-Z_-]+:.*?## .*$$' $(MAKEFILE_LIST) | awk 'BEGIN {FS = ":.*?## "}; {printf "  \033[36m%-20s\033[0m %s\n", $$1, $$2}'
	@echo ""
	@echo "Examples:"
	@echo "  make up          # Start the application"
	@echo "  make logs        # View application logs"
	@echo "  make test        # Test if application is running"
	@echo ""

# Build Docker image
build: ## Build the Docker image
	@echo "Building Docker image..."
	docker build -t $(IMAGE_NAME):latest .
	@echo "✓ Image built successfully"

# Run container using docker-compose
up: ## Start the application using docker-compose
	@echo "Starting application..."
	docker-compose up -d
	@echo "✓ Application running at http://localhost:$(PORT)"

# Stop container using docker-compose
down: ## Stop the application using docker-compose
	@echo "Stopping application..."
	@docker-compose down 2>/dev/null || true
	@echo "✓ Application stopped"

# Remove containers and volumes (keeps images)
remove: ## Remove containers, networks, and volumes (keeps images)
	@echo "Removing containers and volumes..."
	@docker-compose down -v 2>/dev/null || true
	@echo "✓ Containers and volumes removed"

# View logs
logs: ## View application logs
	docker-compose logs -f

# Rebuild and restart
rebuild: ## Rebuild image and restart container
	@echo "Rebuilding and restarting..."
	docker-compose up -d --build
	@echo "✓ Application rebuilt and restarted"

# Clean up - remove containers, images, and volumes
clean: ## Remove containers, images, and volumes
	@echo "Cleaning up..."
	@docker-compose down -v 2>/dev/null || true
	@docker rmi $(IMAGE_NAME):latest 2>/dev/null || true
	@echo "✓ Cleanup complete"

# Run container directly (without docker-compose)
run: build ## Build and run container directly
	@echo "Running container..."
	@docker stop $(CONTAINER_NAME) 2>/dev/null || true
	@docker rm $(CONTAINER_NAME) 2>/dev/null || true
	docker run -d -p $(PORT):80 --name $(CONTAINER_NAME) $(IMAGE_NAME):latest
	@echo "✓ Container running at http://localhost:$(PORT)"

# Stop container (direct run)
stop: ## Stop the container (if run directly)
	@echo "Stopping container..."
	@docker stop $(CONTAINER_NAME) 2>/dev/null || true
	@docker rm $(CONTAINER_NAME) 2>/dev/null || true
	@echo "✓ Container stopped"

# Test the application
test: ## Test if the application is running
	@echo "Testing application..."
	@curl -f http://localhost:$(PORT) > /dev/null 2>&1 && echo "✓ Application is running!" || echo "✗ Application is not responding"

# Show container status
status: ## Show container status
	@echo "Container status:"
	@docker ps -a --filter "name=$(CONTAINER_NAME)" --format "table {{.Names}}\t{{.Status}}\t{{.Ports}}" 2>/dev/null || docker-compose ps

# Shell into container (for debugging)
shell: ## Open a shell in the running container
	@echo "Opening shell in container..."
	@docker exec -it $(CONTAINER_NAME) sh 2>/dev/null || docker-compose exec web sh

# Deploy manually using deploy.sh script
deploy: ## Deploy using the deploy.sh script
	@echo "Running deployment script..."
	./deploy.sh

# Test production site
test-prod: ## Test the production Netlify site
	@echo "Testing production site..."
	@curl -f -I $(NETLIFY_URL) > /dev/null 2>&1 && echo "✓ Production site is online!" || echo "✗ Production site is not responding"

# Health check (comprehensive)
health: ## Run comprehensive health check
	@echo "=========================================="
	@echo "  Health Check"
	@echo "=========================================="
	@echo ""
	@echo "1. Checking Docker..."
	@docker info > /dev/null 2>&1 && echo "   ✓ Docker is running" || echo "   ✗ Docker is not running"
	@echo ""
	@echo "2. Checking local container..."
	@docker ps | grep -q $(CONTAINER_NAME) && echo "   ✓ Container is running" || echo "   ✗ Container is not running"
	@echo ""
	@echo "3. Checking local endpoint..."
	@curl -f http://localhost:$(PORT) > /dev/null 2>&1 && echo "   ✓ Local site responds (http://localhost:$(PORT))" || echo "   ✗ Local site not responding"
	@echo ""
	@echo "4. Checking production site..."
	@curl -f $(NETLIFY_URL) > /dev/null 2>&1 && echo "   ✓ Production site responds ($(NETLIFY_URL))" || echo "   ✗ Production site not responding"
	@echo ""

# Git shortcuts
git-status: ## Show git status
	git status

git-push: ## Push to both GitHub and Gitea
	@echo "Pushing to GitHub..."
	git push origin main
	@echo "Pushing to Gitea..."
	git push github main
	@echo "✓ Pushed to both remotes"

# Show project info
info: ## Show project information
	@echo "=========================================="
	@echo "  Project Information"
	@echo "=========================================="
	@echo ""
	@echo "Image Name:        $(IMAGE_NAME)"
	@echo "Container Name:    $(CONTAINER_NAME)"
	@echo "Local Port:        $(PORT)"
	@echo "Local URL:         http://localhost:$(PORT)"
	@echo "Production URL:    $(NETLIFY_URL)"
	@echo ""
	@echo "GitHub:            https://github.com/Vicky-Apo/graphql"
	@echo "Gitea:             https://platform.zone01.gr/git/vapostol/graphql/"
	@echo ""

# Validate all configuration files
validate: ## Validate Docker and config files
	@echo "Validating configuration files..."
	@echo "1. Checking Dockerfile..."
	@test -f Dockerfile && echo "   ✓ Dockerfile exists" || echo "   ✗ Dockerfile missing"
	@echo "2. Checking docker-compose.yml..."
	@docker-compose config > /dev/null 2>&1 && echo "   ✓ docker-compose.yml is valid" || echo "   ✗ docker-compose.yml has errors"
	@echo "3. Checking nginx.conf..."
	@test -f nginx.conf && echo "   ✓ nginx.conf exists" || echo "   ✗ nginx.conf missing"
	@echo "4. Checking deploy.sh..."
	@test -x deploy.sh && echo "   ✓ deploy.sh is executable" || echo "   ✗ deploy.sh not executable"
	@echo "✓ Validation complete"

.PHONY: help build up down remove logs rebuild clean run stop test status shell deploy test-prod health git-status git-push info validate

