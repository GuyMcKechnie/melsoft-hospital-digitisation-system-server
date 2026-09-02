const bcrypt = require('bcrypt');
const crypto = require('crypto');
const supabase = require('../config/supabase');
const ResponseHelper = require('../utils/response');
const ApiError = require('../utils/apiError');
const TokenStore = require('../services/tokenStore');

async function listUsers(req, res, next) {
    try {
        const page = Math.max(1, Number(req.query.page) || 1);
        const limit = Math.min(100, Number(req.query.limit) || 25);
        const search = req.query.search || null;
        const role = req.query.role || null;
        const status = req.query.status || null;
        const sort = req.query.sort || 'createdAt';
        const order = req.query.order === 'desc' ? 'desc' : 'asc';

        const from = (page - 1) * limit;
        const to = from + limit - 1;

        let query = supabase.from('users').select('id,name,email,role,status,createdAt,updatedAt', { count: 'exact' });
        // filters
        if (search) {
            query = query.or(`name.ilike.%${search}%,email.ilike.%${search}%`);
        }
        if (role) query = query.eq('role', role);
        if (status) query = query.eq('status', status);
        // exclude soft-deleted (status=deleted)
        query = query.neq('status', 'deleted');

        // sort
        query = query.order(sort, { ascending: order === 'asc' });

        const { data, count, error } = await query.range(from, to);
        if (error) return next(new ApiError('DB error', 500, 'db_error', error));

        const meta = { total: count || (data ? data.length : 0), page, limit };
        return ResponseHelper.success(res, { items: data || [], meta });
    } catch (err) {
        next(err);
    }
}

async function createUser(req, res, next) {
    try {
        const { name, email, password, role = 'user' } = req.body;
        // check exists (use maybeSingle to avoid throwing when not found)
        const { data: existing, error: existsError } = await supabase.from('users').select('id').eq('email', email).limit(1).maybeSingle();
        if (existsError) return next(new ApiError('DB error', 500, 'db_error', existsError));
        if (existing) return ResponseHelper.error(res, { code: 'conflict', message: 'Email already in use' }, 409);

        // Ensure passwordHash is never null (DB enforces NOT NULL)
        const plainPassword = password || crypto.randomBytes(8).toString('hex');
        const passwordHash = await bcrypt.hash(plainPassword, 10);
        const row = { name, email, passwordHash, role, status: 'active' };
        const { data, error } = await supabase.from('users').insert([row]).select().single();
        if (error) return next(new ApiError('Failed to create user', 500, 'db_error', error));

        const user = { id: data.id, name: data.name, email: data.email, role: data.role, status: data.status };
        return res.status(201).json({ success: true, data: { user } });
    } catch (err) {
        next(err);
    }
}

async function getUser(req, res, next) {
    try {
        const id = req.params.id;
        const { data: user, error } = await supabase.from('users').select('id,name,email,role,status,createdAt,updatedAt,lastLogin').eq('id', id).limit(1).single();
        if (error || !user) return ResponseHelper.error(res, { code: 'not_found', message: 'User not found' }, 404);
        if (user.status === 'deleted') return ResponseHelper.error(res, { code: 'not_found', message: 'User not found' }, 404);
        return ResponseHelper.success(res, { user });
    } catch (err) {
        next(err);
    }
}

async function updateUser(req, res, next) {
    try {
        const id = req.params.id;
        const updates = { ...req.body };
        // Prevent owner from changing role/status unless admin
        const requester = req.user || {};
        if (requester.id && String(requester.id) === String(id) && requester.role !== 'admin') {
            delete updates.role;
            delete updates.status;
        }

        if (updates.password) {
            updates.passwordHash = await bcrypt.hash(updates.password, 10);
            delete updates.password;
        }

        updates.updatedAt = new Date().toISOString();

        const { data, error } = await supabase.from('users').update(updates).eq('id', id).select().single();
        if (error) return next(new ApiError('Failed to update user', 500, 'db_error', error));
        const user = { id: data.id, name: data.name, email: data.email, role: data.role, status: data.status };
        return ResponseHelper.success(res, { user });
    } catch (err) {
        next(err);
    }
}

async function deleteUser(req, res, next) {
    try {
        const id = req.params.id;
        const updates = { status: 'deleted', deletedAt: new Date().toISOString() };
        const { error } = await supabase.from('users').update(updates).eq('id', id);
        if (error) return next(new ApiError('Failed to delete user', 500, 'db_error', error));
        // Audit could be added here
        return res.status(204).send();
    } catch (err) {
        next(err);
    }
}

async function changePassword(req, res, next) {
    try {
        const id = req.params.id;
        const { currentPassword, newPassword } = req.body;
        const requester = req.user || {};

        const { data: user } = await supabase.from('users').select('id,passwordHash').eq('id', id).limit(1).single();
        if (!user) return ResponseHelper.error(res, { code: 'not_found', message: 'User not found' }, 404);

        // if requester is owner (not admin) require currentPassword
        if (String(requester.id) === String(id) && requester.role !== 'admin') {
            const ok = await bcrypt.compare(currentPassword || '', user.passwordHash || '');
            if (!ok) return ResponseHelper.error(res, { code: 'invalid_credentials', message: 'Current password incorrect' }, 401);
        }

        const passwordHash = await bcrypt.hash(newPassword, 10);
        await supabase.from('users').update({ passwordHash, updatedAt: new Date().toISOString() }).eq('id', id);
        // revoke refresh tokens for this user
        await TokenStore.revokeByUserId(id);

        return ResponseHelper.success(res, null, 200);
    } catch (err) {
        next(err);
    }
}

module.exports = { listUsers, createUser, getUser, updateUser, deleteUser, changePassword };
