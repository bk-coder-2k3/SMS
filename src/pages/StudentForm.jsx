import { useEffect, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { supabase, adminSupabase } from "../utils/supabase";
import { Box, Card, CardContent, Typography, TextField, Button, Grid, MenuItem, CircularProgress, Alert } from "@mui/material";

const StudentForm = () => {
    const { id } = useParams();
    const navigate = useNavigate();
    const isEditMode = Boolean(id);

    const [formData, setFormData] = useState({
        Student_ID: "",
        First_Name: "",
        Last_Name: "",
        Email: "",
        Date_of_Birth: "",
        Grade_Level: "",
        GPA: "",
        Enrollment_Date: "",
        Status: "Active",
        Gender: "Male",
        Phone_Number: "",
        Address: "",
        Emergency_Contact_Name: "",
        Emergency_Contact_Phone: "",
        Blood_Group: ""
    });

    const [loading, setLoading] = useState(false);
    const [fetching, setFetching] = useState(true);
    const [error, setError] = useState(null);

    useEffect(() => {
        if (isEditMode) {
            const fetchStudent = async () => {
                try {
                    const { data, error } = await supabase
                        .from('students_data')
                        .select('*')
                        .eq('Student_ID', id)
                        .single();
                    
                    if (error) throw error;
                    if (data) setFormData(data);
                } catch (err) {
                    setError("Failed to fetch student data.");
                } finally {
                    setFetching(false);
                }
            };
            fetchStudent();
        } else {
            const fetchLatestId = async () => {
                try {
                    const { data, error } = await supabase
                        .from('students_data')
                        .select('Student_ID');
                    
                    if (error) throw error;

                    if (data && data.length > 0) {
                        let maxNum = 0;
                        let prefix = "";
                        let numLength = 0;
                        
                        data.forEach(item => {
                            const idStr = String(item.Student_ID);
                            const numMatch = idStr.match(/\d+$/);
                            if (numMatch) {
                                const num = parseInt(numMatch[0], 10);
                                if (num > maxNum) {
                                    maxNum = num;
                                    prefix = idStr.substring(0, idStr.length - numMatch[0].length);
                                    numLength = numMatch[0].length;
                                }
                            }
                        });
                        
                        let nextId = "1";
                        if (maxNum > 0) {
                            const nextNum = maxNum + 1;
                            const nextNumStr = String(nextNum).padStart(numLength, '0');
                            nextId = prefix + nextNumStr;
                        }
                        
                        setFormData(prev => ({ ...prev, Student_ID: nextId }));
                    } else {
                        setFormData(prev => ({ ...prev, Student_ID: "1" }));
                    }
                } catch (err) {
                    console.error("Failed to fetch latest ID:", err);
                } finally {
                    setFetching(false);
                }
            };
            fetchLatestId();
        }
    }, [id, isEditMode]);

    const handleChange = (e) => {
        const { name, value } = e.target;
        setFormData(prev => ({ ...prev, [name]: value }));
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setLoading(true);
        setError(null);
        try {
            
            if (isEditMode) {
                const { error } = await supabase
                    .from('students_data')
                    .update(formData)
                    .eq('Student_ID', id);
                if (error) throw error;
            } else {
                // Create auth account with default password
                const { error: signUpError } = await adminSupabase.auth.signUp({
                    email: formData.Email,
                    password: 'Welcome123!'
                });
                if (signUpError) throw signUpError;

                const { error } = await supabase
                    .from('students_data')
                    .insert([formData]);
                if (error) throw error;
            }
            navigate("/staff");

        } catch (err) {
            setError(err.message || "An error occurred while saving.");
        } finally {
            setLoading(false);
        }
    };

    if (fetching) {
        return (
            <Box sx={{ minHeight: "100vh", display: "flex", justifyContent: "center", alignItems: "center" }}>
                <CircularProgress />
            </Box>
        );
    }

    return (
        <Box sx={{ p: { xs: 2, md: 4 }, minHeight: "100vh", background: "radial-gradient(circle at top right, rgba(99,102,241,0.1), transparent 40%), radial-gradient(circle at bottom left, rgba(236,72,153,0.1), transparent 40%)" }}>
            <Box sx={{ mb: 4 }}>
                <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                    <Typography variant="h3" fontWeight="800" sx={{ background: 'linear-gradient(45deg, #6366f1, #ec4899)', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent' }}>
                        {isEditMode ? "Edit Student" : "Add Student"}
                    </Typography>
                    <Button variant="outlined" onClick={() => navigate("/staff")} sx={{ borderColor: 'text.secondary', color: 'text.secondary' }}>
                        Cancel
                    </Button>
                </Box>
                <Typography variant="body1" sx={{ mt: 1, color: 'text.secondary' }}>
                    {isEditMode ? "Update the details of the selected student." : "Fill out the information below to register a new student. A login account will automatically be created with the default password: Welcome123!"}
                </Typography>
            </Box>

            {error && <Alert severity="error" sx={{ mb: 3 }}>{error}</Alert>}

            <Card sx={{ p: 2, background: 'rgba(30, 41, 59, 0.7)', backdropFilter: 'blur(10px)', border: '1px solid rgba(255,255,255,0.05)' }}>
                <CardContent>
                    <form onSubmit={handleSubmit}>
                        <Grid container spacing={3}>
                            <Grid xs={12} sm={6} md={4}>
                                <TextField fullWidth label="Student ID" name="Student_ID" value={formData.Student_ID} onChange={handleChange} required disabled={true} />
                            </Grid>
                            <Grid xs={12} sm={6} md={4}>
                                <TextField fullWidth label="First Name" name="First_Name" value={formData.First_Name} onChange={handleChange} required />
                            </Grid>
                            <Grid xs={12} sm={6} md={4}>
                                <TextField fullWidth label="Last Name" name="Last_Name" value={formData.Last_Name} onChange={handleChange} required />
                            </Grid>
                            <Grid xs={12} sm={6}>
                                <TextField fullWidth label="Email" type="email" name="Email" value={formData.Email} onChange={handleChange} required />
                            </Grid>
                            <Grid xs={12} sm={6}>
                                <TextField fullWidth label="Phone Number" name="Phone_Number" value={formData.Phone_Number} onChange={handleChange} />
                            </Grid>
                            <Grid xs={12} sm={4}>
                                <TextField fullWidth label="Date of Birth" name="Date_of_Birth" value={formData.Date_of_Birth} onChange={handleChange} placeholder="DD-MM-YYYY" />
                            </Grid>
                            <Grid xs={12} sm={4}>
                                <TextField fullWidth label="Gender" name="Gender" select value={formData.Gender} onChange={handleChange}>
                                    <MenuItem value="Male">Male</MenuItem>
                                    <MenuItem value="Female">Female</MenuItem>
                                    <MenuItem value="Other">Other</MenuItem>
                                </TextField>
                            </Grid>
                            <Grid xs={12} sm={4}>
                                <TextField fullWidth label="Blood Group" name="Blood_Group" value={formData.Blood_Group} onChange={handleChange} />
                            </Grid>
                            <Grid xs={12} sm={4}>
                                <TextField fullWidth label="Grade Level" name="Grade_Level" value={formData.Grade_Level} onChange={handleChange} required />
                            </Grid>
                            <Grid xs={12} sm={4}>
                                <TextField fullWidth label="GPA" name="GPA" type="number" inputProps={{ step: "0.01" }} value={formData.GPA} onChange={handleChange} />
                            </Grid>
                            <Grid xs={12} sm={4}>
                                <TextField fullWidth label="Status" name="Status" select value={formData.Status} onChange={handleChange}>
                                    <MenuItem value="Active">Active</MenuItem>
                                    <MenuItem value="Inactive">Inactive</MenuItem>
                                </TextField>
                            </Grid>
                            <Grid xs={12} sm={6}>
                                <TextField fullWidth label="Enrollment Date" name="Enrollment_Date" value={formData.Enrollment_Date} onChange={handleChange} placeholder="DD-MM-YYYY" />
                            </Grid>
                            <Grid xs={12}>
                                <TextField fullWidth label="Address" name="Address" value={formData.Address} onChange={handleChange} multiline rows={2} />
                            </Grid>
                            <Grid xs={12} sm={6}>
                                <TextField fullWidth label="Emergency Contact Name" name="Emergency_Contact_Name" value={formData.Emergency_Contact_Name} onChange={handleChange} />
                            </Grid>
                            <Grid xs={12} sm={6}>
                                <TextField fullWidth label="Emergency Contact Phone" name="Emergency_Contact_Phone" value={formData.Emergency_Contact_Phone} onChange={handleChange} />
                            </Grid>
                        </Grid>

                        <Box sx={{ mt: 4, display: 'flex', justifyContent: 'flex-end', gap: 2 }}>
                            <Button variant="outlined" onClick={() => navigate("/staff")} disabled={loading} sx={{ borderColor: 'text.secondary', color: 'text.secondary' }}>
                                Cancel
                            </Button>
                            <Button type="submit" variant="contained" disabled={loading} sx={{ background: 'linear-gradient(45deg, #6366f1 30%, #ec4899 90%)' }}>
                                {loading ? <CircularProgress size={24} color="inherit" /> : "Save Student"}
                            </Button>
                        </Box>
                    </form>
                </CardContent>
            </Card>
        </Box>
    );
};

export default StudentForm;
