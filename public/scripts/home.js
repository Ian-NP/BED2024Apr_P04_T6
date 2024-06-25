document.addEventListener('DOMContentLoaded', function() {
    const token = localStorage.getItem('token');

    if (token) {
        console.log('Token found:', token);
        fetchContent(token);
    } else {
        fetchContent(); // Load normal events if no token
    }

    // Event listener for "View Events" link
    const viewEventsLink = document.getElementById('view-events-link');
    if (viewEventsLink) {
        viewEventsLink.addEventListener('click', function(event) {
            event.preventDefault();
            if (token) {
                fetchContent(token);
                history.pushState({}, '', '/events'); // Update the URL
            } else {
                fetchContent(); // Load normal events if no token
                history.pushState({}, '', '/events'); // Update the URL
            }
        });
    }

    // Popstate event listener
    window.addEventListener('popstate', function(event) {
        if (location.pathname === '/events') {
            if (token) {
                fetchContent(token);
            } else {
                fetchContent(); // Load normal events if no token
            }
        }
    });

    function fetchContent(token = '') {
        const headers = token ? { 'Authorization': `Bearer ${token}` } : {};
        fetch('/events-content', {
            method: 'GET',
            headers: headers
        })
        .then(response => response.text())
        .then(html => {
            console.log('Content fetched:', html);
            const contentDiv = document.getElementById('contentss');
            contentDiv.innerHTML = html;
            executeScripts(contentDiv);
        })
        .catch(error => {
            console.error('Error:', error);
            alert('Network error. Please try again later.');
        });
    }

    function executeScripts(element) {
        const scripts = element.querySelectorAll('script');
        scripts.forEach(script => {
            const newScript = document.createElement('script');
            newScript.type = script.type || 'text/javascript';
            if (script.src) {
                newScript.src = script.src;
                newScript.onload = () => {
                    if (script.dataset.initFunction) {
                        window[script.dataset.initFunction]();
                    }
                };
            } else {
                newScript.textContent = script.textContent;
            }
            document.head.appendChild(newScript).parentNode.removeChild(newScript);
        });
    }
});