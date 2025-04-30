document.addEventListener('DOMContentLoaded', function() {
    // Tab navigation
    const tabs = document.querySelectorAll('.tab');
    const tabContents = document.querySelectorAll('.tab-content');
    const prevBtn = document.getElementById('prevTab');
    const nextBtn = document.getElementById('nextTab');
    const submitBtn = document.getElementById('submitBtn');
    let currentTab = 0;
    
    // Show current tab
    function showTab(n) {
        tabs.forEach(tab => tab.classList.remove('active'));
        tabContents.forEach(content => content.classList.remove('active'));
        
        tabs[n].classList.add('active');
        tabContents[n].classList.add('active');
        
        // Update buttons
        prevBtn.disabled = n === 0;
        nextBtn.style.display = n === tabs.length - 1 ? 'none' : 'block';
        submitBtn.style.display = n === tabs.length - 1 ? 'block' : 'none';
    }
    
    // Tab click event
    tabs.forEach((tab, index) => {
        tab.addEventListener('click', () => {
            currentTab = index;
            showTab(currentTab);
        });
    });
    
    // Next button
    nextBtn.addEventListener('click', () => {
        if (currentTab < tabs.length - 1) {
            currentTab++;
            showTab(currentTab);
        }
    });
    
    // Previous button
    prevBtn.addEventListener('click', () => {
        if (currentTab > 0) {
            currentTab--;
            showTab(currentTab);
        }
    });
    
    // Character count for short description
    const shortDesc = document.getElementById('shortDescription');
    const charCount = document.getElementById('charCount');
    
    shortDesc.addEventListener('input', () => {
        charCount.textContent = `${shortDesc.value.length}/200 characters`;
    });
    
    // File upload handling
    const fileUpload = document.getElementById('fileUpload');
    const productFiles = document.getElementById('productFiles');
    const fileInfo = document.getElementById('fileInfo');
    const fileName = document.getElementById('fileName');
    const fileSize = document.getElementById('fileSize');
    const removeFile = document.getElementById('removeFile');
    
    fileUpload.addEventListener('click', () => productFiles.click());
    
    productFiles.addEventListener('change', () => {
        if (productFiles.files.length > 0) {
            const file = productFiles.files[0];
            fileName.textContent = file.name;
            fileSize.textContent = formatFileSize(file.size);
            fileInfo.style.display = 'block';
            fileUpload.style.display = 'none';
        }
    });
    
    removeFile.addEventListener('click', () => {
        productFiles.value = '';
        fileInfo.style.display = 'none';
        fileUpload.style.display = 'block';
    });
    
    // Image upload handling
    const imageUpload = document.getElementById('imageUpload');
    const productImages = document.getElementById('productImages');
    const imagePreviews = document.getElementById('imagePreviews');
    
    imageUpload.addEventListener('click', () => productImages.click());
    
    productImages.addEventListener('change', () => {
        imagePreviews.innerHTML = '';
        if (productImages.files.length > 0) {
            Array.from(productImages.files).forEach(file => {
                if (file.type.startsWith('image/')) {
                    const reader = new FileReader();
                    reader.onload = (e) => {
                        const previewItem = document.createElement('div');
                        previewItem.className = 'preview-item';
                        previewItem.innerHTML = `
                            <img src="${e.target.result}" alt="Preview">
                            <button class="remove-btn" data-name="${file.name}">×</button>
                        `;
                        imagePreviews.appendChild(previewItem);
                        
                        // Add remove button event
                        previewItem.querySelector('.remove-btn').addEventListener('click', function() {
                            previewItem.remove();
                            // TODO: Remove from files list
                        });
                    };
                    reader.readAsDataURL(file);
                }
            });
        }
    });
    
    // Form submission
    document.getElementById('productForm').addEventListener('submit', function(e) {
        e.preventDefault();
        
        // Check if user is authenticated
        const user = firebase.auth().currentUser;
        if (!user) {
            alert('Please login to add products');
            window.location.href = 'login.html';
            return;
        }
        
        // Get form values
        const productData = {
            name: document.getElementById('productName').value,
            price: parseFloat(document.getElementById('productPrice').value),
            category: document.getElementById('productCategory').value,
            shortDescription: document.getElementById('shortDescription').value,
            fullDescription: document.getElementById('fullDescription').value,
            features: document.getElementById('features').value.split('\n').filter(f => f.trim() !== ''),
            tags: document.getElementById('tags').value.split(',').map(t => t.trim()).filter(t => t !== ''),
            previewUrl: document.getElementById('previewUrl').value,
            demoUsername: document.getElementById('demoUsername').value,
            demoPassword: document.getElementById('demoPassword').value,
            sellerId: user.uid,
            createdAt: firebase.firestore.FieldValue.serverTimestamp(),
            status: 'pending' // For admin approval
        };
        
        // Upload files to Firebase Storage
        if (productFiles.files.length > 0) {
            const storageRef = firebase.storage().ref();
            const fileRef = storageRef.child(`products/${user.uid}/${Date.now()}_${productFiles.files[0].name`);
            
            fileRef.put(productFiles.files[0]).then(snapshot => {
                return snapshot.ref.getDownloadURL();
            }).then(downloadURL => {
                productData.fileUrl = downloadURL;
                return saveProduct(productData);
            }).catch(error => {
                console.error('File upload failed:', error);
                alert('File upload failed. Please try again.');
            });
        } else {
            saveProduct(productData);
        }
    });
    
    function saveProduct(productData) {
        // Save product to Firestore
        firebase.firestore().collection('products').add(productData)
            .then(() => {
                alert('Product submitted successfully! It will be reviewed before publishing.');
                window.location.href = 'seller-portal.html';
            })
            .catch(error => {
                console.error('Error adding product:', error);
                alert('Error adding product. Please try again.');
            });
    }
    
    function formatFileSize(bytes) {
        if (bytes === 0) return '0 Bytes';
        const k = 1024;
        const sizes = ['Bytes', 'KB', 'MB', 'GB'];
        const i = Math.floor(Math.log(bytes) / Math.log(k));
        return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
    }
});