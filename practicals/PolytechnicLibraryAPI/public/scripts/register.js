const registerForm = document.getElementById('registerForm');

registerForm.addEventListener('submit', async (event) => {
    event.preventDefault(); // Prevent the default form submission

    const formData = new FormData(registerForm);
    const formObject = {};
    
    // Convert FormData to a plain object
    formData.forEach((value, key) => {
        formObject[key] = value;
    });

    delete formObject.remember;

    console.log(formObject);

    try {
        // Modify formObject to include role from dropdown
        formObject.role = document.getElementById('dropdownInput').value;

        const response = await fetch('/api/users/register', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify(formObject)
        });

        if (response.status === 400) {
            const errorResponse = await response.json();
            console.error('Registration error:', errorResponse.message);

            // Display alert or error message to the user
            alert(errorResponse.message); // Alert with the error message from backend
        } else if (!response.ok) {
            throw new Error('Registration failed');
        }

        const result = await response.json();

        // Check if the registration was successful
        if (response.status === 200) {
            console.log('Registration successful:', result);

            // Store token based on remember checkbox
            if (document.getElementById('flexCheckDefault').checked) {
                localStorage.setItem('token', result.token);
                sessionStorage.removeItem('token');
            } else {
                sessionStorage.setItem('token', result.token);
                localStorage.removeItem('token');
            }

            // Optionally redirect or perform actions after successful registration
            window.location.href = '/home'; // Redirect to dashboard after registration
        } 
    } catch (error) {
        console.error('Error during registration:', error);
    }
});