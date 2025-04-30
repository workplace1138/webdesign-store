// Sample data - in real app this would come from your database
const featuredProducts = [
    {
        id: 1,
        name: "E-commerce Template",
        price: 49.99,
        description: "Complete e-commerce solution with cart functionality",
        image: "assets/ecommerce.jpg",
        seller: "DesignPro"
    },
    {
        id: 2,
        name: "Portfolio Template",
        price: 29.99,
        description: "Elegant portfolio for creatives",
        image: "assets/portfolio.jpg",
        seller: "CodeMaster"
    },
    {
        id: 3,
        name: "Blog Template",
        price: 39.99,
        description: "Modern blog with categories and tags",
        image: "assets/blog.jpg",
        seller: "WebWizard"
    }
];

const testimonials = [
    {
        name: "Sarah Johnson",
        role: "Small Business Owner",
        text: "The website template I purchased was exactly what I needed. Easy to customize and perfect for my business."
    },
    {
        name: "Michael Chen",
        role: "Freelance Developer",
        text: "Great quality code that saved me dozens of hours of development time."
    },
    {
        name: "Emily Rodriguez",
        role: "Marketing Director",
        text: "Our new website has significantly increased our online conversions. Highly recommended!"
    }
];

// DOM Content Loaded
document.addEventListener('DOMContentLoaded', function() {
    // Load featured products
    if (document.getElementById('featuredProducts')) {
        const productsContainer = document.getElementById('featuredProducts');
        
        featuredProducts.forEach(product => {
            const productCard = document.createElement('div');
            productCard.className = 'product-card';
            productCard.innerHTML = `
                <div class="product-img">
                    <img src="${product.image}" alt="${product.name}" style="width:100%; height:100%; object-fit:cover;">
                </div>
                <div class="product-info">
                    <h3>${product.name}</h3>
                    <p class="price">$${product.price.toFixed(2)}</p>
                    <p>${product.description}</p>
                    <p><small>By ${product.seller}</small></p>
                    <button onclick="viewProduct(${product.id})">View Details</button>
                </div>
            `;
            productsContainer.appendChild(productCard);
        });
    }
    
    // Load testimonials
    if (document.querySelector('.testimonial-slider')) {
        const slider = document.querySelector('.testimonial-slider');
        
        testimonials.forEach(testimonial => {
            const testimonialElement = document.createElement('div');
            testimonialElement.className = 'testimonial';
            testimonialElement.innerHTML = `
                <p>"${testimonial.text}"</p>
                <h4>${testimonial.name}</h4>
                <small>${testimonial.role}</small>
            `;
            slider.appendChild(testimonialElement);
        });
    }
});

// View Product Function
function viewProduct(productId) {
    // In a real app, this would redirect to product page with ID
    window.location.href = `preview.html?id=${productId}`;
}

// Authentication functions would be in auth.js