# Zone01 Athens - GraphQL Profile

A modern, interactive profile dashboard built with vanilla JavaScript, GraphQL, and SVG visualizations for the Zone01 Athens coding school platform.

**[🚀 Live Demo](https://graphql-zone01athens.netlify.app)**

![Profile Dashboard](https://img.shields.io/badge/Status-Complete-success)
![GraphQL](https://img.shields.io/badge/GraphQL-API-E10098?logo=graphql)
![Vanilla JS](https://img.shields.io/badge/JavaScript-ES6+-F7DF1E?logo=javascript)
![Deployed on Netlify](https://img.shields.io/badge/Deployed-Netlify-00C7B7?logo=netlify)

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

**1. Stats Section (Left Sidebar)**
- Level progress with animated circular SVG indicator
- Total XP earned (filtered by current event)
- Projects completed count
- Audits done count
- Audit ratio with visual progress bars

**2. Main Content (Center)**
- Personalized welcome message
- Two interactive SVG graphs:
  - **XP Progress Over Time**: Line graph showing cumulative XP growth
  - **Audit Ratio**: Pie chart displaying audits done vs received

**3. Activity Section (Right Sidebar)**
- Current activity status
- Recent records placeholder

### GraphQL Queries

The project implements all three required query types:

**Normal Query** - Basic user information:
```graphql
query {
  user {
    id
    login
    email
  }
}
```

**Query with Arguments** - Filtered XP data:
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

**Nested Query** - Projects with related objects:
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

1. **XP Timeline Graph**
   - Line chart with area fill gradient
   - Interactive data points with tooltips
   - Responsive scaling based on data range
   - Formatted axes (XP values with k/M suffixes)

2. **Audit Ratio Pie Chart**
   - Donut chart showing done vs received audits
   - Percentage breakdown in legend
   - Ratio displayed in center (1 decimal place)
   - Color-coded sections (green for done, blue for received)

## Design

**Modern Minimal Dark Theme**
- True black backgrounds with subtle warmth
- Muted blue accent colors (#4a7ba7)
- Professional typography with proper hierarchy
- Refined spacing and generous padding
- Subtle hover effects (border color transitions)
- Smooth animations and micro-interactions
- Responsive 3-column layout (adapts to mobile)

**CSS Architecture**
- CSS custom properties for consistent theming
- BEM-adjacent naming conventions
- Mobile-first responsive design
- No CSS frameworks (pure CSS)

## Technology Stack

- **Frontend**: Vanilla JavaScript (ES6+)
- **API**: GraphQL with JWT authentication
- **Graphics**: SVG (no external charting libraries)
- **Styling**: Pure CSS3 with CSS variables
- **Fonts**: System fonts + Google Fonts (Inter, JetBrains Mono)
- **Storage**: LocalStorage for token persistence

## Project Structure

```
graphql/
├── public/
│   ├── index.html              # Login page
│   ├── profile.html            # Profile dashboard
│   ├── css/
│   │   └── styles.css          # All styling (681 lines)
│   └── js/
│       ├── config.js           # API endpoints configuration
│       ├── auth.js             # Authentication helpers
│       ├── login.js            # Login form handler
│       ├── graphql.js          # GraphQL queries (8 queries)
│       ├── graphs.js           # SVG graph rendering
│       └── profile.js          # Profile page logic
└── README.md
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
```

3. Open your browser and navigate to:
```
http://localhost:8000
```

### Configuration

API endpoints are configured in `public/js/config.js`:

```javascript
const API_CONFIG = {
    SIGNIN_ENDPOINT: 'https://learn.zone01.gr/api/auth/signin',
    GRAPHQL_ENDPOINT: 'https://learn.zone01.gr/api/graphql-engine/v1/graphql',
    TOKEN_KEY: 'zone01_token',
    USER_ID_KEY: 'zone01_user_id'
};
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

### Deployment Setup

This project uses **continuous deployment** via Netlify:

1. **GitHub Repository** → Code is pushed to GitHub
2. **Netlify Detection** → Netlify automatically detects changes
3. **Build & Deploy** → Site is built and deployed within seconds
4. **Global CDN** → Content delivered from servers worldwide

**Configuration:**
- **Build Command**: None (static site)
- **Publish Directory**: `public`
- **Production Branch**: `main`

### Alternative Hosting Options

This project can also be hosted on:
- **GitHub Pages**: Free static hosting
- **Vercel**: Zero-config deployments
- **GitLab Pages**: Integrated with GitLab repos
- **AWS S3 + CloudFront**: Scalable cloud hosting

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

## UI/UX Principles

- **Minimal Design**: Clean interface without clutter
- **Visual Hierarchy**: Clear distinction between sections
- **Color Coding**: Consistent use of colors for meaning
- **Feedback**: Hover states, loading indicators, animations
- **Accessibility**: Proper contrast ratios, semantic HTML
- **Performance**: No external dependencies, optimized rendering

## Security

- No credentials stored in code
- JWT tokens stored in localStorage only
- HTTPS endpoints for all API calls
- Base64 encoding for Basic auth
- Token expiration handled by API

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

## Author

**Vicky Apostolou** (vapostol)
- Zone01 Athens Student
- Gitea: [@vapostol](https://learn.zone01.gr/git/vapostol)

## License

This project is created as part of the Zone01 Athens curriculum.

## Acknowledgments

- Zone01 Athens for providing the GraphQL API
- The Zone01 platform team for infrastructure support
- Fellow students for feedback and testing

---

**Last Updated**: December 2025
