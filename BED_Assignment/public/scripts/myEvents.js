document.addEventListener('DOMContentLoaded', () => {
    const token = localStorage.getItem('token'); 
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
        
        // Sort events by date
        events.sort((a, b) => new Date(a.eventTime) - new Date(b.eventTime));

        const now = new Date();
        const newEvents = [];
        const pastEvents = [];

        events.forEach(event => {
            const eventDate = new Date(event.eventTime);
            if (eventDate >= now) {
                newEvents.push(event);
            } else {
                pastEvents.push(event);
            }
        });

        const mainContainer = document.querySelector('main');
        mainContainer.innerHTML = ''; // Clear existing content

        // Display New Events
        if (newEvents.length > 0) {
            const newEventsHeader = document.createElement('h2');
            newEventsHeader.textContent = 'Current Events';
            newEventsHeader.className = 'events-header';
            mainContainer.appendChild(newEventsHeader);

            newEvents.forEach(event => populateEventDetails(event));
        }

        // Add a divider
        const divider = document.createElement('hr');
        divider.className = 'events-divider';
        mainContainer.appendChild(divider);

        // Display Past Events
        if (pastEvents.length > 0) {
            const pastEventsHeader = document.createElement('h2');
            pastEventsHeader.textContent = 'Past Events';
            pastEventsHeader.className = 'events-header';
            mainContainer.appendChild(pastEventsHeader);

            pastEvents.forEach(event => populateEventDetails(event));
        }
    } catch (error) {
        console.error('Error fetching event details:', error);
        redirectToLogin();
    }
}
function populateEventDetails(event) {
    const container = document.createElement('div');
    container.className = 'eventContainer';
    const buttonText = event.isCompanyEvent ? 'Delete Event' : 'Leave';
    const buttonAction = event.isCompanyEvent ? `deleteEvent('${event.eventId}')` : `leaveEvent('${event.eventId}')`;
    const isEventStarted = new Date(event.eventTime) <= new Date();

   
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
                    <p class="timeLeft">${isEventStarted ? 'Event has started' : calculateTimeLeft(new Date(event.eventTime))}</p>
                </div>
            </div>
            <button class="Signup ${isEventStarted ? 'disabled' : ''}" 
                    onclick="${buttonAction}" 
                    ${isEventStarted ? 'disabled' : ''}>
                ${isEventStarted ? 'Event has started' : buttonText}
            </button>
        </div>
    
        
    `;


    if (event.isCompanyEvent && event.attendees) {
        const attendeesSection = document.createElement('div');
        attendeesSection.className = 'attendees-section';
        attendeesSection.innerHTML = `
            <h2>Attendees</h2>
            <div class="attendees-list">
                ${event.attendees.map(attendee => `
                    <div class="attendee-item">
                        <span>${attendee.name} (${attendee.email})</span>
                        <button class="kick-button" onclick="kickAttendee('${event.eventId}', '${attendee.userId}')" ${isEventOver(event.eventTime) ? 'disabled' : ''}>
                            Kick
                        </button>
                    </div>
                `).join('')}
            </div>
        `;
        container.appendChild(attendeesSection);
    };

    const imgElement = container.querySelector('.gmm');
    imgElement.src = event.eventImage ? `data:image/png;base64,${event.eventImage}` : '../images/image-removebg.png';

    document.querySelector('main').appendChild(container);
    

    
}

function kickAttendee(eventId, userId) {
    const token = localStorage.getItem('token');
    if (!token || isTokenExpired(token)) {
        redirectToLogin();
        return;
    }

    fetch(`/api/events/${eventId}/kick/${userId}`, {
        method: 'DELETE',
        headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${token}`
        }
    })
    .then(response => {
        if (!response.ok) {
            console.log('Response:', response);
            throw new Error('Failed to kick attendee');
        }
        return response.json();
    })
    .then(data => {
        console.log('Attendee kicked successfully:', data);
        // Refresh the page or update the attendees list
        window.location.reload();
    })
    .catch(error => console.error('Error kicking attendee:', error));
}
function isEventOver(eventTime) {
    return new Date(eventTime) < new Date();
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
