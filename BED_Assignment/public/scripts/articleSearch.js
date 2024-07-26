// document.addEventListener('DOMContentLoaded', () => {
//     const searchForm = document.querySelector('form[action="/api/article/title"]');
//     searchForm.addEventListener('submit', async (event) => {
//         event.preventDefault();
        
//         const title = searchForm.querySelector('input[name="title"]').value;
//         const response = await fetch(`/api/article/title/${encodeURIComponent(title)}`);
//         const articles = await response.json();
        
//         const articlesContainer = document.getElementById('articles');
//         articlesContainer.innerHTML = ''; // Clear previous results

//         articles.forEach(article => {
//             const articleElement = document.createElement('div');
//             articleElement.className = 'col-md-4';
//             articleElement.innerHTML = `
//                 <div class="card mb-4 shadow-sm">
//                     <img src="data:image/jpeg;base64,${article.photo}" class="card-img-top" alt="Article Image">
//                     <div class="card-body">
//                         <h5 class="card-title">${article.title}</h5>
//                         <p class="card-text">${article.content.substring(0, 100)}...</p>
//                         <a href="/article/${article.articleId}" class="btn btn-primary">Read More</a>
//                     </div>
//                 </div>
//             `;
//             articlesContainer.appendChild(articleElement);
//         });
//     });
// });
document.addEventListener('DOMContentLoaded', async () => {
    const queryParams = new URLSearchParams(window.location.search);
    const title = queryParams.get('title');
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

    if (title) {
        try {
            const response = await fetch(`/api/article/title?title=${encodeURIComponent(title)}`);
            if (!response.ok) {
                throw new Error('Network response was not ok');
            }
            const articles = await response.json();
            const articlesContainer = document.getElementById('articles');
            articlesContainer.innerHTML = ''; // Clear previous results

            for (const article of articles) {
                const isFavourite = await fetch(`/api/article/isFavourite/${userId}/${article.articleId}`)
                    .then(res => res.json());

                const favouriteText = isFavourite ? 'Unfavourite' : 'Favourite';
                console.log('Is Favourite:', isFavourite);

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
            console.error('Error fetching articles:', error);
        }
    } else {
        console.log('No title query parameter found.');
    }
});






