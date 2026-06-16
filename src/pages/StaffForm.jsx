import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { supabase, adminSupabase } from "../utils/supabase";
import { Box, Card, CardContent, Typography, TextField, Button, Grid, CircularProgress, Alert, MenuItem } from "@mui/material";

const StaffForm = () => {
    const navigate = useNavigate();

    const [formData, setFormData] = useState({
        email: "",
        password: "",
        First_Name: "",
        Last_Name: "",
        Phone_Number: "",
        Department: "Science",
        Role_Title: "Teacher"
    });

    const [loading, setLoading] = useState(false);
    const [error, setError] = useState(null);

    const handleChange = (e) => {
        const { name, value } = e.target;
        setFormData(prev => ({ ...prev, [name]: value }));
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setLoading(true);
        setError(null);
        try {
            // 1. Create the user using the secondary client to prevent logging the admin out
            const { data, error: signUpError } = await adminSupabase.auth.signUp({
                email: formData.email,
                password: formData.password,
            });

            if (signUpError) throw signUpError;

            // 2. Set their role to "staff" (overriding the "student" default trigger)
            if (data?.user) {
                const { error: claimError } = await supabase.rpc('set_claim', {
                    uid: data.user.id,
                    claim: 'role',
                    value: 'staff'
                });
                
                if (claimError) {
                    console.error("Failed to set role claim:", claimError);
                    throw new Error("Staff created, but failed to set role. Please check database logs.");
                }

                // 3. Insert staff details into staff_data table
                const { error: insertError } = await supabase
                    .from('staff_data')
                    .insert([{
                        Auth_ID: data.user.id,
                        First_Name: formData.First_Name,
                        Last_Name: formData.Last_Name,
                        Email: formData.email,
                        Phone_Number: formData.Phone_Number,
                        Department: formData.Department,
                        Role_Title: formData.Role_Title,
                        Status: 'Active'
                    }]);
                
                if (insertError) {
                    console.error("Failed to insert staff data:", insertError);
                    throw new Error("Auth created, but failed to save staff details in the database.");
                }
            }

            navigate("/staff");
        } catch (err) {
            setError(err.message || "An error occurred while creating the staff member.");
        } finally {
            setLoading(false);
        }
    };

    return (
        <Box sx={{ p: { xs: 2, md: 4 }, minHeight: "100vh", background: "radial-gradient(circle at top right, rgba(99,102,241,0.1), transparent 40%), radial-gradient(circle at bottom left, rgba(236,72,153,0.1), transparent 40%)" }}>
            <Box sx={{ mb: 4, display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <Typography variant="h3" fontWeight="800" sx={{ background: 'linear-gradient(45deg, #6366f1, #ec4899)', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent' }}>
                    Add New Staff
                </Typography>
                <Button variant="outlined" onClick={() => navigate("/staff")} sx={{ borderColor: 'text.secondary', color: 'text.secondary' }}>
                    Cancel
                </Button>
            </Box>

            {error && <Alert severity="error" sx={{ mb: 3 }}>{error}</Alert>}

            <Card sx={{ p: 2, background: 'rgba(30, 41, 59, 0.7)', backdropFilter: 'blur(10px)', border: '1px solid rgba(255,255,255,0.05)' }}>
                <CardContent>
                    <form onSubmit={handleSubmit}>
                        <Grid container spacing={3}>
                            <Grid item xs={12} sm={6}>
                                <TextField fullWidth label="First Name" name="First_Name" value={formData.First_Name} onChange={handleChange} required />
                            </Grid>
                            <Grid item xs={12} sm={6}>
                                <TextField fullWidth label="Last Name" name="Last_Name" value={formData.Last_Name} onChange={handleChange} required />
                            </Grid>
                            <Grid item xs={12} sm={6}>
                                <TextField fullWidth label="Staff Email Address" type="email" name="email" value={formData.email} onChange={handleChange} required />
                            </Grid>
                            <Grid item xs={12} sm={6}>
                                <TextField fullWidth label="Initial Password" type="password" name="password" value={formData.password} onChange={handleChange} required />
                            </Grid>
                            <Grid item xs={12} sm={4}>
                                <TextField fullWidth label="Phone Number" name="Phone_Number" value={formData.Phone_Number} onChange={handleChange} />
                            </Grid>
                            <Grid item xs={12} sm={4}>
                                <TextField fullWidth select label="Department" name="Department" value={formData.Department} onChange={handleChange}>
                                    <MenuItem value="Science">Science</MenuItem>
                                    <MenuItem value="Mathematics">Mathematics</MenuItem>
                                    <MenuItem value="English">English</MenuItem>
                                    <MenuItem value="History">History</MenuItem>
                                    <MenuItem value="Physical Education">Physical Education</MenuItem>
                                    <MenuItem value="Administration">Administration</MenuItem>
                                    <MenuItem value="IT">IT</MenuItem>
                                    <MenuItem value="Counseling">Counseling</MenuItem>
                                    <MenuItem value="Other">Other</MenuItem>
                                </TextField>
                            </Grid>
                            <Grid item xs={12} sm={4}>
                                <TextField fullWidth select label="Role/Title" name="Role_Title" value={formData.Role_Title} onChange={handleChange}>
                                    <MenuItem value="Teacher">Teacher</MenuItem>
                                    <MenuItem value="Principal">Principal</MenuItem>
                                    <MenuItem value="Vice Principal">Vice Principal</MenuItem>
                                    <MenuItem value="Counselor">Counselor</MenuItem>
                                    <MenuItem value="IT Admin">IT Admin</MenuItem>
                                    <MenuItem value="Librarian">Librarian</MenuItem>
                                    <MenuItem value="Support Staff">Support Staff</MenuItem>
                                </TextField>
                            </Grid>
                        </Grid>

                        <Box sx={{ mt: 4, display: 'flex', justifyContent: 'flex-end', gap: 2 }}>
                            <Button variant="outlined" onClick={() => navigate("/staff")} disabled={loading} sx={{ borderColor: 'text.secondary', color: 'text.secondary' }}>
                                Cancel
                            </Button>
                            <Button type="submit" variant="contained" disabled={loading} sx={{ background: 'linear-gradient(45deg, #6366f1 30%, #ec4899 90%)' }}>
                                {loading ? <CircularProgress size={24} color="inherit" /> : "Create Staff"}
                            </Button>
                        </Box>
                    </form>
                </CardContent>
            </Card>
        </Box>
    );
};

export default StaffForm;
