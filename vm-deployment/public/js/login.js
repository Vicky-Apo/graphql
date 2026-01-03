// Login page functionality
// This script handles the login form submission

// ===== WAIT FOR PAGE TO LOAD =====
// DOMContentLoaded = "wait until the HTML is fully loaded before running code"
document.addEventListener('DOMContentLoaded', function() {

    // ===== STEP 1: Check if user is already logged in =====
    // If they already have a token, send them to profile page
    if (checkIfAuthenticated()) {
        window.location.href = 'profile.html';
        return; // Stop here, don't run the rest
    }

    // ===== STEP 2: Get references to HTML elements =====
    const loginForm = document.getElementById('loginForm');
    const errorMessage = document.getElementById('errorMessage');
    const usernameInput = document.getElementById('username');
    const passwordInput = document.getElementById('password');

    // ===== STEP 3: Listen for form submission =====
    // When user clicks "Login" button, this function runs
    loginForm.addEventListener('submit', async function(event) {

        // Prevent the form from refreshing the page (default behavior)
        event.preventDefault();

        // ===== STEP 4: Get values from input fields =====
        const username = usernameInput.value.trim(); // .trim() removes extra spaces
        const password = passwordInput.value;

        // ===== STEP 5: Validate inputs =====
        // Make sure both fields are filled
        if (!username || !password) {
            displayErrorMessage('Please enter both username and password');
            return; // Stop here if validation fails
        }

        // ===== STEP 6: Hide any previous error messages =====
        clearErrorMessage();

        // ===== STEP 7: Disable the button while logging in =====
        const submitButton = loginForm.querySelector('button[type="submit"]');
        submitButton.disabled = true;
        submitButton.textContent = 'Logging in...';

        try {
            // ===== STEP 8: Encode credentials =====
            // Convert username:password to base64
            const encodedCredentials = encodeLoginData(username, password);

            // ===== STEP 9: Send login request to Zone01 API =====
            // fetch() is how we make HTTP requests in JavaScript
            const response = await fetch(API_CONFIG.SIGNIN_ENDPOINT, {
                method: 'POST',  // POST = sending data to server
                headers: {
                    // Tell the server we're using Basic Authentication
                    'Authorization': `Basic ${encodedCredentials}`,
                    'Content-Type': 'application/json'
                }
            });

            // ===== STEP 10: Check if login was successful =====
            if (response.ok) {
                // response.ok = true if status code is 200-299 (success)

                // Get the JWT token from the response
                const token = await response.json();

                // ===== STEP 11: Save the token =====
                storeAuthToken(token);

                // ===== STEP 12: Extract and save user ID =====
                const userId = extractUserID(token);
                if (userId) {
                    storeUserID(userId);
                }

                // ===== STEP 13: Success! Redirect to profile page =====
                window.location.href = 'profile.html';

            } else {
                // Login failed (wrong username/password, etc.)

                // Try to get error message from server
                let errorText = 'Invalid credentials. Please try again!';

                try {
                    const errorData = await response.json();
                    if (errorData.error) {
                        errorText = errorData.error;
                    }
                } catch (e) {
                    // If we can't parse error, use default message
                }

                // Show error to user
                displayErrorMessage(errorText);
            }

        } catch (error) {
            // This runs if there's a network error or other problem
            console.error('Login error:', error);
            displayErrorMessage('Network error. Please check your connection and try again!');
        } finally {
            // ===== STEP 14: Re-enable the button =====
            // "finally" always runs, whether success or error
            submitButton.disabled = false;
            submitButton.textContent = 'Login';
        }
    });

    // ===== HELPER FUNCTION: Show error message =====
    function displayErrorMessage(message) {
        errorMessage.textContent = message;
        errorMessage.classList.add('show');
    }

    // ===== HELPER FUNCTION: Hide error message =====
    function clearErrorMessage() {
        errorMessage.textContent = '';
        errorMessage.classList.remove('show');
    }
});
