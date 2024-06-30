document.addEventListener('DOMContentLoaded', () => {
    const token = localStorage.getItem('token');
    if (token) {
        if (!isTokenExpired(token)) {
            const userType = getUserTypeFromToken(token);
            if (userType === 'C') {
                document.querySelector('.nav-link[href="/events"]').textContent = 'Create Events';
            }
        }
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
