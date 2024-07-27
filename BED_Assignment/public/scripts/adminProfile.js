//require('dotenv').config();

document.addEventListener('DOMContentLoaded', () => {
    const token = localStorage.getItem('token');
    if (token) {
        const decoded = jwt_decode(token);
        const userType = decoded.userType;
        const userId = decoded.userId;
        console.log(userType);

        const aboutSection = document.querySelector('.about-card');
        //checking to see if its a user and if it is, it load user profile
        //else it will load admin profile

        if (userType === 'U' || userType === 'C') {
            loadUserProfile();
        } else {
            aboutSection.style.display = 'none';
            loadAdminProfile();
        }
    } else {
        window.location.href = '/login';
    }
});

//To fetch about info for users only
async function fetchAboutInfo() {
    const token = localStorage.getItem('token');
    const userId = jwt_decode(token).userId;
    try {
        const response = await fetch(`/api/getAboutInfo/${userId}`, {
            headers: {
                'Authorization': `Bearer ${getToken()}`
            }
        });
        console.log(response);

        if (response.ok) {
            const data = await response.json();
            document.getElementById('about-textarea').value = data.about || '';
        } else {
            console.error('Failed to fetch about info:', await response.text());
        }
    } catch (error) {
        console.error('Error:', error);
    }
}
fetchAboutInfo();

//to save user about info
async function saveAboutInfo() {
    const token = localStorage.getItem('token');
    const userId = jwt_decode(token).userId;
    const aboutText = document.getElementById('about-textarea').value;
    
    
    try {
        const response = await fetch(`/api/saveAboutInfo/${userId}`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${getToken()}`
            },
            body: JSON.stringify({ about: aboutText })
        });
        console.log(response);

        if (response.ok) {
            alert('Profile info saved successfully');
        } else {
            console.error('Failed to save profile info:', await response.text());
        }
    } catch (error) {
        console.error('Error:', error);
    }
    
}
document.getElementById('save-about-button').addEventListener('click', saveAboutInfo);


//Function to load user profile
function loadUserProfile() {
    const token = localStorage.getItem('token');
    const userId = jwt_decode(token).userId;
    fetch(`/api/profile/${userId}`, {
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
        document.getElementById('profile-name').textContent = data.name;
        document.getElementById('profile-email').textContent = data.email;
        document.getElementById('profile-picture').src = data.profilePictureUrl || '../images/default-profile-user.jpg';

        if (data.paypalEmail) {
            document.getElementById('paypal-email-container').style.display = 'block';
            document.getElementById('profile-paypal-email').textContent = data.paypalEmail;
        }
    })
    .catch(error => {
        console.error('Error fetching profile data:', error.message);
        if (error.message.includes('Unauthorized')) {
            window.location.href = '/login';
        }
    });

    
//to upload the profile picture
    document.getElementById('upload-profile-picture').addEventListener('click', () => {
        const profilePictureInput = document.getElementById('profile-picture-input');
        const formData = new FormData();
        formData.append('profilePicture', profilePictureInput.files[0]);

        fetch(`/api/uploadProfilePicture/${userId}`, {
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
                if (response.status === 404) {
                    throw new Error('User not found or profile picture unchanged');
                } else {
                    throw new Error('Failed to upload profile picture');
                }
            }
        })
        .then(data => {
            document.getElementById('profile-picture').src = `${data.profilePictureUrl}?t=${new Date().getTime()}`;
            alert('Profile picture uploaded successfully!');
        })
        .catch(error => {
            console.error('Error uploading profile picture:', error.message);
            alert('Failed to upload profile picture. Please try again.');
        });
    });
    

    document.getElementById('logout_btn').addEventListener('click', function() {
        localStorage.removeItem('token');
        window.location.href = '/';
    });
}

//Function to load admin profile
function loadAdminProfile() {
    const profilePicture = document.getElementById('profile-picture');
    const token = localStorage.getItem('token');
    const adminId = jwt_decode(token).adminId;
    fetch(`/api/adminProfile/${adminId}`, {
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
        document.getElementById('profile-name').textContent = data.name;
        document.getElementById('profile-email').textContent = data.email;
        document.getElementById('profile-picture').src = data.profilePictureUrl || '../images/default-profile-user.jpg';
    })
    .catch(error => {
        console.error('Error fetching profile data:', error.message);
        if (error.message.includes('Unauthorized')) {
            window.location.href = '/login';
        }
    });
//for uploading of profile picture
    document.getElementById('upload-profile-picture').addEventListener('click', () => {
        const profilePictureInput = document.getElementById('profile-picture-input');
        const formData = new FormData();
        formData.append('profilePicture', profilePictureInput.files[0]);

        fetch(`/api/uploadAdminProfilePicture/${adminId}`, {
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
                if (response.status === 404) {
                    throw new Error('Admin not found or profile picture unchanged');
                } else {
                    throw new Error('Failed to upload profile picture');
                }
            }
        })
        .then(data => {
            profilePicture.src = `${data.profilePictureUrl}?t=${new Date().getTime()}`;
            alert('Profile picture uploaded successfully!');
        })
        .catch(error => {
            console.error('Error uploading profile picture:', error.message);
            alert('Failed to upload profile picture. Please try again.');
        });
    });
//to handle logout
    document.getElementById('logout_btn').addEventListener('click', function() {
        localStorage.removeItem('token');
        window.location.href = '/';
    });
}
//to get the token
function getToken() {
    return localStorage.getItem('token');
}


  
