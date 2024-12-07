import { createBrowserRouter, RouterProvider, Navigate } from 'react-router-dom';
import { QueryClient, QueryClientProvider } from 'react-query';
import { AuthProvider } from './contexts/AuthContext';
import { Toaster } from 'react-hot-toast';
import PrivateRoute from './components/PrivateRoute';
import Layout from './components/Layout';
import Landing from './pages/Landing';
import Dashboard from './pages/Dashboard';
import GuestList from './pages/GuestList';
import TaskManager from './pages/TaskManager';
import Budget from './pages/Budget';
import Expenses from './pages/Expenses';
import WeddingAI from './pages/WeddingAI';
import Documents from './pages/Documents';
import Vendors from './pages/Vendors';
import Quotes from './pages/Quotes';
import WeddingForum from './pages/WeddingForum';
import WeddingStore from './pages/WeddingStore';
import TestRunner from './pages/TestRunner';
import DataMigration from './pages/DataMigration';

const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      retry: false,
      refetchOnWindowFocus: false,
    },
  },
});

// Enable React Router v7 future flags
const router = createBrowserRouter(
  [
    {
      path: '/',
      element: <Landing />,
    },
    {
      path: '/login',
      element: <Landing />,
    },
    {
      path: '/app',
      element: (
        <PrivateRoute>
          <Layout />
        </PrivateRoute>
      ),
      children: [
        { path: '', element: <Navigate to="dashboard" replace /> },
        { path: 'dashboard', element: <Dashboard /> },
        { path: 'guests', element: <GuestList /> },
        { path: 'tasks', element: <TaskManager /> },
        { path: 'budget', element: <Budget /> },
        { path: 'expenses', element: <Expenses /> },
        { path: 'wedding-ai', element: <WeddingAI /> },
        { path: 'documents', element: <Documents /> },
        { path: 'vendors', element: <Vendors /> },
        { path: 'quotes', element: <Quotes /> },
        { path: 'forum', element: <WeddingForum /> },
        { path: 'store', element: <WeddingStore /> },
        { path: 'test', element: <TestRunner /> },
        { path: 'data-migration', element: <DataMigration /> },
        { path: '*', element: <Navigate to="dashboard" replace /> },
      ],
    },
  ],
  {
    future: {
      v7_startTransition: true,
      v7_relativeSplatPath: true
    }
  }
);

export default function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <AuthProvider>
        <RouterProvider router={router} />
        <Toaster 
          position="top-right"
          toastOptions={{
            duration: 4000,
            style: {
              background: '#363636',
              color: '#fff',
            },
            success: {
              duration: 3000,
              theme: {
                primary: '#4aed88',
              }
            },
          }}
        />
      </AuthProvider>
    </QueryClientProvider>
  );
}
