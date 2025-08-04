const { io } = require('socket.io-client');

// Test script to demonstrate notifications
async function testNotifications() {
  console.log('🚀 Testing Push Notification System');
  console.log('=====================================');

  // Connect to WebSocket server
  const socket = io('http://localhost:3001', {
    withCredentials: true,
  });

  socket.on('connect', () => {
    console.log('✅ Connected to WebSocket server');
    
    // Simulate user authentication
    socket.emit('authenticate', 'test-user-id');
    console.log('🔐 Authenticated as test user');
  });

  socket.on('newNotification', (notification) => {
    console.log('📨 Received notification:', {
      title: notification.title,
      message: notification.message,
      type: notification.type,
      taskId: notification.taskId,
    });
  });

  socket.on('broadcastNotification', (notification) => {
    console.log('📢 Received broadcast notification:', {
      title: notification.title,
      message: notification.message,
      type: notification.type,
    });
  });

  socket.on('disconnect', () => {
    console.log('❌ Disconnected from WebSocket server');
  });

  // Keep the connection alive for testing
  setTimeout(() => {
    console.log('⏰ Test completed. Disconnecting...');
    socket.disconnect();
  }, 10000);
}

// Run the test
testNotifications().catch(console.error); 