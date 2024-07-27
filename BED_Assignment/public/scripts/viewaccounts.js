document.addEventListener('DOMContentLoaded', () => {
    fetchAccounts();
    document.getElementById('search-input').addEventListener('input', searchUsers);

});

let allUsers = []; //for storing the users

//to fetch all the accounts
async function fetchAccounts() {
    try {
        const responseAdmin = await fetch('/admin');
        const adminUsers = await responseAdmin.json();

        const responseUsers = await fetch('/users');
        const normalUsers = await responseUsers.json();

        // Merge both arrays into one array of users
        allUsers = adminUsers.map(user => ({ id: user.adminId, name: user.name, email: user.adminEmail, type: 'admin' }))
            .concat(normalUsers.map(user => ({ id: user.userId, name: user.name, email: user.email, type: 'user' })));

        displayUsers(allUsers);
    } catch (error) {
        console.error('Error fetching accounts:', error);
    }
}

// to display users after they search for them
function displayUsers(users) {
    const tableBody = document.querySelector('#accounts-table tbody');
    tableBody.innerHTML = '';

    users.forEach(user => {
        const row = document.createElement('tr');
        row.innerHTML = `
            <td>${user.name}</td>
            <td>${user.email}</td>
            <td>
                <button class="update" onclick="updateAccount(${user.id}, '${user.type}')">Update</button>
                <button class="delete" onclick="deleteAccount(${user.id}, '${user.type}')">Delete</button>
            </td>
        `;
        tableBody.appendChild(row);
    });
}

//search function
function searchUsers() {
    const searchInput = document.getElementById('search-input').value.trim().toLowerCase();
    console.log('Search input:', searchInput);

    // Filtering users based on search input
    const filteredUsers = allUsers.filter(user => user.name.toLowerCase().includes(searchInput));
    console.log('Filtered users:', filteredUsers);

    // Displaying filtered users or show message if no results
    if (filteredUsers.length === 0) {
        displayNoResultsMessage();
    } else {
        displayUsers(filteredUsers);
    }
}

// message to display when no such user is found when searching
function displayNoResultsMessage() {
    const tableBody = document.querySelector('#accounts-table tbody');
    tableBody.innerHTML = '';

    const row = document.createElement('tr');
    row.innerHTML = `<td colspan="3" class="text-center">No matching users found.</td>`;
    tableBody.appendChild(row);
}

//update button
function updateAccount(userId, userType) {
    console.log(`Navigating to update page for user ID: ${userId} with type: ${userType}`);
    window.location.href = `/html/updateaccount.html?id=${userId}&type=${userType}`;
}
//delete button
function deleteAccount(userId, userType) {
    console.log(`Navigating to update page for user ID: ${userId} with type: ${userType}`);
    window.location.href = `/html/deleteaccount.html?id=${userId}&type=${userType}`;
}

