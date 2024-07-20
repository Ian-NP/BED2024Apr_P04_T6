

document.addEventListener('DOMContentLoaded', () => {
    const token = localStorage.getItem('token');
    if (token) {
        if (!isTokenExpired(token)) {
            const userType = getUserTypeFromToken(token);
            if (userType === 'C') {
                document.querySelector('.nav-link[href="/events"]').textContent = 'Create Events';
            }
            toggleButtons(true);
        } else{
            localStorage.removeItem('token');
            toggleButtons(false);
        }
    } else {
        toggleButtons(false);
    }

    
   
});



function getUserTypeFromToken(token) {
    const payload = JSON.parse(atob(token.split('.')[1]));
    return payload.userType;
}

function toggleButtons(isLoggedIn) {
    const signUpBtn = document.getElementById('signUp_btn');
    const loginBtn = document.getElementById('login_btn');
    const profileBtn = document.getElementById('profile_btn');
    const logoutBtn = document.getElementById('logout_btn');

    if (isLoggedIn) {
        signUpBtn.style.display = 'none';
        loginBtn.style.display = 'none';
        profileBtn.style.display = 'block';
        logoutBtn.style.display = 'block';
    } else {
        signUpBtn.style.display = 'block';
        loginBtn.style.display = 'block';
        profileBtn.style.display = 'none';
        logoutBtn.style.display = 'none';
    }
}

function articlePage() {
    window.location.href="/article";
}

function chatBotPage(){
    window.location.href="/chatbot"
}

function eventsPage(){
    window.location.href="/events"
}


document.getElementById('logout_btn').addEventListener('click', async () => {
    localStorage.removeItem('token');
    toggleButtons(false);
    const refreshToken = localStorage.getItem('refreshToken');
    console.log('Logging out with refresh token:', refreshToken);
    await removeToken(refreshToken); // Await the removeToken function to complete
   
});

async function removeToken(token) {
    try {
        console.log('Removing token:', token);  
        const response = await fetch('/refreshToken', {
            method: 'DELETE',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({ token })
        });

        if (response.ok) {
            const result = await response.json();
            localStorage.removeItem('refreshToken');
            console.log('Token removed:', result);
        } else {
            const errorMessage = await response.json();
            console.error('Error removing token:', errorMessage);
        }
    } catch (error) {
        console.error('Error removing token:', error);
    }
};


// Token management functions

// Function to check if the token is expired
function isTokenExpired(token) {
    if (!token) return true;

    const payload = JSON.parse(atob(token.split('.')[1]));
    const expirationTime = payload.exp * 1000; // Convert to milliseconds

    const minutesLeft = (expirationTime - Date.now()) / (1000 * 60); // Calculate minutes left
    console.log(minutesLeft);

    return Date.now() >= expirationTime;
}

// Function to refresh the access token
async function refreshAccessTokenIfNeeded() {
    const accessToken = localStorage.getItem('token');
    const refreshToken = localStorage.getItem('refreshToken');

    if (!refreshToken) {
        console.error('No refresh token available');
       
        window.location.href = '/login';
        return null;
    }

    if (!isTokenExpired(accessToken)) {
        return accessToken;
    }

    console.log('Access token expired. Refreshing...');
    try {
        const response = await fetch('/refreshToken', {
            method: 'GET',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({ refreshToken })
        });

        if (response.ok) {
            const data = await response.json();
            localStorage.setItem('token', data.accessToken);
            console.log('Access token refreshed successfully');
            return data.accessToken;
        } else {
            console.error('Failed to refresh access token');
            
            window.location.href = '/login';
            return null;
        }
    } catch (error) {
        console.error('Error refreshing access token:', error);
        
        window.location.href = '/login';
        return null;
    }
}

setInterval(refreshAccessTokenIfNeeded, 60000); // Refresh access token every minute