import { useState } from 'react';
import runAllTests from '../tests/firebaseTest';

export default function TestRunner() {
    const [isRunning, setIsRunning] = useState(false);
    const [logs, setLogs] = useState([]);

    // Override console.log to capture test output
    const originalLog = console.log;
    const originalError = console.error;

    const captureLog = (message, type = 'log') => {
        const timestamp = new Date().toLocaleTimeString();
        setLogs(prevLogs => [...prevLogs, { timestamp, message: String(message), type }]);
    };

    const runTests = async () => {
        setIsRunning(true);
        setLogs([]);

        // Override console methods
        console.log = (message) => {
            originalLog(message);
            captureLog(message, 'log');
        };
        console.error = (message) => {
            originalError(message);
            captureLog(message, 'error');
        };

        try {
            await runAllTests();
        } catch (error) {
            console.error('Test execution error:', error);
        }

        // Restore console methods
        console.log = originalLog;
        console.error = originalError;
        setIsRunning(false);
    };

    return (
        <div className="p-6 max-w-4xl mx-auto">
            <div className="flex items-center justify-between mb-6">
                <div>
                    <h1 className="text-2xl font-semibold text-gray-900">Firebase Integration Tests</h1>
                    <p className="text-sm text-gray-500">Test the Firebase database integration</p>
                </div>
                <button
                    onClick={runTests}
                    disabled={isRunning}
                    className={`px-4 py-2 rounded-lg font-medium ${
                        isRunning
                            ? 'bg-gray-300 cursor-not-allowed'
                            : 'bg-blue-600 hover:bg-blue-700 text-white'
                    }`}
                >
                    {isRunning ? 'Running Tests...' : 'Run Tests'}
                </button>
            </div>

            <div className="bg-gray-900 rounded-lg p-4 font-mono text-sm">
                <div className="h-[600px] overflow-y-auto">
                    {logs.map((log, index) => (
                        <div
                            key={index}
                            className={`py-1 ${
                                log.type === 'error' ? 'text-red-400' : 'text-green-400'
                            }`}
                        >
                            <span className="text-gray-500">[{log.timestamp}]</span>{' '}
                            {log.message}
                        </div>
                    ))}
                    {isRunning && (
                        <div className="py-1 text-blue-400 animate-pulse">
                            Running tests...
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
}
