// SVG Graph rendering functions
// These functions create beautiful graphs using pure SVG

// ===== GRAPH 1: XP Over Time (Line Graph) =====
function renderXPTimelineGraph(xpData) {
    if (!xpData || xpData.length === 0) {
        return '<p class="loading-text">No XP data available</p>';
    }

    // Calculate cumulative XP over time
    let cumulativeXP = 0;
    const dataPoints = xpData.map(transaction => {
        cumulativeXP += transaction.amount;
        return {
            date: new Date(transaction.createdAt),
            xp: cumulativeXP
        };
    });

    // SVG dimensions
    const width = 900;
    const height = 500;
    const padding = 80;
    const graphWidth = width - (padding * 2);
    const graphHeight = height - (padding * 2);

    // Find min/max values
    const maxXP = Math.max(...dataPoints.map(d => d.xp));
    const minDate = dataPoints[0].date;
    const maxDate = dataPoints[dataPoints.length - 1].date;
    const dateRange = maxDate - minDate;

    // Function to convert data to SVG coordinates
    function getX(date) {
        const timeFromStart = date - minDate;
        return padding + (timeFromStart / dateRange) * graphWidth;
    }

    function getY(xp) {
        return height - padding - (xp / maxXP) * graphHeight;
    }

    // Create line path (connects all points)
    let linePath = '';
    let areaPath = `M ${padding} ${height - padding} `; // Start at bottom-left

    dataPoints.forEach((point, index) => {
        const x = getX(point.date);
        const y = getY(point.xp);

        if (index === 0) {
            linePath = `M ${x} ${y}`;
            areaPath += `L ${x} ${y}`;
        } else {
            linePath += ` L ${x} ${y}`;
            areaPath += ` L ${x} ${y}`;
        }
    });

    // Close area path
    areaPath += ` L ${getX(maxDate)} ${height - padding} Z`;

    // Format XP value for display
    function formatXP(xp) {
        if (xp >= 1000000) return (xp / 1000000).toFixed(1) + 'M';
        if (xp >= 1000) return (xp / 1000).toFixed(1) + 'k';
        return xp;
    }

    // Generate SVG
    return `
        <svg viewBox="0 0 ${width} ${height}" xmlns="http://www.w3.org/2000/svg" style="width: 100%; height: auto;">
            <!-- Title -->
            <text x="${width / 2}" y="40" text-anchor="middle" style="fill: #ffffff; font-size: 22px; font-weight: 600;">
                XP Progress Over Time
            </text>

            <!-- Gradient for area fill -->
            <defs>
                <linearGradient id="areaGradient" x1="0%" y1="0%" x2="0%" y2="100%">
                    <stop offset="0%" style="stop-color:#4ade80;stop-opacity:0.6" />
                    <stop offset="100%" style="stop-color:#4ade80;stop-opacity:0.1" />
                </linearGradient>
            </defs>

            <!-- Y-axis (XP) -->
            <line x1="${padding}" y1="${padding + 30}" x2="${padding}" y2="${height - padding}" class="graph-axis" />

            <!-- X-axis (Time) -->
            <line x1="${padding}" y1="${height - padding}" x2="${width - padding}" y2="${height - padding}" class="graph-axis" />

            <!-- Y-axis labels -->
            ${[0, 0.25, 0.5, 0.75, 1].map(fraction => {
                const yValue = maxXP * fraction;
                const y = height - padding - (fraction * graphHeight);
                return `
                    <text x="${padding - 15}" y="${y + 6}" style="fill: #e0e4f0; font-size: 16px; font-weight: 500;" text-anchor="end">
                        ${formatXP(yValue)}
                    </text>
                    <line x1="${padding - 8}" y1="${y}" x2="${padding}" y2="${y}" class="graph-axis" />
                `;
            }).join('')}

            <!-- Area under line -->
            <path d="${areaPath}" class="graph-area" />

            <!-- Line -->
            <path d="${linePath}" class="graph-line" />

            <!-- Data points -->
            ${dataPoints.map(point => {
                const x = getX(point.date);
                const y = getY(point.xp);
                return `
                    <circle cx="${x}" cy="${y}" r="5" class="graph-dot">
                        <title>${point.date.toLocaleDateString()}: ${formatXP(point.xp)} XP</title>
                    </circle>
                `;
            }).join('')}

            <!-- X-axis label -->
            <text x="${width / 2}" y="${height - 15}" style="fill: #e0e4f0; font-size: 16px; font-weight: 500;" text-anchor="middle">
                Time
            </text>

            <!-- Y-axis label -->
            <text x="25" y="${height / 2}" style="fill: #e0e4f0; font-size: 16px; font-weight: 500;" text-anchor="middle" transform="rotate(-90, 25, ${height / 2})">
                Total XP
            </text>
        </svg>
    `;
}

// ===== GRAPH 2: Audit Ratio (Pie Chart) =====
function renderAuditRatioGraph(auditData) {
    if (!auditData || (auditData.done === 0 && auditData.received === 0)) {
        return '<p class="loading-text">No audit data available</p>';
    }

    const { done, received } = auditData;
    const total = done + received;

    // Calculate percentages
    const donePercent = (done / total) * 100;
    const receivedPercent = (received / total) * 100;

    // SVG dimensions
    const size = 450;
    const centerX = size / 2;
    const centerY = 180;
    const radius = 100;

    // Calculate pie slices
    // SVG arcs are tricky! We need to calculate the path
    function getArcPath(startAngle, endAngle, r) {
        const startX = centerX + r * Math.cos(startAngle);
        const startY = centerY + r * Math.sin(startAngle);
        const endX = centerX + r * Math.cos(endAngle);
        const endY = centerY + r * Math.sin(endAngle);

        const largeArc = endAngle - startAngle > Math.PI ? 1 : 0;

        return `
            M ${centerX} ${centerY}
            L ${startX} ${startY}
            A ${r} ${r} 0 ${largeArc} 1 ${endX} ${endY}
            Z
        `;
    }

    // Convert percentages to radians
    const doneAngle = (donePercent / 100) * 2 * Math.PI;
    const receivedAngle = (receivedPercent / 100) * 2 * Math.PI;

    // Start from top (-90 degrees = -π/2)
    const startAngle = -Math.PI / 2;
    const doneEndAngle = startAngle + doneAngle;
    const receivedEndAngle = doneEndAngle + receivedAngle;

    // Paths for pie slices
    const donePath = getArcPath(startAngle, doneEndAngle, radius);
    const receivedPath = getArcPath(doneEndAngle, receivedEndAngle, radius);

    // Format numbers
    function formatBytes(bytes) {
        if (bytes >= 1000000) return (bytes / 1000000).toFixed(1) + 'MB';
        if (bytes >= 1000) return (bytes / 1000).toFixed(1) + 'kB';
        return bytes + 'B';
    }

    return `
        <svg viewBox="0 0 ${size} ${size}" xmlns="http://www.w3.org/2000/svg" style="width: 100%; height: auto;">
            <!-- Title -->
            <text x="${centerX}" y="30" text-anchor="middle" style="fill: #ffffff; font-size: 18px; font-weight: 600;">
                Audit Ratio
            </text>

            <!-- Donut Chart -->
            <!-- Done slice (green) -->
            <path d="${donePath}" fill="#4ade80" opacity="1" stroke="#2d3250" stroke-width="2">
                <title>Audits Done: ${formatBytes(done)}</title>
            </path>

            <!-- Received slice (cyan) -->
            <path d="${receivedPath}" fill="#60d0ff" opacity="1" stroke="#2d3250" stroke-width="2">
                <title>Audits Received: ${formatBytes(received)}</title>
            </path>

            <!-- Center circle (donut hole) -->
            <circle cx="${centerX}" cy="${centerY}" r="60" fill="#1a1d2e" />

            <!-- Ratio text in center -->
            <text x="${centerX}" y="${centerY - 12}" text-anchor="middle" style="font-size: 13px; fill: #a8b0c8; text-transform: uppercase; letter-spacing: 1px;">
                RATIO
            </text>
            <text x="${centerX}" y="${centerY + 18}" text-anchor="middle" style="font-size: 38px; font-weight: 700; fill: #4ade80;">
                ${auditData.ratio.toFixed(2)}
            </text>

            <!-- Legend -->
            <g transform="translate(${centerX - 110}, ${centerY + 140})">
                <!-- Done -->
                <circle cx="10" cy="10" r="6" fill="#4ade80" />
                <text x="25" y="15" style="font-size: 13px; fill: #e0e4f0; font-weight: 500;">
                    Done: ${formatBytes(done)} <tspan fill="#a8b0c8">(${donePercent.toFixed(1)}%)</tspan>
                </text>

                <!-- Received -->
                <circle cx="10" cy="35" r="6" fill="#60d0ff" />
                <text x="25" y="40" style="font-size: 13px; fill: #e0e4f0; font-weight: 500;">
                    Received: ${formatBytes(received)} <tspan fill="#a8b0c8">(${receivedPercent.toFixed(1)}%)</tspan>
                </text>
            </g>
        </svg>
    `;
}
