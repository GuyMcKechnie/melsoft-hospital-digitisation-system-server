const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');
const supabase = require('../config/supabase');
const TokenStore = require('../services/tokenStore');
const ResponseHelper = require('../utils/response');
const ApiError = require('../utils/apiError');

const JWT_SECRET = process.env.JWT_SECRET || 'dev_secret_change_me';
const ACCESS_EXPIRES = process.env.ACCESS_EXPIRES || '15m';
const REFRESH_TTL_MS = (process.env.REFRESH_TTL_DAYS ? Number(process.env.REFRESH_TTL_DAYS) : 7) * 24 * 60 * 60 * 1000;

async function signup(req, res, next) {
    try {
        const { name, email, password, role = 'user' } = req.body;

        // check existing
        const { data: existing, error: selErr } = await supabase.from('users').select('*').eq('email', email).limit(1).single();
        if (selErr && selErr.code !== 'PGRST116') {
            // PGRST116 when no rows? supabase returns differently; handle gracefully
        }
        if (existing) return ResponseHelper.error(res, { code: 'conflict', message: 'Email already in use' }, 409);

        const passwordHash = await bcrypt.hash(password, 10);
        const userPayload = { name, email, passwordHash, role, status: 'active' };
        const { data, error } = await supabase.from('users').insert([userPayload]).select().single();
        if (error) return next(new ApiError('Failed to create user', 500, 'db_error', error));

        const user = { id: data.id, name: data.name, email: data.email, role: data.role };
        const accessToken = jwt.sign(user, JWT_SECRET, { expiresIn: ACCESS_EXPIRES });
        const refreshToken = TokenStore.generateToken();
        TokenStore.save(refreshToken, { userId: data.id, type: 'refresh', expiresAt: Date.now() + REFRESH_TTL_MS });

        return res.status(201).json({ success: true, data: { user, tokens: { accessToken, refreshToken } } });
    } catch (err) {
        next(err);
    }
}

async function login(req, res, next) {
    try {
        const { email, password } = req.body;
        const { data: user, error } = await supabase.from('users').select('*').eq('email', email).limit(1).single();
        if (error || !user) return ResponseHelper.error(res, { code: 'invalid_credentials', message: 'Invalid email or password' }, 401);

        const ok = await bcrypt.compare(password, user.passwordHash || '');
        if (!ok) return ResponseHelper.error(res, { code: 'invalid_credentials', message: 'Invalid email or password' }, 401);

        // update lastLogin
        await supabase.from('users').update({ lastLogin: new Date().toISOString() }).eq('id', user.id);

        const safeUser = { id: user.id, name: user.name, email: user.email, role: user.role };
        const accessToken = jwt.sign(safeUser, JWT_SECRET, { expiresIn: ACCESS_EXPIRES });
        const refreshToken = TokenStore.generateToken();
        TokenStore.save(refreshToken, { userId: user.id, type: 'refresh', expiresAt: Date.now() + REFRESH_TTL_MS });

        return ResponseHelper.success(res, { user: safeUser, tokens: { accessToken, refreshToken } });
    } catch (err) {
        next(err);
    }
}

async function logout(req, res, next) {
    try {
        const token = req.body.refreshToken || req.cookies && req.cookies.refreshToken;
        if (token) TokenStore.revoke(token);
        return ResponseHelper.success(res, null, 200);
    } catch (err) {
        next(err);
    }
}

async function refresh(req, res, next) {
    try {
        const token = req.body.refreshToken || req.cookies && req.cookies.refreshToken;
        if (!token) return ResponseHelper.error(res, { code: 'invalid_request', message: 'Refresh token required' }, 400);
        const rec = TokenStore.get(token);
        if (!rec || rec.type !== 'refresh') return ResponseHelper.error(res, { code: 'invalid_token', message: 'Invalid or expired refresh token' }, 401);

        // rotate
        TokenStore.revoke(token);
        const newRefresh = TokenStore.generateToken();
        TokenStore.save(newRefresh, { userId: rec.userId, type: 'refresh', expiresAt: Date.now() + REFRESH_TTL_MS });

        // load user
        const { data: user } = await supabase.from('users').select('*').eq('id', rec.userId).limit(1).single();
        const safeUser = { id: user.id, name: user.name, email: user.email, role: user.role };
        const accessToken = jwt.sign(safeUser, JWT_SECRET, { expiresIn: ACCESS_EXPIRES });

        return ResponseHelper.success(res, { accessToken, refreshToken: newRefresh });
    } catch (err) {
        next(err);
    }
}

async function forgotPassword(req, res, next) {
    try {
        const { email } = req.body;
        // Always return 200 to avoid account enumeration
        const { data: user } = await supabase.from('users').select('*').eq('email', email).limit(1).single();
        if (user) {
            const token = TokenStore.generateToken();
            TokenStore.save(token, { userId: user.id, type: 'reset', expiresAt: Date.now() + 60 * 60 * 1000 }); // 1 hour

            // Placeholder for sending email
            console.info(`Password reset token for ${email}: ${token}`);
        }
        return ResponseHelper.success(res, null, 200);
    } catch (err) {
        next(err);
    }
}

async function resetPassword(req, res, next) {
    try {
        const { token, newPassword } = req.body;
        const rec = TokenStore.get(token);
        if (!rec || rec.type !== 'reset') return ResponseHelper.error(res, { code: 'invalid_token', message: 'Invalid or expired reset token' }, 400);

        const passwordHash = await bcrypt.hash(newPassword, 10);
        await supabase.from('users').update({ passwordHash }).eq('id', rec.userId);

        // revoke user's refresh tokens
        TokenStore.revokeByUserId(rec.userId);
        TokenStore.revoke(token);

        return ResponseHelper.success(res, null, 200);
    } catch (err) {
        next(err);
    }
}

async function me(req, res, next) {
    try {
        const userId = req.user && req.user.id;
        if (!userId) return ResponseHelper.error(res, { code: 'unauthenticated', message: 'Not authenticated' }, 401);
        const { data: user, error } = await supabase.from('users').select('id,name,email,role,status,createdAt,updatedAt,lastLogin').eq('id', userId).limit(1).single();
        if (error || !user) return ResponseHelper.error(res, { code: 'not_found', message: 'User not found' }, 404);
        return ResponseHelper.success(res, { user });
    } catch (err) {
        next(err);
    }
}

module.exports = { signup, login, logout, refresh, forgotPassword, resetPassword, me };
