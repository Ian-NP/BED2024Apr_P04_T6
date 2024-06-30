document.addEventListener('DOMContentLoaded', () => {
    const urlParams = new URLSearchParams(window.location.search);
    const eventId = parseInt(urlParams.get('eventId'), 10);
    if (eventId) {
        setTimeout(() => {
            fetchEventDetails(eventId);
        }, 100);
    }

    const token = localStorage.getItem('token');
    if (token && !isTokenExpired(token)) {
        checkUserEvents(token, eventId);
    }

    setInterval(() => {
        if (eventId) {
            fetchEventDetails(eventId);
        }
    }, 3600000);
});

function isTokenExpired(token) {
    const payload = JSON.parse(atob(token.split('.')[1]));
    const expiry = payload.exp;
    const now = Math.floor(Date.now() / 1000);
    return now >= expiry;
}

function redirectToLogin() {
    window.location.href = '/login';
}

async function fetchEventDetails(eventId) {
    try {
        const response = await fetch(`/api/events/${eventId}`);
        const event = await response.json();
        populateEventDetails(event);
        checkIfEventStarted(event);
    } catch (error) {
        console.error('Error fetching event details:', error);
    }
}

function populateEventDetails(event) {
    const container = document.getElementById('Container');
    const eventNameElement = document.getElementById('eventName');
    const costElement = document.getElementById('cost');
    const creatorNameElement = document.getElementById('creatorName');
    const tagElement = document.getElementById('tag');
    const contentElement = document.getElementById('content');
    const dateElement = document.getElementById('Date');
    const timeLeftElement = document.getElementById('timeLeft');
    const IMG = document.getElementById('gmm');

    if (eventNameElement && costElement && creatorNameElement && tagElement && contentElement && dateElement && timeLeftElement && IMG) {
        eventNameElement.innerHTML = `${event.eventName} <span id="cost">${event.cost ? `($${event.cost.toFixed(2)})` : '(Free)'}</span>`;
        container.setAttribute('data-creatorId', event.creatorId);
        creatorNameElement.innerText = event.creatorName;
        tagElement.innerText = event.eventCategory;
        contentElement.innerHTML = event.eventDesc || 'No details available';
        dateElement.innerText = new Date(event.eventTime).toLocaleDateString('en-US', {
            weekday: 'long',
            year: 'numeric',
            month: 'long',
            day: 'numeric',
            timeZone: 'Asia/Singapore'
        });
        timeLeftElement.innerText = calculateTimeLeft(new Date(event.eventTime));
        IMG.src = event.eventImage ? `data:image/png;base64,${event.eventImage}` : '../images/image-removebg.png';
    } else {
        console.error('One or more elements are not found in the DOM');
    }
}

function calculateTimeLeft(eventTime) {
    const now = new Date();
    const eventTimeInSG = new Date(eventTime);

    const diff = eventTimeInSG - now;

    if (diff <= 0) {
        return 'Event has started';
    }

    const days = Math.floor(diff / (1000 * 60 * 60 * 24));
    const hours = Math.floor((diff % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60));
    const minutes = Math.floor((diff % (1000 * 60 * 60)) / (1000 * 60));

    return `${days}d ${hours}h ${minutes}m left`;
}

async function checkIfEventStarted(event) {
    const eventTime = new Date(event.eventTime);
    const now = new Date();

    if (now >= eventTime) {
        const signUpButton = document.getElementById('Signup');
        signUpButton.classList.add('disabled');
        signUpButton.innerText = 'Event has started';
    }
}

async function checkUserEvents(token, eventId) {
    try {
        const response = await fetch('/api/events/userEvents', {
            headers: {
                'Authorization': `Bearer ${token}`
            }
        });
        const userEvents = await response.json();
        for (let event of userEvents) {
            if (event.eventId === eventId) {
                const signUpButton = document.getElementById('Signup');
                signUpButton.classList.add('disabled');
                signUpButton.innerText = 'Already Signed up';
                break;
            }
        }
    } catch (error) {
        console.error('Error fetching user events:', error);
    }
}

const signUpButton = document.getElementById('Signup');
signUpButton.addEventListener('click', async function(event) {
    const token = localStorage.getItem('token');

    if (!token || isTokenExpired(token)) {
        redirectToLogin();
        return;
    }

    const urlParams = new URLSearchParams(window.location.search);
    const eventId = parseInt(urlParams.get('eventId'), 10);
    const container = document.getElementById('Container');
    const cost = parseFloat(document.getElementById('cost').innerText.replace(/[^\d.]/g, ''));
    const creatorId = container.getAttribute('data-creatorId');

    if (cost > 0) {
        // Hide the sign-up button and display the PayPal button
        signUpButton.style.display = 'none';

        // Fetch the PayPal email of the creator
        try {
            const response = await fetch(`/api/users/${creatorId}`);
            const user = await response.json();
            const paypalEmail = user.paypalEmail;

            // Display PayPal button for payment
            document.getElementById('paypal-button-container').style.display = 'block';
            processPayPalPayment(paypalEmail, cost, eventId, token);
        } catch (error) {
            console.error('Error fetching PayPal email:', error);
            alert('Error fetching PayPal email');
            return;
        }
    } else {
        // Proceed with sign-up
        try {
            const response = await fetch(`/api/${eventId}/signup`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${token}`
                },
            });

            if (!response.ok) {
                const errorData = await response.json();
                throw new Error(errorData.message || 'Sign up failed');
            }

            alert('Sign up successful!');
            window.location.reload();
        } catch (error) {
            console.error('Error signing up:', error);
            alert(`Error signing up: ${error.message}`);
        }
    }
});

async function processPayPalPayment(paypalEmail, cost, eventId, token) {
    paypal.Buttons({
        intent: 'authorize',
        createOrder: function(data, actions) {
            return actions.order.create({
                purchase_units: [{
                    amount: {
                        value: cost.toFixed(2)
                    },
                    payee: {
                        email_address: paypalEmail
                    }
                }],
                application_context: {
                    shipping_preference: 'NO_SHIPPING'
                }
            });
        },
        onApprove: function(data, actions) {
            return actions.order.authorize().then(async function(authorization) {
                const authorizationID = authorization.purchase_units[0].payments.authorizations[0].id;

                // Save authorizationID to server
                await fetch(`/api/events/${eventId}/authorize`, {
                    method: 'POST',
                    headers: {
                        'Content-Type': 'application/json',
                        'Authorization': `Bearer ${token}`
                    },
                    body: JSON.stringify({
                        authorizationID: authorizationID
                    })
                });

                alert('Payment authorized! Proceeding with sign-up.');

                // Proceed with sign-up
                const signUpResponse = await fetch(`/api/${eventId}/signup`, {
                    method: 'POST',
                    headers: {
                        'Content-Type': 'application/json',
                        'Authorization': `Bearer ${token}`
                    },
                });

                if (!signUpResponse.ok) {
                    const errorData = await signUpResponse.json();
                    throw new Error(errorData.message || 'Sign up failed');
                }

                alert('Sign up successful!');
                window.location.reload();
            });
        },
        onError: function(err) {
            console.error('Error during the transaction:', err);
            alert('Payment failed');
        }
    }).render('#paypal-button-container');
}
