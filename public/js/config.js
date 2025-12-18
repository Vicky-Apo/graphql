// This file stores all the API endpoints we need to connect to

const API_CONFIG = {
    // The main Zone01 Athens domain
    DOMAIN: 'https://platform.zone01.gr',

    // CORS proxy (needed because Zone01 blocks localhost)
    CORS_PROXY: 'https://corsproxy.io',

    // Automatically detect: use proxy only on localhost
    USE_PROXY: window.location.hostname === 'localhost' || window.location.hostname === '127.0.0.1',
    
    // Where we send login requests (username + password)
    get SIGNIN_ENDPOINT() {
        if (this.USE_PROXY) {
            return `${this.CORS_PROXY}/?${this.DOMAIN}/api/auth/signin`;
        }
        return `${this.DOMAIN}/api/auth/signin`;
    },

    // Where we send GraphQL queries (to get your data)
    get GRAPHQL_ENDPOINT() {
        if (this.USE_PROXY) {
            return `${this.CORS_PROXY}/?${this.DOMAIN}/api/graphql-engine/v1/graphql`;
        }
        return `${this.DOMAIN}/api/graphql-engine/v1/graphql`;
    },

    // Keys for storing data in browser's localStorage
    TOKEN_KEY: 'zone01_token',      // Where we save the JWT token
    USER_ID_KEY: 'zone01_user_id'   // Where we save your user ID
};
