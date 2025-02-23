const jwt = require("jsonwebtoken");
const crypto = require('crypto');
const User = require('../models/User');
const bcrypt = require('bcrypt');
const { validateUser } = require('../validators/validators');
const sendEmail = require('../utils/sendEmail');


exports.login = async (req, res) => {
    const { email, password } = req.body;

    try {
        const user = await User.findOne({ email });
        if (!user) {
            return res.status(401).json({ error: "Email ou mot de passe incorrect" });
        }

        const isMatch = await bcrypt.compare(password, user.password);
        if (!isMatch) {
            return res.status(401).json({ error: "Email ou mot de passe incorrect" });
        }

        const token = jwt.sign(
            { id: user._id, email: user.email },
            process.env.JWT_SECRET,
            {expiresIn: process.env.JWT_EXPIRE_TIME}
        );

        res.json({ message: "Connexion réussie", token });
    } catch (error) {
        res.status(500).json({ error: "Erreur serveur", details: error });
    }
};

exports.register = async (req, res) => {
    try {
        const { error, value } = validateUser(req.body);
        if (error) {
            return res.status(400).json({ errors: error.details.map(err => err.message) });
        }

        const { name, email, password, authentication_method, role, phone_number, bio } = value;

        const existingUser = await User.findOne({ email });
        if (existingUser) {
            return res.status(400).json({ error: 'Email déjà utilisé.' });
        }

        const hashedPassword = await bcrypt.hash(password, 10);

        const newUser = new User({
            name,
            email,
            password: hashedPassword,
            authentication_method: authentication_method || 'local',
            role: role || 'user',
            phone_number: phone_number || '',
            bio: bio ? bio.trim() : '',
        });

        await newUser.save();

        const token = jwt.sign(
            { id: newUser._id },
            process.env.JWT_SECRET,
            {expiresIn: process.env.JWT_EXPIRE_TIME}
        );

        res.status(201).json({ message: 'Utilisateur créé avec succès', user: newUser, token });
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
};

exports.protection = async (req, res, next) => {
    const token = req.header('Authorization');
    if (!token) {
        return res.status(401).json({ error: 'Non authentifié. Veuillez vous connecter.' });
    }

    try {
        const decoded = jwt.verify(token, process.env.JWT_SECRET);
        const user = await User.findById(decoded.id);

        if (!user) {
            return res.status(401).json({ error: 'Utilisateur non trouvé. Veuillez vous connecter.' });
        }

        if (user.passwordChangedAt) {
            const passwordChangedTimestamp = parseInt(user.passwordChangedAt.getTime() / 1000, 10);
            if (decoded.iat < passwordChangedTimestamp) {
                return res.status(401).json({ error: 'Mot de passe récemment changé. Veuillez vous reconnecter.' });
            }
        }
        
        req.user = user;
        next();     
    } catch (error) {
        res.status(401).json({ error: 'Non authentifié. Veuillez vous connecter.' });
    }
}

exports.allowTo = (...roles) => {
    return (req, res, next) => {
        if (!req.user) {
            return res.status(401).json({ error: 'Non authentifié. Veuillez vous connecter.' });
        }
        if (!roles.includes(req.user.role)) {
            return res.status(403).json({ error: 'Non autorisé.' });
        }
        next();
    }
}

exports.forgotPassword = async (req, res) => {
    const { email } = req.body;

    try {
        const user = await User.findOne({ email });
        if (!user) {
            return res.status(404).json({ error: 'Utilisateur non trouvé.' });
        }

        const resetToken = Math.floor(100000 + Math.random() * 900000).toString();
        const hashedToken = crypto.createHash('sha256').update(resetToken).digest('hex');      
        user.passwordResetToken = hashedToken;
        user.passwordResetExpires = Date.now() + 10 * 60 * 1000; // 10 minutes

        await user.save();  

        await sendEmail({
            email: user.email,
            name: user.name,
            subject: '[Planify] Réinitialisation du mot de passe',
            resetToken
        });

        res.status(200).json({ status:'succes', message: 'Code de réinitialisation envoyé à votre adresse email.' });

    } catch (error) {     
        res.status(500).json({ error: error.message });
    }           
}

exports.verifyResetToken = async (req, res) => {
    const hashedToken = crypto
    .createHash('sha256')
    .update(req.body.resetToken)
    .digest('hex');      
    
    const user = await User.findOne({
         passwordResetToken: hashedToken,
          passwordResetExpires: { $gt: Date.now() }
         });
    
    if (!user) {
        return res.status(400).json({ error: 'Token invalide ou expiré.' });
    }

    user.passwordResetVerified = true;
    await user.save();

    res.status(200).json({ status: 'success', message: 'Token vérifié avec succès.' });

};
