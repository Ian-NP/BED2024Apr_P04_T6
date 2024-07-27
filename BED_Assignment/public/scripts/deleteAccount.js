document.addEventListener('DOMContentLoaded', () => {
    const params = new URLSearchParams(window.location.search);
    const userId = params.get('id');
    const userType = params.get('type');

    fetchUserData(userId, userType);

    document.getElementById('confirm-delete').addEventListener('click', () => {
        if (confirm('Are you sure you want to delete this account? This account will be permanently deleted.')) {
            deleteUserAccount(userId, userType);
        }
    });
});

//fetches user data first to display it
async function fetchUserData(userId, userType) {
    try {
        const endpoint = userType === 'admin' ? `/admin/${userId}` : `/users/${userId}`;
        const response = await fetch(endpoint);
        
        if (!response.ok) {
            throw new Error('Error fetching user data');
        }
        
        const userData = await response.json();
        document.getElementById('first-name').value = userType === 'admin' ? userData.name : userData.name;
        document.getElementById('email').value = userType === 'admin' ? userData.adminEmail : userData.email;
    } catch (error) {
        console.error('Error fetching user data:', error);
    }
}

//to delete a user account
async function deleteUserAccount(userId, userType) {
    try {
        const endpoint = userType === 'admin' ? `/admin/${userId}` : `/users/${userId}`;
        const response = await fetch(endpoint, {
            method: 'DELETE'
        });

        if (response.ok) {
            alert('Account deleted successfully!');
            window.location.href = '/html/viewaccounts.html';
        } else {
            const errorData = await response.json();
            alert('Error deleting account: ' + errorData.message);
        }
    } catch (error) {
        console.error('Error deleting account:', error);
        alert('An error occurred while deleting the account.');
    }
}
