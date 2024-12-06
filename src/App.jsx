import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { QueryClient, QueryClientProvider } from 'react-query';
import { AuthProvider } from './contexts/AuthContext';
import PrivateRoute from './components/PrivateRoute';
import Layout from './components/Layout';
import Landing from './pages/Landing';
import Dashboard from './pages/Dashboard';
import GuestList from './pages/GuestList';
import TaskManager from './pages/TaskManager';
import Budget from './pages/Budget';
import Expenses from './pages/Expenses';
import AIChat from './pages/AIChat';
import Documents from './pages/Documents';
import Vendors from './pages/Vendors';
import Quotes from './pages/Quotes';
import WeddingForum from './pages/WeddingForum';
import WeddingStore from './pages/WeddingStore';

const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      retry: false,
      refetchOnWindowFocus: false,
    },
  },
});

function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <AuthProvider>
        <Router>
          <Routes>
            {/* Public routes */}
            <Route path="/" element={<Landing />} />
            <Route path="/login" element={<Landing />} />
            
            {/* Protected routes */}
            <Route
              path="/app"
              element={
                <PrivateRoute>
                  <Layout />
                </PrivateRoute>
              }
            >
              <Route index element={<Navigate to="/app/dashboard" replace />} />
              <Route path="dashboard" element={<Dashboard />} />
              <Route path="guests" element={<GuestList />} />
              <Route path="tasks" element={<TaskManager />} />
              <Route path="budget" element={<Budget />} />
              <Route path="expenses" element={<Expenses />} />
              <Route path="chat" element={<AIChat />} />
              <Route path="documents" element={<Documents />} />
              <Route path="vendors" element={<Vendors />} />
              <Route path="quotes" element={<Quotes />} />
              <Route path="forum" element={<WeddingForum />} />
              <Route path="store" element={<WeddingStore />} />
              <Route path="*" element={<Navigate to="/app/dashboard" replace />} />
            </Route>
          </Routes>
        </Router>
      </AuthProvider>
    </QueryClientProvider>
  );
}

export default App;
