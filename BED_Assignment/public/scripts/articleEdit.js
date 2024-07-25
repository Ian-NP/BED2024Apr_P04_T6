// document.addEventListener('DOMContentLoaded', async () => {
//     try {
//         const articleId = localStorage.getItem('editArticleId');
//         const token = localStorage.getItem('token');

//         if (!articleId) {
//             throw new Error('No article ID found in localStorage.');
//         }

//         const response = await fetch(`/api/article/id/${articleId}`, {
//             method: 'GET',
//             headers: {
//                 'Authorization': `Bearer ${token}`
//             }
//         });

//         if (!response.ok) {
//             throw new Error('Failed to fetch article details.');
//         }

//         const article = await response.json();
//         console.log('Article:', article);

//         // Populate the edit form with existing article data
//         document.getElementById('editArticleId').value = article.articleId;
//         document.getElementById('editTitle').value = article.title;
//         document.getElementById('editContent').value = article.content;
//         document.getElementById('editPhotoPreview').src = `data:image/jpeg;base64,${article.photo}`;
//         document.getElementById('editPhotoPreview').style.display = 'block';

//         // Display the edit modal if necessary
//         // document.getElementById('editArticleModal').style.display = 'block';

//     } catch (error) {
//         console.error('Error fetching article details:', error);
//         alert('Failed to fetch article details. Please try again.');
//     }
// });

// document.getElementById('editArticleForm').addEventListener('submit', async (event) => {
//     event.preventDefault();
    
//     const articleId = document.getElementById('editArticleId').value;
//     const title = document.getElementById('editTitle').value;
//     const content = document.getElementById('editContent').value;
//     const photoFile = document.getElementById('editPhoto').files[0];
    
//     let photoDataUrl = '';
    
//     if (photoFile) {
//         const reader = new FileReader();
//         reader.onloadend = async function () {
//             photoDataUrl = reader.result;
//             await updateArticle(articleId, title, content, photoDataUrl);
//         };
//         reader.readAsDataURL(photoFile);
//     } else {
//         await updateArticle(articleId, title, content, photoDataUrl);
//     }
// });

// async function updateArticle(articleId, title, content, photoDataUrl) {
//     const token = localStorage.getItem('token');
//     const updatedArticle = {
//         title: title,
//         content: content,
//         photo: photoDataUrl.split(',')[1], // Extract base64 part from data URL
//         publicationDate: new Date().toISOString()
//     };
    
//     try {
//         const response = await fetch(`/api/article/id/${articleId}`, {
//             method: 'PUT',
//             headers: {
//                 'Content-Type': 'application/json',
//                 'Authorization': `Bearer ${token}`
//             },
//             body: JSON.stringify(updatedArticle)
//         });
        
//         if (!response.ok) {
//             throw new Error('Failed to update article.');
//         }
        
//         alert('Article updated successfully!');
//         // Optionally, redirect back to the articles page or update the UI
//         window.location.href = '../html/articleMyBlogs.html';
//     } catch (error) {
//         console.error('Error updating article:', error);
//         alert('Failed to update the article. Please try again.');
//     }
// }

// function closeEditModal() {
//     document.getElementById('editArticleModal').style.display = 'none';
// }
document.addEventListener('DOMContentLoaded', async () => {
    try {
        const articleId = localStorage.getItem('editArticleId');
        const token = localStorage.getItem('token');

        if (!articleId) {
            throw new Error('No article ID found in localStorage.');
        }

        console.log('Article ID:', articleId);
        console.log('Token:', token);

        const response = await fetch(`/api/article/id/${articleId}`, {
            method: 'GET',
            headers: {
                'Authorization': `Bearer ${token}`
            }
        });

        if (!response.ok) {
            const errorText = await response.text();
            throw new Error(`Failed to fetch article details. ${errorText}`);
        }

        const article = await response.json();
        console.log('Fetched Article:', article);

        // Populate the edit form with existing article data
        const editArticleIdElem = document.getElementById('editArticleId');
        const editTitleElem = document.getElementById('editTitle');
        const editContentElem = document.getElementById('editContent');
        const editPhotoPreviewElem = document.getElementById('editPhotoPreview');

        console.log('editArticleId element:', editArticleIdElem);
        console.log('editTitle element:', editTitleElem);
        console.log('editContent element:', editContentElem);
        console.log('editPhotoPreview element:', editPhotoPreviewElem);

        editArticleIdElem.value = article.articleId;
        editTitleElem.value = article.title;
        editContentElem.value = article.content;

        if (article.photo) {
            const base64Photo = `data:image/jpeg;base64,${article.photo}`;
            editPhotoPreviewElem.src = base64Photo;
            editPhotoPreviewElem.style.display = 'block';
            console.log('Photo src:', base64Photo);
        } else {
            editPhotoPreviewElem.style.display = 'none';
        }

        console.log('editArticleId value:', editArticleIdElem.value);
        console.log('editTitle value:', editTitleElem.value);
        console.log('editContent value:', editContentElem.value);
        console.log('editPhotoPreview src:', editPhotoPreviewElem.src);

    } catch (error) {
        console.error('Error fetching article details:', error);
        alert('Failed to fetch article details. Please try again.');
    }
});

document.getElementById('editArticleForm').addEventListener('submit', async (event) => {
    event.preventDefault();

    const articleId = document.getElementById('editArticleId').value;
    const title = document.getElementById('editTitle').value;
    const content = document.getElementById('editContent').value;
    const photoFile = document.getElementById('editPhoto').files[0];

    let photoDataUrl = '';

    if (photoFile) {
        const reader = new FileReader();
        reader.onloadend = async function () {
            photoDataUrl = reader.result;
            await updateArticle(articleId, title, content, photoDataUrl);
        };
        reader.readAsDataURL(photoFile);
    } else {
        // Fetch the current photo data from the preview element if the photo is not changed
        const currentPhotoSrc = document.getElementById('editPhotoPreview').src;
        if (currentPhotoSrc && currentPhotoSrc.startsWith('data:image/jpeg;base64,')) {
            photoDataUrl = currentPhotoSrc;
        }
        await updateArticle(articleId, title, content, photoDataUrl);
    }
});

async function updateArticle(articleId, title, content, photoDataUrl) {
    const token = localStorage.getItem('token');
    let userId = 'userId';
    if (token) {
        try {
            const decodedToken = jwt_decode(token);
            console.log('decodeToken:', decodedToken); // Log the token to verify its presence
            userId = decodedToken.userId || userId;
        } catch (error) {
            console.error('Failed to decode token:', error);
        }
    }

    const updatedArticle = {
        articleId: articleId,
        userId: userId,
        title: title,
        content: content,
        photo: photoDataUrl ? photoDataUrl.split(',')[1] : '', // Extract base64 part from data URL
        publicationDate: new Date().toISOString()
    };

    try {
        const response = await fetch(`/api/article/id/${articleId}`, {
            method: 'PUT',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${token}`
            },
            body: JSON.stringify(updatedArticle)
        });

        if (!response.ok) {
            const errorText = await response.text();
            throw new Error(`Failed to update article. ${errorText}`);
        }

        alert('Article updated successfully!');
        window.location.href = '../html/articleMyBlogs.html';
    } catch (error) {
        console.error('Error updating article:', error);
        alert('Failed to update the article. Please try again.');
    }
}

function closeEditModal() {
    document.getElementById('editArticleModal').style.display = 'none';
    window.location.href = '../html/articleMyBlogs.html';
}

