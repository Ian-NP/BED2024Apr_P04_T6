
    const eventFreeRadio = document.getElementById('eventFree');
    const eventNotFreeRadio = document.getElementById('eventNotFree');
    const priceContainer = document.getElementById('priceContainer');
    const previewButton = document.getElementById('previewButton');
    const createEventForm = document.getElementById('createEventForm');
    

    eventFreeRadio.addEventListener('change', togglePriceInput);
    eventNotFreeRadio.addEventListener('change', togglePriceInput);

    function togglePriceInput() {
        if (eventNotFreeRadio.checked) {
            priceContainer.style.display = 'block';
        } else {
            priceContainer.style.display = 'none';
        }
    }

    previewButton.addEventListener('click', () => {
        if (createEventForm.checkValidity()) {
            populatePreview();
            document.getElementById('preview').style.display = 'block';
            document.querySelector('.container.mt-5.pt-5').style.display = 'none';
        } else {
            createEventForm.reportValidity();
        }
    });

    function populatePreview() {
        const eventImage = document.getElementById('eventImage').files[0];
        const eventTitle = document.getElementById('eventTitle').value;
        const eventTag = document.getElementById('eventTag').value;
        const eventDesc = document.getElementById('eventDesc').value;
        const eventOverview = document.getElementById('eventOverview').value;
        const eventTimeInput = document.getElementById('eventTime').value;
        let eventTime = null;
    
        // Get creator name from token
        const token = localStorage.getItem('token');
        let creatorName = 'Creator Name'; // Default value
        let hosterName = 'Hoster Name'; // Default value
        if (token) {
            try {
                const decodedToken = jwt_decode(token); // Use jwt_decode directly
                creatorName = decodedToken.userName || creatorName; // Use the userName from the token if available
                hosterName = decodedToken.userName || hosterName; // Use the same userName for hoster
            } catch (error) {
                console.error('Failed to decode token:', error);
            }
        }
    
        // Check if eventTime is not empty
        if (eventTimeInput) {
            eventTime = new Date(eventTimeInput);
            if (isNaN(eventTime.getTime())) {
                alert('Invalid date format');
                return;
            }
        }
    
        const eventCost = document.querySelector('input[name="eventCost"]:checked').value;
        const eventPrice = document.getElementById('eventPrice').value;
    
        // Main preview elements
        const previewEventImage = document.getElementById('previewEventImage');
        const eventName = document.getElementById('eventName');
        const creatorNameElem = document.getElementById('creatorName');
        const tag = document.getElementById('tag');
        const content = document.getElementById('content');
        const eventDate = document.getElementById('eventDate');
        const timeLeft = document.getElementById('timeLeft');
    
        // Event card elements
        const eventCardImage = document.querySelector('.Event-Image img');
        const eventCardTag = document.querySelector('.Event-Tag');
        const eventCardName = document.querySelector('.Event-Name');
        const eventCardHoster = document.querySelector('.Event-Hoster');
        const eventCardDetails = document.querySelector('p.Event-Details');
        const eventCardDate = document.querySelector('.Event-Date .Date');
        const eventCardTimeLeft = document.querySelector('.Event-Date .Time-Left');
    
        if (eventImage) {
            const reader = new FileReader();
            reader.onload = function(e) {
                previewEventImage.src = e.target.result;
                eventCardImage.src = e.target.result;
            };
            reader.readAsDataURL(eventImage);
        }
    
        const formattedEventName = eventTitle + (eventCost === 'free' ? ' (Free)' : ` ($${eventPrice})`);
        const formattedEventDate = eventTime ? formatDate(eventTime) : 'No date provided';
        const formattedTimeLeft = eventTime ? calculateTimeLeft(eventTime) : 'No date provided';
    
        // Main preview
        eventName.textContent = formattedEventName;
        tag.textContent = eventTag;
        content.textContent = eventDesc;
        creatorNameElem.textContent = creatorName;
        eventDate.textContent = formattedEventDate;
        timeLeft.textContent = formattedTimeLeft;
    
        // Event card
        eventCardTag.textContent = eventTag;
        eventCardName.textContent = formattedEventName;
        eventCardHoster.textContent = hosterName;
        eventCardDetails.textContent = eventOverview || 'No overview available';
        eventCardDate.textContent = formattedEventDate;
        eventCardTimeLeft.textContent = formattedTimeLeft;
    }
    
    function formatDate(date) {
        return date.toLocaleDateString('en-US', {
            weekday: 'long',
            year: 'numeric',
            month: 'long',
            day: 'numeric',
            timeZone: 'Asia/Singapore'
        });
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
    

    function formatDate(eventTime) {
        const day = eventTime.getDate();
        const month = eventTime.toLocaleString('default', { month: 'long' });
        const year = eventTime.getFullYear();
        const hours = eventTime.getHours();
        const minutes = eventTime.getMinutes();
        const ampm = hours >= 12 ? 'PM' : 'AM';
        const formattedHours = hours % 12 || 12;  // Convert to 12-hour format
        const formattedMinutes = minutes.toString().padStart(2, '0');  // Ensure two digits

        return `${formattedHours}:${formattedMinutes} ${ampm} ${day} ${month} ${year}`;
    }

    document.getElementById('myButton').addEventListener('click', function() {
        document.getElementById('preview').style.display = 'none';
        document.querySelector('.container.mt-5.pt-5').style.display = 'block';
    });

   
    document.getElementById('createButton').addEventListener('click', async function(event) {
        event.preventDefault();
    
        const eventImageFile = document.getElementById('eventImage').files[0];
        const eventTitle = document.getElementById('eventTitle').value;
        const eventDesc = document.getElementById('eventDesc').value;
        const eventOverview = document.getElementById('eventOverview').value;
        const eventCategory = document.getElementById('eventTag').value;
        const eventTime = document.getElementById('eventTime').value;
        let eventCost = document.querySelector('input[name="eventCost"]:checked').value;
    
        // Check the actual price input value if the event is not free
        if (eventCost.toLowerCase() === 'free') {
            eventCost = 0;
        } else {
            eventCost = parseFloat(document.getElementById('eventPrice').value);
            if (isNaN(eventCost)) {
                alert('Please enter a valid price.');
                return;
            }
        }
    
        const token = localStorage.getItem('token');
        if (!token) {
            alert('User not authenticated');
            return;
        }
    
        const decodedToken = jwt_decode(token);
        const creatorId = decodedToken.userId;
    
        const reader = new FileReader();
        reader.onloadend = async function() {
            const eventImageBase64 = reader.result;
    
            const eventData = {
                eventName: eventTitle,
                eventDesc: eventDesc,
                eventOverview: eventOverview,
                eventCategory: eventCategory,
                eventTime: eventTime,
                cost: eventCost,
                creatorId: creatorId,
                eventImage: eventImageBase64
            };
    
            try {
                const response = await fetch('/create-event', {
                    method: 'POST',
                    headers: {
                        'Content-Type': 'application/json',
                        'Authorization': `Bearer ${token}`
                    },
                    body: JSON.stringify(eventData)
                });
    
                if (!response.ok) {
                    throw new Error('Network response was not ok');
                }
    
                const responseData = await response.json();
                console.log('Event created successfully:', responseData);
            } catch (error) {
                console.error('Error creating event:', error);
            }
        };
    
        if (eventImageFile) {
            reader.readAsDataURL(eventImageFile);
        } else {
            alert('Please select an image file.');
        }
    });