import React from 'react';
import ReactDOM from 'react-dom/client';
import { createBrowserRouter, RouterProvider } from 'react-router-dom';

import App from './App.jsx';
import LoginPage from './pages/LoginPage.jsx';
import RegisterPage from './pages/RegisterPage.jsx';
import DashboardPage from './pages/DashboardPage';
import ProtectedRoute from './components/ProtectedRoute';
import GroupDetailPage from './pages/GroupDetailPage';

const router = createBrowserRouter([
    {
        path: "/",
        element: <App />, 
        children: [
            {
                element: <ProtectedRoute />,
                children: [
                    {
                        index: true, 
                        element: <DashboardPage />,
                    },
                    { 
                        path: "/groups/:groupId",
                        element: <GroupDetailPage />,
                    },
                ],
            },
            {
                path: "/login",
                element: <LoginPage />,
            },
            {
                path: "/register",
                element: <RegisterPage />,
            },
        ],
    },
]);

ReactDOM.createRoot(document.getElementById('root')).render(
    <React.StrictMode>
        <RouterProvider router={router} />
    </React.StrictMode>
);