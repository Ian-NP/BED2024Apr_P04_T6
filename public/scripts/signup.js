function toggleForm() {
    var userType = document.getElementById('user-type').value;
    var normalUserForm = document.getElementById('normal-user-form');
    var companyUserForm = document.getElementById('company-user-form');

    if (userType === 'normal') {
        normalUserForm.classList.add('show');
        companyUserForm.classList.remove('show');
    } else {
        normalUserForm.classList.remove('show');
        companyUserForm.classList.add('show');
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