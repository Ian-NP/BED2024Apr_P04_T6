document.addEventListener('DOMContentLoaded', () => {
  const token = localStorage.getItem('token');
  if (token) {
      fetch('/api/profile', {
          headers: {
              'Authorization': `Bearer ${token}`
          }
      })
      .then(response => {
          if (response.ok) {
              return response.json();
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
          console.error('Error:', error);
      });
  } else {
      window.location.href = '/login';
  }
});
