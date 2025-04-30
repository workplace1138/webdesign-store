// Replace with your actual Firebase config
const firebaseConfig = {
  apiKey: "YOUR_API_KEY",
  authDomain: "YOUR_PROJECT_ID.firebaseapp.com",
  projectId: "YOUR_PROJECT_ID",
  storageBucket: "YOUR_PROJECT_ID.appspot.com",
  messagingSenderId: "YOUR_SENDER_ID",
  appId: "YOUR_APP_ID"
};

// Initialize Firebase
firebase.initializeApp(firebaseConfig);
const auth = firebase.auth();
const db = firebase.firestore();
const storage = firebase.storage();

// Authentication state listener
auth.onAuthStateChanged(user => {
  // Handle user state changes
  if (user) {
    console.log("User logged in:", user.email);
    // Update UI for logged in user
    const logoutButtons = document.querySelectorAll('#logoutBtn');
    logoutButtons.forEach(btn => {
      btn.style.display = 'block';
    });
  } else {
    console.log("User logged out");
    // Update UI for logged out user
    const logoutButtons = document.querySelectorAll('#logoutBtn');
    logoutButtons.forEach(btn => {
      btn.style.display = 'none';
    });
  }
});

// Logout functionality
const logoutButtons = document.querySelectorAll('#logoutBtn');
logoutButtons.forEach(btn => {
  btn.addEventListener('click', (e) => {
    e.preventDefault();
    auth.signOut().then(() => {
      window.location.href = 'index.html';
    }).catch(error => {
      console.error('Logout error:', error);
    });
  });
});

// Helper function to format Firebase timestamps
function formatFirebaseTimestamp(timestamp) {
  if (!timestamp) return '';
  if (timestamp.toDate) {
    return timestamp.toDate().toLocaleDateString();
  }
  return new Date(timestamp).toLocaleDateString();
}