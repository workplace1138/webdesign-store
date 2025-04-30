document.addEventListener('DOMContentLoaded', function() {
    // Check if user is admin
    const user = firebase.auth().currentUser;
    if (!user) {
        alert('Please login to access admin panel');
        window.location.href = 'login.html';
        return;
    }
    
    // Verify admin status
    firebase.firestore().collection('users').doc(user.uid).get()
        .then(doc => {
            if (doc.exists && doc.data().role === 'admin') {
                // User is admin, load data
                loadAdminData();
            } else {
                alert('You do not have permission to access this page');
                window.location.href = 'dashboard.html';
            }
        })
        .catch(error => {
            console.error('Error verifying admin status:', error);
            alert('Error verifying permissions');
            window.location.href = 'dashboard.html';
        });
    
    function loadAdminData() {
        // Load stats
        Promise.all([
            firebase.firestore().collection('users').get(),
            firebase.firestore().collection('users').where('role', '==', 'seller').get(),
            firebase.firestore().collection('products').get(),
            firebase.firestore().collection('sellerApplications').where('status', '==', 'pending').get(),
            firebase.firestore().collection('products').where('status', '==', 'pending').get()
        ]).then(results => {
            const [users, sellers, products, sellerApps, pendingProducts] = results;
            
            // Update stats
            document.getElementById('totalUsers').textContent = users.size;
            document.getElementById('totalSellers').textContent = sellers.size;
            document.getElementById('totalProducts').textContent = products.size;
            
            // Calculate total sales (would be from transactions in a real app)
            let totalSales = 0;
            products.forEach(doc => {
                const product = doc.data();
                if (product.price && product.salesCount) {
                    totalSales += product.price * product.salesCount;
                }
            });
            document.getElementById('totalSales').textContent = `$${totalSales.toFixed(2)}`;
            
            // Load seller applications
            const sellerAppsTable = document.getElementById('sellerAppsTable');
            sellerApps.forEach(doc => {
                const app = doc.data();
                const row = document.createElement('tr');
                row.innerHTML = `
                    <td>${app.name}</td>
                    <td>${app.skills.slice(0, 3).join(', ')}${app.skills.length > 3 ? '...' : ''}</td>
                    <td>${formatExperience(app.experience)}</td>
                    <td><span class="badge badge-pending">Pending</span></td>
                    <td>
                        <button class="action-btn btn-approve" data-id="${doc.id}">Approve</button>
                        <button class="action-btn btn-reject" data-id="${doc.id}">Reject</button>
                    </td>
                `;
                sellerAppsTable.appendChild(row);
                
                // Add event listeners to buttons
                row.querySelector('.btn-approve').addEventListener('click', () => processApplication(doc.id, 'approved'));
                row.querySelector('.btn-reject').addEventListener('click', () => processApplication(doc.id, 'rejected'));
            });
            
            // Load pending products
            const productsTable = document.getElementById('productsTable');
            pendingProducts.forEach(doc => {
                const product = doc.data();
                const row = document.createElement('tr');
                row.innerHTML = `
                    <td>${product.name}</td>
                    <td>${product.sellerName || 'Unknown'}</td>
                    <td>$${product.price.toFixed(2)}</td>
                    <td><span class="badge badge-pending">Pending</span></td>
                    <td>
                        <button class="action-btn btn-approve" data-id="${doc.id}">Approve</button>
                        <button class="action-btn btn-reject" data-id="${doc.id}">Reject</button>
                    </td>
                `;
                productsTable.appendChild(row);
                
                // Add event listeners to buttons
                row.querySelector('.btn-approve').addEventListener('click', () => processProduct(doc.id, 'approved'));
                row.querySelector('.btn-reject').addEventListener('click', () => processProduct(doc.id, 'rejected'));
            });
        }).catch(error => {
            console.error('Error loading admin data:', error);
            alert('Error loading admin data');
        });
    }
    
    function processApplication(appId, status) {
        if (!confirm(`Are you sure you want to ${status} this application?`)) return;
        
        const batch = firebase.firestore().batch();
        const appRef = firebase.firestore().collection('sellerApplications').doc(appId);
        
        // Update application status
        batch.update(appRef, { status: status });
        
        // If approved, update user role
        if (status === 'approved') {
            appRef.get().then(doc => {
                const userId = doc.data().userId;
                const userRef = firebase.firestore().collection('users').doc(userId);
                batch.update(userRef, { role: 'seller' });
                
                return batch.commit();
            }).then(() => {
                alert('Application approved successfully!');
                window.location.reload();
            }).catch(error => {
                console.error('Error approving application:', error);
                alert('Error approving application');
            });
        } else {
            batch.commit().then(() => {
                alert('Application rejected successfully!');
                window.location.reload();
            }).catch(error => {
                console.error('Error rejecting application:', error);
                alert('Error rejecting application');
            });
        }
    }
    
    function processProduct(productId, status) {
        if (!confirm(`Are you sure you want to ${status} this product?`)) return;
        
        firebase.firestore().collection('products').doc(productId).update({
            status: status
        }).then(() => {
            alert(`Product ${status} successfully!`);
            window.location.reload();
        }).catch(error => {
            console.error(`Error ${status} product:`, error);
            alert(`Error ${status} product`);
        });
    }
    
    function formatExperience(exp) {
        const experiences = {
            '0-1': '0-1 years',
            '1-3': '1-3 years',
            '3-5': '3-5 years',
            '5+': '5+ years'
        };
        return experiences[exp] || exp;
    }
});