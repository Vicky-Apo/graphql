// Authentication helper functions
// These functions help us login, save tokens, and manage authentication

// ===== FUNCTION 1: Encode credentials for login =====
// Zone01 API requires "Basic Authentication" with base64 encoding
function encodeLoginData(username, password) {
    // Combine username:password
    const credentials = `${username}:${password}`;

    // Convert to base64 (a way to encode text)
    // btoa() is a built-in browser function that does base64 encoding
    return btoa(credentials);
}

// ===== FUNCTION 2: Save token to browser storage =====
// When login succeeds, we save the JWT token so you stay logged in
function storeAuthToken(token) {
    // localStorage is like a mini database in your browser
    // It saves data even after you close the browser
    localStorage.setItem(API_CONFIG.TOKEN_KEY, token);
}

// ===== FUNCTION 3: Get the saved token =====
// Retrieve the token from browser storage
function retrieveAuthToken() {
    return localStorage.getItem(API_CONFIG.TOKEN_KEY);
}

// ===== FUNCTION 4: Delete the token (logout) =====
function clearAuthData() {
    localStorage.removeItem(API_CONFIG.TOKEN_KEY);
    localStorage.removeItem(API_CONFIG.USER_ID_KEY);
}

// ===== FUNCTION 5: Check if user is logged in =====
// Returns true if we have a token, false if not
function checkIfAuthenticated() {
    const token = retrieveAuthToken();
    return token !== null && token !== undefined;
}

// ===== FUNCTION 6: Decode JWT to get user ID =====
// JWT tokens have 3 parts separated by dots: header.payload.signature
// The payload (middle part) contains user info
function parseJWTToken(token) {
    try {
        // Split the token into 3 parts
        const parts = token.split('.');

        // We want the middle part (index 1)
        const payload = parts[1];

        // Decode from base64 and parse as JSON
        const decoded = JSON.parse(atob(payload));

        return decoded;
    } catch (error) {
        console.error('Error decoding JWT:', error);
        return null;
    }
}

// ===== FUNCTION 7: Extract user ID from token =====
function extractUserID(token) {
    const decoded = parseJWTToken(token);

    // JWT payload usually has 'sub' (subject) field with user ID
    if (decoded && decoded.sub) {
        return decoded.sub;
    }

    return null;
}

// ===== FUNCTION 8: Save user ID to storage =====
function storeUserID(userId) {
    localStorage.setItem(API_CONFIG.USER_ID_KEY, userId);
}

// ===== FUNCTION 9: Get saved user ID =====
function retrieveUserID() {
    return localStorage.getItem(API_CONFIG.USER_ID_KEY);
}
