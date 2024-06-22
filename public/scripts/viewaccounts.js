// scripts/viewaccounts.js

document.addEventListener('DOMContentLoaded', () => {
    fetchAccounts();
});

async function fetchAccounts() {
    try {
        const response = await fetch('/admin');
        const accounts = await response.json();

        const tableBody = document.querySelector('#accounts-table tbody');
        tableBody.innerHTML = '';

        accounts.forEach(account => {
            const row = document.createElement('tr');
            row.innerHTML = `
                <td>${account.name}</td>
                <td>${account.adminEmail}</td>
                <td>
                    <button class="update" onclick="updateAccount(${account.adminId})">Update</button>
                    <button class="delete" onclick="deleteAccount(${account.adminId})">Delete</button>
                </td>
            `;
            tableBody.appendChild(row);
        });
    } catch (error) {
        console.error('Error fetching accounts:', error);
    }
}

async function updateAccount(adminId) {
    const name = prompt("Enter new name:");
    const email = prompt("Enter new email:");
    
    if (name && email) {
        try {
            const response = await fetch(`/admin/${adminId}`, {
                method: 'PUT',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify({ name, adminEmail: email })
            });

            if (response.ok) {
                fetchAccounts();
            } else {
                alert('Error updating account');
            }
        } catch (error) {
            console.error('Error updating account:', error);
        }
    }
}

async function deleteAccount(adminId) {
    if (confirm("Are you sure you want to delete this account?")) {
        try {
            const response = await fetch(`/admin/${adminId}`, {
                method: 'DELETE'
            });

            if (response.ok) {
                fetchAccounts();
            } else {
                alert('Error deleting account');
            }
        } catch (error) {
            console.error('Error deleting account:', error);
        }
    }
}
