

// // document.addEventListener("DOMContentLoaded", () => {
// //     const form = document.getElementById('createBlogForm');
// //     const fileInput = document.getElementById('photo');

// //     form.addEventListener('submit', async (event) => {
// //         event.preventDefault();

// //         const title = document.getElementById('title').value;
// //         const content = document.getElementById('content').value;
// //         const photo = fileInput.files[0];

// //         if (!title || !content || !photo) {
// //             alert("All fields are required!");
// //             return;
// //         }

// //         const token = localStorage.getItem('token');
// //         let userId = 'userId';
// //         if (token) {
// //             try {
// //                 const decodedToken = jwt_decode(token);
// //                 userId = decodedToken.userId || userId;
// //             } catch (error) {
// //                 console.error('Failed to decode token:', error);
// //             }
// //         }

// //         const formData = new FormData();
// //         formData.append('title', title);
// //         formData.append('userId', userId);
// //         formData.append('content', content);

// //         const currentDate = new Date().toISOString();
// //         formData.append('publicationDate', currentDate);

// //         const reader = new FileReader();
// //         reader.onload = async () => {
// //             const base64Photo = reader.result.split(',')[1];
// //             formData.append('photo', base64Photo);
            
// //             console.log("Form data before sending:", Object.fromEntries(formData.entries())); // Log form data

// //             try {
// //                 const response = await fetch('/api/create-blog', {
// //                     method: 'POST',
// //                     body: formData
// //                 });

// //                 if (response.ok) {
// //                     alert("Blog created successfully!");
// //                     window.location.href = '/articles';
// //                 } else {
// //                     const errorData = await response.json();
// //                     alert("Failed to create blog. Please try again.");
// //                     console.error('Error response:', errorData); // Log error response
// //                 }
// //             } catch (error) {
// //                 console.error('Error creating blog:', error);
// //                 alert("Failed to create blog. Please try again.");
// //             }
// //         };
// //         reader.readAsDataURL(photo);
// //     });

// //     const previewButton = document.getElementById('previewButton');

// //     previewButton.addEventListener('click', () => {
// //         if (form.checkValidity()) {
// //             populatePreview();
// //             document.getElementById('preview').style.display = 'block';
// //             document.querySelector('.container.mt-5.pt-5').style.display = 'none';
// //         } else {
// //             form.reportValidity();
// //         }
// //     });

// //     function populatePreview() {
// //         const title = document.getElementById('title').value;
// //         const content = document.getElementById('content').value;
// //         const photo = fileInput.files[0];

// //         const reader = new FileReader();
// //         reader.onload = function(e) {
// //             const previewPhoto = document.getElementById('previewPhoto');
// //             previewPhoto.src = e.target.result;
// //         };
// //         reader.readAsDataURL(photo);

// //         const previewTitle = document.getElementById('previewTitle');
// //         previewTitle.textContent = title;

// //         const previewContent = document.getElementById('previewContent');
// //         previewContent.textContent = content;
// //     }

// //     document.getElementById('editButton').addEventListener('click', function() {
// //         document.getElementById('preview').style.display = 'none';
// //         document.querySelector('.container.mt-5.pt-5').style.display = 'block';
// //     });
// // });


// document.addEventListener("DOMContentLoaded", () => {
//     const form = document.getElementById('createBlogForm');
//     const fileInput = document.getElementById('photo');
//     const previewImage = document.getElementById('preview');

//     form.addEventListener('submit', async (event) => {
//         event.preventDefault();

//         const title = document.getElementById('title').value;
//         const content = document.getElementById('content').value;
//         const photo = fileInput.files[0];

//         console.log("Selected photo file:", photo); // Log the selected photo file

//         if (!title || !content || !photo) {
//             alert("All fields are required!");
//             return;
//         }

//         const token = localStorage.getItem('token');
//         let userId = 'userId';
//         if (token) {
//             try {
//                 const decodedToken = jwt_decode(token);
//                 userId = decodedToken.userId || userId;
//             } catch (error) {
//                 console.error('Failed to decode token:', error);
//             }
//         }

//         // const formData = new FormData();
//         // formData.append('title', title);
//         // formData.append('userId', userId);
//         // formData.append('content', content);

//         const currentDate = new Date().toISOString();
//         // formData.append('publicationDate', currentDate);

//         const reader = new FileReader();
//         reader.onloadend = async function() {
//             const photo = reader.result;
    
//             const articleData = {
//                 photo: photo,
//                 title: title,
//                 userId: userId,
//                 content: content,
//                 publicationDate: currentDate
//             };
    
//             try {
//                 const response = await fetch('/api/create-blog', {
//                     method: 'POST',
//                     headers: {
//                         'Content-Type': 'application/json',
//                         'Authorization': `Bearer ${token}`
//                     },
//                     body: JSON.stringify(articleData)
//                 });
    
//                 if (!response.ok) {
//                     throw new Error('Network response was not ok');
//                 }
    
//                 const responseData = await response.json();
//                 console.log('Blog created successfully:', responseData);
//             } catch (error) {
//                 console.error('Error creating Blog:', error);
//             }
//         };
    
//         if (photo) {
//             reader.readAsDataURL(photo);
//         } else {
//             // Handle the case where there is no image file
//             alert('Please select an image file.');
//         }
//     })
// });
//     //     // Convert photo to base64
//     //     const reader = new FileReader();
//     //     reader.onload = function(event) {
//     //         previewImage.src = event.target.result;
//     //         const base64Photo = event.target.result.split(',')[1]; // Get base64 part only
//     //         formData.append('photo', base64Photo);
//     //         console.log("Form data before sending:", Object.fromEntries(formData.entries())); // Log form data

//     //         // Send formData to server
//     //         sendFormData(formData);
//     //     };
//     //     reader.readAsDataURL(photo);
//     // });

//     // async function sendFormData(formData) {
//     //     try {
//     //         const response = await fetch('/create-blog', {
//     //             method: 'POST',
//     //             body: formData
//     //         });

//     //         if (response.ok) {
//     //             alert("Blog created successfully!");
//     //             window.location.href = '/article';
//     //         } else {
//     //             const errorData = await response.json();
//     //             alert("Failed to create blog. Please try again.");
//     //             console.error('Error response:', errorData); // Log error response
//     //         }
//     //     } catch (error) {
//     //         console.error('Error creating blog:', error);
//     //         alert("Failed to create blog. Please try again.");
//     //     }
//     // }
// // });

document.addEventListener("DOMContentLoaded", () => {
    const form = document.getElementById('createBlogForm');
    const fileInput = document.getElementById('photo');
    const previewImage = document.getElementById('preview');

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
