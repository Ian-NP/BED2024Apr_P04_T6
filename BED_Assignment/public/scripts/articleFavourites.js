document.addEventListener('DOMContentLoaded', async () => {
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

    try {
        const response = await fetch(`/api/article/favourites/${userId}`);
        const articles = await response.json();
        const articlesContainer = document.getElementById('favorite-articles');

        for (const article of articles) {
            const isFavourite = await fetch(`/api/article/isFavourite/${userId}/${article.articleId}`)
                .then(res => res.json());

            const favouriteText = isFavourite ? 'Unfavourite' : 'Favourite';
            console.log(article.photo);
            console.log(article.title);
            console.log(article.content);
            console.log(article.articleId);
            const articleCard = document.createElement('div');
            articleCard.classList.add('col-md-4', 'mb-4');
            articleCard.innerHTML = `
                <div class="card">
                    <img src="data:image/jpeg;base64,${article.photo}" class="card-img-top" alt="...">
                    <div class="card-body">
                        <h5 class="card-title">${article.title}</h5>
                        <p class="card-text">${article.content.substring(0, 10)}...</p>
                        <a href="/articleIndividual?articleId=${article.articleId}" class="btn btn-primary btn-read-more">Read More</a>
                        <button class="btn btn-secondary btn-favourite" data-article-id="${article.articleId}">${favouriteText}</button>
                    </div>
                </div>
            `;
            articlesContainer.appendChild(articleCard);
        }

        articlesContainer.addEventListener('click', async (event) => {
            if (event.target.classList.contains('btn-favourite')) {
                const button = event.target;
                const articleId = button.getAttribute('data-article-id');
                const isFavourite = button.innerText === 'Unfavourite';

                const apiEndpoint = isFavourite 
                    ? `/api/article/removeFavourite/${userId}` 
                    : `/api/article/addFavourite/${userId}`;
                
                const response = await fetch(apiEndpoint, {
                    method: 'POST',
                    headers: {
                        'Content-Type': 'application/json'
                    },
                    body: JSON.stringify({ articleId })
                });

                if (!response.ok) {
                    console.error('Failed to update favourite status:', await response.text());
                }

                button.innerText = isFavourite ? 'Favourite' : 'Unfavourite';
            }
        });
    } catch (error) {
        console.error('Error fetching favorite articles:', error);
    }
});
