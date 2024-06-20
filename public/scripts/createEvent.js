document.addEventListener('DOMContentLoaded', () => {
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
        const eventTime = new Date(document.getElementById('eventTime').value);
        const eventCost = document.querySelector('input[name="eventCost"]:checked').value;
        const eventPrice = document.getElementById('eventPrice').value;

        // Main preview elements
        const previewEventImage = document.getElementById('previewEventImage');
        const eventName = document.getElementById('eventName');
        const creatorName = document.getElementById('creatorName');
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
        const formattedEventDate = formatDate(eventTime);
        const formattedTimeLeft = calculateTimeLeft(eventTime);

        // Main preview
        eventName.textContent = formattedEventName;
        tag.textContent = eventTag;
        content.textContent = eventDesc;
        creatorName.textContent = 'Creator Name';  // Replace with actual creator name if available
        eventDate.textContent = formattedEventDate;
        timeLeft.textContent = formattedTimeLeft;

        // Event card
        eventCardTag.textContent = eventTag;
        eventCardName.textContent = formattedEventName;
        eventCardHoster.textContent = 'Creator Name';  // Replace with actual creator name if available
        eventCardDetails.textContent = eventOverview || 'No overview available';
        eventCardDate.textContent = formattedEventDate;
        eventCardTimeLeft.textContent = formattedTimeLeft;
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
});
