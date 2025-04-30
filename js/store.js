document.addEventListener('DOMContentLoaded', function() {
    // Check authentication state
    const user = firebase.auth().currentUser;
    if (user) {
        document.getElementById('logoutBtn').style.display = 'block';
        document.querySelector('a[href="login.html"]').style.display = 'none';
    }
    
    // Reference to the products grid
    const productsGrid = document.getElementById('productsGrid');
    
    // Fetch and display products from Firestore
    function loadProducts(category = '', searchQuery = '', sortBy = 'newest') {
        let query = firebase.firestore().collection('products')
            .where('status', '==', 'approved');
        
        // Apply category filter if selected
        if (category) {
            query = query.where('category', '==', category);
        }
        
        // Apply sorting
        switch(sortBy) {
            case 'price-low':
                query = query.orderBy('price', 'asc');
                break;
            case 'price-high':
                query = query.orderBy('price', 'desc');
                break;
            case 'popular':
                query = query.orderBy('salesCount', 'desc');
                break;
            default: // 'newest'
                query = query.orderBy('createdAt', 'desc');
        }
        
        query.get().then(querySnapshot => {
            productsGrid.innerHTML = ''; // Clear existing products
            
            if (querySnapshot.empty) {
                productsGrid.innerHTML = '<p class="no-products">No products found. Check back later!</p>';
                return;
            }
            
            querySnapshot.forEach(doc => {
                const product = doc.data();
                const productId = doc.id;
                
                // Apply search filter if query exists
                if (searchQuery && 
                    !product.name.toLowerCase().includes(searchQuery.toLowerCase()) &&
                    !product.description.toLowerCase().includes(searchQuery.toLowerCase()) &&
                    !product.tags.some(tag => tag.toLowerCase().includes(searchQuery.toLowerCase()))) {
                    return; // Skip if doesn't match search
                }
                
                // Create product card
                const productCard = document.createElement('div');
                productCard.className = 'product-card';
                
                productCard.innerHTML = `
                    <div class="product-image">
                        <img src="${product.imageUrl || 'assets/placeholder.jpg'}" alt="${product.name}">
                    </div>
                    <div class="product-info">
                        <h3 class="product-title">${product.name}</h3>
                        <p class="product-seller">By ${product.sellerName || 'Unknown Seller'}</p>
                        <p class="product-price">$${product.price.toFixed(2)}</p>
                        <p class="product-description">${product.shortDescription || product.description || 'No description available.'}</p>
                        <div class="product-actions">
                            <a href="preview.html?id=${productId}" class="btn btn-outline">Preview</a>
                            <button class="btn btn-primary purchase-btn" data-id="${productId}">Purchase</button>
                        </div>
                    </div>
                `;
                
                productsGrid.appendChild(productCard);
                
                // Add event listener to purchase button
                productCard.querySelector('.purchase-btn').addEventListener('click', function(e) {
                    e.preventDefault();
                    purchaseProduct(productId, product);
                });
            });
        }).catch(error => {
            console.error('Error loading products:', error);
            productsGrid.innerHTML = '<p class="error">Error loading products. Please try again later.</p>';
        });
    }
    
    // Handle product purchase
    function purchaseProduct(productId, product) {
        const user = firebase.auth().currentUser;
        
        if (!user) {
            alert('Please login to make a purchase');
            window.location.href = `login.html?redirect=${encodeURIComponent(window.location.href)}`;
            return;
        }
        
        // In a real app, this would integrate with a payment system
        // For now, we'll simulate a purchase
        if (confirm(`Purchase ${product.name} for $${product.price.toFixed(2)}?`)) {
            // Add to user's purchases
            firebase.firestore().collection('users').doc(user.uid).collection('purchases').add({
                productId: productId,
                productName: product.name,
                price: product.price,
                purchasedAt: firebase.firestore.FieldValue.serverTimestamp(),
                downloadUrl: product.fileUrl
            }).then(() => {
                // Update product sales count
                firebase.firestore().collection('products').doc(productId).update({
                    salesCount: firebase.firestore.FieldValue.increment(1)
                });
                
                alert('Purchase successful! You can now download the product from your dashboard.');
            }).catch(error => {
                console.error('Error recording purchase:', error);
                alert('Error completing purchase. Please try again.');
            });
        }
    }
    
    // Event listeners for filters
    document.getElementById('categoryFilter').addEventListener('change', function() {
        const category = this.value;
        const searchQuery = document.getElementById('searchInput').value.trim();
        const sortBy = document.getElementById('sortOptions').value;
        loadProducts(category, searchQuery, sortBy);
    });
    
    document.getElementById('searchInput').addEventListener('input', function() {
        const searchQuery = this.value.trim();
        const category = document.getElementById('categoryFilter').value;
        const sortBy = document.getElementById('sortOptions').value;
        loadProducts(category, searchQuery, sortBy);
    });
    
    document.getElementById('sortOptions').addEventListener('change', function() {
        const sortBy = this.value;
        const category = document.getElementById('categoryFilter').value;
        const searchQuery = document.getElementById('searchInput').value.trim();
        loadProducts(category, searchQuery, sortBy);
    });
    
    // Initial load of products
    loadProducts();
});