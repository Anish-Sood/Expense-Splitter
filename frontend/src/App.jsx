import React from 'react';
import { Link, Outlet } from 'react-router-dom'; 
import authService from './services/authService';

function App() {
    const user = JSON.parse(localStorage.getItem('user'));

    const handleLogout = () => {
        authService.logout();
        window.location.href = '/login'; 
    };

    return (
        <div>
            <nav>
                <Link to="/">Dashboard</Link> |{" "}
                {user ? (
                    <button onClick={handleLogout}>Logout</button>
                ) : (
                    <>
                        <Link to="/login">Login</Link> |{" "}
                        <Link to="/register">Register</Link>
                    </>
                )}
            </nav>
            <hr />
            <main>
                <Outlet /> 
            </main>
        </div>
    );
}
export default App;