// GraphQL query functions
// These functions fetch data from Zone01 Athens GraphQL API

// ===== HELPER: Execute GraphQL Query =====
// This is the main function that sends GraphQL queries
async function executeGraphQLQuery(query, variables = {}) {
    const token = retrieveAuthToken();

    if (!token) {
        throw new Error('No authentication token found');
    }

    try {
        const response = await fetch(API_CONFIG.GRAPHQL_ENDPOINT, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${token}`  // Bearer = JWT authentication
            },
            body: JSON.stringify({
                query: query,
                variables: variables
            })
        });

        if (!response.ok) {
            throw new Error(`HTTP error! status: ${response.status}`);
        }

        const result = await response.json();

        // Check for GraphQL errors
        if (result.errors) {
            console.error('GraphQL errors:', result.errors);
            throw new Error(result.errors[0].message);
        }

        return result.data;
    } catch (error) {
        console.error('GraphQL query error:', error);
        throw error;
    }
}

// ===== QUERY 1: Get User Info (Normal Query) =====
// Fetches basic user information and eventId
async function fetchUserInfo() {
    const query = `
        query {
            user {
                id
                login
                email
                events {
                    cohorts {
                        eventId
                    }
                }
            }
        }
    `;

    const data = await executeGraphQLQuery(query);
    const user = data.user[0];

    // Extract the non-null eventId from cohorts
    // This is the current campus event you're enrolled in
    const eventId = user.events
        .flatMap(event => event.cohorts)
        .map(cohort => cohort.eventId)
        .find(id => id !== null && id !== undefined);

    // Store eventId for use in other queries
    if (eventId) {
        localStorage.setItem('zone01_event_id', eventId);
    }

    return user;
}

// ===== QUERY 2: Get Total XP (Query with Arguments) =====
// Calculates total XP earned by user in their current event/cohort
async function fetchTotalXP(userId) {
    // Get the eventId from localStorage (set by fetchUserInfo)
    const eventId = localStorage.getItem('zone01_event_id');

    if (!eventId) {
        console.error('No eventId found. Make sure fetchUserInfo is called first.');
        return 0;
    }

    const query = `
        query GetUserXP($userId: Int!, $eventId: Int!) {
            transaction_aggregate(
                where: {
                    userId: { _eq: $userId },
                    type: { _eq: "xp" },
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
    `;

    const data = await executeGraphQLQuery(query, {
        userId: parseInt(userId),
        eventId: parseInt(eventId)
    });

    const totalXP = data.transaction_aggregate.aggregate.sum.amount || 0;

    // Debug logging
    console.log('Event ID:', eventId);
    console.log('Total XP (for current event):', totalXP);

    return totalXP;
}

// ===== QUERY 3: Get Projects Completed (Nested Query) =====
// Fetches all projects with their completion status
async function fetchProjectsCompleted(userId) {
    const query = `
        query GetProjects($userId: Int!) {
            progress(
                where: {
                    userId: { _eq: $userId },
                    grade: { _gte: 1 }
                },
                distinct_on: objectId
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
    `;

    const data = await executeGraphQLQuery(query, { userId: parseInt(userId) });

    // Filter only projects (not exercises)
    const projects = data.progress.filter(p => p.object.type === 'project');
    return projects;
}

// ===== QUERY 4: Get XP Over Time (for graph) =====
// Fetches XP transactions with dates for timeline graph (filtered by eventId)
async function fetchXPTimeline(userId) {
    // Get the eventId from localStorage (set by fetchUserInfo)
    const eventId = localStorage.getItem('zone01_event_id');

    if (!eventId) {
        console.error('No eventId found. Make sure fetchUserInfo is called first.');
        return [];
    }

    const query = `
        query GetXPTimeline($userId: Int!, $eventId: Int!) {
            transaction(
                where: {
                    userId: { _eq: $userId },
                    type: { _eq: "xp" },
                    eventId: { _eq: $eventId }
                },
                order_by: { createdAt: asc }
            ) {
                amount
                createdAt
                path
            }
        }
    `;

    const data = await executeGraphQLQuery(query, {
        userId: parseInt(userId),
        eventId: parseInt(eventId)
    });

    return data.transaction;
}

// ===== QUERY 5: Get Audit Ratio =====
// Fetches audits done and received to calculate ratio
async function fetchAuditRatio(userId) {
    const query = `
        query GetAudits($userId: Int!) {
            user(where: { id: { _eq: $userId } }) {
                id
                auditRatio
                totalUp
                totalDown
            }
        }
    `;

    const data = await executeGraphQLQuery(query, { userId: parseInt(userId) });

    if (data.user.length > 0) {
        const user = data.user[0];
        return {
            ratio: user.auditRatio || 0,
            done: user.totalUp || 0,
            received: user.totalDown || 0
        };
    }

    return { ratio: 0, done: 0, received: 0 };
}

// ===== QUERY 6: Get User Level/Grade =====
// Fetches user's current level at Zone01
async function fetchUserLevel(userId) {
    const eventId = localStorage.getItem('zone01_event_id');

    if (!eventId) {
        console.error('No eventId found');
        return 0;
    }

    const query = `
        query GetUserLevel($userId: Int!, $eventId: Int!) {
            transaction(
                where: {
                    userId: { _eq: $userId },
                    type: { _eq: "level" },
                    eventId: { _eq: $eventId }
                },
                order_by: { amount: desc }
                limit: 1
            ) {
                amount
            }
        }
    `;

    try {
        const data = await executeGraphQLQuery(query, {
            userId: parseInt(userId),
            eventId: parseInt(eventId)
        });
        return data.transaction[0]?.amount || 0;
    } catch (error) {
        console.log('Level not available:', error.message);
        return 0;
    }
}

// ===== QUERY 7: Get User Ranking =====
// Fetches user's rank compared to other students
async function fetchUserRanking(userId) {
    const eventId = localStorage.getItem('zone01_event_id');

    if (!eventId) {
        console.error('No eventId found');
        return { rank: 0, total: 0 };
    }

    const query = `
        query GetUserRanking($userId: Int!, $eventId: Int!) {
            user(where: { id: { _eq: $userId } }) {
                id
                transactions(
                    where: {
                        type: { _eq: "xp" },
                        eventId: { _eq: $eventId }
                    }
                ) {
                    amount
                }
            }
            allUsers: user {
                id
                transactions(
                    where: {
                        type: { _eq: "xp" },
                        eventId: { _eq: $eventId }
                    }
                ) {
                    amount
                }
            }
        }
    `;

    try {
        const data = await executeGraphQLQuery(query, {
            userId: parseInt(userId),
            eventId: parseInt(eventId)
        });

        // Calculate user's total XP
        const userXP = data.user[0]?.transactions.reduce((sum, t) => sum + t.amount, 0) || 0;

        // Calculate all users' XP and rank them
        const userXPs = data.allUsers
            .map(u => u.transactions.reduce((sum, t) => sum + t.amount, 0))
            .filter(xp => xp > 0)
            .sort((a, b) => b - a);

        const rank = userXPs.findIndex(xp => xp === userXP) + 1;
        const total = userXPs.length;

        return { rank, total };
    } catch (error) {
        console.log('Ranking not available:', error.message);
        return { rank: 0, total: 0 };
    }
}

// ===== QUERY 8: Get Audits Done Count =====
// Fetches number of audits the user has completed
async function fetchAuditsDone(userId) {
    const query = `
        query GetAuditsDone($userId: Int!) {
            audit_aggregate(
                where: {
                    auditorId: { _eq: $userId }
                }
            ) {
                aggregate {
                    count
                }
            }
        }
    `;

    try {
        const data = await executeGraphQLQuery(query, { userId: parseInt(userId) });
        return data.audit_aggregate.aggregate.count || 0;
    } catch (error) {
        console.log('Audits done not available:', error.message);
        return 0;
    }
}
