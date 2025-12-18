#!/bin/bash

# Manual Deployment Script for GraphQL Profile
# This script provides an alternative to automated CI/CD deployment
# Usage: ./deploy.sh [environment]
# Example: ./deploy.sh production

set -e  # Exit on any error

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

# Configuration
IMAGE_NAME="graphql-profile"
CONTAINER_NAME="graphql-app"
PORT=8081
ENVIRONMENT=${1:-development}

echo -e "${BLUE}========================================${NC}"
echo -e "${BLUE}  GraphQL Profile Deployment Script${NC}"
echo -e "${BLUE}========================================${NC}"
echo ""
echo -e "${GREEN}Environment:${NC} $ENVIRONMENT"
echo -e "${GREEN}Image:${NC} $IMAGE_NAME"
echo -e "${GREEN}Container:${NC} $CONTAINER_NAME"
echo -e "${GREEN}Port:${NC} $PORT"
echo ""

# Function to print colored messages
print_info() {
    echo -e "${GREEN}[INFO]${NC} $1"
}

print_warn() {
    echo -e "${YELLOW}[WARN]${NC} $1"
}

print_error() {
    echo -e "${RED}[ERROR]${NC} $1"
}

print_success() {
    echo -e "${GREEN}[SUCCESS]${NC} $1"
}

# Check if Docker is installed and running
print_info "Checking Docker installation..."
if ! command -v docker &> /dev/null; then
    print_error "Docker is not installed. Please install Docker first."
    exit 1
fi

if ! docker info &> /dev/null; then
    print_error "Docker is not running. Please start Docker first."
    exit 1
fi
print_success "Docker is installed and running"

# Stop and remove existing container if running
print_info "Stopping existing container (if any)..."
if docker ps -a --format '{{.Names}}' | grep -q "^${CONTAINER_NAME}$"; then
    docker stop "$CONTAINER_NAME" 2>/dev/null || true
    docker rm "$CONTAINER_NAME" 2>/dev/null || true
    print_success "Existing container removed"
else
    print_info "No existing container found"
fi

# Build the Docker image
print_info "Building Docker image..."
docker build -t "$IMAGE_NAME:latest" .
print_success "Docker image built successfully"

# Get image size
IMAGE_SIZE=$(docker images "$IMAGE_NAME:latest" --format "{{.Size}}")
print_info "Image size: $IMAGE_SIZE"

# Start the new container
print_info "Starting new container..."
docker run -d \
    --name "$CONTAINER_NAME" \
    -p "$PORT:80" \
    --restart unless-stopped \
    "$IMAGE_NAME:latest"

# Wait for container to be ready
print_info "Waiting for container to start..."
sleep 5

# Health check
print_info "Performing health check..."
MAX_RETRIES=10
RETRY_COUNT=0

while [ $RETRY_COUNT -lt $MAX_RETRIES ]; do
    if curl -f http://localhost:$PORT > /dev/null 2>&1; then
        print_success "Health check passed!"
        break
    else
        RETRY_COUNT=$((RETRY_COUNT + 1))
        if [ $RETRY_COUNT -lt $MAX_RETRIES ]; then
            print_warn "Health check failed. Retrying... ($RETRY_COUNT/$MAX_RETRIES)"
            sleep 3
        else
            print_error "Health check failed after $MAX_RETRIES attempts"
            print_error "Container logs:"
            docker logs "$CONTAINER_NAME"
            exit 1
        fi
    fi
done

# Show container status
print_info "Container status:"
docker ps --filter "name=$CONTAINER_NAME" --format "table {{.Names}}\t{{.Status}}\t{{.Ports}}"

# Show recent logs
print_info "Recent logs:"
docker logs --tail=20 "$CONTAINER_NAME"

echo ""
echo -e "${BLUE}========================================${NC}"
echo -e "${GREEN}  Deployment completed successfully!${NC}"
echo -e "${BLUE}========================================${NC}"
echo ""
print_success "Application is running at: http://localhost:$PORT"
echo ""
echo -e "${YELLOW}Useful commands:${NC}"
echo "  View logs:        docker logs -f $CONTAINER_NAME"
echo "  Stop container:   docker stop $CONTAINER_NAME"
echo "  Remove container: docker rm $CONTAINER_NAME"
echo "  Restart:          docker restart $CONTAINER_NAME"
echo ""

