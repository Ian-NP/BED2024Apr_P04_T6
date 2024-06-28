document.addEventListener("DOMContentLoaded", () => {
    const form = document.getElementById('create-blog-form');
    const fileInput = document.getElementById('photo');

    form.addEventListener('submit', async (event) => {
        event.preventDefault();

        const title = document.getElementById('title').value;
        const content = document.getElementById('content').value;
        const photo = fileInput.files[0];

        if (!title || !content || !photo) {
            alert("All fields are required!");
            return;
        }

        const token = localStorage.getItem('token');
        let userId = 'userId';
        if (token) {
            try {
                const decodedToken = jwt_decode(token);
                userId = decodedToken.userId || userId;
            } catch (error) {
                console.error('Failed to decode token:', error);
            }
        }

        const formData = new FormData();
        formData.append('title', title);
        formData.append('userId', userId);
        formData.append('content', content);

        const currentDate = new Date().toISOString();
        formData.append('publicationDate', currentDate);

        const reader = new FileReader();
        reader.onload = async () => {
            const base64Photo = reader.result.split(',')[1];
            formData.append('photo', base64Photo);
            
            console.log("Form data before sending:", Object.fromEntries(formData.entries())); // Log form data

            try {
                const response = await fetch('/api/create-blog', {
                    method: 'POST',
                    body: formData
                });

                if (response.ok) {
                    alert("Blog created successfully!");
                    window.location.href = '/articles';
                } else {
                    const errorData = await response.json();
                    alert("Failed to create blog. Please try again.");
                    console.error('Error response:', errorData); // Log error response
                }
            } catch (error) {
                console.error('Error creating blog:', error);
                alert("Failed to create blog. Please try again.");
            }
        };
        reader.readAsDataURL(photo);
    });

    const previewButton = document.getElementById('previewButton');

    previewButton.addEventListener('click', () => {
        if (form.checkValidity()) {
            populatePreview();
            document.getElementById('preview').style.display = 'block';
            document.querySelector('.container.mt-5.pt-5').style.display = 'none';
        } else {
            form.reportValidity();
        }
    });

    function populatePreview() {
        const title = document.getElementById('title').value;
        const content = document.getElementById('content').value;
        const photo = fileInput.files[0];

        const reader = new FileReader();
        reader.onload = function(e) {
            const previewPhoto = document.getElementById('previewPhoto');
            previewPhoto.src = e.target.result;
        };
        reader.readAsDataURL(photo);

        const previewTitle = document.getElementById('previewTitle');
        previewTitle.textContent = title;

        const previewContent = document.getElementById('previewContent');
        previewContent.textContent = content;
    }

    document.getElementById('editButton').addEventListener('click', function() {
        document.getElementById('preview').style.display = 'none';
        document.querySelector('.container.mt-5.pt-5').style.display = 'block';
    });
});
