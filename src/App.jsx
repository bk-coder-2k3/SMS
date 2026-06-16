import { BrowserRouter as Router, Routes, Route, Navigate } from "react-router-dom"
import StudentControl from "./pages/StudentControl"
import Login from "./pages/Login"
import StudentDashboard from "./pages/StudentDashboard"
import StudentForm from "./pages/StudentForm"
import StaffForm from "./pages/StaffForm"
import ProtectedRoute from "./components/ProtectedRoute"

function App() {
  return (
    <Router>
      <Routes>
        <Route path="/" element={<Login />} />
        <Route path="/dashboard" element={<ProtectedRoute><StudentDashboard /></ProtectedRoute>} />
        <Route path="/staff" element={<ProtectedRoute allowedRoles={['staff', 'admin']}><StudentControl /></ProtectedRoute>} />
        <Route path="/staff/add" element={<ProtectedRoute allowedRoles={['staff', 'admin']}><StudentForm /></ProtectedRoute>} />
        <Route path="/staff/edit/:id" element={<ProtectedRoute allowedRoles={['staff', 'admin']}><StudentForm /></ProtectedRoute>} />
        <Route path="/admin/add-staff" element={<ProtectedRoute allowedRoles={['admin']}><StaffForm /></ProtectedRoute>} />
        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
    </Router>
  )
}

export default App
