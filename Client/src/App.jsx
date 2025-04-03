import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import Login from './pages/Login';
import { Toaster } from 'react-hot-toast';
import Register from './pages/Register';
import Home from './pages/home';
import ProtectedRoute from './pages/ProtectedRoute';
import Acceuil from './pages/Acceuil';
import UserDetails from "./dashboard/UserDetails.jsx";
import Listusers from "./dashboard/Listusers.jsx";
import Dashboard from "./dashboard/Dashboard.jsx";
import ForgotPassword from './pages/forgotPassword';
import VerifyEmail from './pages/VerifyEmail';
import WorkspaceLayout from './pages/Workspace';
import Projects from './pages/workspace/Projects';
import WorkspaceOverview from './pages/workspace/WorkspaceOverview.jsx';
import InvitationResponse from './pages/workspace/InvitationResponse.jsx';
import WorkspaceMembers from './pages/workspace/WorkspaceMembers.jsx';
import WorkspaceSettings from './pages/workspace/WorkspaceSettings.jsx';

import Profile from './pages/Profile';
import NotFound from './pages/NotFound.jsx';

function App() {
  return (
    <>
    <Toaster
      position="top-center"
      toastOptions={{
        duration: 5000,
      }}
    />
    <Routes>

      <Route path="/" element={<Home />} />
      <Route path="/login" element={<Login />} />
      <Route path="/Register" element={<Register />} />
      <Route path="/forgotPassword" element={<ForgotPassword />} />
      <Route path="/verify-email" element={<VerifyEmail />} />
      <Route path="/home" element={<Home />} />
      <Route path="/dashboard" element={<Dashboard />} />
      <Route path="/dashboard/listusers" element={<Listusers />} />
      <Route path="/dashboard/user/:id" element={<UserDetails />} />
      <Route path="/invitations/:token/accept" element={<InvitationResponse />} />


        {/* Workspace Routes */}
        <Route 
          path="/workspace/:id" 
          element={
            <ProtectedRoute allowedRoles={['user', 'admin']}>
              <WorkspaceLayout />
            </ProtectedRoute>
          }
        >
          <Route index element={<Navigate to="overview" replace />} />
          <Route path="overview" element={<WorkspaceOverview />}  />
          <Route path="projects" element={<Projects />} />
          <Route path="members" element={<WorkspaceMembers />} />
          <Route path="settings" element={<WorkspaceSettings />} />
        </Route>
      

      <Route path="/acceuil" element={
      <ProtectedRoute allowedRoles={['user']}>
        <Acceuil />
      </ProtectedRoute>} /> 
      <Route path="/profile" element={
          <ProtectedRoute allowedRoles={['user', 'admin']}>
            <Profile />
          </ProtectedRoute>
        } />
        
        <Route path="*" element={<NotFound />} />

    </Routes>
    </>
  );
}

export default App;