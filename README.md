# Zone01 Athens - GraphQL Profile

![CI/CD Pipeline](https://github.com/vapostol/graphql/workflows/CI%2FCD%20Pipeline/badge.svg)
![Docker Tests](https://github.com/vapostol/graphql/workflows/Docker%20Tests/badge.svg)
![Health Monitoring](https://github.com/vapostol/graphql/workflows/Health%20Monitoring/badge.svg)
![Uptime](https://img.shields.io/website?down_message=offline&up_message=online&url=https%3A%2F%2Fgraphql-zone01athens.netlify.app)

A modern, interactive profile dashboard built with vanilla JavaScript, GraphQL, and SVG visualizations for the Zone01 Athens coding school platform.

**[🚀 Live Demo](https://graphql-zone01athens.netlify.app)**

![Profile Dashboard](https://img.shields.io/badge/Status-Complete-success)
![GraphQL](https://img.shields.io/badge/GraphQL-API-E10098?logo=graphql)
![Vanilla JS](https://img.shields.io/badge/JavaScript-ES6+-F7DF1E?logo=javascript)
![Docker](https://img.shields.io/badge/Docker-Containerized-2496ED?logo=docker)
![Deployed on Netlify](https://img.shields.io/badge/Deployed-Netlify-00C7B7?logo=netlify)

## 📋 Table of Contents

- [Project Overview](#project-overview)
- [Features](#features)
- [Technology Stack](#technology-stack)
- [Getting Started](#getting-started)
- [Docker Deployment](#-docker-deployment)
- [CI/CD Pipeline](#-cicd-pipeline)
- [Architecture](#architecture)
- [Security](#security)
- [Performance](#performance)
- [Author](#author)

## Project Overview

This project creates a personalized student profile page that queries data from Zone01's GraphQL API to display:

- User statistics and progress
- XP earned over time
- Project completion records
- Audit ratio and performance metrics
- Interactive SVG graphs for data visualization

## Features

### Authentication

- Secure login with JWT tokens
- Supports both `username:password` and `email:password`
- Base64 encoded Basic authentication
- Bearer token authorization for GraphQL queries
- Error handling for invalid credentials
- Logout functionality with token cleanup

### Profile Sections

#### 1. Stats Section (Left Sidebar)

- Level progress with animated circular SVG indicator
- Total XP earned (filtered by current event)
- Projects completed count
- Audits done count
- Audit ratio with visual progress bars

#### 2. Main Content (Center)

- Personalized welcome message
- Two interactive SVG graphs:
  - **XP Progress Over Time**: Line graph showing cumulative XP growth
  - **Audit Ratio**: Pie chart displaying audits done vs received

#### 3. Activity Section (Right Sidebar)

- Current activity status
- Recent records placeholder

### GraphQL Queries

The project implements all three required query types:

#### Normal Query - Basic user information

```graphql
query {
  user {
    id
    login
    email
  }
}
```

#### Query with Arguments - Filtered XP data

```graphql
query GetUserXP($userId: Int!, $eventId: Int!) {
  transaction_aggregate(
    where: {
      userId: { _eq: $userId }
      type: { _eq: "xp" }
      eventId: { _eq: $eventId }
    }
  ) {
    aggregate {
      sum {
        amount
      }
    }
  }
}
```

#### Nested Query - Projects with related objects

```graphql
query GetProjects($userId: Int!) {
  progress(
    where: {
      userId: { _eq: $userId }
      grade: { _gte: 1 }
    }
  ) {
    id
    grade
    object {
      id
      name
      type
    }
  }
}
```

### SVG Graphs

Both graphs are created using pure SVG without external libraries:

**XP Timeline Graph:**

- Line chart with area fill gradient
- Interactive data points with tooltips
- Responsive scaling based on data range
- Formatted axes (XP values with k/M suffixes)

**Audit Ratio Pie Chart:**

- Donut chart showing done vs received audits
- Percentage breakdown in legend
- Ratio displayed in center (1 decimal place)
- Color-coded sections (green for done, blue for received)

## Design

### Modern Minimal Dark Theme

- True black backgrounds with subtle warmth
- Muted blue accent colors (#4a7ba7)
- Professional typography with proper hierarchy
- Refined spacing and generous padding
- Subtle hover effects (border color transitions)
- Smooth animations and micro-interactions
- Responsive 3-column layout (adapts to mobile)

### CSS Architecture

- CSS custom properties for consistent theming
- BEM-adjacent naming conventions
- Mobile-first responsive design
- No CSS frameworks (pure CSS)

## Technology Stack

| Layer | Technology | Purpose |
|-------|------------|---------|
| Frontend | Vanilla JavaScript (ES6+) | User interface |
| API | GraphQL | Data fetching |
| Auth | JWT | Authentication & authorization |
| Graphics | SVG | Data visualization |
| Styling | Pure CSS3 | Design & layout |
| Storage | LocalStorage | Token persistence |
| Containerization | Docker | Portability & deployment |
| CI/CD | GitHub Actions | Automation |
| Hosting | Netlify | CDN & deployment |
| Web Server | nginx:alpine | Production server |

## Project Structure

```text
graphql/
├── .github/
│   └── workflows/
│       ├── ci-cd.yml           # Main CI/CD pipeline
│       ├── docker-test.yml     # Docker-specific tests
│       └── monitoring.yml      # Health monitoring
├── public/
│   ├── index.html              # Login page
│   ├── profile.html            # Profile dashboard
│   ├── css/
│   │   └── styles.css          # All styling
│   └── js/
│       ├── config.js           # API endpoints configuration
│       ├── auth.js             # Authentication helpers
│       ├── login.js            # Login form handler
│       ├── graphql.js          # GraphQL queries (8 queries)
│       ├── graphs.js           # SVG graph rendering
│       └── profile.js          # Profile page logic
├── Dockerfile                  # Docker image definition
├── docker-compose.yml          # Docker Compose configuration
├── nginx.conf                  # nginx server configuration
├── netlify.toml                # Netlify deployment config
└── README.md                   # This file
```

## Getting Started

### Prerequisites

- A Zone01 Athens student account
- Modern web browser (Chrome, Firefox, Safari, Edge)
- Web server (for local development)

### Installation

1. Clone the repository:

```bash
git clone https://learn.zone01.gr/git/vapostol/graphql.git
cd graphql
```

2. Serve the files using any web server:

```bash
# Option 1: Python
python3 -m http.server 8000

# Option 2: Node.js
npx serve public

# Option 3: PHP
php -S localhost:8000 -t public

# Option 4: Docker (recommended)
docker-compose up -d
```

3. Open your browser and navigate to:

```text
http://localhost:8000
# or http://localhost:8081 (if using Docker)
```

### Configuration

API endpoints are configured in `public/js/config.js`:

```javascript
const API_CONFIG = {
    DOMAIN: 'https://platform.zone01.gr',
    SIGNIN_ENDPOINT: '/api/auth/signin',
    GRAPHQL_ENDPOINT: '/api/graphql-engine/v1/graphql',
    TOKEN_KEY: 'zone01_token',
    USER_ID_KEY: 'zone01_user_id'
};
```

## 🐳 Docker Deployment

The application is containerized using Docker with nginx:alpine base image.

### Quick Start with Docker

```bash
# Build and run with docker-compose
docker-compose up -d

# Access the application
open http://localhost:8081
```

### Container Details

- **Base Image:** nginx:alpine (~5MB)
- **Final Image Size:** ~10MB
- **Port Mapping:** 8081:80
- **Web Server:** nginx with custom configuration
- **Features:** Security headers, caching, SPA routing

### Manual Docker Commands

```bash
# Build image
docker build -t graphql-profile .

# Run container
docker run -d -p 8081:80 --name graphql-app graphql-profile

# View logs
docker logs graphql-app

# Stop container
docker stop graphql-app

# Remove container
docker rm graphql-app
```

### Development Commands

```bash
# View logs in real-time
docker-compose logs -f

# Rebuild after changes
docker-compose up -d --build

# Stop all services
docker-compose down

# Shell access to container
docker exec -it graphql_web_1 sh

# Check container status
docker ps
```

## 🔄 CI/CD Pipeline

Automated deployment pipeline using GitHub Actions with three workflows:

### Pipeline Stages

#### 1. Lint & Code Quality (2-3 minutes)

- HTML validation
- JavaScript syntax checking
- Security scanning (hardcoded secrets detection)
- TODO/FIXME comment detection

#### 2. Docker Build & Test (3-5 minutes)

- Multi-stage Docker build
- Container functionality testing
- HTTP response validation
- Security header verification
- Image size optimization check

#### 3. Deploy to Production (1-2 minutes)

- Automatic Netlify deployment
- Environment variable injection
- Deployment notifications
- GitHub commit status updates

### Workflow Triggers

```yaml
# Automatic triggers:
- Push to main/master branch
- Pull requests to main/master
- Docker file changes
- Scheduled health checks (every 30 minutes)

# Manual trigger:
- workflow_dispatch (via GitHub Actions UI)
```

### Pipeline Status

All workflows run automatically on every push to `main`:

```text
Push to GitHub → Lint → Build → Test → Deploy → Live in ~8 minutes
```

### Health Monitoring

Automated monitoring checks every 30 minutes:

- Website availability (HTTP 200 status)
- Response time tracking (<3s threshold)
- Zone01 API connectivity
- SSL certificate expiration

## Architecture

### System Overview

```text
┌─────────────┐
│   GitHub    │ (Source Control)
└──────┬──────┘
       │ Push triggers
       ▼
┌─────────────┐
│GitHub Actions│ (CI/CD Pipeline)
└──────┬──────┘
       │
       ├─► Lint & Test
       ├─► Build Docker Image
       └─► Deploy to Netlify
              │
              ▼
       ┌─────────────┐
       │   Netlify   │ (Global CDN)
       │  Production │
       └─────────────┘
```

### Data Flow

```text
User → Login Page → Zone01 Auth API → JWT Token
                         ↓
                    Store in localStorage
                         ↓
                    Profile Page
                         ↓
                    GraphQL API (with Bearer token)
                         ↓
                    Fetch & Display Data
                         ↓
                    Render SVG Graphs
```

## Data Sources

The application queries the following GraphQL tables:

| Table | Usage |
|-------|-------|
| `user` | Basic user information (id, login, email) |
| `transaction` | XP amounts, dates, and audit data |
| `progress` | Project completion and grades |
| `audit` | Audit counts and ratios |
| `object` | Project/exercise metadata |

## Key Features Implementation

### Event-Filtered Data

All XP and level data is filtered by the current event/cohort to show accurate campus-specific progress:

- Extracts `eventId` from user's cohort data
- Applies `eventId` filter to all XP and level queries
- Ensures accurate statistics per campus enrollment

### JWT Token Handling

- Token extracted from signin response
- Stored in localStorage for persistence
- Automatically sent with Bearer authentication
- User ID extracted from JWT payload
- Token cleared on logout

### Error Handling

- Network error detection
- Invalid credentials feedback
- GraphQL error parsing
- Graceful fallbacks for missing data

## Deployment

### Live Site

The application is deployed on Netlify with automatic deployments from GitHub:

**Live URL**: [https://graphql-zone01athens.netlify.app](https://graphql-zone01athens.netlify.app)

### Deployment Configuration

This project uses **continuous deployment** via Netlify:

- **GitHub Repository** → Code is pushed to GitHub
- **GitHub Actions** → Runs tests and builds
- **Netlify** → Automatically deploys on success
- **Global CDN** → Content delivered from servers worldwide

**Configuration:**

- **Build Command**: None (static site)
- **Publish Directory**: `public`
- **Production Branch**: `main`
- **Deploy Time**: ~8 minutes (including tests)

### Alternative Hosting Options

This project can also be hosted on:

- **GitHub Pages**: Free static hosting
- **Vercel**: Zero-config deployments
- **GitLab Pages**: Integrated with GitLab repos
- **AWS S3 + CloudFront**: Scalable cloud hosting
- **Docker**: Self-hosted on any server

## Responsive Design

Breakpoints:

- **Desktop**: 1400px+ (3-column layout)
- **Tablet**: 1200px - 1400px (compressed columns)
- **Mobile**: < 1200px (single column, sidebars hidden)

## Testing Checklist

- [x] Login with username:password
- [x] Login with email:password
- [x] Invalid credentials show error message
- [x] Profile displays three required sections
- [x] Data accuracy matches GraphiQL queries
- [x] Two SVG graphs render correctly
- [x] Graphs display accurate data
- [x] Logout functionality works
- [x] Normal GraphQL queries implemented
- [x] Nested GraphQL queries implemented
- [x] Queries with arguments implemented
- [x] Responsive design works on all devices
- [x] Docker containerization working
- [x] CI/CD pipeline functional
- [x] Automated health monitoring active

## UI/UX Principles

- **Minimal Design**: Clean interface without clutter
- **Visual Hierarchy**: Clear distinction between sections
- **Color Coding**: Consistent use of colors for meaning
- **Feedback**: Hover states, loading indicators, animations
- **Accessibility**: Proper contrast ratios, semantic HTML
- **Performance**: No external dependencies, optimized rendering

## Security

### Application Security

- No credentials stored in code
- JWT tokens stored in localStorage only
- HTTPS endpoints for all API calls
- Base64 encoding for Basic auth
- Token expiration handled by API
- Secrets managed via GitHub Secrets

### Infrastructure Security

- Security headers configured (X-Frame-Options, CSP, etc.)
- Docker image scanning with Trivy
- Automated secret detection in CI/CD
- HTTPS enforced via Netlify
- Regular dependency updates

### Security Headers

```http
X-Frame-Options: DENY
X-Content-Type-Options: nosniff
X-XSS-Protection: 1; mode=block
Referrer-Policy: strict-origin-when-cross-origin
```

## Performance

### Metrics

- **Load Time**: <2s (target)
- **Time to Interactive**: <3s
- **Docker Image Size**: ~10MB
- **Uptime SLA**: 99.9%
- **Global CDN**: Netlify Edge Network

### Optimizations

- Minimal dependencies (vanilla JS)
- Gzip compression enabled
- Static asset caching (1 year)
- Lazy loading for images
- Efficient SVG rendering

## Learning Outcomes

This project demonstrates understanding of:

- GraphQL query language and schema introspection
- JWT authentication and authorization
- SVG creation and manipulation
- Modern CSS with custom properties
- Vanilla JavaScript (no frameworks)
- UI/UX design principles
- REST API integration
- Data visualization techniques
- Docker containerization
- CI/CD pipeline implementation
- Infrastructure automation
- Security best practices

## DevOps Skills Demonstrated

✅ **Containerization** - Docker with nginx:alpine  
✅ **CI/CD** - GitHub Actions automated pipeline  
✅ **Monitoring** - Automated health checks  
✅ **Security** - Headers, secret scanning, image scanning  
✅ **Documentation** - Comprehensive README, inline comments  
✅ **Version Control** - Git workflows, branching strategy  
✅ **Cloud Deployment** - Netlify CDN integration  
✅ **Infrastructure as Code** - Docker Compose, workflow YAML  

## Author

**Vicky Apostolou** (vapostol)

- Zone01 Athens Student
- Gitea: [@vapostol](https://learn.zone01.gr/git/vapostol)
- GitHub: [vapostol](https://github.com/vapostol)

## 🎓 About

This project was built as part of the Zone01 Athens curriculum, demonstrating full-stack development skills with a focus on DevOps practices.

## 📄 License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

## Acknowledgments

- Zone01 Athens for providing the GraphQL API
- The Zone01 platform team for infrastructure support
- Fellow students for feedback and testing

---

**Last Updated**: December 2024

**Project Status**: ✅ Complete & Production Ready
