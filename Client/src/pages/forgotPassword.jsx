import { useState } from "react";
import api from "../utils/Api";
import { useNavigate } from "react-router-dom";

const ForgetPassword = () => {
    const [step, setStep] = useState(1); // Étape 1: Demande, 2: Vérification, 3: Réinitialisation
    const [email, setEmail] = useState("");
    const [resetToken, setResetToken] = useState("");
    const [newPassword, setNewPassword] = useState("");
    const [confirmPassword, setConfirmPassword] = useState("");
    const [message, setMessage] = useState(null);
    const [loading, setLoading] = useState(false);
    const navigate = useNavigate();

    // Étape 1: Envoi du code de réinitialisation
    const handleRequestReset = async (e) => {
        e.preventDefault();
        setLoading(true);
        setMessage(null);

        try {
            const response = await api.post("/api/auth/forgotPassword", { email });
            setMessage({ type: "success", text: response.data.message });
            setStep(2); // Passe à l'étape de vérification
        } catch (error) {
            setMessage({ type: "error", text: error.response?.data?.error || "Erreur lors de la demande." });
        } finally {
            setLoading(false);
        }
    };

    // Étape 2: Vérification du code
    const handleVerifyToken = async (e) => {
        e.preventDefault();
        setLoading(true);
        setMessage(null);

        try {
            const response = await api.post("/api/auth/verifyResetToken", { resetToken });
            setMessage({ type: "success", text: response.data.message });
            setStep(3); // Passe à l'étape de réinitialisation
        } catch (error) {
            setMessage({ type: "error", text: error.response?.data?.error || "Code invalide ou expiré." });
        } finally {
            setLoading(false);
        }
    };

    // Étape 3: Réinitialisation du mot de passe
    const handleResetPassword = async (e) => {
        e.preventDefault();
        setLoading(true);
        setMessage(null);

        if (newPassword !== confirmPassword) {
            setMessage({ type: "error", text: "Les mots de passe ne correspondent pas." });
            setLoading(false);
            return;
        }

        try {
            const response = await api.put("/api/auth/resetPassword", { email, newPassword, resetToken });

            setMessage({ type: "success", text: response.data.message });

            // Rediriger après succès
            setTimeout(() => {
                navigate("/login");
            }, 2000);
        } catch (error) {
            console.error(error);
            setMessage({ type: "error", text: error.response?.data?.error || "Erreur lors de la réinitialisation." });
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="flex min-h-screen items-center justify-center bg-gray-100">
            <div className="bg-white p-8 rounded-lg shadow-md w-full max-w-md">
                {message && (
                    <div className={`p-3 mb-4 rounded-md text-center ${message.type === "success" ? "bg-green-100 text-green-700" : "bg-red-100 text-red-700"}`}>
                        {message.text}
                    </div>
                )}

                {step === 1 && (
                    <form onSubmit={handleRequestReset}>
                        <h2 className="text-2xl font-bold text-center mb-4">Mot de passe oublié</h2>
                        <p className="text-gray-600 text-center mb-6">
                            Entrez votre email pour recevoir un code de réinitialisation.
                        </p>
                        <div className="mb-4">
                            <label className="block text-gray-700 font-medium mb-1">Email</label>
                            <input
                                type="email"
                                value={email}
                                onChange={(e) => setEmail(e.target.value)}
                                required
                                className="w-full p-3 border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                                placeholder="Entrez votre email"
                            />
                        </div>
                        <button
                            type="submit"
                            disabled={loading}
                            className={`w-full bg-blue-600 text-white p-3 rounded-md font-semibold ${loading ? "opacity-50 cursor-not-allowed" : "hover:bg-blue-700"}`}
                        >
                            {loading ? "Envoi en cours..." : "Envoyer le code"}
                        </button>
                    </form>
                )}

                {step === 2 && (
                    <form onSubmit={handleVerifyToken}>
                        <h2 className="text-2xl font-bold text-center mb-4">Vérification du Code</h2>
                        <p className="text-gray-600 text-center mb-6">
                            Entrez le code que vous avez reçu par email.
                        </p>
                        <div className="mb-4">
                            <label className="block text-gray-700 font-medium mb-1">Code de réinitialisation</label>
                            <input
                                type="text"
                                value={resetToken}
                                onChange={(e) => setResetToken(e.target.value)}
                                required
                                className="w-full p-3 border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                                placeholder="Entrez le code"
                            />
                        </div>
                        <button
                            type="submit"
                            disabled={loading}
                            className={`w-full bg-blue-600 text-white p-3 rounded-md font-semibold ${loading ? "opacity-50 cursor-not-allowed" : "hover:bg-blue-700"}`}
                        >
                            {loading ? "Vérification..." : "Vérifier le code"}
                        </button>
                    </form>
                )}

                {step === 3 && (
                    <form onSubmit={handleResetPassword}>
                        <h2 className="text-2xl font-bold text-center mb-4">Nouveau mot de passe</h2>
                        <p className="text-gray-600 text-center mb-6">
                            Choisissez un nouveau mot de passe sécurisé.
                        </p>
                        <div className="mb-4">
                            <label className="block text-gray-700 font-medium mb-1">Nouveau mot de passe</label>
                            <input
                                type="password"
                                value={newPassword}
                                onChange={(e) => setNewPassword(e.target.value)}
                                required
                                className="w-full p-3 border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                                placeholder="••••••••"
                            />
                        </div>
                        <div className="mb-4">
                            <label className="block text-gray-700 font-medium mb-1">Confirmer le mot de passe</label>
                            <input
                                type="password"
                                value={confirmPassword}
                                onChange={(e) => setConfirmPassword(e.target.value)}
                                required
                                className="w-full p-3 border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                                placeholder="••••••••"
                            />
                        </div>
                        <button
                            type="submit"
                            disabled={loading}
                            className={`w-full bg-blue-600 text-white p-3 rounded-md font-semibold ${loading ? "opacity-50 cursor-not-allowed" : "hover:bg-blue-700"}`}
                        >
                            {loading ? "Mise à jour..." : "Réinitialiser"}
                        </button>
                    </form>
                )}
            </div>
        </div>
    );
};

export default ForgetPassword;
