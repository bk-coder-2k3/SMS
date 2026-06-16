import { useEffect, useState } from 'react';
import { Navigate } from 'react-router-dom';
import { supabase } from '../utils/supabase';
import { Box, CircularProgress } from '@mui/material';

const ProtectedRoute = ({ children, requiredRole }) => {
    const [loading, setLoading] = useState(true);
    const [authorized, setAuthorized] = useState(false);

    useEffect(() => {
        const checkAuth = async () => {
            const { data: { session } } = await supabase.auth.getSession();
            if (!session) {
                setAuthorized(false);
            } else {
                const role = session.user.app_metadata?.role;
                if (requiredRole && role !== requiredRole) {
                    setAuthorized(false);
                } else {
                    setAuthorized(true);
                }
            }
            setLoading(false);
        };
        checkAuth();
    }, [requiredRole]);

    if (loading) {
        return (
            <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', minHeight: '100vh', bgcolor: '#0f172a' }}>
                <CircularProgress />
            </Box>
        );
    }

    if (!authorized) {
        return <Navigate to="/" replace />;
    }

    return children;
};

export default ProtectedRoute;
