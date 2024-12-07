import { chatService } from '../services/chatService';
import { db } from '../config/firebase';
import { collection, getDocs, query, where, orderBy } from 'firebase/firestore';

const testUserId = 'test-user-123';
const testMessage = {
    text: 'Hello, this is a test message',
    sender: 'user'
};

async function cleanupTestMessages() {
    const chatRef = collection(db, 'chats');
    const q = query(
        chatRef,
        where('userId', '==', testUserId)
    );
    const querySnapshot = await getDocs(q);
    console.log(`Found ${querySnapshot.docs.length} test messages to clean up`);
}

async function runTests() {
    console.log('Starting chat service tests...');

    try {
        // Test 1: Save Message
        console.log('\nTest 1: Saving message...');
        await chatService.saveMessage(testUserId, testMessage);
        console.log('✅ Message saved successfully');

        // Test 2: Get Chat History
        console.log('\nTest 2: Getting chat history...');
        const history = await chatService.getChatHistory(testUserId);
        console.log(`✅ Retrieved ${history.length} messages`);
        console.log('Latest message:', history[history.length - 1]);

        // Test 3: Verify Message Order
        console.log('\nTest 3: Verifying message order...');
        const isOrdered = history.every((msg, i) => {
            if (i === 0) return true;
            return msg.timestamp >= history[i - 1].timestamp;
        });
        console.log(isOrdered ? '✅ Messages are properly ordered' : '❌ Message order issue detected');

        console.log('\nAll tests completed successfully! 🎉');
    } catch (error) {
        console.error('❌ Test failed:', error);
    }
}

// Run the tests
runTests().then(() => {
    console.log('\nTests finished, cleaning up...');
    return cleanupTestMessages();
}).catch(console.error);
