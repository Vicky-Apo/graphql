# GraphQL Profile Dashboard

![CI/CD Pipeline](https://github.com/Vicky-Apo/graphql/workflows/CI%2FCD%20Pipeline/badge.svg)
![Docker Tests](https://github.com/Vicky-Apo/graphql/workflows/Docker%20Tests/badge.svg)
![Health Monitoring](https://github.com/Vicky-Apo/graphql/workflows/Health%20Monitoring/badge.svg)
![Uptime](https://img.shields.io/website?down_message=offline&up_message=online&url=https%3A%2F%2Fvicky-apo.github.io%2Fgraphql%2F)

An interactive profile dashboard that authenticates with a GraphQL API and visualizes student progress through custom SVG charts — built with zero external dependencies.

**[Live Demo](https://vicky-apo.github.io/graphql/)**

---

## Features

- JWT authentication (username or email login)
- XP progression line chart with tooltips and area fill
- Audit ratio donut chart
- Level progress indicator, project count, and audit stats
- Responsive 3-column layout (collapses to single column on mobile)
- Deployed via GitHub Actions to GitHub Pages; optionally self-hosted with Docker

---

## Tech Stack

| Layer | Technology |
|-------|------------|
| Frontend | Vanilla JavaScript (ES6+) |
| API | GraphQL |
| Auth | JWT + Basic Auth |
| Graphics | SVG (native) |
| Styling | Pure CSS3 |
| Storage | LocalStorage |
| Web Server | nginx:1.28-alpine |
| Container | Docker |
| CI/CD | GitHub Actions |
| Hosting | GitHub Pages |

---

## Running Locally

**With Docker (recommended):**

```bash
git clone https://github.com/Vicky-Apo/graphql.git
cd graphql
make up
# open http://localhost:8081
```

**Without Docker:**

```bash
python3 -m http.server 8000 --directory public
# open http://localhost:8000
```

**Makefile reference:**

```bash
make up        # start
make down      # stop
make logs      # tail logs
make rebuild   # rebuild and restart
make test      # health check
make shell     # shell into container
make clean     # remove containers and images
```

---

## Project Structure

```
graphql/
├── .github/workflows/
│   ├── ci-cd.yml          # lint → build → test → deploy
│   ├── docker-test.yml    # Hadolint + Trivy security scan
│   └── monitoring.yml     # daily availability and SSL checks
├── public/
│   ├── index.html
│   ├── profile.html
│   ├── css/styles.css
│   └── js/
│       ├── config.js      # API endpoints
│       ├── auth.js        # JWT handling
│       ├── login.js       # form submission
│       ├── graphql.js     # 8 GraphQL queries
│       ├── graphs.js      # SVG rendering
│       └── profile.js     # dashboard logic
├── vm-deployment/
│   └── public/            # copy of public/ with VM-specific nginx.conf
├── Dockerfile
├── docker-compose.yml
├── nginx.conf
└── Makefile
```

---

## Architecture

```
GitHub → GitHub Actions → lint / build / scan → GitHub Pages (production)
                                │
                                └─► Docker image (for self-hosting)
```

**Data flow:**

```
Login → Zone01 Auth API → JWT token (localStorage)
                               │
                          Profile page
                               │
                       GraphQL API (Bearer token)
                               │
                     Render stats + SVG graphs
```

---

## CI/CD

Three automated workflows run on every push to `main`:

| Workflow | What it does |
|----------|-------------|
| `ci-cd.yml` | HTML validation, JS syntax check, secret scanning, Docker build + HTTP test, deploy to GitHub Pages |
| `docker-test.yml` | Dockerfile linting (Hadolint), vulnerability scan (Trivy), Compose validation |
| `monitoring.yml` | Daily uptime check, response time, Zone01 API reachability, SSL expiry |

---

## Security

```http
X-Frame-Options: DENY
X-Content-Type-Options: nosniff
X-XSS-Protection: 1; mode=block
Referrer-Policy: strict-origin-when-cross-origin
```

- No credentials in source; CI/CD scans for accidental commits
- Docker image scanned with Trivy on every change to `Dockerfile`
- HTTPS enforced via GitHub Pages

---

## License

MIT
