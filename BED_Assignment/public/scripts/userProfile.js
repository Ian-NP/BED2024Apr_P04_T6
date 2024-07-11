// profile.js
document.addEventListener('DOMContentLoaded', () => {
    const token = localStorage.getItem('token');
    if (!token) {
      window.location.href = '/login'; // Redirect to login page if not logged in
    } else {
      fetchUserProfile(token);
    }
  });
  
  async function fetchUserProfile(token) {
    try {
      const response = await fetch('/profile', {
        headers: {
          'Authorization': token
        }
      });
      if (!response.ok) throw new Error('Failed to fetch profile');
      const userProfile = await response.json();
      displayUserProfile(userProfile);
    } catch (err) {
      console.error(err);
      window.location.href = '/login'; // Redirect to login page if token is invalid
    }
  }
  
  function displayUserProfile(user) {
    document.getElementById('username').textContent = user.username;
    document.getElementById('email').textContent = user.email;
    // Display other user info as needed
  }
  