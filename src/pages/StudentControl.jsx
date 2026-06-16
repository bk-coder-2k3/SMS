import { useEffect, useState } from "react";
import { supabase } from "../utils/supabase";
import { DataGrid } from '@mui/x-data-grid';
import Paper from '@mui/material/Paper';
import TextField from "@mui/material/TextField";
import Button from "@mui/material/Button";
import Dialog from "@mui/material/Dialog";
import DialogActions from "@mui/material/DialogActions";
import DialogContent from "@mui/material/DialogContent";
import DialogContentText from "@mui/material/DialogContentText";
import DialogTitle from "@mui/material/DialogTitle";
import Snackbar from "@mui/material/Snackbar";
import Alert from "@mui/material/Alert";
import Typography from "@mui/material/Typography";
import Box from "@mui/material/Box";
import Card from "@mui/material/Card";
import AddIcon from "@mui/icons-material/Add";
import Chip from "@mui/material/Chip";
import EditIcon from "@mui/icons-material/Edit";
import DeleteIcon from "@mui/icons-material/Delete";
import PeopleIcon from "@mui/icons-material/People";
import CheckCircleIcon from "@mui/icons-material/CheckCircle";
import CancelIcon from "@mui/icons-material/Cancel";
import InputAdornment from "@mui/material/InputAdornment";
import SearchIcon from "@mui/icons-material/Search";
import LockResetIcon from "@mui/icons-material/LockReset";
import { useNavigate } from "react-router-dom";

const StudentControl = () => {
    const navigate = useNavigate();

    const handleLogout = async () => {
        await supabase.auth.signOut();
        navigate("/");
    };

    const [ studata , setStudata ] = useState([]);
    const [ search , setSearch ] = useState("");
    const [open, setOpen] = useState(false);
    const [selectedStudent, setSelectedStudent] = useState(null);
    const [successOpen, setSuccessOpen] = useState(false);
    const [userRole, setUserRole] = useState(null);

    // Reset Password States
    const [resetModalOpen, setResetModalOpen] = useState(false);
    const [studentToReset, setStudentToReset] = useState(null);
    const [resetting, setResetting] = useState(false);
    const [resetSuccess, setResetSuccess] = useState(false);
    const [resetError, setResetError] = useState(null);

    const handleOpenReset = (student) => {
        setStudentToReset(student);
        setResetModalOpen(true);
        setResetError(null);
    };

    const confirmResetPassword = async () => {
        setResetting(true);
        setResetError(null);
        try {
            const { error } = await supabase.rpc('admin_reset_password', {
                student_email: studentToReset.Email,
                new_password: 'Welcome123!'
            });
            if (error) throw error;
            
            setResetModalOpen(false);
            setResetSuccess(true);
        } catch (err) {
            setResetError(err.message || 'Failed to reset password');
        } finally {
            setResetting(false);
        }
    };

    const fetchData = async() => {
        try{
            const { data: { session } } = await supabase.auth.getSession();
            if (session) {
                setUserRole(session.user.app_metadata?.role);
            }

            const { data , error } = await supabase.from("students_data").select("*")
            if(data) setStudata(data)
        } catch(err){
            console.log(err)
        }
    }

    useEffect(()=>{
        fetchData();
    },[])

    const handleOpenDelete = (studentId) => {
        setSelectedStudent(studentId);
        setOpen(true);
    };

    const handleDelete = async () => {
        const { error } = await supabase
            .from("students_data")
            .delete()
            .eq("Student_ID", selectedStudent);

        if (!error) {
            fetchData();
            setSuccessOpen(true);   
        }
        setOpen(false);
    };

    const totalStudents = studata.length;
    const activeStudents = studata.filter((s) => s.Status === "Active").length;
    const inactiveStudents = studata.filter((s) => s.Status === "Inactive").length;
        
    const displayStudents = search === "" ? studata : studata.filter((s)=>(s.First_Name.toLowerCase().includes(search.toLowerCase()) || s.Last_Name.toLowerCase().includes(search.toLowerCase())))

    const columns = [
        {
            field: "Student_ID",
            headerName: "Student ID",
            flex: 0.8,
            minWidth: 100,
        },
        {
            field: "fullName",
            headerName: "Student Name",
            flex: 1,
            minWidth: 150,
            valueGetter: (_, row) =>
                `${row.First_Name} ${row.Last_Name}`,
        },
        {
            field: "Email",
            headerName: "Email",
            flex: 1.5,
            minWidth: 200,
        },
        {
            field: "Grade_Level",
            headerName: "Grade",
            width: 90,
        },
        {
            field: "GPA",
            headerName: "GPA",
            width: 90,
        },
        {
            field: "Status",
            headerName: "Status",
            width: 130,
            renderCell: (params) => (
                <Chip
                    label={params.value}
                    sx={{
                        bgcolor: params.value === "Active" ? 'rgba(34, 197, 94, 0.2)' : 'rgba(239, 68, 68, 0.2)',
                        color: params.value === "Active" ? '#4ade80' : '#f87171',
                        border: `1px solid ${params.value === "Active" ? 'rgba(34, 197, 94, 0.5)' : 'rgba(239, 68, 68, 0.5)'}`,
                        fontWeight: 'bold',
                    }}
                    size="small"
                />
            ),
        },
        {
            field: "actions",
            headerName: "Actions",
            flex: 1.2,
            minWidth: 220,
            sortable: false,
            renderCell: (params) => (
                <>
                    <Button
                        variant="outlined"
                        size="small"
                        startIcon={<EditIcon />}
                        sx={{ mr: 1, borderColor: 'primary.light', color: 'primary.light' }}
                        onClick={() => navigate(`/staff/edit/${params.row.Student_ID}`)}
                    >
                        Edit
                    </Button>
                    <Button
                        variant="outlined"
                        color="warning"
                        size="small"
                        startIcon={<LockResetIcon />}
                        sx={{ mr: 1 }}
                        onClick={() => handleOpenReset(params.row)}
                    >
                        Reset
                    </Button>
                    <Button
                        variant="outlined"
                        color="error"
                        size="small"
                        startIcon={<DeleteIcon />}
                        onClick={() => handleOpenDelete(params.row.Student_ID)}
                    >
                        Delete
                    </Button>
                </>
            ),
        },
    ];

    return (
        <Box sx={{ p: { xs: 2, md: 4 }, minHeight: "100vh", background: "transparent" }}>
            {/* Header */}
            <Box sx={{ display: "flex", justifyContent: "space-between", alignItems: "center", mb: 4, flexWrap: 'wrap', gap: 2 }}>
                <Box>
                    <Typography variant="h3" fontWeight="800" sx={{ background: 'linear-gradient(45deg, #6366f1, #ec4899)', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent' }}>
                        Student Control
                    </Typography>
                    <Typography variant="body1" color="text.secondary" mt={1}>
                        Manage your students, update records, and monitor status.
                    </Typography>
                </Box>
                <Box sx={{ display: 'flex', gap: 2, alignItems: 'center' }}>
                    {userRole === 'admin' && (
                        <Button variant="contained" color="secondary" startIcon={<AddIcon />} sx={{ background: 'linear-gradient(45deg, #f59e0b 30%, #d97706 90%)' }} onClick={() => navigate('/admin/add-staff')}>
                            Add Staff
                        </Button>
                    )}
                    <Button variant="contained" startIcon={<AddIcon />} sx={{ background: 'linear-gradient(45deg, #6366f1 30%, #ec4899 90%)' }} onClick={() => navigate('/staff/add')}>
                        Add Student
                    </Button>
                    <Button variant="outlined" color="error" onClick={handleLogout} sx={{ borderRadius: 2 }}>
                        Logout
                    </Button>
                </Box>
            </Box>

            {/* Stats Cards */}
            <Box sx={{ display: "flex", gap: 3, mb: 4, flexDirection: { xs: 'column', md: 'row' } }}>
                <Card sx={{ flex: 1, p: 3, background: 'linear-gradient(135deg, #4f46e5 0%, #7c3aed 100%)', color: 'white', border: 'none', '&:hover': { transform: 'translateY(-5px)', boxShadow: '0 12px 24px rgba(79, 70, 229, 0.4)' } }}>
                    <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                        <Box>
                            <Typography variant="h6" sx={{ opacity: 0.9 }}>Total Students</Typography>
                            <Typography variant="h3" fontWeight="bold" mt={1}>{totalStudents}</Typography>
                        </Box>
                        <PeopleIcon sx={{ fontSize: 48, opacity: 0.5 }} />
                    </Box>
                </Card>

                <Card sx={{ flex: 1, p: 3, background: 'linear-gradient(135deg, #059669 0%, #10b981 100%)', color: 'white', border: 'none', '&:hover': { transform: 'translateY(-5px)', boxShadow: '0 12px 24px rgba(16, 185, 129, 0.4)' } }}>
                    <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                        <Box>
                            <Typography variant="h6" sx={{ opacity: 0.9 }}>Active Students</Typography>
                            <Typography variant="h3" fontWeight="bold" mt={1}>{activeStudents}</Typography>
                        </Box>
                        <CheckCircleIcon sx={{ fontSize: 48, opacity: 0.5 }} />
                    </Box>
                </Card>

                <Card sx={{ flex: 1, p: 3, background: 'linear-gradient(135deg, #e11d48 0%, #f43f5e 100%)', color: 'white', border: 'none', '&:hover': { transform: 'translateY(-5px)', boxShadow: '0 12px 24px rgba(244, 63, 94, 0.4)' } }}>
                    <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                        <Box>
                            <Typography variant="h6" sx={{ opacity: 0.9 }}>Inactive Students</Typography>
                            <Typography variant="h3" fontWeight="bold" mt={1}>{inactiveStudents}</Typography>
                        </Box>
                        <CancelIcon sx={{ fontSize: 48, opacity: 0.5 }} />
                    </Box>
                </Card>
            </Box>

            {/* Search */}
            <Card sx={{ p: 2, mb: 4, display: 'flex', alignItems: 'center' }}>
                <TextField
                    fullWidth
                    placeholder="Search by student name..."
                    variant="outlined"
                    value={search}
                    onChange={(e) => setSearch(e.target.value)}
                    slotProps={{
                        input: {
                            startAdornment: (
                                <InputAdornment position="start">
                                    <SearchIcon color="primary" />
                                </InputAdornment>
                            ),
                            sx: { borderRadius: 3 }
                        }
                    }}
                />
            </Card>

            {/* DataGrid */}
            <Card sx={{ height: 650, width: "100%", p: 1 }}>
                <DataGrid
                    rows={displayStudents}
                    columns={columns}
                    getRowId={(row) => row.Student_ID}
                    pageSizeOptions={[5, 10, 25, 50]}
                    initialState={{
                        pagination: {
                            paginationModel: { page: 0, pageSize: 10 },
                        },
                    }}
                    disableRowSelectionOnClick
                    sx={{
                        border: 'none',
                        '& .MuiDataGrid-cell': {
                            borderBottom: '1px solid rgba(255, 255, 255, 0.05)',
                            color: 'text.secondary',
                        },
                        '& .MuiDataGrid-columnHeaders': {
                            backgroundColor: 'rgba(255, 255, 255, 0.02)',
                            borderBottom: '2px solid rgba(255, 255, 255, 0.1)',
                            color: 'text.primary',
                            fontSize: '0.95rem',
                        },
                        '& .MuiDataGrid-footerContainer': {
                            borderTop: '2px solid rgba(255, 255, 255, 0.1)',
                        },
                        '& .MuiDataGrid-row:hover': {
                            backgroundColor: 'rgba(99, 102, 241, 0.08)',
                        }
                    }}
                />
            </Card>

            {/* Delete Dialog */}
            <Dialog 
                open={open} 
                onClose={() => setOpen(false)}
                PaperProps={{
                    sx: { background: 'rgba(30, 41, 59, 0.95)', backdropFilter: 'blur(10px)', border: '1px solid rgba(255,255,255,0.1)' }
                }}
            >
                <DialogTitle color="error.main" fontWeight="bold" sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                    <DeleteIcon /> Delete Student
                </DialogTitle>
                <DialogContent>
                    <DialogContentText color="text.secondary">
                        Are you sure you want to permanently delete this student record? This action cannot be undone.
                    </DialogContentText>
                </DialogContent>
                <DialogActions sx={{ p: 2, pt: 0 }}>
                    <Button onClick={() => setOpen(false)} sx={{ color: 'text.secondary' }}>Cancel</Button>
                    <Button color="error" variant="contained" onClick={handleDelete} sx={{ borderRadius: 2 }}>Delete</Button>
                </DialogActions>
            </Dialog>

            {/* Reset Password Dialog */}
            <Dialog open={resetModalOpen} onClose={() => setResetModalOpen(false)}>
                <DialogTitle sx={{ display: 'flex', alignItems: 'center', gap: 1, color: 'warning.main' }}>
                    <LockResetIcon /> Reset Student Password
                </DialogTitle>
                <DialogContent>
                    {resetError && <Alert severity="error" sx={{ mb: 2 }}>{resetError}</Alert>}
                    <DialogContentText>
                        Are you sure you want to reset the password for <strong>{studentToReset?.First_Name} {studentToReset?.Last_Name}</strong>?
                        <br/><br/>
                        This will instantly change their password to <strong>Welcome123!</strong>. They should change it after logging in.
                    </DialogContentText>
                </DialogContent>
                <DialogActions>
                    <Button onClick={() => setResetModalOpen(false)} disabled={resetting}>Cancel</Button>
                    <Button onClick={confirmResetPassword} color="warning" variant="contained" disabled={resetting}>
                        {resetting ? 'Resetting...' : 'Reset Password'}
                    </Button>
                </DialogActions>
            </Dialog>

            <Snackbar open={successOpen} autoHideDuration={3000} onClose={() => setSuccessOpen(false)}>
                <Alert severity="success" sx={{ width: '100%' }}>Student deleted successfully!</Alert>
            </Snackbar>

            <Snackbar open={resetSuccess} autoHideDuration={4000} onClose={() => setResetSuccess(false)}>
                <Alert severity="success" sx={{ width: '100%' }}>Password successfully reset to Welcome123!</Alert>
            </Snackbar>
        </Box>
    );
}

export default StudentControl;
