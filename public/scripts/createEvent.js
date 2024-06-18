document.addEventListener('DOMContentLoaded', () => {
    const eventFreeCheckbox = document.getElementById('eventFree');
    const priceContainer = document.getElementById('priceContainer');

    eventFreeCheckbox.addEventListener('change', () => {
        if (eventFreeCheckbox.checked) {
            priceContainer.style.display = 'none';
        } else {
            priceContainer.style.display = 'block';
        }
    });

    const previewButton = document.getElementById('previewButton');
    previewButton.addEventListener('click', () => {
        const form = document.getElementById('createEventForm');
        const formData = new FormData(form);

        const event = {
            image: formData.get('eventImage'),
            title: formData.get('eventTitle'),
            tag: formData.get('eventTag'),
            desc: formData.get('eventDesc'),
            overview: formData.get('eventOverview'),
            time: formData.get('eventTime'),
            free: formData.get('eventFree'),
            price: formData.get('eventFree') ? 'Free' : formData.get('eventPrice')
        };

        const previewUrl = `../html/specificEventDetails.html?title=${encodeURIComponent(event.title)}&tag=${encodeURIComponent(event.tag)}&desc=${encodeURIComponent(event.desc)}&overview=${encodeURIComponent(event.overview)}&time=${encodeURIComponent(event.time)}&price=${encodeURIComponent(event.price)}`;

        window.open(previewUrl, '_blank');
    });
});
