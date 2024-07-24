//require('dotenv').config();


// document.addEventListener('DOMContentLoaded', () => {
//     const token = localStorage.getItem('token');
//     const profilePictureInput = document.getElementById('profile-picture-input');
//     const profilePicture = document.getElementById('profile-picture');
//     console.log('Token', token);
//     if (token) {
//         const adminId = jwt_decode(token).adminId;
//         fetch(`/api/profile/${adminId}`, {
//             headers: {
//                 'Authorization': `Bearer ${token}`
//             }
//         })       
//         .then(response => {
//             if (response.ok) {
//                 return response.json();
//             } else if (response.status === 401) {
//                 console.error('Unauthorized: Invalid or expired token');
//                 throw new Error('Unauthorized: Invalid or expired token');
//             } else {
//                 throw new Error('Failed to fetch profile data');
//             }
//         })
//         .then(data => {
//             console.log('Profile data: ', data);
//             document.getElementById('profile-name').textContent = data.name;
//             document.getElementById('profile-email').textContent = data.adminEmail;
//             profilePicture.src = data.profilePictureUrl || '../images/default-profile-user.jpg'

//             // if (data.paypalEmail) {
//             //     document.getElementById('paypal-email-container').style.display = 'block';
//             //     document.getElementById('profile-paypal-email').textContent = data.paypalEmail;
//             // }
//         })
//         .catch(error => {
//             console.error('Error fetching profile data:', error.message);
//             if (error.message.includes('Unauthorized')) {
//                 window.location.href = '/login';
//             }
//         });
//     } else {
//         window.location.href = '/login';
//     }

//     profilePictureInput.addEventListener('change', (event) => {
//         const file = event.target.files[0];
//         if (file) {
//             const reader = new FileReader();
//             reader.onload = (e) => {
//                 profilePicture.src = e.target.result;
//             };
//             reader.readAsDataURL(file);
//         }
//     });

//     document.getElementById('upload-profile-picture').addEventListener('click', () => {
//         const formData = new FormData();
//         formData.append('profilePicture', profilePictureInput.files[0]);
    
//         fetch(`/api/uploadProfilePicture/${jwt_decode(token).adminId}`, {
//             method: 'POST',
//             headers: {
//                 'Authorization': `Bearer ${token}`
//             },
//             body: formData
//         })
//         .then(response => {
//             if (response.ok) {
//                 return response.json();
//             } else {
//                 // Check the response status and handle accordingly
//                 if (response.status === 404) {
//                     throw new Error('User not found or profile picture unchanged');
//                 } else {
//                     throw new Error('Failed to upload profile picture');
//                 }
//             }
//         })
//         .then(data => {
//             // Update profile picture on the page with cache busting
//             profilePicture.src = `${data.profilePictureUrl}?t=${new Date().getTime()}`;
//             alert('Profile picture uploaded successfully!');
//         })
//         .catch(error => {
//             console.error('Error uploading profile picture:', error.message);
//             alert('Failed to upload profile picture. Please try again.');
//         });
//     });
// });

// document.getElementById('logout_btn').addEventListener('click', function() {
//     localStorage.removeItem('token');
//     window.location.href = '/';
// });

document.addEventListener('DOMContentLoaded', () => {
    const token = localStorage.getItem('token');
    if (token) {
        const decoded = jwt_decode(token);
        const userType = decoded.userType;
        console.log(userType);

        if (userType === 'U' || userType === 'C') {
            loadUserProfile();
        } else {
            loadAdminProfile();
        }
    } else {
        window.location.href = '/login';
    }
});

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

    //     document.getElementById('upload-profile-picture').addEventListener('click', () => {
//         const formData = new FormData();
//         formData.append('profilePicture', profilePictureInput.files[0]);
    
//         fetch(`/api/uploadProfilePicture/${jwt_decode(token).adminId}`, {
//             method: 'POST',
//             headers: {
//                 'Authorization': `Bearer ${token}`
//             },
//             body: formData
//         })
//         .then(response => {
//             if (response.ok) {
//                 return response.json();
//             } else {
//                 // Check the response status and handle accordingly
//                 if (response.status === 404) {
//                     throw new Error('User not found or profile picture unchanged');
//                 } else {
//                     throw new Error('Failed to upload profile picture');
//                 }
//             }
//         })
//         .then(data => {
//             // Update profile picture on the page with cache busting
//             profilePicture.src = `${data.profilePictureUrl}?t=${new Date().getTime()}`;
//             alert('Profile picture uploaded successfully!');
//         })
//         .catch(error => {
//             console.error('Error uploading profile picture:', error.message);
//             alert('Failed to upload profile picture. Please try again.');
//         });
//     });
// });

    document.getElementById('logout_btn').addEventListener('click', function() {
        localStorage.removeItem('token');
        window.location.href = '/';
    });
}
