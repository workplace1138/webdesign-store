document.addEventListener('DOMContentLoaded', function() {
    // Step navigation
    const steps = document.querySelectorAll('.step');
    const formSteps = document.querySelectorAll('.form-step');
    const prevBtn = document.getElementById('prevStep');
    const nextBtn = document.getElementById('nextStep');
    const submitBtn = document.getElementById('submitBtn');
    let currentStep = 0;
    
    // Show current step
    function showStep(n) {
        steps.forEach(step => {
            step.classList.remove('active', 'completed');
            const stepNum = parseInt(step.getAttribute('data-step'));
            
            if (stepNum < n + 1) {
                step.classList.add('completed');
            } else if (stepNum === n + 1) {
                step.classList.add('active');
            }
        });
        
        formSteps.forEach(step => step.classList.remove('active'));
        formSteps[n].classList.add('active');
        
        // Update buttons
        prevBtn.disabled = n === 0;
        nextBtn.style.display = n === formSteps.length - 1 ? 'none' : 'block';
        submitBtn.style.display = n === formSteps.length - 1 ? 'block' : 'none';
    }
    
    // Next button
    nextBtn.addEventListener('click', function() {
        if (validateStep(currentStep)) {
            currentStep++;
            showStep(currentStep);
        }
    });
    
    // Previous button
    prevBtn.addEventListener('click', function() {
        currentStep--;
        showStep(currentStep);
    });
    
    // Validate step
    function validateStep(step) {
        let isValid = true;
        
        if (step === 0) {
            // Validate basic info
            if (!document.getElementById('sellerName').value) {
                alert('Please enter your display name');
                isValid = false;
            }
        } else if (step === 1) {
            // Validate portfolio
            const portfolioTitles = document.querySelectorAll('.portfolio-title');
            let hasValidPortfolio = false;
            
            portfolioTitles.forEach(title => {
                if (title.value) hasValidPortfolio = true;
            });
            
            if (!hasValidPortfolio && !document.getElementById('portfolioFiles').files.length) {
                alert('Please add at least one portfolio item or upload a portfolio file');
                isValid = false;
            }
        } else if (step === 2) {
            // Validate payment
            if (!document.getElementById('paymentMethod').value) {
                alert('Please select a payment method');
                isValid = false;
            } else {
                const method = document.getElementById('paymentMethod').value;
                if (method === 'paypal' && !document.getElementById('paypalEmail').value) {
                    alert('Please enter your PayPal email');
                    isValid = false;
                } else if (method === 'bank' && !document.getElementById('bankName').value) {
                    alert('Please enter your bank details');
                    isValid = false;
                }
            }
        }
        
        return isValid;
    }
    
    // Add portfolio item
    document.getElementById('addPortfolioItem').addEventListener('click', function() {
        const portfolioItems = document.getElementById('portfolioItems');
        const newItem = document.createElement('div');
        newItem.className = 'portfolio-item';
        newItem.innerHTML = `
            <div class="input-group">
                <label>Project Title</label>
                <input type="text" class="portfolio-title" required>
            </div>
            <div class="input-group">
                <label>Project URL</label>
                <input type="url" class="portfolio-url" required>
            </div>
            <div class="input-group">
                <label>Description</label>
                <textarea class="portfolio-desc" required></textarea>
            </div>
            <button type="button" class="remove-portfolio" style="background:var(--danger); color:white; border:none; padding:0.5rem 1rem; border-radius:4px;">Remove</button>
        `;
        portfolioItems.appendChild(newItem);
        
        // Add remove event
        newItem.querySelector('.remove-portfolio').addEventListener('click', function() {
            if (document.querySelectorAll('.portfolio-item').length > 1) {
                newItem.remove();
            } else {
                alert('You need at least one portfolio item');
            }
        });
    });
    
    // Portfolio file upload
    const portfolioUpload = document.getElementById('portfolioUpload');
    const portfolioFiles = document.getElementById('portfolioFiles');
    const portfolioFileInfo = document.getElementById('portfolioFileInfo');
    const portfolioFileName = document.getElementById('portfolioFileName');
    const portfolioFileSize = document.getElementById('portfolioFileSize');
    const removePortfolioFile = document.getElementById('removePortfolioFile');
    
    portfolioUpload.addEventListener('click', () => portfolioFiles.click());
    
    portfolioFiles.addEventListener('change', () => {
        if (portfolioFiles.files.length > 0) {
            const file = portfolioFiles.files[0];
            portfolioFileName.textContent = file.name;
            portfolioFileSize.textContent = formatFileSize(file.size);
            portfolioFileInfo.style.display = 'block';
            portfolioUpload.style.display = 'none';
        }
    });
    
    removePortfolioFile.addEventListener('click', () => {
        portfolioFiles.value = '';
        portfolioFileInfo.style.display = 'none';
        portfolioUpload.style.display = 'block';
    });
    
    // Payment method selection
    const paymentMethods = document.querySelectorAll('.payment-method');
    const paymentDetails = document.querySelectorAll('.payment-details');
    
    paymentMethods.forEach(method => {
        method.addEventListener('click', function() {
            const selectedMethod = this.getAttribute('data-method');
            
            // Update selected method
            paymentMethods.forEach(m => m.classList.remove('selected'));
            this.classList.add('selected');
            document.getElementById('paymentMethod').value = selectedMethod;
            
            // Show relevant payment details
            paymentDetails.forEach(detail => detail.style.display = 'none');
            document.getElementById(`${selectedMethod}Details`).style.display = 'block';
        });
    });
    
    // Form submission
    document.getElementById('sellerForm').addEventListener('submit', function(e) {
        e.preventDefault();
        
        // Check if user is authenticated
        const user = firebase.auth().currentUser;
        if (!user) {
            alert('Please login to become a seller');
            window.location.href = 'login.html';
            return;
        }
        
        // Prepare seller data
        const sellerData = {
            name: document.getElementById('sellerName').value,
            bio: document.getElementById('sellerBio').value,
            skills: document.getElementById('sellerSkills').value.split(',').map(s => s.trim()),
            experience: document.getElementById('sellerExperience').value,
            paymentMethod: document.getElementById('paymentMethod').value,
            status: 'pending', // For admin approval
            userId: user.uid,
            createdAt: firebase.firestore.FieldValue.serverTimestamp()
        };
        
        // Add payment details based on method
        const method = sellerData.paymentMethod;
        if (method === 'paypal') {
            sellerData.paypalEmail = document.getElementById('paypalEmail').value;
        } else if (method === 'bank') {
            sellerData.bankDetails = {
                bankName: document.getElementById('bankName').value,
                accountName: document.getElementById('accountName').value,
                accountNumber: document.getElementById('accountNumber').value,
                swiftCode: document.getElementById('swiftCode').value
            };
        }
        
        // Prepare portfolio items
        const portfolioItems = [];
        document.querySelectorAll('.portfolio-item').forEach(item => {
            portfolioItems.push({
                title: item.querySelector('.portfolio-title').value,
                url: item.querySelector('.portfolio-url').value,
                description: item.querySelector('.portfolio-desc').value
            });
        });
        sellerData.portfolioItems = portfolioItems;
        
        // Upload portfolio file if exists
        if (portfolioFiles.files.length > 0) {
            const storageRef = firebase.storage().ref();
            const fileRef = storageRef.child(`seller-portfolios/${user.uid}/${portfolioFiles.files[0].name}`);
            
            fileRef.put(portfolioFiles.files[0]).then(snapshot => {
                return snapshot.ref.getDownloadURL();
            }).then(downloadURL => {
                sellerData.portfolioFile = downloadURL;
                return saveSellerApplication(sellerData);
            }).catch(error => {
                console.error('File upload failed:', error);
                alert('File upload failed. Please try again.');
            });
        } else {
            saveSellerApplication(sellerData);
        }
    });
    
    function saveSellerApplication(sellerData) {
        // Save to Firestore
        firebase.firestore().collection('sellerApplications').add(sellerData)
            .then(() => {
                // Also update user role in users collection
                return firebase.firestore().collection('users').doc(sellerData.userId).update({
                    role: 'seller-pending'
                });
            })
            .then(() => {
                alert('Application submitted successfully! It will be reviewed within 48 hours.');
                window.location.href = 'dashboard.html';
            })
            .catch(error => {
                console.error('Error submitting application:', error);
                alert('Error submitting application. Please try again.');
            });
    }
    
    function formatFileSize(bytes) {
        if (bytes === 0) return '0 Bytes';
        const k = 1024;
        const sizes = ['Bytes', 'KB', 'MB', 'GB'];
        const i = Math.floor(Math.log(bytes) / Math.log(k));
        return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
    }
    
    // Update review section before showing step 4
    nextBtn.addEventListener('click', function() {
        if (currentStep === 2) { // Before moving to review step
            updateReviewSection();
        }
    });
    
    function updateReviewSection() {
        // Basic info
        document.getElementById('reviewName').textContent = document.getElementById('sellerName').value;
        document.getElementById('reviewBio').textContent = document.getElementById('sellerBio').value;
        document.getElementById('reviewSkills').textContent = document.getElementById('sellerSkills').value;
        document.getElementById('reviewExperience').textContent = document.getElementById('sellerExperience').value;
        
        // Portfolio
        const reviewPortfolio = document.getElementById('reviewPortfolio');
        reviewPortfolio.innerHTML = '';
        
        document.querySelectorAll('.portfolio-item').forEach(item => {
            const portfolioDiv = document.createElement('div');
            portfolioDiv.style.marginBottom = '1rem';
            portfolioDiv.innerHTML = `
                <p><strong>${item.querySelector('.portfolio-title').value}</strong></p>
                <p>URL: <a href="${item.querySelector('.portfolio-url').value}" target="_blank">${item.querySelector('.portfolio-url').value}</a></p>
                <p>${item.querySelector('.portfolio-desc').value}</p>
            `;
            reviewPortfolio.appendChild(portfolioDiv);
        });
        
        if (portfolioFiles.files.length > 0) {
            const fileDiv = document.createElement('div');
            fileDiv.innerHTML = `<p><strong>Uploaded Portfolio File:</strong> ${portfolioFiles.files[0].name}</p>`;
            reviewPortfolio.appendChild(fileDiv);
        }
        
        // Payment
        const method = document.getElementById('paymentMethod').value;
        document.getElementById('reviewPaymentMethod').textContent = method.charAt(0).toUpperCase() + method.slice(1);
        
        const paymentDetailsDiv = document.getElementById('reviewPaymentDetails');
        paymentDetailsDiv.innerHTML = '';
        
        if (method === 'paypal') {
            paymentDetailsDiv.innerHTML = `<p>PayPal Email: ${document.getElementById('paypalEmail').value}</p>`;
        } else if (method === 'bank') {
            paymentDetailsDiv.innerHTML = `
                <p>Bank Name: ${document.getElementById('bankName').value}</p>
                <p>Account Name: ${document.getElementById('accountName').value}</p>
                <p>Account Number: ${document.getElementById('accountNumber').value}</p>
                <p>SWIFT/BIC Code: ${document.getElementById('swiftCode').value}</p>
            `;
        }
    }
});