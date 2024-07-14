//require('dotenv').config();
document.addEventListener('DOMContentLoaded', () => {
    const token = localStorage.getItem('token');
    console.log('Token', token);
    if (token) {
        fetch('/api/profile', {
            headers: {
                'Authorization': `Bearer ${token}`
            }
        })
        console.log()
        .then(response => {
            if (response.ok) {
                return response.json();
            } else if (response.status === 401) {
                console.error('Unauthorized: Invalid or expired token');
                throw new Error('Unauthorized: Invalid or expired token');
            } else {
                throw new Error('Failed to fetch profile data');
            }
        })
        .then(data => {
            document.getElementById('profile-name').textContent = data.name;
            document.getElementById('profile-email').textContent = data.email;
            document.getElementById('profile-picture').src = data.profilePicture || '/default-profile-picture.jpg';
        })
        .catch(error => {
            console.error('Error fetching profile data:', error.message);
            // Handle specific errors, e.g., redirect to login on unauthorized
            if (error.message.includes('Unauthorized')) {
                window.location.href = '/login';
            }
            // Handle other errors as needed
        });
    } else {
        window.location.href = '/login';
    }
});
