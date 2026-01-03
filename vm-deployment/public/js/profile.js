// This script loads user data and displays it on the profile page

// Global variable to store fetched data
let userData = {
    userInfo: null,
    totalXP: 0,
    userLevel: 0,
    projects: [],
    ranking: null,
    auditsDone: 0,
    xpTimeline: [],
    auditRatio: null
};

// ===== WAIT FOR PAGE TO LOAD =====
document.addEventListener('DOMContentLoaded', async function() {
    console.log('Profile page loaded, checking authentication...');

    // ===== STEP 1: Check if user is logged in =====
    if (!checkIfAuthenticated()) {
        console.log('Not authenticated, redirecting to login');
        window.location.href = 'index.html';
        return;
    }

    console.log('User is authenticated');

    // ===== STEP 2: Get user ID =====
    const userId = retrieveUserID();

    if (!userId) {
        console.error('No user ID found');
        clearAuthData();
        window.location.href = 'index.html';
        return;
    }

    console.log('User ID:', userId);

    // ===== STEP 3: Set up logout button =====
    const logoutBtn = document.getElementById('logoutBtn');
    logoutBtn.addEventListener('click', function() {
        clearAuthData();
        window.location.href = 'index.html';
    });

    // ===== STEP 4: Load all user data =====
    await loadUserData(userId);

    // ===== STEP 5: Display graphs =====
    displayAllGraphs();
});

// ===== FUNCTION: Load All User Data =====
async function loadUserData(userId) {
    try {
        // Show loading state
        document.getElementById('navUsername').textContent = 'Loading...';
        document.getElementById('levelValue').textContent = '?';
        document.getElementById('totalXP').textContent = 'Loading...';
        document.getElementById('projectsCompleted').textContent = 'Loading...';
        document.getElementById('auditsDone').textContent = 'Loading...';
        document.getElementById('auditDoneAmount').textContent = 'Loading...';
        document.getElementById('auditReceivedAmount').textContent = 'Loading...';
        document.getElementById('auditRatioNumber').textContent = '?';

        // STEP 1: Fetch user info first (this sets the eventId in localStorage)
        const userInfo = await fetchUserInfo();

        // STEP 2: Now fetch all other data in parallel
        const [totalXP, userLevel, projects, ranking, auditsDone, xpTimeline, auditRatio] = await Promise.all([
            fetchTotalXP(userId),
            fetchUserLevel(userId),
            fetchProjectsCompleted(userId),
            fetchUserRanking(userId),
            fetchAuditsDone(userId),
            fetchXPTimeline(userId),
            fetchAuditRatio(userId)
        ]);

        // Store in global variable
        userData = {
            userInfo,
            totalXP,
            userLevel,
            projects,
            ranking,
            auditsDone,
            xpTimeline,
            auditRatio
        };

        // Update UI with the data
        displayUserInfo(userInfo);
        displayUserLevel(userLevel);
        displayTotalXP(totalXP);
        displayProjectsCompleted(projects);
        displayAuditsDone(auditsDone);
        displayAuditRatio(auditRatio);

    } catch (error) {
        console.error('Error loading user data:', error);

        // Show error message
        alert('Failed to load profile data. Please try logging in again!');

        // Clear auth and redirect to login
        clearAuthData();
        window.location.href = 'index.html';
    }
}

// ===== DISPLAY FUNCTION: User Info =====
function displayUserInfo(userInfo) {
    const navUsername = document.getElementById('navUsername');
    const welcomeUsername = document.getElementById('userLogin');

    const username = userInfo.login || 'Student';
    navUsername.textContent = username;
    welcomeUsername.textContent = username;
}

// ===== DISPLAY FUNCTION: User Level =====
function displayUserLevel(level) {
    const levelElement = document.getElementById('levelValue');
    const levelProgressCircle = document.getElementById('levelProgressCircle');

    if (!level || level === 0) {
        levelElement.textContent = '0';
        if (levelProgressCircle) {
            levelProgressCircle.setAttribute('stroke-dashoffset', '565');
        }
        return;
    }

    // Display level as whole number
    const wholeLevel = Math.floor(level);
    levelElement.textContent = wholeLevel;

    // Calculate progress to next level (for the circular progress bar)
    const progress = level - wholeLevel;
    const circumference = 2 * Math.PI * 90; // radius is 90
    const offset = circumference - (progress * circumference);

    if (levelProgressCircle) {
        levelProgressCircle.setAttribute('stroke-dashoffset', offset);
    }
}

// ===== DISPLAY FUNCTION: Total XP =====
function displayTotalXP(totalXP) {
    const totalXPElement = document.getElementById('totalXP');

    // Format XP nicely
    if (totalXP >= 1000000) {
        totalXPElement.textContent = (totalXP / 1000000).toFixed(2) + ' MB';
    } else if (totalXP >= 1000) {
        totalXPElement.textContent = (totalXP / 1000).toFixed(1) + ' kB';
    } else {
        totalXPElement.textContent = totalXP + ' B';
    }
}

// ===== DISPLAY FUNCTION: Projects Completed =====
function displayProjectsCompleted(projects) {
    const projectsElement = document.getElementById('projectsCompleted');
    projectsElement.textContent = projects.length;
}

// ===== DISPLAY FUNCTION: Audits Done =====
function displayAuditsDone(auditsDone) {
    const auditsDoneElement = document.getElementById('auditsDone');
    auditsDoneElement.textContent = auditsDone || 0;
}

// ===== DISPLAY FUNCTION: Audit Ratio =====
function displayAuditRatio(auditData) {
    const auditRatioElement = document.getElementById('auditRatioNumber');
    const auditDoneElement = document.getElementById('auditDoneAmount');
    const auditReceivedElement = document.getElementById('auditReceivedAmount');
    const auditDoneFill = document.getElementById('auditDoneBar');
    const auditReceivedFill = document.getElementById('auditReceivedBar');

    if (!auditData || auditData.ratio === 0) {
        auditRatioElement.textContent = '0.0';
        auditDoneElement.textContent = '0 B';
        auditReceivedElement.textContent = '0 B';
        if (auditDoneFill) auditDoneFill.style.width = '0%';
        if (auditReceivedFill) auditReceivedFill.style.width = '0%';
        return;
    }

    // Display ratio with 2 decimal places
    auditRatioElement.textContent = auditData.ratio.toFixed(1);

    // Format audit amounts
    function formatBytes(bytes) {
        if (bytes >= 1000000) return (bytes / 1000000).toFixed(1) + ' MB';
        if (bytes >= 1000) return (bytes / 1000).toFixed(1) + ' kB';
        return bytes + ' B';
    }

    auditDoneElement.textContent = formatBytes(auditData.done);
    auditReceivedElement.textContent = formatBytes(auditData.received);

    // Calculate percentages for progress bars
    const total = auditData.done + auditData.received;
    const donePercent = total > 0 ? (auditData.done / total) * 100 : 0;
    const receivedPercent = total > 0 ? (auditData.received / total) * 100 : 0;

    // Animate progress bars
    if (auditDoneFill) {
        setTimeout(() => {
            auditDoneFill.style.width = donePercent + '%';
        }, 100);
    }
    if (auditReceivedFill) {
        setTimeout(() => {
            auditReceivedFill.style.width = receivedPercent + '%';
        }, 100);
    }
}

// ===== FUNCTION: Display All Graphs =====
function displayAllGraphs() {
    const xpGraphContainer = document.getElementById('xpGraph');
    const auditGraphContainer = document.getElementById('auditGraph');

    // Small delay to show loading state
    setTimeout(() => {
        // Render XP Timeline Graph
        const xpGraphHTML = renderXPTimelineGraph(userData.xpTimeline);
        xpGraphContainer.innerHTML = xpGraphHTML;

        // Render Audit Ratio Graph
        const auditGraphHTML = renderAuditRatioGraph(userData.auditRatio);
        auditGraphContainer.innerHTML = auditGraphHTML;
    }, 100);
}
