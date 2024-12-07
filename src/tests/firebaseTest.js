import { guestService, tableService, settingsService } from '../services/database';
import { auth } from '../config/firebase';
import { chatService } from '../services/chatService';

// Test guest operations
async function testGuestOperations() {
    console.log('🏁 Starting guest operations test...');
    try {
        // Test creating a guest
        const testGuest = {
            id: 'test-1',
            firstName: 'Test',
            lastName: 'User',
            email: 'test@example.com',
            group: 'Family',
            category: 'Bride Side',
            status: 'Pending',
            plusOne: true,
            table: null,
            dietary: 'None',
            mealPreference: 'Chicken',
            specialRequirements: '',
            invitationSent: false,
            rsvpDate: null,
            createdAt: '2024-12-07T12:59:15+11:00'
        };

        console.log('📝 Creating test guest...');
        await guestService.upsertGuest(testGuest);
        console.log('✅ Guest created successfully');

        // Test retrieving the guest
        console.log('🔍 Retrieving test guest...');
        const retrievedGuest = await guestService.getGuest('test-1');
        console.log('Retrieved guest:', retrievedGuest);
        console.log('✅ Guest retrieved successfully');

        // Test updating the guest
        console.log('📝 Updating test guest...');
        const updatedGuest = {
            ...testGuest,
            status: 'Confirmed',
            table: 1
        };
        await guestService.upsertGuest(updatedGuest);
        console.log('✅ Guest updated successfully');

        // Test getting all guests
        console.log('🔍 Getting all guests...');
        const allGuests = await guestService.getAllGuests();
        console.log(`Found ${allGuests.length} guests`);
        console.log('✅ All guests retrieved successfully');

        // Test deleting the guest
        console.log('🗑️ Deleting test guest...');
        await guestService.deleteGuest('test-1');
        console.log('✅ Guest deleted successfully');

        return true;
    } catch (error) {
        console.error('❌ Error in guest operations test:', error);
        return false;
    }
}

// Test table operations
async function testTableOperations() {
    console.log('🏁 Starting table operations test...');
    try {
        // Test creating a table
        const testTable = {
            id: 'table-1',
            number: 1,
            capacity: 8,
            name: 'Family Table',
            createdAt: '2024-12-07T12:59:15+11:00'
        };

        console.log('📝 Creating test table...');
        await tableService.upsertTable(testTable);
        console.log('✅ Table created successfully');

        // Test retrieving the table
        console.log('🔍 Retrieving test table...');
        const retrievedTable = await tableService.getTable('table-1');
        console.log('Retrieved table:', retrievedTable);
        console.log('✅ Table retrieved successfully');

        // Test getting all tables
        console.log('🔍 Getting all tables...');
        const allTables = await tableService.getAllTables();
        console.log(`Found ${allTables.length} tables`);
        console.log('✅ All tables retrieved successfully');

        // Test deleting the table
        console.log('🗑️ Deleting test table...');
        await tableService.deleteTable('table-1');
        console.log('✅ Table deleted successfully');

        return true;
    } catch (error) {
        console.error('❌ Error in table operations test:', error);
        return false;
    }
}

// Test settings operations
async function testSettingsOperations() {
    console.log('🏁 Starting settings operations test...');
    try {
        const userId = 'test-user-1';
        const testSettings = {
            weddingDate: '2024-12-31',
            venue: 'Test Venue',
            maxGuests: 100,
            updatedAt: '2024-12-07T12:59:15+11:00'
        };

        console.log('📝 Updating wedding settings...');
        await settingsService.updateWeddingSettings(userId, testSettings);
        console.log('✅ Settings updated successfully');

        // Test retrieving settings
        console.log('🔍 Retrieving wedding settings...');
        const retrievedSettings = await settingsService.getWeddingSettings(userId);
        console.log('Retrieved settings:', retrievedSettings);
        console.log('✅ Settings retrieved successfully');

        return true;
    } catch (error) {
        console.error('❌ Error in settings operations test:', error);
        return false;
    }
}

const testUserId = 'test-user-123';
const testMessage = {
    text: 'Hello, this is a test message',
    sender: 'user'
};

async function testChatService() {
    console.log('\n🔄 Testing Chat Service...');
    
    try {
        // Test 1: Save Message
        console.log('\nTest 1: Saving message...');
        await chatService.saveMessage(testUserId, testMessage);
        console.log('✅ Message saved successfully');

        // Test 2: Get Chat History
        console.log('\nTest 2: Getting chat history...');
        const history = await chatService.getChatHistory(testUserId);
        console.log(`✅ Retrieved ${history.length} messages`);
        
        if (history.length > 0) {
            console.log('Latest message:', history[history.length - 1]);
        }

        // Test 3: Verify Message Order
        console.log('\nTest 3: Verifying message order...');
        const isOrdered = history.every((msg, i) => {
            if (i === 0) return true;
            return msg.timestamp >= history[i - 1].timestamp;
        });
        console.log(isOrdered ? '✅ Messages are properly ordered' : '❌ Message order issue detected');

        return true;
    } catch (error) {
        console.error('❌ Chat Service Test failed:', error);
        return false;
    }
}

// Run all tests
async function runAllTests() {
    console.log('🚀 Starting Firebase integration tests...\n');
    
    let allTestsPassed = true;
    
    // Test Guest Operations
    const guestTestsPassed = await testGuestOperations();
    allTestsPassed = allTestsPassed && guestTestsPassed;

    // Test Table Operations
    const tableTestsPassed = await testTableOperations();
    allTestsPassed = allTestsPassed && tableTestsPassed;

    // Test Settings Operations
    const settingsTestsPassed = await testSettingsOperations();
    allTestsPassed = allTestsPassed && settingsTestsPassed;

    // Test Chat Service
    const chatTestsPassed = await testChatService();
    allTestsPassed = allTestsPassed && chatTestsPassed;
    
    // Final Results
    console.log('\n📊 Test Results:');
    console.log(`Guest Operations: ${guestTestsPassed ? '✅ Passed' : '❌ Failed'}`);
    console.log(`Table Operations: ${tableTestsPassed ? '✅ Passed' : '❌ Failed'}`);
    console.log(`Settings Operations: ${settingsTestsPassed ? '✅ Passed' : '❌ Failed'}`);
    console.log(`Chat Service Tests: ${chatTestsPassed ? '✅ Passed' : '❌ Failed'}`);
    console.log(`\nOverall Status: ${allTestsPassed ? '✅ ALL TESTS PASSED' : '❌ SOME TESTS FAILED'}`);
    
    return allTestsPassed;
}

export default runAllTests;
