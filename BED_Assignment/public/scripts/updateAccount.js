document.addEventListener('DOMContentLoaded', () => {
    const params = new URLSearchParams(window.location.search);
    const userId = params.get('id');
    const userType = params.get('type');
    
    console.log(`Fetching data for ${userType} with ID: ${userId}`);

    fetchUserData(userId, userType);

    document.getElementById('update-form').addEventListener('submit', (event) => {
        event.preventDefault();
        updateUserData(userId, userType);
    });
});

//fetch acc details first before updating
async function fetchUserData(userId, userType) {
    try {
        const endpoint = userType === 'admin' ? `/admin/${userId}` : `/users/${userId}`;
        console.log(`Fetching data from endpoint: ${endpoint}`);
        const response = await fetch(endpoint);

        if (!response.ok) {
            throw new Error('Error fetching user data');
        }

        const userData = await response.json();
        console.log(`Fetched user data:`, userData);
        document.getElementById('first-name').value = userData.name;
        document.getElementById('email').value = userData.adminEmail || userData.email; 
        
    } catch (error) {
        console.error('Error fetching user data:', error);
    }
}

//to update the user account info
async function updateUserData(userId, userType) {
    const name = document.getElementById('first-name').value;
    const email = document.getElementById('email').value;

    try {
        const endpoint = userType === 'admin' ? `/admin/${userId}` : `/users/${userId}`;
        console.log(`Updating ${userType} with ID ${userId} at endpoint: ${endpoint}`);
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

// to submit the form for updating
async function submitForm() {
    const firstName = document.getElementById('first-name').value;
    const email = document.getElementById('email').value;
    const password = document.getElementById('password').value;

    const userId = getUserIdFromURL();
    const userType = getUserTypeFromURL();

    console.log('User ID:', userId);
    console.log('User Type:', userType);

    const endpoint = userType === 'admin' ? `/admin/${userId}` : `/users/${userId}`;

    console.log('Endpoint:', endpoint);

    const data = {
        name: firstName,
        password: password
    };

    if (userType === 'admin') {
        data.adminEmail = email;
    } else {
        data.email = email;
        data.userType = userType === 'C' ? 'C' : 'U';
    }

    console.log('Data to send:', data);

    try {
        const response = await fetch(endpoint, {
            method: 'PUT',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify(data)
        });

        console.log('Response:', response);

        if (response.ok) {
            alert('Account updated successfully!');
        } else {
            const errorData = await response.json();
            console.error('Error data:', errorData);
            if (errorData && errorData.errors) {
                const errorMessage = errorData.errors.join('\n');
                alert('Error updating account:\n' + errorMessage);
            } else {
                alert('Error updating account: ' + response.statusText);
            }
        }
    } catch (error) {
        console.error('Error:', error);
        alert('An error occurred while updating the account.');
    }
}




