import { useState, useRef, useEffect } from "react";
import { supabase } from "../utils/supabase";
import {
  Box, Card, CardContent, Typography, Grid, Avatar, Chip, Divider, CircularProgress, IconButton, Button, Dialog, DialogTitle, DialogContent, DialogActions, TextField, Alert
} from "@mui/material";
import { useNavigate } from "react-router-dom";

import SchoolIcon from "@mui/icons-material/School";
import EmailIcon from "@mui/icons-material/Email";
import PhoneIcon from "@mui/icons-material/Phone";
import CakeIcon from "@mui/icons-material/Cake";
import LocationOnIcon from "@mui/icons-material/LocationOn";
import PhotoCameraIcon from "@mui/icons-material/PhotoCamera";

const StudentDashboard = () => {
  const navigate = useNavigate();
  const [student, setStudent] = useState(null);
  const [loading, setLoading] = useState(true);

  const handleLogout = async () => {
    await supabase.auth.signOut();
    navigate("/");
  };

  const [profileImage, setProfileImage] = useState(null);
  const [isUploading, setIsUploading] = useState(false);
  const fileInputRef = useRef(null);

  const [passwordModalOpen, setPasswordModalOpen] = useState(false);
  const [newPassword, setNewPassword] = useState("");
  const [passwordError, setPasswordError] = useState("");
  const [passwordSuccess, setPasswordSuccess] = useState("");
  const [changingPassword, setChangingPassword] = useState(false);

  const handlePasswordChange = async () => {
    if (newPassword.length < 6) {
      setPasswordError("Password must be at least 6 characters.");
      return;
    }
    setPasswordError("");
    setPasswordSuccess("");
    setChangingPassword(true);
    
    const { error } = await supabase.auth.updateUser({ password: newPassword });
    
    setChangingPassword(false);
    
    if (error) {
      setPasswordError(error.message);
    } else {
      setPasswordSuccess("Password updated successfully!");
      setNewPassword("");
      setTimeout(() => {
        setPasswordModalOpen(false);
        setPasswordSuccess("");
      }, 2000);
    }
  };

  useEffect(() => {
    const fetchStudentData = async () => {
      try {
        const { data: { user }, error: userError } = await supabase.auth.getUser();
        if (userError || !user) throw new Error("Not authenticated");

        const { data, error } = await supabase
          .from("students_data")
          .select("*")
          .eq("Email", user.email)
          .single();

        if (error) throw error;

        if (data) {
          setStudent(data);
          if (data.pp_img_url) {
            setProfileImage(data.pp_img_url);
          }
        }
      } catch (error) {
        console.error("Error fetching student data:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchStudentData();
  }, []);

  const handleImageClick = () => {
    fileInputRef.current?.click();
  };

  const handleImageChange = async (event) => {
    const file = event.target.files?.[0];
    if (!file) return;

    setIsUploading(true);
    const formData = new FormData();
    formData.append("file", file);
    formData.append("upload_preset", import.meta.env.VITE_CLOUDINARY_UPLOAD_PRESET || "sms_preset");
    formData.append("cloud_name", import.meta.env.VITE_CLOUDINARY_CLOUD_NAME || "dsst4gxvo");

    try {
      const response = await fetch(
        `https://api.cloudinary.com/v1_1/${import.meta.env.VITE_CLOUDINARY_CLOUD_NAME || "dsst4gxvo"}/image/upload`,
        {
          method: "POST",
          body: formData,
        }
      );
      const data = await response.json();
      if (data.secure_url) {
        setProfileImage(data.secure_url);

        // Update the image URL in Supabase
        const { error: dbError } = await supabase
          .from("students_data")
          .update({ pp_img_url: data.secure_url })
          .eq("Student_ID", student.Student_ID);

        if (dbError) {
          console.error("Database update failed:", dbError);
          alert("Image uploaded successfully, but failed to update database.");
        }
      } else {
        console.error("Upload failed:", data);
        alert("Failed to upload image. Please check your Cloudinary upload preset.");
      }
    } catch (error) {
      console.error("Error uploading image:", error);
      alert("An error occurred while uploading the image.");
    } finally {
      setIsUploading(false);
    }
  };

  if (loading) {
    return (
      <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', minHeight: '100vh', backgroundColor: '#0f172a' }}>
        <CircularProgress />
      </Box>
    );
  }

  if (!student) {
    return (
      <Box sx={{ p: 4, textAlign: 'center', minHeight: '100vh', backgroundColor: '#0f172a' }}>
        <Typography variant="h5" color="error">Student data not found. Please log in again or contact administration.</Typography>
      </Box>
    );
  }

  return (
    <Box
      sx={{
        p: { xs: 2, md: 4 },
        minHeight: "100vh",
        background: "radial-gradient(circle at top right, rgba(99,102,241,0.1), transparent 40%), radial-gradient(circle at bottom left, rgba(236,72,153,0.1), transparent 40%)",
      }}
    >
      <Box sx={{ mb: 4, display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: 2 }}>
        <Box>
          <Typography
            variant="h3"
            fontWeight="800"
            sx={{
              background: 'linear-gradient(45deg, #818cf8, #c084fc)',
              WebkitBackgroundClip: 'text',
              WebkitTextFillColor: 'transparent',
              display: 'inline-block'
            }}
          >
            Dashboard
          </Typography>
          <Typography variant="body1" color="text.secondary">
            Welcome back, {student.First_Name}
          </Typography>
        </Box>
        <Box sx={{ display: 'flex', gap: 2 }}>
          <Button variant="outlined" color="primary" onClick={() => setPasswordModalOpen(true)} sx={{ borderRadius: 2 }}>
            Change Password
          </Button>
          <Button variant="outlined" color="error" onClick={handleLogout} sx={{ borderRadius: 2 }}>
            Logout
          </Button>
        </Box>
      </Box>

      <Grid container spacing={4}>
        {/* Profile Card */}
        <Grid xs={12} md={4}>
          <Card sx={{ height: '100%', display: 'flex', flexDirection: 'column' }}>
            <CardContent
              sx={{
                textAlign: "center",
                flexGrow: 1,
                display: 'flex',
                flexDirection: 'column',
                alignItems: 'center',
                justifyContent: 'center',
                p: 4
              }}
            >
              <Box sx={{ position: 'relative', mb: 3, display: 'inline-block' }}>
                <Box
                  sx={{
                    position: 'absolute',
                    top: -4, left: -4, right: -4, bottom: -4,
                    background: 'linear-gradient(45deg, #6366f1, #ec4899)',
                    borderRadius: '50%',
                    zIndex: 0,
                    animation: 'pulse 2s infinite alternate',
                  }}
                />
                <Avatar
                  src={profileImage || undefined}
                  sx={{
                    width: 120,
                    height: 120,
                    fontSize: '3rem',
                    bgcolor: 'background.paper',
                    color: 'primary.main',
                    border: '4px solid #1e293b',
                    position: 'relative',
                    zIndex: 1,
                    cursor: 'pointer',
                    transition: 'all 0.3s ease',
                    '&:hover': {
                      opacity: 0.8,
                    }
                  }}
                  onClick={handleImageClick}
                >
                  {!profileImage && student.First_Name[0]}
                </Avatar>

                <IconButton
                  sx={{
                    position: 'absolute',
                    bottom: 0,
                    right: -10,
                    zIndex: 2,
                    bgcolor: 'background.paper',
                    border: '2px solid #1e293b',
                    '&:hover': { bgcolor: 'action.hover' },
                  }}
                  onClick={handleImageClick}
                  disabled={isUploading}
                >
                  <PhotoCameraIcon color="primary" fontSize="small" />
                </IconButton>

                {isUploading && (
                  <CircularProgress
                    size={128}
                    thickness={2}
                    sx={{
                      position: 'absolute',
                      top: -4,
                      left: -4,
                      zIndex: 3,
                      color: '#ec4899',
                    }}
                  />
                )}

                <input
                  type="file"
                  hidden
                  ref={fileInputRef}
                  accept="image/*"
                  onChange={handleImageChange}
                />
              </Box>

              <Typography variant="h4" fontWeight="700" gutterBottom>
                {student.First_Name} {student.Last_Name}
              </Typography>

              <Typography color="primary.light" variant="h6" fontWeight="500" gutterBottom>
                {student.Student_ID}
              </Typography>

              <Box mt={2}>
                <Chip
                  label={student.Status}
                  color="success"
                  sx={{ fontWeight: 'bold', px: 2, py: 2.5, borderRadius: 2, fontSize: '1rem', background: 'rgba(34, 197, 94, 0.2)', color: '#4ade80', border: '1px solid rgba(34, 197, 94, 0.5)' }}
                />
              </Box>
            </CardContent>
          </Card>
        </Grid>

        {/* Academic Card */}
        <Grid xs={12} md={8}>
          <Grid container spacing={4}>
            <Grid xs={12} sm={6}>
              <Card sx={{ height: '100%' }}>
                <CardContent sx={{ p: 3 }}>
                  <Typography variant="h6" color="primary.light" gutterBottom sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                    <SchoolIcon /> Academic Information
                  </Typography>
                  <Divider sx={{ my: 2, borderColor: 'rgba(255,255,255,0.1)' }} />

                  <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
                    <Box sx={{ display: 'flex', justifyContent: 'space-between' }}>
                      <Typography color="text.secondary">Grade Level</Typography>
                      <Typography fontWeight="600">{student.Grade_Level}</Typography>
                    </Box>
                    <Box sx={{ display: 'flex', justifyContent: 'space-between' }}>
                      <Typography color="text.secondary">GPA</Typography>
                      <Typography fontWeight="bold" color="secondary.main">{student.GPA}</Typography>
                    </Box>
                    <Box sx={{ display: 'flex', justifyContent: 'space-between' }}>
                      <Typography color="text.secondary">Enrollment Date</Typography>
                      <Typography fontWeight="600">{student.Enrollment_Date}</Typography>
                    </Box>
                    <Box sx={{ display: 'flex', justifyContent: 'space-between' }}>
                      <Typography color="text.secondary">Blood Group</Typography>
                      <Typography fontWeight="600">{student.Blood_Group}</Typography>
                    </Box>
                  </Box>
                </CardContent>
              </Card>
            </Grid>

            {/* Quick Stats */}
            <Grid xs={12} sm={6}>
              <Card sx={{ height: '100%' }}>
                <CardContent sx={{ p: 3 }}>
                  <Typography variant="h6" color="secondary.light" gutterBottom sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                    Student Status
                  </Typography>
                  <Divider sx={{ my: 2, borderColor: 'rgba(255,255,255,0.1)' }} />

                  <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
                    <Box sx={{ display: 'flex', justifyContent: 'space-between' }}>
                      <Typography color="text.secondary">Enrollment</Typography>
                      <Chip size="small" label="Currently Enrolled" sx={{ background: 'rgba(99,102,241,0.2)', color: '#818cf8' }} />
                    </Box>
                    <Box sx={{ display: 'flex', justifyContent: 'space-between' }}>
                      <Typography color="text.secondary">Current Status</Typography>
                      <Typography fontWeight="600" color="success.main">{student.Status}</Typography>
                    </Box>
                    <Box sx={{ display: 'flex', justifyContent: 'space-between' }}>
                      <Typography color="text.secondary">Gender</Typography>
                      <Typography fontWeight="600">{student.Gender}</Typography>
                    </Box>
                  </Box>
                </CardContent>
              </Card>
            </Grid>

            {/* Personal Details */}
            <Grid xs={12}>
              <Card>
                <CardContent sx={{ p: 3 }}>
                  <Typography variant="h6" gutterBottom color="text.primary">
                    Personal Details
                  </Typography>
                  <Divider sx={{ my: 2, borderColor: 'rgba(255,255,255,0.1)' }} />

                  <Grid container spacing={3}>
                    <Grid xs={12} sm={6}>
                      <Box sx={{ display: 'flex', alignItems: 'center', gap: 2, mb: 2 }}>
                        <Avatar sx={{ bgcolor: 'rgba(99,102,241,0.2)', color: '#818cf8' }}><EmailIcon /></Avatar>
                        <Box>
                          <Typography variant="body2" color="text.secondary">Email Address</Typography>
                          <Typography variant="body1" fontWeight="500">{student.Email}</Typography>
                        </Box>
                      </Box>
                      <Box sx={{ display: 'flex', alignItems: 'center', gap: 2, mb: 2 }}>
                        <Avatar sx={{ bgcolor: 'rgba(236,72,153,0.2)', color: '#f472b6' }}><PhoneIcon /></Avatar>
                        <Box>
                          <Typography variant="body2" color="text.secondary">Phone Number</Typography>
                          <Typography variant="body1" fontWeight="500">{student.Phone_Number}</Typography>
                        </Box>
                      </Box>
                    </Grid>

                    <Grid xs={12} sm={6}>
                      <Box sx={{ display: 'flex', alignItems: 'center', gap: 2, mb: 2 }}>
                        <Avatar sx={{ bgcolor: 'rgba(16,185,129,0.2)', color: '#34d399' }}><CakeIcon /></Avatar>
                        <Box>
                          <Typography variant="body2" color="text.secondary">Date of Birth</Typography>
                          <Typography variant="body1" fontWeight="500">{student.Date_of_Birth}</Typography>
                        </Box>
                      </Box>
                      <Box sx={{ display: 'flex', alignItems: 'center', gap: 2, mb: 2 }}>
                        <Avatar sx={{ bgcolor: 'rgba(245,158,11,0.2)', color: '#fbbf24' }}><LocationOnIcon /></Avatar>
                        <Box>
                          <Typography variant="body2" color="text.secondary">Address</Typography>
                          <Typography variant="body1" fontWeight="500">{student.Address}</Typography>
                        </Box>
                      </Box>
                    </Grid>
                  </Grid>
                </CardContent>
              </Card>
            </Grid>
          </Grid>
        </Grid>
      </Grid>

      {/* Change Password Modal */}
      <Dialog open={passwordModalOpen} onClose={() => setPasswordModalOpen(false)}>
        <DialogTitle>Change Password</DialogTitle>
        <DialogContent>
          {passwordError && <Alert severity="error" sx={{ mb: 2 }}>{passwordError}</Alert>}
          {passwordSuccess && <Alert severity="success" sx={{ mb: 2 }}>{passwordSuccess}</Alert>}
          <Typography variant="body2" sx={{ mb: 2 }}>
            Please enter your new password below. It must be at least 6 characters long.
          </Typography>
          <TextField
            autoFocus
            margin="dense"
            label="New Password"
            type="password"
            fullWidth
            variant="outlined"
            value={newPassword}
            onChange={(e) => setNewPassword(e.target.value)}
          />
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setPasswordModalOpen(false)} disabled={changingPassword}>Cancel</Button>
          <Button onClick={handlePasswordChange} variant="contained" disabled={changingPassword || !newPassword}>
            {changingPassword ? <CircularProgress size={24} /> : "Update Password"}
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
};

export default StudentDashboard;