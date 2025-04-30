document.addEventListener('DOMContentLoaded', function() {
    // Check if user is logged in
    const user = firebase.auth().currentUser;
    if (!user) {
        alert('Please login to access chat');
        window.location.href = 'login.html';
        return;
    }
    
    // Initialize variables
    let currentChatId = null;
    let unsubscribeMessages = null;
    
    // Load user's conversations
    function loadConversations() {
        const conversationsList = document.getElementById('conversationsList');
        
        // In a real app, this would query Firestore for the user's conversations
        // For now, we'll simulate some conversations
        const simulatedConversations = [
            {
                id: 'conv1',
                participants: [user.uid, 'seller1'],
                participantNames: {
                    [user.uid]: 'You',
                    ['seller1']: 'WebDesign Pro'
                },
                lastMessage: {
                    text: 'Thanks for your purchase!',
                    sender: 'seller1',
                    timestamp: new Date(Date.now() - 3600000) // 1 hour ago
                },
                unread: 0
            },
            {
                id: 'conv2',
                participants: [user.uid, 'seller2'],
                participantNames: {
                    [user.uid]: 'You',
                    ['seller2']: 'CodeMaster'
                },
                lastMessage: {
                    text: 'Can you provide more details about your project?',
                    sender: user.uid,
                    timestamp: new Date(Date.now() - 86400000) // 1 day ago
                },
                unread: 2
            },
            {
                id: 'conv3',
                participants: [user.uid, 'admin'],
                participantNames: {
                    [user.uid]: 'You',
                    ['admin']: 'Support Team'
                },
                lastMessage: {
                    text: 'Your issue has been resolved',
                    sender: 'admin',
                    timestamp: new Date(Date.now() - 172800000) // 2 days ago
                },
                unread: 0
            }
        ];
        
        // Clear existing conversations
        conversationsList.innerHTML = '';
        
        // Add conversations to the list
        simulatedConversations.forEach(conv => {
            const conversation = document.createElement('div');
            conversation.className = 'conversation';
            conversation.setAttribute('data-id', conv.id);
            
            // Format time
            const timeStr = formatTime(conv.lastMessage.timestamp);
            
            conversation.innerHTML = `
                <div class="conversation-name">${getOtherParticipantName(conv, user.uid)}</div>
                <div class="conversation-preview">${conv.lastMessage.sender === user.uid ? 'You: ' : ''}${conv.lastMessage.text}</div>
                <div class="conversation-time">${timeStr}</div>
                ${conv.unread > 0 ? `<span class="unread-badge">${conv.unread}</span>` : ''}
            `;
            
            // Add click event
            conversation.addEventListener('click', () => openChat(conv.id));
            
            conversationsList.appendChild(conversation);
        });
    }
    
    // Open a chat conversation
    function openChat(chatId) {
        currentChatId = chatId;
        
        // Update UI
        document.querySelectorAll('.conversation').forEach(conv => {
            conv.classList.toggle('active', conv.getAttribute('data-id') === chatId);
        });
        
        // Show chat header
        document.getElementById('emptyChat').style.display = 'none';
        document.getElementById('activeChatHeader').style.display = 'block';
        document.getElementById('chatForm').style.display = 'grid';
        
        // In a real app, we would get the conversation details from Firestore
        const conversation = getSimulatedConversation(chatId);
        document.getElementById('chatWithName').textContent = getOtherParticipantName(conversation, user.uid);
        
        // Load messages
        loadMessages(chatId);
    }
    
    // Load messages for a conversation
    function loadMessages(chatId) {
        const chatMessages = document.getElementById('chatMessages');
        chatMessages.innerHTML = '';
        
        // Unsubscribe from previous listener
        if (unsubscribeMessages) unsubscribeMessages();
        
        // In a real app, this would listen to Firestore messages collection
        // For now, we'll simulate some messages
        const simulatedMessages = [
            {
                id: 'msg1',
                sender: 'seller1',
                text: 'Hello! How can I help you with your website?',
                timestamp: new Date(Date.now() - 7200000) // 2 hours ago
            },
            {
                id: 'msg2',
                sender: user.uid,
                text: 'I need a modern design for my e-commerce store',
                timestamp: new Date(Date.now() - 3600000) // 1 hour ago
            },
            {
                id: 'msg3',
                sender: 'seller1',
                text: 'I can definitely help with that. Do you have any specific requirements?',
                timestamp: new Date(Date.now() - 1800000) // 30 minutes ago
            },
            {
                id: 'msg4',
                sender: user.uid,
                text: 'Yes, I need it to be responsive and have a clean, minimalist design',
                timestamp: new Date(Date.now() - 900000) // 15 minutes ago
            },
            {
                id: 'msg5',
                sender: 'seller1',
                text: 'Great! I\'ll prepare some design concepts for you.',
                timestamp: new Date(Date.now() - 300000) // 5 minutes ago
            }
        ];
        
        // Add messages to the chat
        simulatedMessages.forEach(msg => {
            addMessageToChat(msg, user.uid);
        });
        
        // Scroll to bottom
        chatMessages.scrollTop = chatMessages.scrollHeight;
    }
    
    // Add a message to the chat UI
    function addMessageToChat(message, currentUserId) {
        const chatMessages = document.getElementById('chatMessages');
        const messageDiv = document.createElement('div');
        
        messageDiv.className = `message ${message.sender === currentUserId ? 'sent' : 'received'}`;
        
        // Format time
        const timeStr = formatTime(message.timestamp);
        
        messageDiv.innerHTML = `
            <div class="message-info">${message.sender === currentUserId ? 'You' : getSimulatedUserName(message.sender)} • ${timeStr}</div>
            <div class="message-text">${message.text}</div>
        `;
        
        chatMessages.appendChild(messageDiv);
        
        // Scroll to bottom
        chatMessages.scrollTop = chatMessages.scrollHeight;
    }
    
    // Send a new message
    document.getElementById('sendMessage').addEventListener('click', function() {
        const messageInput = document.getElementById('messageInput');
        const messageText = messageInput.value.trim();
        
        if (messageText && currentChatId) {
            // In a real app, this would add the message to Firestore
            const newMessage = {
                id: 'msg' + Date.now(),
                sender: user.uid,
                text: messageText,
                timestamp: new Date()
            };
            
            // Add to UI immediately
            addMessageToChat(newMessage, user.uid);
            
            // Clear input
            messageInput.value = '';
            
            // In a real app, we would also update the last message in the conversation
            console.log('Message would be saved to database:', newMessage);
        }
    });
    
    // Allow pressing Enter to send message (Shift+Enter for new line)
    document.getElementById('messageInput').addEventListener('keydown', function(e) {
        if (e.key === 'Enter' && !e.shiftKey) {
            e.preventDefault();
            document.getElementById('sendMessage').click();
        }
    });
    
    // Helper functions
    function getOtherParticipantName(conversation, currentUserId) {
        const otherParticipantId = conversation.participants.find(id => id !== currentUserId);
        return conversation.participantNames[otherParticipantId] || 'Unknown';
    }
    
    function formatTime(date) {
        if (!date) return '';
        
        const now = new Date();
        const diff = now - date;
        
        if (diff < 60000) { // Less than 1 minute
            return 'Just now';
        } else if (diff < 3600000) { // Less than 1 hour
            const mins = Math.floor(diff / 60000);
            return `${mins} min${mins !== 1 ? 's' : ''} ago`;
        } else if (date.toDateString() === now.toDateString()) { // Today
            return date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
        } else if (diff < 86400000) { // Yesterday
            return 'Yesterday';
        } else {
            return date.toLocaleDateString();
        }
    }
    
    function getSimulatedConversation(chatId) {
        // In a real app, this would come from Firestore
        const simulatedConversations = {
            'conv1': {
                id: 'conv1',
                participants: [user.uid, 'seller1'],
                participantNames: {
                    [user.uid]: 'You',
                    ['seller1']: 'WebDesign Pro'
                }
            },
            'conv2': {
                id: 'conv2',
                participants: [user.uid, 'seller2'],
                participantNames: {
                    [user.uid]: 'You',
                    ['seller2']: 'CodeMaster'
                }
            },
            'conv3': {
                id: 'conv3',
                participants: [user.uid, 'admin'],
                participantNames: {
                    [user.uid]: 'You',
                    ['admin']: 'Support Team'
                }
            }
        };
        
        return simulatedConversations[chatId];
    }
    
    function getSimulatedUserName(userId) {
        const names = {
            'seller1': 'WebDesign Pro',
            'seller2': 'CodeMaster',
            'admin': 'Support Team'
        };
        
        return names[userId] || 'Unknown';
    }
    
    // Initialize
    loadConversations();
});