import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import Login from './pages/login';
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
      <Route path="/acceuil" element={
      <ProtectedRoute allowedRoles={['user']}>
        <Acceuil />
      </ProtectedRoute>} /> 
    </Routes>
    </>
  );
}

export default App;