console.log('Script loaded');

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

function submitForm() {
var userType = document.getElementById('user-type').value;
var terms = document.getElementById('terms');
var isValid = true;

// Check if a user type is selected
if (!userType) {
alert('Please select a user type.');
return;
}

// Check required fields based on the selected user type
if (userType === 'normal') {
var firstName = document.getElementById('first-name').value;
var email = document.getElementById('email').value;
var password = document.getElementById('password').value;

if (!firstName || !email || !password) {
    isValid = false;
}
} else if (userType === 'company') {
var companyName = document.getElementById('company-name').value;
var companyEmail = document.getElementById('company-email').value;
var companyPassword = document.getElementById('company-password').value;

if (!companyName || !companyEmail || !companyPassword) {
    isValid = false;
}
}

// Check if terms and conditions are checked
if (!terms.checked) {
isValid = false;
}

// Submit the form if all fields are valid
if (isValid) {
alert('Form submitted!');
} else {
alert('Please fill in all required fields and agree to the Terms and Conditions.');
}
}

document.getElementById('normal-user-form').addEventListener('submit', async (event) => {
    event.preventDefault();
    console.log('Normal user form submitted');
    
    const name = document.getElementById('name').value;
    const email = document.getElementById('email').value;
    const password = document.getElementById('password').value;

    try {
        const response = await fetch('/signup', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({ name, email, password })
        });

        if (response.ok) {
            // Sign-up successful
            // Redirect the user or show a success message
        } else {
            // Sign-up failed
            // Handle the error (e.g., display error message to the user)
        }
    } catch (error) {
        console.error('Error:', error);
        // Handle network errors or other exceptions
    }
});

document.getElementById('company-user-form').addEventListener('submit', async (event) => {
    event.preventDefault();
    
    const name = document.getElementById('name').value;
    const email = document.getElementById('email').value;
    const password = document.getElementById('password').value;

    try {
        const response = await fetch('/signup', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({ name, email, password })
        });

        if (response.ok) {
            // Sign-up successful
            // Redirect the user or show a success message
        } else {
            // Sign-up failed
            // Handle the error (e.g., display error message to the user)
        }
    } catch (error) {
        console.error('Error:', error);
        // Handle network errors or other exceptions
    }
});
