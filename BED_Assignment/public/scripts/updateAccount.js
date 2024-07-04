document.addEventListener('DOMContentLoaded', () => {
    const params = new URLSearchParams(window.location.search);
    const userId = params.get('id');
    const userType = params.get('type');
    
    fetchUserData(userId, userType);

    document.getElementById('update-form').addEventListener('submit', (event) => {
        event.preventDefault();
        updateUserData(userId, userType);
    });
});

async function fetchUserData(userId, userType) {
    try {
        const endpoint = userType === 'admin' ? `/admin/${userId}` : `/users/${userId}`;
        const response = await fetch(endpoint);
        const user = await response.json();
        
        document.getElementById('first-name').value = user.name;
        document.getElementById('email').value = user.email;
    } catch (error) {
        console.error('Error fetching user data:', error);
    }
}

async function updateUserData(userId, userType) {
    const name = document.getElementById('first-name').value;
    const email = document.getElementById('email').value;
    const password = document.getElementById('password').value;

    try {
        const endpoint = userType === 'admin' ? `/admin/${userId}` : `/users/${userId}`;
        const response = await fetch(endpoint, {
            method: 'PUT',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({ name, email, password })
        });

        if (response.ok) {
            alert('Account updated successfully');
        } else {
            alert('Error updating account');
        }
    } catch (error) {
        console.error('Error updating account:', error);
    }
}
