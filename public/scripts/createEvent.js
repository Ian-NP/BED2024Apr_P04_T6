document.addEventListener('DOMContentLoaded', () => {
    const eventFreeRadio = document.getElementById('eventFree');
    const eventNotFreeRadio = document.getElementById('eventNotFree');
    const priceContainer = document.getElementById('priceContainer');

    eventFreeRadio.addEventListener('change', togglePriceInput);
    eventNotFreeRadio.addEventListener('change', togglePriceInput);

    function togglePriceInput() {
        if (eventNotFreeRadio.checked) {
            priceContainer.style.display = 'block';
        } else {
            priceContainer.style.display = 'none';
        }
    }

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
            free: formData.get('eventCost') === 'free',
            price: formData.get('eventCost') === 'free' ? 'Free' : formData.get('eventPrice')
        };

        const previewUrl = `../html/specificEventDetails.html?title=${encodeURIComponent(event.title)}&tag=${encodeURIComponent(event.tag)}&desc=${encodeURIComponent(event.desc)}&overview=${encodeURIComponent(event.overview)}&time=${encodeURIComponent(event.time)}&price=${encodeURIComponent(event.price)}`;

        window.open(previewUrl, '_blank');
    });
});


document.getElementById('myButton').addEventListener('click', function() {
    document.getElementById('preview').style.display = 'none';
    document.querySelector('.container.mt-5.pt-5').style.display = 'block';
});