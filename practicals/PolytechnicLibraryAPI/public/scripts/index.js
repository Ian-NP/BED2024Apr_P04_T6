async function fetchBooks() {
    try {
        const token = getToken(); // Assuming you have a function to retrieve the token

        if (!token) {
            console.error('Token not found. User is not authenticated.');
            alert("User is not logged in. Please login or sign up for account.")
            window.location.href = "/login";
            return; // Handle authentication error
        }

        const response = await fetch('/books', {
            headers: {
                'Authorization': `Bearer ${token}`,
                'Content-Type': 'application/json'
            }
        });

        if (response.status === 403) {
            alert("Token expired. Please log in again.");
            window.location.href = "/login";
            return; // Handle token expiration
        } else if (!response.ok) {
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

function getUserFromToken(token) {
    try {
        const decoded = jwt_decode(token);
        console.log(decoded.user_id);
        console.log(decoded.username);
        console.log(decoded.role);
        return decoded;
    } catch (error) {
        console.error('Error decoding token:', error);
        return null;
    }
}

const createBookCards = async () => {
    const token = getToken();
    if (!token) {
        console.error('Token not found. User is not authenticated.');
        alert("User is not logged in. Please login or sign up for an account.");
        window.location.href = "/login";
        return; // Handle authentication error
    }

    const user = getUserFromToken(token);
    const role = user.role;
    if (!role) return; // If fetching user role failed, exit the function

    const bookList = await fetchBooks();
    if (!bookList) return; // If fetching books failed, exit the function

    const container = document.querySelector('#placeBooks'); // Assuming you have a container with this ID
    bookList.forEach(book => {
        const colDiv = document.createElement('div');
        colDiv.className = 'col';

        const cardDiv = document.createElement('div');
        cardDiv.className = 'card shadow-sm';
        cardDiv.setAttribute('data-available', book.availability);
        cardDiv.setAttribute('data-bookid', book.book_id); // Assuming book._id is the ID of the book

        const svg = document.createElementNS('http://www.w3.org/2000/svg', 'svg');
        svg.classList.add('bd-placeholder-img');
        svg.classList.add('card-img-top');
        svg.setAttribute('width', '100%');
        svg.setAttribute('height', '225');
        svg.setAttribute('xmlns', 'http://www.w3.org/2000/svg');
        svg.setAttribute('role', 'img');
        svg.setAttribute('aria-label', `Placeholder: ${book.title}`);
        svg.setAttribute('preserveAspectRatio', 'xMidYMid slice');
        svg.setAttribute('focusable', 'false');

        const title = document.createElementNS('http://www.w3.org/2000/svg', 'title');
        title.textContent = 'Placeholder';
        svg.appendChild(title);

        const rect = document.createElementNS('http://www.w3.org/2000/svg', 'rect');
        rect.setAttribute('width', '100%');
        rect.setAttribute('height', '100%');
        rect.setAttribute('fill', '#55595c');
        svg.appendChild(rect);

        const text = document.createElementNS('http://www.w3.org/2000/svg', 'text');
        text.setAttribute('x', '50%');
        text.setAttribute('y', '50%');
        text.setAttribute('fill', '#eceeef');
        text.setAttribute('dy', '.3em');
        text.textContent = book.title;
        svg.appendChild(text);

        const cardBody = document.createElement('div');
        cardBody.className = 'card-body';

        const bodyDiv = document.createElement('div');
        bodyDiv.className = 'd-flex justify-content-center align-items-center flex-wrap';

        const h3 = document.createElement('h4');
        h3.className = 'card-body-title';
        h3.textContent = book.title;

        const h5 = document.createElement('h6');
        h5.className = 'card-body-author';
        h5.textContent = book.author;

        const btnGroup = document.createElement('div');
        btnGroup.className = 'btn-group';

        const viewBtn = document.createElement('button');
        viewBtn.type = 'button';
        viewBtn.className = 'btn btn-sm btn-outline-secondary';
        viewBtn.textContent = 'View';

        btnGroup.appendChild(viewBtn);

        if (role === 'librarian') {
            const updateBtn = document.createElement('button');
            updateBtn.type = 'button';
            updateBtn.className = 'btn btn-sm btn-outline-secondary';
            updateBtn.textContent = 'Update';
            updateBtn.onclick = function() {
                // Populate modal with book details
                document.getElementById('bookAvailability').value = book.availability === "Y" ? 'true' : 'false';
                console.log(book.availability);

                // Set bookId in data attribute
                document.getElementById('bookModal').setAttribute('data-bookid', book.book_id);
                console.log(book.book_id);

                // Show the modal
                const modal = new bootstrap.Modal(document.getElementById('bookModal'), {});
                modal.show();
            };
            btnGroup.appendChild(updateBtn);
        }

        bodyDiv.appendChild(h3);
        bodyDiv.appendChild(h5);
        bodyDiv.appendChild(btnGroup);

        cardBody.appendChild(bodyDiv);
        cardDiv.appendChild(svg);
        cardDiv.appendChild(cardBody);

        const overlayDiv = document.createElement('div');
        overlayDiv.className = 'overlay';
        
        if (role === 'librarian') {
            const overlayContent = document.createElement('div');
            const unavailableText = document.createElement('p');
            unavailableText.textContent = 'Unavailable';
            overlayContent.appendChild(unavailableText);
            
            const updateOverlayBtn = document.createElement('button');
            updateOverlayBtn.type = 'button';
            updateOverlayBtn.className = 'btn btn-sm btn-secondary';
            updateOverlayBtn.textContent = 'Update';
            updateOverlayBtn.addEventListener('click', function() {
                // Populate modal with book details
                document.getElementById('bookAvailability').value = book.availability === "Y" ? 'true' : 'false';
                console.log(book.availability);

                // Set bookId in data attribute
                document.getElementById('bookModal').setAttribute('data-bookid', book.book_id);
                console.log(book.book_id);

                // Show the modal
                const modal = new bootstrap.Modal(document.getElementById('bookModal'), {});
                let bookAvailability = document.getElementById("bookAvailability");
                const bookCardDiv = document.querySelector(`[data-bookid="${book.book_id}"]`);
                let availability = bookCardDiv.getAttribute('data-available');
                console.log(availability);
                bookAvailability.value = availability;
                modal.show();
            });
            overlayContent.appendChild(updateOverlayBtn);
            
            overlayDiv.appendChild(overlayContent);
        } else {
            const unavailableText = document.createElement('p');
            unavailableText.textContent = 'Unavailable';
            overlayDiv.appendChild(unavailableText);
        }
        
        cardDiv.appendChild(overlayDiv);

        colDiv.appendChild(cardDiv);
        container.appendChild(colDiv);
    });
};

// Call createBookCards to generate the book cards on page load or whenever appropriate
createBookCards();


async function updateBook() {
    const modal = document.getElementById('bookModal');
    const bookId = modal.getAttribute('data-bookid');
    const availability = document.getElementById('bookAvailability').value;

    try {
        const token = getToken(); // Retrieve the token

        if (!token) {
            console.error('Token not found. User is not authenticated.');
            alert("User is not logged in. Please login or sign up for an account.");
            window.location.href = "/login";
            return; // Handle authentication error
        }

        const user = getUserFromToken(token);
        const role = user.role;

        const response = await fetch(`/books/${bookId}/availability`, {
            method: 'PUT',
            headers: {
                'Authorization': `Bearer ${token}`,
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({ availability })
        });

        if (response.status === 403) {
            alert("Token expired. Please log in again.");
            window.location.href = "/login";
            return; // Handle token expiration
        } else if (!response.ok) {
            throw new Error('Failed to update book availability');
        }

        console.log('Book availability updated successfully');
        // Optionally, you can reload the book cards or update UI here after successful update
        // Example: createBookCards(); // Refresh book cards after update

        // Close the modal after successful update
        const bsModal = bootstrap.Modal.getInstance(modal);
        bsModal.hide();

        const bookCard = document.querySelector(`[data-bookid="${bookId}"]`);
        
        if (role === 'librarian') {
            bookCard.setAttribute('data-available', availability);
        }
    } catch (error) {
        console.error('Error updating book availability:', error);
        // Handle error (e.g., display error message to user)
    }
}

document.getElementById('save-changes-btn').addEventListener('click', updateBook);