import React, { useContext } from 'react';
import { Navigate } from 'react-router-dom';
import { AuthContext } from '../context/AuthContext';

const ProtectedRoute = ({ children, role }) => {
    const { user } = useContext(AuthContext);

    if (!user) {
        return <Navigate to="/" />;
    }

    if (role && user.role !== role) {
        // Redirect to appropriate dashboard based on role
        return <Navigate to={user.role === 'kasir' ? '/kasir' : '/manajemen'} />;
    }

    return children;
};

export default ProtectedRoute;
