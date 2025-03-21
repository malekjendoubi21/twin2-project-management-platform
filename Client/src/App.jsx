import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
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
import CreateWorkspace from './pages/workspace/CreateWorkspace.jsx';


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
      <Route 
          path="/create-workspace" 
          element={
            <ProtectedRoute allowedRoles={['user']}>
              <CreateWorkspace />
    </ProtectedRoute>
  }
/>

        {/* Workspace Routes */}
        <Route 
          path="/workspace/:id" 
          element={
            <ProtectedRoute allowedRoles={['user', 'admin']}>
              <WorkspaceLayout />
            </ProtectedRoute>
          }
        >
          <Route index element={<div>Workspace Overview</div>} />
          <Route path="projects" element={<Projects />} />
          {/* <Route path="tasks" element={<Tasks />} />
          <Route path="members" element={<Members />} />
          <Route path="settings" element={<Settings />} /> */}
        </Route>
      
      <Route path="/acceuil" element={
      <ProtectedRoute allowedRoles={['user']}>
        <Acceuil />
      </ProtectedRoute>} /> 
    </Routes>
    </>
  );
}

export default App;