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
            articleCard.style.overflow = "hidden";
            articleCard.style.width = "80%";
            articleCard.style.margin = "0 auto";

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
