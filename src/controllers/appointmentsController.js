const supabase = require('../config/supabase');
const ResponseHelper = require('../utils/response');
const ApiError = require('../utils/apiError');

async function listAppointments(req, res, next) {
    try {
        const userId = req.user && req.user.id;
        if (!userId) return ResponseHelper.error(res, { code: 'unauthenticated', message: 'Not authenticated' }, 401);

        const { data, error } = await supabase
            .from('appointments')
            .select('*')
            .eq('patient_id', userId)
            .order('date', { ascending: true });

        if (error) return next(new ApiError('DB error', 500, 'db_error', error));
        return ResponseHelper.success(res, { items: data || [] });
    } catch (err) {
        next(err);
    }
}

async function createAppointment(req, res, next) {
    try {
        const userId = req.user && req.user.id;
        if (!userId) return ResponseHelper.error(res, { code: 'unauthenticated', message: 'Not authenticated' }, 401);

        const payload = { ...req.body };
        const row = {
            patient_id: userId,
            service: payload.service,
            date: payload.date,
            time: payload.time,
            doctor: payload.doctor || null,
            status: payload.status || 'Pending',
            createdAt: new Date().toISOString(),
            updatedAt: new Date().toISOString(),
        };

        const { data, error } = await supabase.from('appointments').insert([row]).select().single();
        if (error) return next(new ApiError('Failed to create appointment', 500, 'db_error', error));

        return res.status(201).json({ success: true, data: { appointment: data } });
    } catch (err) {
        next(err);
    }
}

async function getAppointment(req, res, next) {
    try {
        const id = req.params.id;
        const userId = req.user && req.user.id;

        const { data, error } = await supabase.from('appointments').select('*').eq('id', id).limit(1).maybeSingle();
        if (error) return next(new ApiError('DB error', 500, 'db_error', error));
        const appointment = data;
        if (!appointment) return ResponseHelper.error(res, { code: 'not_found', message: 'Appointment not found' }, 404);
        if (String(appointment.patient_id) !== String(userId)) return ResponseHelper.error(res, { code: 'forbidden', message: 'Insufficient permissions' }, 403);

        return ResponseHelper.success(res, { appointment });
    } catch (err) {
        next(err);
    }
}

async function updateAppointment(req, res, next) {
    try {
        const id = req.params.id;
        const userId = req.user && req.user.id;

        const { data: existing, error: fetchErr } = await supabase.from('appointments').select('*').eq('id', id).limit(1).maybeSingle();
        if (fetchErr) return next(new ApiError('DB error', 500, 'db_error', fetchErr));
        if (!existing) return ResponseHelper.error(res, { code: 'not_found', message: 'Appointment not found' }, 404);
        if (String(existing.patient_id) !== String(userId)) return ResponseHelper.error(res, { code: 'forbidden', message: 'Insufficient permissions' }, 403);

        const updates = { ...req.body, updatedAt: new Date().toISOString() };
        const { data, error } = await supabase.from('appointments').update(updates).eq('id', id).select().single();
        if (error) return next(new ApiError('Failed to update appointment', 500, 'db_error', error));

        return ResponseHelper.success(res, { appointment: data });
    } catch (err) {
        next(err);
    }
}

async function deleteAppointment(req, res, next) {
    try {
        const id = req.params.id;
        const userId = req.user && req.user.id;

        const { data: existing, error: fetchErr } = await supabase.from('appointments').select('*').eq('id', id).limit(1).maybeSingle();
        if (fetchErr) return next(new ApiError('DB error', 500, 'db_error', fetchErr));
        if (!existing) return ResponseHelper.error(res, { code: 'not_found', message: 'Appointment not found' }, 404);
        if (String(existing.patient_id) !== String(userId)) return ResponseHelper.error(res, { code: 'forbidden', message: 'Insufficient permissions' }, 403);

        const { error } = await supabase.from('appointments').delete().eq('id', id);
        if (error) return next(new ApiError('Failed to delete appointment', 500, 'db_error', error));

        return res.status(204).send();
    } catch (err) {
        next(err);
    }
}

module.exports = { listAppointments, createAppointment, getAppointment, updateAppointment, deleteAppointment };
