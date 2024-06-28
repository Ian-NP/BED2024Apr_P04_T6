document.addEventListener('DOMContentLoaded', async () => {
    try {
        const response = await fetch('/api/article');
        const articles = await response.json();
        const articlesContainer = document.getElementById('articles');
        articles.forEach(article => {
            const articleCard = document.createElement('div');
            articleCard.classList.add('col-md-4', 'mb-4');
            console.log('Article:', article);
            articleCard.innerHTML = `
                <div class="card">
                    <img src="data:image/jpeg;base64,${article.photo}" class="card-img-top" alt="...">
                    <div class="card-body">
                        <h5 class="card-title">${article.title}</h5>
                        <p class="card-text">${article.content.substring(0, 10)}...</p>
                        <a href="/articleIndividual?articleId=${article.articleId}" class="btn btn-primary">Read More</a>
                    </div>
                </div>
            `;
            articlesContainer.appendChild(articleCard);
        });
    } catch (error) {
        console.error('Error fetching articles:', error);
    }
});