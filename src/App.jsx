import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import { QueryClient, QueryClientProvider } from 'react-query';
import Layout from './components/Layout';
import Dashboard from './pages/Dashboard';
import GuestList from './pages/GuestList';
import TaskManager from './pages/TaskManager';
import Budget from './pages/Budget';
import Expenses from './pages/Expenses';
import AIChat from './pages/AIChat';

const queryClient = new QueryClient();

function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <Router>
        <Routes>
          <Route path="/" element={<Layout />}>
            <Route index element={<Dashboard />} />
            <Route path="guests" element={<GuestList />} />
            <Route path="tasks" element={<TaskManager />} />
            <Route path="budget" element={<Budget />} />
            <Route path="expenses" element={<Expenses />} />
            <Route path="chat" element={<AIChat />} />
          </Route>
        </Routes>
      </Router>
    </QueryClientProvider>
  );
}

export default App;
