import { Box, Card, CardContent, Typography, TextField, Button, Divider } from "@mui/material";
import { useNavigate } from "react-router-dom";
import { useState } from "react";
import { supabase } from "../utils/supabase";

const Login = () => {

  const navigate = useNavigate();

  const [ formData , setFormData] = useState({ email: '', password: ''});

  const handleFormChange = (e) =>{
    setFormData({
      ...formData,
      [e.target.name]: e.target.value,
    })
  }

  const handleLogin = async(e) => {
    e.preventDefault();
    const { data , error } = await supabase.auth.signInWithPassword({
      email: formData.email,
      password: formData.password,
    });

    if (error) {
      alert(error.message);
      return;
    }

    // Read custom claims from JWT
    const role = data?.session?.user?.app_metadata?.role;

    if (role === 'staff' || role === 'admin') {
      navigate("/staff");
    } else {
      navigate("/dashboard");
    }
  };

  return (
    <Box
      sx={{
        minHeight: "100vh",
        background: "radial-gradient(circle at 15% 50%, rgba(99, 102, 241, 0.15), transparent 25%), radial-gradient(circle at 85% 30%, rgba(236, 72, 153, 0.15), transparent 25%)",
        backgroundColor: "#0f172a",
        display: "flex",
        justifyContent: "center",
        alignItems: "center",
        p: 2,
        position: 'relative',
        overflow: 'hidden'
      }}
    >
      <Box sx={{ position: 'absolute', top: '10%', left: '20%', width: '300px', height: '300px', background: 'radial-gradient(circle, rgba(99,102,241,0.4) 0%, rgba(0,0,0,0) 70%)', filter: 'blur(40px)', zIndex: 0 }} />
      <Box sx={{ position: 'absolute', bottom: '10%', right: '20%', width: '350px', height: '350px', background: 'radial-gradient(circle, rgba(236,72,153,0.3) 0%, rgba(0,0,0,0) 70%)', filter: 'blur(50px)', zIndex: 0 }} />

      <Card
        sx={{
          width: 420,
          borderRadius: 4,
          boxShadow: '0 8px 32px 0 rgba(0, 0, 0, 0.37)',
          backdropFilter: 'blur(16px)',
          WebkitBackdropFilter: 'blur(16px)',
          border: '1px solid rgba(255, 255, 255, 0.08)',
          background: 'rgba(30, 41, 59, 0.65)',
          zIndex: 1,
          '&:hover': {
            transform: 'none',
            boxShadow: '0 8px 32px 0 rgba(0, 0, 0, 0.37)',
          }
        }}
      >
        <CardContent sx={{ p: 4 }}>
          <Typography
            variant="h4"
            fontWeight="bold"
            align="center"
            gutterBottom
            sx={{
              background: 'linear-gradient(to right, #818cf8, #f472b6)',
              WebkitBackgroundClip: 'text',
              WebkitTextFillColor: 'transparent'
            }}
          >
            Welcome Back
          </Typography>

          <Typography
            variant="body2"
            color="text.secondary"
            align="center"
            mb={4}
          >
            Student Management System
          </Typography>

          <form onSubmit={handleLogin}>
            <TextField
              fullWidth
              label="Email Address"
              type="email"
              margin="normal"
              onChange={handleFormChange}
              value={formData.email}
              required
              name="email"
              variant="outlined"
            />

            <TextField
              fullWidth
              label="Password"
              type="password"
              margin="normal"
              required
              value={formData.password}
              onChange={handleFormChange}
              name="password"
              variant="outlined"
            />

            <Button
              type="submit"
              variant="contained"
              fullWidth
              size="large"
              sx={{
                mt: 3,
                mb: 2,
                borderRadius: 2,
                py: 1.5,
                background: 'linear-gradient(45deg, #6366f1 30%, #ec4899 90%)',
                color: 'white',
                '&:hover': {
                  background: 'linear-gradient(45deg, #4f46e5 30%, #db2777 90%)',
                  transform: 'translateY(-2px)'
                }
              }}
            >
              Login
            </Button>
          </form>

        </CardContent>
      </Card>
    </Box>
  );
};

export default Login;