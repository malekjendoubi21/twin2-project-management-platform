// Email verification component
import { useState } from 'react';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';

const EmailVerification = () => {
    const [verificationCode, setVerificationCode] = useState('');
    const [error, setError] = useState('');
    const [loading, setLoading] = useState(false);
    const navigate = useNavigate();
    
    // Get userId from URL parameters or localStorage
    const userId = new URLSearchParams(window.location.search).get('userId') || localStorage.getItem('userId');
    
    const handleSubmit = async (e) => {
        e.preventDefault();
        setLoading(true);
        setError('');
        
        try {
            const response = await axios.post('/api/auth/verify-email', {
                userId,
                verificationToken: verificationCode
            });
            
            // Clear stored userId if it was in localStorage
            localStorage.removeItem('userId');
            
            // Redirect to dashboard or login page
            navigate('/dashboard');
        } catch (err) {
            setError(err.response?.data?.error || 'Une erreur est survenue');
        } finally {
            setLoading(false);
        }
    };
    
    return (
        <div className="verification-container">
            <h2>Vérification de votre adresse email</h2>
            <p>Veuillez saisir le code de vérification que nous avons envoyé à votre adresse email.</p>
            
            {error && <div className="error-message">{error}</div>}
            
            <form onSubmit={handleSubmit}>
                <div className="form-group">
                    <label>Code de vérification</label>
                    <input 
                        type="text" 
                        value={verificationCode} 
                        onChange={(e) => setVerificationCode(e.target.value)}
                        placeholder="Entrez le code à 6 chiffres"
                        required
                    />
                </div>
                
                <button type="submit" disabled={loading}>
                    {loading ? 'Vérification en cours...' : 'Vérifier'}
                </button>
            </form>
        </div>
    );
};

export default EmailVerification;