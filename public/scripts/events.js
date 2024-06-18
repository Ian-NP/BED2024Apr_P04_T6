window.onload = function() {
    var buttons = document.querySelectorAll("#Tag-Buttons button");
    for (var i = 0; i < buttons.length; i++) {
        buttons[i].addEventListener('click', function() {
            this.classList.toggle('clicked');
            filterEvents();
        });
    }

    const searchInput = document.getElementById("Search-Input");
    searchInput.addEventListener('input', filterEvents);
};

document.addEventListener('DOMContentLoaded', () => {
    fetchEvents();
});

let allEvents = [];

async function fetchEvents() {
    try {
        const response = await fetch('/api/events');
        const events = await response.json();
        allEvents = events;
        renderEvents(events);
    } catch (error) {
        console.error('Error fetching events:', error);
    }
}

function renderEvents(events) {
    const container = document.getElementById('Events-Container');
    container.innerHTML = '';

    events.forEach(event => {
        const eventCard = createEventCard(event);
        container.appendChild(eventCard);
    });
}

function createEventCard(event) {
    const eventDiv = document.createElement('div');
    eventDiv.className = 'Event';
    eventDiv.dataset.eventId = event.eventId; 
    eventDiv.dataset.eventCategory = event.eventCategory; 

    const eventTime = new Date(event.eventTime);
    const timeLeft = calculateTimeLeft(eventTime);
    const formattedDate = formatDate(eventTime);

    eventDiv.innerHTML = `
        <div class="Event-Image">
            <img class="Event-Image" src="../images/image-removebg.png" alt="Event Image">
        </div>
        <div id="tag">
            <p class="Event-Tag">${event.eventCategory}</p>
        </div>
        <div class="Event-Details">
            <h3 class="Event-Name">${event.eventName} <span class="Event-Cost">(Free)</span></h3>
            <p class="Event-Hoster">${event.creatorName}</p>
            <p class="Event-Details">${event.eventOverview || 'No overview available'}</p>
        </div>
        <div class="Event-Date">
            <h2 class="Date">${formattedDate}</h2>
            <h2 class="Time-Left">${timeLeft}</h2>
        </div>
    `;

    
    eventDiv.addEventListener('click', () => {
        const eventId = eventDiv.dataset.eventId;
        console.log(`Event ID: ${eventId}`); // Later remember to replace with the open new page card thingy
    });

    return eventDiv;
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

function formatDate(eventTime) {
    const day = eventTime.getDate();
    const month = eventTime.toLocaleString('default', { month: 'long' });
    const year = eventTime.getFullYear();
    return `${day} ${month} ${year}`;
}

function filterEvents() {
    const searchInput = document.getElementById("Search-Input").value.toLowerCase();
    const selectedTags = Array.from(document.querySelectorAll("#Tag-Buttons button.clicked")).map(button => button.textContent);

    const filteredEvents = allEvents.filter(event => {
        const matchesSearch = searchInput === "" || 
            event.eventName.toLowerCase().includes(searchInput) || 
            event.eventOverview.toLowerCase().includes(searchInput) || 
            event.creatorName.toLowerCase().includes(searchInput);

        const matchesTags = selectedTags.length === 0 || selectedTags.includes(event.eventCategory);

        return matchesSearch && matchesTags;
    });

    renderEvents(filteredEvents);
}
