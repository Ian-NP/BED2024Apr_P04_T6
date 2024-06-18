document.addEventListener('DOMContentLoaded', () => {
    const urlParams = new URLSearchParams(window.location.search);
    const eventId = urlParams.get('eventId');
    if (eventId) {
        fetchEventDetails(eventId);
    }
});

async function fetchEventDetails(eventId) {
    try {
        const response = await fetch(`/api/events/${eventId}`);
        const event = await response.json();
        populateEventDetails(event);
    } catch (error) {
        console.error('Error fetching event details:', error);
    }
}

function populateEventDetails(event) {
    const eventNameElement = document.getElementById('eventName');
    const costElement = document.getElementById('cost');
    const creatorNameElement = document.getElementById('creatorName');
    const tagElement = document.getElementById('tag');
    const contentElement = document.getElementById('content');
    const dateElement = document.getElementById('Date');
    const timeLeftElement = document.getElementById('timeLeft');

    if (eventNameElement && costElement && creatorNameElement && tagElement && contentElement && dateElement && timeLeftElement) {
        eventNameElement.innerText = event.eventName;
        costElement.innerText = event.cost ? `(${event.cost})` : '(Free)';
        creatorNameElement.innerText = event.creatorName;
        tagElement.innerText = event.eventCategory;
        contentElement.innerHTML = event.eventDesc || 'No details available'; 
        dateElement.innerText = new Date(event.eventTime).toLocaleDateString('en-US', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' });
        timeLeftElement.innerText = calculateTimeLeft(new Date(event.eventTime));
    } else {
        console.error('One or more elements are not found in the DOM');
    }
}

function calculateTimeLeft(eventTime) {
    const now = new Date();
    const diff = eventTime - now;

    if (diff <= 0) {
        return 'Event has started';
    }

    const days = Math.floor(diff / (1000 * 60 * 60 * 24));
    const hours = Math.floor((diff % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60));
    const minutes = Math.floor((diff % (1000 * 60 * 60)) / (1000 * 60));

    return `${days}d ${hours}h ${minutes}m left`;
}
