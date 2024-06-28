document.addEventListener("DOMContentLoaded", () => {
    const form = document.getElementById('createBlogForm');
    const fileInput = document.getElementById('photo');
    const previewImage = document.getElementById('preview');

    // Event listener for file input change
    fileInput.addEventListener('change', (event) => {
        const file = event.target.files[0];
        if (file) {
            const reader = new FileReader();
            reader.onload = function(e) {
                previewImage.src = e.target.result;
                previewImage.style.display = 'block'; // Display the image
            }
            reader.readAsDataURL(file);
        } else {
            previewImage.src = '';
            previewImage.style.display = 'none'; // Hide the image preview if no file is selected
        }
    });

    form.addEventListener('submit', async (event) => {
        event.preventDefault();

        const title = document.getElementById('title').value;
        const content = document.getElementById('content').value;
        const photo = fileInput.files[0];

        console.log("Selected photo file:", photo); // Log the selected photo file

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

        const currentDate = new Date().toISOString();

        const reader = new FileReader();
        reader.onloadend = async function() {
            const photoDataUrl = reader.result; // Base64-encoded image data URL
    
            const articleData = {
                photo: photoDataUrl,
                title: title,
                userId: userId,
                content: content,
                publicationDate: currentDate
            };
    
            try {
                const response = await fetch('/create-blog', {
                    method: 'POST',
                    headers: {
                        'Content-Type': 'application/json',
                        'Authorization': `Bearer ${token}`
                    },
                    body: JSON.stringify(articleData)
                });
    
                if (!response.ok) {
                    throw new Error('Network response was not ok');
                }
    
                const responseData = await response.json();
                console.log('Blog created successfully:', responseData);
                alert('Blog created successfully!');
                window.location.href = '/article'; // Redirect to article page after successful creation
            } catch (error) {
                console.error('Error creating Blog:', error);
                alert('Failed to create blog. Please try again.');
            }
        };
    
        if (photo) {
            reader.readAsDataURL(photo);
        } else {
            alert('Please select an image file.');
        }
    });
});
