//require('dotenv').config();
document.addEventListener('DOMContentLoaded', () => {
    const token = localStorage.getItem('token');
    const profilePictureInput = document.getElementById('profile-picture-input');
    const profilePicture = document.getElementById('profile-picture');
    console.log('Token', token);
    if (token) {
        fetch('/api/profile', {
            headers: {
                'Authorization': `Bearer ${token}`
            }
        })       
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
            console.log('Profile data: ', data);
            document.getElementById('profile-name').textContent = data.name;
            document.getElementById('profile-email').textContent = data.email;
            //document.getElementById('profile-picture').src = data.profilePictureUrl || '../images/default-profile-user.jpg';
            profilePicture.src = data.profilePictureUrl || '../images/default-profile-user.jpg'

            if (data.paypalEmail) {
                document.getElementById('paypal-email-container').style.display = 'block';
                document.getElementById('profile-paypal-email').textContent = data.paypalEmail;
              }
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

    document.getElementById('upload-profile-picture').addEventListener('click', () => {
        const formData = new FormData();
        formData.append('profilePicture', profilePictureInput.files[0]);

        fetch('/api/uploadProfilePicture', {
            method: 'POST',
            headers: {
                'Authorization': `Bearer ${token}`
            },
            body: formData
        })
        .then(response => {
            if (response.ok) {
                return response.json();
            } else {
                throw new Error('Failed to upload profile picture');
            }
        })
        .then(data => {
            // Update profile picture on the page
            profilePicture.src = data.profilePictureUrl;
            alert('Profile picture uploaded successfully!');
        })
        .catch(error => {
            console.error('Error uploading profile picture:', error.message);
            alert('Failed to upload profile picture. Please try again.');
        });
    });
    
});



document.getElementById('logout_btn').addEventListener('click', function() {
    localStorage.removeItem('token'); // Remove the token from local storage
    window.location.href = '/'; // Redirect to the home page
});
