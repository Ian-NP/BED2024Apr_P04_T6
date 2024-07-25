// // document.addEventListener('DOMContentLoaded', async () => {
// //     try {
// //         const response = await fetch('/api/article/:userId');
// //         const articles = await response.json();
// //         const articlesContainer = document.getElementById('articles');
// //         articles.forEach(article => {
// //             const articleCard = document.createElement('div');
// //             articleCard.classList.add('col-md-4', 'mb-4');
// //             console.log('Article:', article);
// //             articleCard.innerHTML = `
// //                 <div class="card">
// //                     <div class="flex justify-between p-4">
// //                         <button class="button unfavorite-button">Unfavorite</button>
// //                     </div>
// //                     <div class="card-header">
// //                         <img src="data:image/jpeg;base64,${article.photo}" class="card-img-top" alt="...">
// //                     </div>
// //                     <div class="card-content">
// //                         <div class="card-title">${article.title}</div>
// //                         <div class="card-description">${article.content.substring(0, 10)}...</div>
// //                     </div>
// //                     <div class="card-footer">
// //                         <a href="/articleIndividual?articleId=${article.articleId}" class="button read-more-button">Read More</a>
// //                     </div>
// //                 </div>
// //             `;
// //             articlesContainer.appendChild(articleCard);
// //         });
// //     } catch (error) {
// //         console.error('Error fetching articles:', error);
// //     }
// // });

// document.addEventListener('DOMContentLoaded', async () => {
//     try {
//         const token = localStorage.getItem('token');
//         console.log('Token:', token); // Log the token to verify its presence
//         let userId = 'userId';
//         if (token) {
//             try {
//                 const decodedToken = jwt_decode(token);
//                 console.log('decodeToken:', decodedToken); // Log the token to verify its presence
//                 userId = decodedToken.userId || userId;
//             } catch (error) {
//                 console.error('Failed to decode token:', error);
//             }
//         }
//         const response = await fetch(`/api/article/user/${userId}`);
//         const articles = await response.json();
//         const articlesContainer = document.querySelector('div[style*="display: grid;"]');
//         articles.forEach(article => {
//             const articleCard = document.createElement('div');
//             articleCard.setAttribute('data-article-id', article.articleId);
//             articleCard.style.border = "1px solid #ccc";
//             articleCard.style.borderRadius = "4px";

//             articleCard.innerHTML = `
//                 <div style="padding: 0;">
//                     <img src="data:image/jpeg;base64,${article.photo}" alt="..." style="width: 100%; height: 240px; object-fit: cover;">
//                 </div>
//                 <div style="padding: 16px;">
//                     <h2 style="font-size: 18px; font-weight: bold;">${article.title}</h2>
//                     <p>${article.content.substring(0, 10)}...</p>
//                 </div>
//                 <div style="padding: 16px; display: flex; align-items: center; justify-content: space-between;">
//                     <span style="display: flex; align-items: center;">
//                         <svg viewBox="0 0 24 24" style="width: 16px; height: 16px; margin-right: 8px;"><path d="M7 10v4 H17 V10 Z"/></svg> ${new Date(article.publicationDate).toISOString().split('T')[0]}
//                     </span>
//                     <div style="display: flex; gap: 8px;">
//                         <button style="border: 1px solid #ccc; background: white; padding: 8px; font-size: 12px;" onclick="editArticle(${article.articleId})">Edit</button>
//                         <button style="border: 1px solid #f00; background: white; padding: 8px; font-size: 12px;" onclick="deleteArticle(${article.articleId})">Delete</button>
//                     </div>
//                 </div>
//             `;
//             articlesContainer.appendChild(articleCard);
//         });
//     } catch (error) {
//         console.error('Error fetching articles:', error);
//     }
// });

// async function deleteArticle(articleId) {
//     const token = localStorage.getItem('token');
//     if (!token) {
//         alert('You need to be logged in to delete an article.');
//         return;
//     }
//     console.log('Article ID:', articleId);
//     try {
//         console.log('deleting article:', articleId);
//         const response = await fetch(`/api/article/id/${articleId}`, {
//             method: 'DELETE',
//             headers: {
//                 'Content-Type': 'application/json',
//                 'Authorization': `Bearer ${token}`
//             }    
//         });

//         if (!response.ok) {
//             throw new Error('Failed to delete article.');
//         }

//         alert('Article deleted successfully!');
//         // Remove the article from the UI
//         document.querySelector(`[data-article-id="${articleId}"]`).remove();
//     } catch (error) {
//         console.error('Error deleting article:', error);
//         alert('Failed to delete the article. Please try again.');
//     }
// }

// async function editArticle(articleId) {
//     try {
//         // Redirect to the edit page
//         console.log('article id: ', articleId);
//         window.location.href = '../html/articleEdit.html';

//         const token = localStorage.getItem('token');
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
//         console.log('articlle: ', article);

//         // Ensure the DOM is fully loaded before accessing the elements
//         document.addEventListener('DOMContentLoaded', () => {
//             // Populate the edit form with existing article data
//             document.getElementById('editArticleId').value = article.articleId;
//             document.getElementById('editTitle').value = article.title;
//             document.getElementById('editContent').value = article.content;
//             document.getElementById('editPhotoPreview').src = `data:image/jpeg;base64,${article.photo}`;
//             document.getElementById('editPhotoPreview').style.display = 'block';

//             // Display the edit modal
//             document.getElementById('editArticleModal').style.display = 'block';
//         });
//     } catch (error) {
//         console.error('Error fetching article details:', error);
//         alert('Failed to fetch article details. Please try again.');
//     }
// }


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
//         location.reload(); // Refresh the page or update the UI
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
        const token = localStorage.getItem('token');
        console.log('Token:', token); // Log the token to verify its presence
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
        const response = await fetch(`/api/article/user/${userId}`);
        const articles = await response.json();
        const articlesContainer = document.querySelector('div[style*="display: grid;"]');
        articles.forEach(article => {
            const articleCard = document.createElement('div');
            articleCard.setAttribute('data-article-id', article.articleId);
            articleCard.style.border = "1px solid #ccc";
            articleCard.style.borderRadius = "4px";

            articleCard.innerHTML = `
                <div style="padding: 0;">
                    <img src="data:image/jpeg;base64,${article.photo}" alt="..." style="width: 100%; height: 240px; object-fit: cover;">
                </div>
                <div style="padding: 16px;">
                    <h2 style="font-size: 18px; font-weight: bold;">${article.title}</h2>
                    <p>${article.content.substring(0, 10)}...</p>
                </div>
                <div style="padding: 16px; display: flex; align-items: center; justify-content: space-between;">
                    <span style="display: flex; align-items: center;">
                        <svg viewBox="0 0 24 24" style="width: 16px; height: 16px; margin-right: 8px;"><path d="M7 10v4 H17 V10 Z"/></svg> ${new Date(article.publicationDate).toISOString().split('T')[0]}
                    </span>
                    <div style="display: flex; gap: 8px;">
                        <button style="border: 1px solid #ccc; background: white; padding: 8px; font-size: 12px;" onclick="editArticle(${article.articleId})">Edit</button>
                        <button style="border: 1px solid #f00; background: white; padding: 8px; font-size: 12px;" onclick="deleteArticle(${article.articleId})">Delete</button>
                    </div>
                </div>
            `;
            articlesContainer.appendChild(articleCard);
        });
    } catch (error) {
        console.error('Error fetching articles:', error);
    }
});

async function deleteArticle(articleId) {
    const token = localStorage.getItem('token');
    if (!token) {
        alert('You need to be logged in to delete an article.');
        return;
    }
    console.log('Article ID:', articleId);
    try {
        console.log('deleting article:', articleId);
        const response = await fetch(`/api/article/id/${articleId}`, {
            method: 'DELETE',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${token}`
            }    
        });

        if (!response.ok) {
            throw new Error('Failed to delete article.');
        }

        alert('Article deleted successfully!');
        // Remove the article from the UI
        document.querySelector(`[data-article-id="${articleId}"]`).remove();
    } catch (error) {
        console.error('Error deleting article:', error);
        alert('Failed to delete the article. Please try again.');
    }
}

async function editArticle(articleId) {
    try {
        // Store the article ID in localStorage and redirect to the edit page
        localStorage.setItem('editArticleId', articleId);
        window.location.href = '../html/articleEdit.html';
    } catch (error) {
        console.error('Error redirecting to edit page:', error);
    }
}
