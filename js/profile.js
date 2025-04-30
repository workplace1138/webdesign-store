document.addEventListener('DOMContentLoaded', function() {
    // Tab functionality
    const profileTabs = document.querySelectorAll('.profile-tab');
    const tabContents = document.querySelectorAll('.tab-content');
    
    profileTabs.forEach(tab => {
        tab.addEventListener('click', function() {
            const tabId = this.getAttribute('data-tab');
            
            // Update active tab
            profileTabs.forEach(t => t.classList.remove('active'));
            this.classList.add('active');
            
            // Update active content
            tabContents.forEach(c => c.classList.remove('active'));
            document.getElementById(`${tabId}-tab`).classList.add('active');
        });
    });
    
    // Check if user is logged in
    const user = firebase.auth().currentUser;
    if (!user) {
        alert('Please login to view profile');
        window.location.href = 'login.html';
        return;
    }
    
    // Load profile data
    loadProfileData();
    
    // Edit profile button
    document.getElementById('editProfileBtn').addEventListener('click', function() {
        // In a real app, this would toggle edit mode
        alert('Edit profile functionality would be implemented here');
    });
    
    // Avatar upload
    document.getElementById('editAvatar').addEventListener('click', function() {
        document.getElementById('avatarUpload').click();
    });
    
    document.getElementById('avatarUpload').addEventListener('change', function() {
        if (this.files && this.files[0]) {
            const file = this.files[0];
            
            // Check if image
            if (!file.type.startsWith('image/')) {
                alert('Please select an image file');
                return;
            }
            
            // Preview image
            const reader = new FileReader();
            reader.onload = function(e) {
                document.getElementById('profileImage').src = e.target.result;
                
                // In a real app, this would upload to Firebase Storage
                console.log('Avatar would be uploaded:', file);
            };
            reader.readAsDataURL(file);
        }
    });
    
    function loadProfileData() {
        // In a real app, this would fetch from Firestore
        // For now, we'll use simulated data
        const profileData = {
            name: 'Alex Johnson',
            title: 'Founder & Lead Developer',
            bio: 'Experienced web designer and developer with over 5 years of experience creating beautiful, functional websites for clients worldwide. Specializing in responsive design, user experience, and clean code.',
            about: [
                "I'm passionate about creating digital experiences that are both beautiful and functional. With a background in both design and development, I understand how to bridge the gap between aesthetics and technology.",
                "My approach focuses on understanding the client's needs and delivering solutions that exceed expectations. I believe in clean, maintainable code and designs that prioritize user experience.",
                "When I'm not coding, you can find me sharing knowledge through tutorials, contributing to open source projects, or exploring new technologies."
            ],
            skills: {
                technical: ['HTML5', 'CSS3', 'JavaScript', 'React', 'Node.js', 'UI/UX Design', 'Responsive Design', 'Git'],
                designTools: ['Figma', 'Adobe XD', 'Photoshop', 'Illustrator']
            },
            stats: {
                projects: '50+',
                clients: '100+',
                rating: '4.9'
            }
        };
        
        // Update profile
        document.getElementById('profileName').textContent = profileData.name;
        document.getElementById('profileTitle').textContent = profileData.title;
        document.getElementById('profileBio').textContent = profileData.bio;
        
        // Update about section
        const aboutContent = document.getElementById('aboutContent');
        aboutContent.innerHTML = profileData.about.map(p => `<p>${p}</p>`).join('');
        
        // Update stats
        document.getElementById('projectsCount').textContent = profileData.stats.projects;
        document.getElementById('clientsCount').textContent = profileData.stats.clients;
        document.getElementById('rating').textContent = profileData.stats.rating;
        
        // Update skills
        const skillsContent = document.getElementById('skillsContent');
        skillsContent.innerHTML = `
            <h3>Technical Skills</h3>
            <div class="skills-list">
                ${profileData.skills.technical.map(skill => `<span class="skill-tag">${skill}</span>`).join('')}
            </div>
            <h3>Design Tools</h3>
            <div class="skills-list">
                ${profileData.skills.designTools.map(tool => `<span class="skill-tag">${tool}</span>`).join('')}
            </div>
        `;
        
        // Check if user is admin/owner to show edit button
        firebase.firestore().collection('users').doc(user.uid).get()
            .then(doc => {
                if (doc.exists && (doc.data().role === 'admin' || doc.data().isOwner)) {
                    document.getElementById('editProfileBtn').style.display = 'block';
                } else {
                    document.getElementById('editProfileBtn').style.display = 'none';
                }
            })
            .catch(error => {
                console.error('Error checking user role:', error);
                document.getElementById('editProfileBtn').style.display = 'none';
            });
    }
});