import { db } from '../config/firebase';
import { 
    collection, 
    addDoc, 
    query, 
    where, 
    orderBy, 
    getDocs,
    serverTimestamp 
} from 'firebase/firestore';

const CHATS_COLLECTION = 'chat_messages';

export const chatService = {
    // Save a new message
    async saveMessage(userId, message) {
        if (!userId) {
            console.error('No userId provided to saveMessage');
            throw new Error('userId is required');
        }

        try {
            console.log('Saving message to Firebase:', {
                collection: CHATS_COLLECTION,
                userId,
                messageContent: message
            });

            const chatRef = collection(db, CHATS_COLLECTION);
            const messageData = {
                userId,
                text: message.text,
                sender: message.sender,
                timestamp: serverTimestamp(),
                conversationId: userId,
                messageType: 'chat',
                clientTimestamp: new Date().toISOString() // For immediate display
            };
            
            const docRef = await addDoc(chatRef, messageData);
            console.log('Message saved successfully with ID:', docRef.id);
            return docRef.id;
        } catch (error) {
            console.error('Error in saveMessage:', error);
            throw error;
        }
    },

    // Get chat history for a user
    async getChatHistory(userId) {
        if (!userId) {
            console.error('No userId provided to getChatHistory');
            throw new Error('userId is required');
        }

        try {
            console.log('Fetching chat history for user:', userId);
            const chatRef = collection(db, CHATS_COLLECTION);
            const q = query(
                chatRef,
                where('userId', '==', userId),
                orderBy('timestamp', 'asc')
            );
            
            const querySnapshot = await getDocs(q);
            const messages = querySnapshot.docs.map(doc => ({
                id: doc.id,
                ...doc.data(),
                timestamp: doc.data().timestamp?.toDate()?.toISOString() || doc.data().clientTimestamp || new Date().toISOString(),
            }));
            
            console.log(`Retrieved ${messages.length} messages for user:`, userId);
            return messages;
        } catch (error) {
            console.error('Error in getChatHistory:', error);
            throw error;
        }
    }
};
