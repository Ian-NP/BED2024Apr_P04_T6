document.getElementById('login-form').addEventListener('submit', async function(event) {
    event.preventDefault();
    var email = document.getElementById('email').value;
    var password = document.getElementById('password').value;

    console.log('Form submitted with:', { email, password }); // Debug log

    try {
        const response = await fetch('/adminlogin', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({ email, password })
        });

        console.log('Response status:', response.status); // Debug log

        if (response.ok) {
            const result = await response.json();
            console.log('Login response:', result); // Check if this logs in the browser console

            if (result.success) {
                alert('Login Successful!');
                localStorage.setItem('token', result.token); // Store token securely
                window.location.href = '/adminhomepage'; // Redirect user to the home page
            } else {
                alert(result.message); // Display error message from server
            }
        } else {
            const errorMessage = await response.json();
            console.log('Error message:', errorMessage); // Debug log
            alert('Login failed: ' + errorMessage.message);
        }
    } catch (error) {
        console.error('Error:', error);
        alert('Network error. Please try again later.');
    }
});
