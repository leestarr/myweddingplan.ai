import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { QueryClient, QueryClientProvider } from 'react-query';
import Layout from './components/Layout';
import Dashboard from './pages/Dashboard';
import GuestList from './pages/GuestList';
import TaskManager from './pages/TaskManager';
import Budget from './pages/Budget';
import Expenses from './pages/Expenses';
import AIChat from './pages/AIChat';
import Documents from './pages/Documents';
import Vendors from './pages/Vendors';
import Quotes from './pages/Quotes';

const queryClient = new QueryClient();

function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <Router>
        <Routes>
          {/* Login route - will create the page next */}
          <Route path="/login" element={<Navigate to="/" replace />} />
          
          {/* Protected routes */}
          <Route path="/" element={<Layout />}>
            <Route index element={<Dashboard />} />
            <Route path="guests" element={<GuestList />} />
            <Route path="tasks" element={<TaskManager />} />
            <Route path="budget" element={<Budget />} />
            <Route path="expenses" element={<Expenses />} />
            <Route path="chat" element={<AIChat />} />
            <Route path="documents" element={<Documents />} />
            <Route path="vendors" element={<Vendors />} />
            <Route path="quotes" element={<Quotes />} />
          </Route>
        </Routes>
      </Router>
    </QueryClientProvider>
  );
}

export default App;
