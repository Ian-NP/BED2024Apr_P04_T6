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
document.addEventListener('DOMContentLoaded', () => {
    const queryParams = new URLSearchParams(window.location.search);
    const title = queryParams.get('title');

    if (title) {
        fetch(`/api/article/title?title=${encodeURIComponent(title)}`)
            .then(response => {
                if (!response.ok) {
                    throw new Error('Network response was not ok');
                }
                return response.json();
            })
            .then(articles => {
                const articlesContainer = document.getElementById('articles');
                articlesContainer.innerHTML = ''; // Clear previous results

                articles.forEach(article => {
                    const articleElement = document.createElement('div');
                    articleElement.className = 'col-md-4';
                    articleElement.innerHTML = `
                        <div class="card mb-4 shadow-sm">
                            ${article.photo ? 
                                `<img src="data:image/jpeg;base64,${article.photo}" class="card-img-top" alt="Article Image">` : 
                                ''}
                            <div class="card-body">
                                <h5 class="card-title">${article.title}</h5>
                                <p class="card-text">${article.content.substring(0, 10)}...</p>
                                <a href="/article/${article.articleId}" class="btn btn-primary">Read More</a>
                            </div>
                        </div>
                    `;
                    articlesContainer.appendChild(articleElement);
                });
            })
            .catch(error => console.error('Error fetching articles:', error));
    } else {
        console.log('No title query parameter found.');
    }
});





