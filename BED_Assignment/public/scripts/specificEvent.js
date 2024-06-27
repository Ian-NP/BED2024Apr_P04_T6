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
    
    const IMG = document.getElementById('gmm');

    if (eventNameElement && costElement && creatorNameElement && tagElement && contentElement && dateElement && timeLeftElement && IMG) {
        eventNameElement.innerHTML = `${event.eventName} <span id="cost">${event.cost ? `($${event.cost.toFixed(2)})` : '(Free)'}</span>`;
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
        console.log(event.eventImage);
        IMG.src = event.eventImage ? `data:image/png;base64,${event.eventImage}` : '../images/image-removebg.png';
    } else {
        console.error('One or more elements are not found in the DOM');
    }
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



    const signUpButton = document.getElementById('Signup');

    signUpButton.addEventListener('click', async function(event) {
        const token = localStorage.getItem('token');
      
        const urlParams = new URLSearchParams(window.location.search);
        const eventId = urlParams.get('eventId');
        try {
            const response = await fetch(`/api/${eventId}/signup`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${token}`
                },
                
            });
    
            if (!response.ok) {
                // If the response status is not ok (e.g., 4xx or 5xx), throw an error
                const errorData = await response.json();
                throw new Error(errorData.message || 'Sign up failed');
            }
    
            alert('Sign up successful!');
        } catch (error) {
            console.error('Error signing up:', error);
            alert(`Error signing up: ${error.message}`);
        }
    });
    
