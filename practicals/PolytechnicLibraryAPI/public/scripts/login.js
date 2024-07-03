const loginForm = document.getElementById('loginForm');

loginForm.addEventListener('submit', async (event) => {
    event.preventDefault(); // Prevent the default form submission

    const formData = new FormData(loginForm);
    const formObject = {};
    formData.forEach((value, key) => {
        formObject[key] = value;
    });

    try {
        const response = await fetch('/api/users/login', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify(formObject)
        });

        if (!response.ok) {
            throw new Error('Login failed');
        }

        // Handle successful login response as needed
        const result = await response.json();
        console.log('Login successful:', result);

        // Store token based on remember checkbox
        if (document.getElementById('flexCheckDefault').checked) {
            localStorage.setItem('token', result.token);
            sessionStorage.removeItem('token');
        } else {
            sessionStorage.setItem('token', result.token);
            localStorage.removeItem('token');
        }

        // Optionally redirect or perform actions after successful login
        window.location.href = '/home'; // Redirect to dashboard after login
    } catch (error) {
        console.error('Error during login:', error);
        // Handle login error (e.g., display error message to user)
    }
});