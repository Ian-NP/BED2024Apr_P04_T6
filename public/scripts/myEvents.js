document.addEventListener('DOMContentLoaded', () => {
    const token = localStorage.getItem('token'); // Assuming the token is stored in local storage
    if (token) {
        fetchEventsDetails(token);
    } else {
        console.error('Token not found');
    }
});

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
        events.forEach(event => populateEventDetails(event));
    } catch (error) {
        console.error('Error fetching event details:', error);
    }
}
function populateEventDetails(event) {
    const container = document.createElement('div');
    container.className = 'eventContainer'; // Use className instead of id to handle multiple events

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
            <button class="Signup" onclick="signUpEvent('${event.id}')">Sign Up</button>
        </div>
    `;

    const imgElement = container.querySelector('.gmm');
    imgElement.src = event.eventImage ? `data:image/png;base64,${event.eventImage}` : '../images/image-removebg.png';

    document.querySelector('main').appendChild(container);
}



function calculateTimeLeft(eventTime) {
    const now = new Date().toLocaleString('en-US', { timeZone: 'Asia/Singapore' });
    const currentTime = new Date(now);
    const eventDateTime = new Date(eventTime).toLocaleString('en-US', { timeZone: 'Asia/Singapore' });
    const eventTimeInSG = new Date(eventDateTime);
    const diff = eventTimeInSG - currentTime;

    if (diff <= 0) {
        return 'Event has started';
    }

    const days = Math.floor(diff / (1000 * 60 * 60 * 24));
    const hours = Math.floor((diff % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60));
    const minutes = Math.floor((diff % (1000 * 60)) / (1000 * 60));

    return `${days}d ${hours}h ${minutes}m left`;
}