document.addEventListener('DOMContentLoaded', () => {
    fetchAccounts();
    document.getElementById('search-input').addEventListener('input', searchUsers);

});

let allUsers = []; //for storing the users

// async function fetchAccounts() {
//     try {
//         // Fetch admin users
//         const responseAdmin = await fetch('/admin');
//         const adminUsers = await responseAdmin.json();

//         // Fetch normal users
//         const responseUsers = await fetch('/users');
//         const normalUsers = await responseUsers.json();

//         // Merge both arrays into one array of users
//         const mergedUsers = adminUsers.map(user => ({ id: user.adminId, name: user.name, email: user.adminEmail, type:'admin' }))
//                                     .concat(normalUsers.map(user => ({ id: user.userId, name: user.name, email: user.email, type:'user' })));

//         const tableBody = document.querySelector('#accounts-table tbody');
//         tableBody.innerHTML = '';

//         mergedUsers.forEach(user => {
//             const row = document.createElement('tr');
//             row.innerHTML = `
//                 <td>${user.name}</td>
//                 <td>${user.email}</td>
//                 <td>
//                     <button class="update" onclick="updateAccount(${user.id},'${user.type}')">Update</button>
//                     <button class="delete" onclick="deleteAccount(${user.id}, '${user.type}')">Delete</button>
//                 </td>
//             `;
//             tableBody.appendChild(row);
//         });
//     } catch (error) {
//         console.error('Error fetching accounts:', error);
//     }
// }

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

// async function updateAccount(adminId) {
//     const name = prompt("Enter new name:");
//     const email = prompt("Enter new email:");
    
//     if (name && email) {
//         try {
//             const response = await fetch(`/admin/${adminId}`, {
//                 method: 'PUT',
//                 headers: {
//                     'Content-Type': 'application/json'
//                 },
//                 body: JSON.stringify({ name, adminEmail: email })
//             });

//             if (response.ok) {
//                 fetchAccounts();
//             } else {
//                 alert('Error updating account');
//             }
//         } catch (error) {
//             console.error('Error updating account:', error);
//         }
//     }
// }
function updateAccount(userId, userType) {
    console.log(`Navigating to update page for user ID: ${userId} with type: ${userType}`);
    window.location.href = `/html/updateaccount.html?id=${userId}&type=${userType}`;
}

function deleteAccount(userId, userType) {
    console.log(`Navigating to update page for user ID: ${userId} with type: ${userType}`);
    window.location.href = `/html/deleteaccount.html?id=${userId}&type=${userType}`;
}

// async function deleteAccount(adminId) {
//     if (confirm("Are you sure you want to delete this account?")) {
//         try {
//             const response = await fetch(`/admin/${adminId}`, {
//                 method: 'DELETE'
//             });

//             if (response.ok) {
//                 fetchAccounts();
//             } else {
//                 alert('Error deleting account');
//             }
//         } catch (error) {
//             console.error('Error deleting account:', error);
//         }
//     }
// }
