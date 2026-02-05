const supabase = require('../config/supabase');
const { hashPassword, verifyPassword } = require('../utils/hash');

async function signup(req, res, next) {
    try {
        const { email, password, name, role } = req.body;
        if (!email || !password) return res.status(400).json({ success: false, error: { message: 'email and password required' } });

        // Use Supabase signUp to create user and send confirmation email
        const { data, error } = await supabase.auth.signUp({ email, password }, { data: { name, role } });
        if (error) return next(error);

        return res.status(201).json({ success: true, data: { user: data.user, session: data.session } });
    } catch (err) {
        next(err);
    }
}

async function login(req, res, next) {
    try {
        const { email, password } = req.body;
        if (!email || !password) return res.status(400).json({ success: false, error: { message: 'email and password required' } });

        const { data, error } = await supabase.auth.signInWithPassword({ email, password });
        if (error) return res.status(401).json({ success: false, error: { message: error.message } });

        // data contains session and user
        return res.status(200).json({ success: true, data: { user: data.user, session: data.session } });
    } catch (err) {
        next(err);
    }
}

async function logout(req, res, next) {
    try {
        // Supabase client signOut will clear the session for the provided access token when called from the client.
        // On server side, you can revoke refresh tokens via Admin API if needed. Here we accept a token in body.
        const { error } = await supabase.auth.signOut();
        if (error) return next(error);
        return res.json({ success: true });
    } catch (err) {
        next(err);
    }
}

async function me(req, res, next) {
    try {
        // req.user is populated by middleware when using authenticateSupabase
        if (!req.user) return res.status(401).json({ success: false, error: { message: 'Unauthorized' } });
        return res.json({ success: true, data: { user: req.user } });
    } catch (err) {
        next(err);
    }
}

async function forgotPassword(req, res, next) {
    try {
        const { email } = req.body;
        if (!email) return res.status(400).json({ success: false, error: { message: 'email required' } });
        const { data, error } = await supabase.auth.resetPasswordForEmail(email, { redirectTo: process.env.FRONTEND_RESET_URL });
        if (error) return next(error);
        return res.json({ success: true, data: { message: 'If the account exists, a reset email was sent' } });
    } catch (err) {
        next(err);
    }
}

async function resetPassword(req, res, next) {
    // Full server-side token verification/rotation is environment-specific.
    // For now, return not implemented and rely on Supabase client-side flow.
    res.status(501).json({ success: false, error: { message: 'Not implemented' } });
}

module.exports = { signup, login, logout, me, forgotPassword, resetPassword };

module.exports = { signup, login, logout, me };
