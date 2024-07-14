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

    
    setInterval(() => {
        const token = localStorage.getItem('token');
        if (token && isTokenExpired(token)) {
            localStorage.removeItem('token');
        }
    }, 60000); 
});

function isTokenExpired(token) {
    const payload = JSON.parse(atob(token.split('.')[1]));
    const expirationDate = new Date(payload.exp * 1000);
    return expirationDate < new Date();
}

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


document.getElementById('logout_btn').addEventListener('click', () => {
    localStorage.removeItem('token');
    toggleButtons(false);
    window.location.href = '/';
});
