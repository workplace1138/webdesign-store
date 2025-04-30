// This would handle the website preview functionality
document.addEventListener('DOMContentLoaded', function() {
    const urlParams = new URLSearchParams(window.location.search);
    const productId = urlParams.get('id');
    
    if (productId) {
        // In a real app, fetch product details from database
        const product = featuredProducts.find(p => p.id == productId);
        
        if (product) {
            document.getElementById('productName').textContent = product.name;
            document.getElementById('productPrice').textContent = `$${product.price.toFixed(2)}`;
            document.getElementById('productSeller').textContent = product.seller;
            document.getElementById('productDescription').textContent = product.description;
            
            // This would be replaced with actual website preview iframe
            const previewFrame = document.getElementById('previewFrame');
            previewFrame.innerHTML = `
                <div style="width:100%; height:100%; display:flex; justify-content:center; align-items:center; background:#f5f5f5;">
                    <h3>Website Preview Would Display Here</h3>
                </div>
            `;
        }
    }
    
    // Handle purchase button
    document.getElementById('purchaseBtn')?.addEventListener('click', function() {
        if (!auth.currentUser) {
            alert('Please login to make a purchase');
            window.location.href = 'login.html';
            return;
        }
        
        // In a real app, this would process payment
        alert(`Purchase of ${product.name} would be processed here`);
    });
});