console.log('Script loaded');

document.addEventListener('DOMContentLoaded', function() {
    const signupForm = document.getElementById('signup-form');
    signupForm.addEventListener('submit', function(event) {
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


async function submitForm() {
    const firstName = document.getElementById('first-name').value; //getting attributes from the form
    const email = document.getElementById('email').value;
    const password = document.getElementById('password').value;

    if (firstName && email && password) {
        const data = {
            name: firstName,
            adminEmail: email,
            password: password
        };
        //Creating admin account via POST method from attributes entered in form
        try {
            const response = await fetch('/createadmin', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify(data)
            });

            if (response.ok) {
                alert('Admin account created successfully!');
            } else {
                const errorData = await response.json();
                alert('Error: ' + errorData.message);
            }
        } catch (error) {
            console.error('Error:', error);
            alert('An error occurred while creating the admin account.');
        }
    } else {
        alert('Please fill out all fields.');
    }
}

