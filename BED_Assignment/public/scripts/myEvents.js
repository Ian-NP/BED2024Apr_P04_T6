document.addEventListener('DOMContentLoaded', () => {
    const token = localStorage.getItem('token'); // Assuming the token is stored in local storage
    if (token && !isTokenExpired(token)) {
        fetchEventsDetails(token);
    } else {
        redirectToLogin();
    }
});

function isTokenExpired(token) {
    const payload = JSON.parse(atob(token.split('.')[1]));
    const expirationDate = new Date(payload.exp * 1000);
    return expirationDate < new Date();
}

function redirectToLogin() {
    window.location.href = '/login';
}

async function fetchEventsDetails(token) {
    try {
        const response = await fetch(`/api/events/userEvents`, {
            method: 'GET',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${token}`
            }
        });

        if (!response.ok) {
            const errorData = await response.json();
            throw new Error(errorData.message || 'Failed to fetch event details');
        }

        const events = await response.json();
        events.forEach(event => {
            populateEventDetails(event);
            checkIfEventStarted(event);
        });
    } catch (error) {
        console.error('Error fetching event details:', error);
        redirectToLogin();
    }
}

function populateEventDetails(event) {
    const container = document.createElement('div');
    container.className = 'eventContainer';

    container.innerHTML = `
        <div class="top">
            <div class="image">
                <img class="gmm" src="../images/image-removebg.png" alt="Event Image">
            </div> 
            <div class="heading">
                <h1 class="eventName">${event.eventName} <span class="cost">${event.cost ? `($${event.cost.toFixed(2)})` : '(Free)'}</span></h1>
                <h2 class="creatorName">${event.creatorName}</h2>
                <p class="tag">${event.eventCategory}</p>
            </div>
        </div>
        <hr>
        <h1 class="details">Details</h1>
        <p class="content">${event.eventDesc || 'No details available'}</p>
        <div class="bottom">
            <div class="deadline">
                <h1 class="Deadline">Deadline</h1>
                <div class="lowest">
                    <p class="Date">${new Date(event.eventTime).toLocaleDateString('en-US', {
                        weekday: 'long',
                        year: 'numeric',
                        month: 'long',
                        day: 'numeric',
                        timeZone: 'Asia/Singapore'
                    })}</p>
                    <p class="timeLeft">${calculateTimeLeft(new Date(event.eventTime))}</p>
                </div>
            </div>
            <button class="Signup" onclick="${event.isCompanyEvent ? `deleteEvent('${event.eventId}')` : `leaveEvent('${event.eventId}')`}">${event.isCompanyEvent ? 'Delete Event' : 'Leave'}</button>
        </div>
    `;

    const imgElement = container.querySelector('.gmm');
    imgElement.src = event.eventImage ? `data:image/png;base64,${event.eventImage}` : '../images/image-removebg.png';

    document.querySelector('main').appendChild(container);
}

function leaveEvent(eventId) {
    const token = localStorage.getItem('token');
    if (!token || isTokenExpired(token)) {
        redirectToLogin();
        return;
    }

    fetch(`/api/${eventId}/leave`, {
        method: 'PATCH',
        headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${token}`
        }
    })
        .then(response => {
            if (!response.ok) {
                throw new Error('Failed to leave event');
            }

            window.location.reload();
        })
        .catch(error => console.error('Error leaving event:', error));
}

function deleteEvent(eventId) {
    const token = localStorage.getItem('token');
    if (!token || isTokenExpired(token)) {
        redirectToLogin();
        return;
    }

    fetch(`/api/events/${eventId}`, {
        method: 'DELETE',
        headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${token}`
        }
    })
        .then(response => {
            if (!response.ok) {
                throw new Error('Failed to delete event');
            }

            window.location.reload();
        })
        .catch(error => console.error('Error deleting event:', error));
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

function checkIfEventStarted(event) {
    const eventTime = new Date(event.eventTime);
    const now = new Date();

    if (now >= eventTime) {
        const signUpButton = document.querySelector(`.eventContainer .Signup`);
        signUpButton.classList.add('disabled');
        signUpButton.innerText = 'Event has started';
    }
}
