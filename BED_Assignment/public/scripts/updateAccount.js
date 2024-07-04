document.addEventListener('DOMContentLoaded', () => {
    const params = new URLSearchParams(window.location.search);
    const userId = params.get('id');
    const userType = getUserTypeFromURL(); // Assume you have implemented this function

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
        
        if (!response.ok) {
            throw new Error('Error fetching user data');
        }
        
        const userData = await response.json();
        document.getElementById('first-name').value = userData.name;
        document.getElementById('email').value = userData.email;
        // Password field should not be pre-filled for security reasons
    } catch (error) {
        console.error('Error fetching user data:', error);
    }
}

async function updateUserData(userId, userType) {
    const name = document.getElementById('first-name').value;
    const email = document.getElementById('email').value;

    try {
        const endpoint = userType === 'admin' ? `/admin/${userId}` : `/users/${userId}`;
        const response = await fetch(endpoint, {
            method: 'PUT',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({ name, email })
        });

        if (response.ok) {
            alert('Account updated successfully!');
        } else {
            const errorData = await response.json();
            if (errorData && errorData.error) {
                alert('Error updating account: ' + errorData.error);
            } else {
                alert('Error updating account: ' + response.statusText);
            }
        }
    } catch (error) {
        console.error('Error updating account:', error);
        alert('An error occurred while updating the account.');
    }
}


document.addEventListener('DOMContentLoaded', function() {
    const updateForm = document.getElementById('update-form');
    updateForm.addEventListener('submit', function(event) {
        event.preventDefault(); // Prevent default form submission

        // Check if the form is valid
        if (signupForm.checkValidity()) {
            submitForm();
        } else {
            // If form is not valid, show validation errors
            signupForm.reportValidity();
        }
    });
});

function getUserIdFromURL() {
    const urlParams = new URLSearchParams(window.location.search);
    return urlParams.get('id');
}

function getUserTypeFromURL() {
    const urlParams = new URLSearchParams(window.location.search);
    return urlParams.get('type');
}

async function submitForm() {
    const firstName = document.getElementById('first-name').value;
    const email = document.getElementById('email').value;
    const password = document.getElementById('password').value;

    const userId = getUserIdFromURL(); // Implement this function to get userId from URL
    const userType = getUserTypeFromURL(); // Implement this function to get userType from URL

    const endpoint = userType === 'admin' ? `/admin/${userId}` : `/users/${userId}`;

    const data = {
        name: firstName,
        email: email,
        password: password
    };

    try {
        const response = await fetch(endpoint, {
            method: 'PUT',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify(data)
        });

        if (response.ok) {
            alert('Account updated successfully!');
        } else {
            const errorData = await response.json();
            if (errorData && errorData.error) {
                alert('Error updating account: ' + errorData.error);
            } else {
                alert('Error updating account: ' + response.statusText);
            }
        }
    } catch (error) {
        console.error('Error:', error);
        alert('An error occurred while updating the account.');
    }
}
