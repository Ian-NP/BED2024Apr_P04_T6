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

function toggleForm() {
    var userType = document.getElementById('user-type').value;
    var normalUserForm = document.getElementById('normal-user-form');
    var companyUserForm = document.getElementById('company-user-form');

    if (userType === 'N') {
        normalUserForm.classList.add('show');
        companyUserForm.classList.remove('show');

        document.getElementById('first-name').setAttribute('required', 'required');
        document.getElementById('email').setAttribute('required', 'required');
        document.getElementById('password').setAttribute('required', 'required');
        
        // Remove required attribute for company user fields
        document.getElementById('company-name').removeAttribute('required');
        document.getElementById('company-email').removeAttribute('required');
        document.getElementById('paypal-email').removeAttribute('required');
        document.getElementById('company-password').removeAttribute('required');
    } else if (userType === 'C') {
        normalUserForm.classList.remove('show');
        companyUserForm.classList.add('show');

        document.getElementById('company-name').setAttribute('required', 'required');
        document.getElementById('company-email').setAttribute('required', 'required');
        document.getElementById('paypal-email').setAttribute('required', 'required');
        document.getElementById('company-password').setAttribute('required', 'required');
        
        // Remove required attribute for normal user fields
        document.getElementById('first-name').removeAttribute('required');
        document.getElementById('email').removeAttribute('required');
        document.getElementById('password').removeAttribute('required');
    }
}

async function submitForm() {
    var userType = document.getElementById('user-type').value;
    var terms = document.getElementById('terms');
    var isValid = true;

    // Check if a user type is selected
    if (!userType) {
        alert('Please select a user type.');
        return;
    }

    // Check required fields based on the selected user type
    if (userType === 'N') {
        var firstName = document.getElementById('first-name').value;
        var email = document.getElementById('email').value;
        var password = document.getElementById('password').value;
        userType = "U"

        if (!firstName || !email || !password) {
            isValid = false;
        }
    } else if (userType === 'C') {
        var firstName = document.getElementById('company-name').value;
        var email = document.getElementById('company-email').value;
        var paypalEmail = document.getElementById('paypal-email').value;
        var password = document.getElementById('company-password').value;

        if (!firstName || !email || !password || !paypalEmail) {
            isValid = false;
        }
    }

    // Check if terms and conditions are checked
    if (!terms.checked) {
        isValid = false;
    }

    if (isValid) {
        const emailPattern = /^[a-zA-Z0-9._-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,6}$/;
        if (!emailPattern.test(email) || (userType === 'C' && !emailPattern.test(paypalEmail))) {
            isValid = false;
            alert('Please enter a valid email address.');
        }
    }

    // Submit the form if all fields are valid
    if (isValid) {
        try {
            const response = await fetch('/signup', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify({ userType, firstName, email, password, paypalEmail })
            });

            if (response.ok) {
                alert('Form submitted!');
                // Redirect the user or show a success message
            } else {
                alert('Sign-up failed. Please try again.');
            }
        } catch (error) {
            console.error('Error:', error);
            alert('Network error. Please try again later.');
        }
    } else {
        alert('Please fill in all required fields and agree to the Terms and Conditions.');
    }
}
