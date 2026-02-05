const supabase = require('../config/supabase');

async function authenticateSupabase(req, res, next) {
    try {
        const authHeader = req.headers.authorization || '';
        const token = authHeader.startsWith('Bearer ') ? authHeader.slice(7) : null;
        if (!token) return res.status(401).json({ success: false, error: { message: 'Unauthorized' } });

        const { data, error } = await supabase.auth.getUser(token);
        if (error || !data?.user) return res.status(401).json({ success: false, error: { message: 'Invalid token' } });

        req.user = data.user;
        next();
    } catch (err) {
        next(err);
    }
}

function authorize(allowedRoles = []) {
    return (req, res, next) => {
        if (!allowedRoles || allowedRoles.length === 0) return next();
        const user = req.user;
        const role = (user && (user.user_metadata && user.user_metadata.role)) || (user && user.role) || null;
        if (!role || !allowedRoles.includes(role)) return res.status(403).json({ success: false, error: { message: 'Forbidden' } });
        next();
    };
}

module.exports = { authenticateSupabase, authorize };
