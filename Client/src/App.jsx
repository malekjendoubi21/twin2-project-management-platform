import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import Login from './pages/login';
import { Toaster } from 'react-hot-toast';
import Register from './pages/Register';
import Home from './pages/home';
import ProtectedRoute from './pages/ProtectedRoute';
import Acceuil from './pages/Acceuil';


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
      <Route path="/home" element={<Home />} />
      <Route path="/acceuil" element={
      <ProtectedRoute allowedRoles={['user']}>
        <Acceuil />
      </ProtectedRoute>} /> 
    </Routes>
    </>
  );
}

export default App;