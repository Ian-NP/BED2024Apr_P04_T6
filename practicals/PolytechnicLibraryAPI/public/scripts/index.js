async function fetchBooks() {
    try {
        const token = getToken(); // Assuming you have a function to retrieve the token

        if (!token) {
            console.error('Token not found. User is not authenticated.');
            alert("User is not logged in. Please login or sign up for account.")
            window.location.href="/login";
            return; // Handle authentication error
        }

        const response = await fetch('/books', {
            headers: {
                'Authorization': `Bearer ${token}`,
                'Content-Type': 'application/json'
            }
        });

        if (!response.ok) {
            throw new Error('Failed to fetch books');
        }

        const books = await response.json();
        console.log('Books:', books);
        return books;
    } catch (error) {
        console.error('Error fetching books:', error);
        // Handle error (e.g., display error message to user)
        return null;
    }
}

function getToken() {
    // Implement your getToken function here to retrieve token from localStorage or sessionStorage
    const localStorageToken = localStorage.getItem('token');
    if (localStorageToken) {
        return localStorageToken;
    }

    const sessionStorageToken = sessionStorage.getItem('token');
    if (sessionStorageToken) {
        return sessionStorageToken;
    }

    return null;
}

const books = fetchBooks() 
