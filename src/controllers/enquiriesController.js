const supabase = require('../config/supabase');
const ResponseHelper = require('../utils/response');
const ApiError = require('../utils/apiError');

function buildMessage(from, fromName, message) {
    return {
        id: `m-${Date.now()}-${Math.floor(Math.random() * 1000)}`,
        from,
        fromName: fromName || null,
        message,
        date: new Date().toISOString(),
    };
}

function dbToModel(row) {
    if (!row) return null;
    return {
        id: row.id,
        userId: row.userid,
        fromName: row.fromname,
        subject: row.subject,
        status: row.status,
        messages: row.messages || [],
        createdAt: row.createdat,
        updatedAt: row.updatedat,
    };
}

async function createEnquiry(req, res, next) {
    try {
        const user = req.user || {};
        if (user.role !== 'patient') return ResponseHelper.error(res, { code: 'forbidden', message: 'Only patients can create enquiries' }, 403);

        const { subject, message } = req.body;
        if (!subject || !message) return ResponseHelper.error(res, { code: 'invalid_request', message: 'Subject and message are required' }, 400);

        const now = new Date().toISOString();
        const firstMessage = buildMessage('user', user.name || user.email || null, message);
        // use DB column names (lowercase) to match schema
        const row = {
            userid: user.id,
            fromname: user.name || user.email || null,
            subject,
            status: 'open',
            messages: [firstMessage],
            createdat: now,
            updatedat: now,
        };

        const { data, error } = await supabase.from('enquiries').insert([row]).select().single();
        if (error) return next(new ApiError('Failed to create enquiry', 500, 'db_error', error));

        return res.status(201).json({ success: true, data: { enquiry: dbToModel(data) } });
    } catch (err) {
        next(err);
    }
}

async function listEnquiries(req, res, next) {
    try {
        const page = Math.max(1, Number(req.query.page) || 1);
        const limit = Math.min(100, Number(req.query.limit) || 25);
        const from = (page - 1) * limit;
        const to = from + limit - 1;

        const requester = req.user || {};

        let query = supabase.from('enquiries').select('id,userid,fromname,subject,status,createdat,updatedat,messages', { count: 'exact' });
        if (requester.role !== 'admin') {
            // patients only see their own enquiries
            query = query.eq('userid', requester.id);
        }

        // simple ordering by createdat desc
        query = query.order('createdat', { ascending: false });

        const { data, count, error } = await query.range(from, to);
        if (error) return next(new ApiError('DB error', 500, 'db_error', error));

        const items = (data || []).map(dbToModel);
        const meta = { total: count || (items ? items.length : 0), page, limit };
        return ResponseHelper.success(res, { items, meta });
    } catch (err) {
        next(err);
    }
}

async function getEnquiry(req, res, next) {
    try {
        const id = req.params.id;
        const requester = req.user || {};

        const { data, error } = await supabase.from('enquiries').select('id,userid,fromname,subject,status,createdat,updatedat,messages').eq('id', id).limit(1).single();
        if (error || !data) return ResponseHelper.error(res, { code: 'not_found', message: 'Enquiry not found' }, 404);

        if (requester.role !== 'admin' && String(data.userid) !== String(requester.id)) {
            return ResponseHelper.error(res, { code: 'forbidden', message: 'Insufficient permissions' }, 403);
        }

        return ResponseHelper.success(res, { enquiry: dbToModel(data) });
    } catch (err) {
        next(err);
    }
}

async function addReply(req, res, next) {
    try {
        const id = req.params.id;
        const { message } = req.body;
        const requester = req.user || {};
        if (!message) return ResponseHelper.error(res, { code: 'invalid_request', message: 'Message text is required' }, 400);

        const { data: enquiry, error: fetchErr } = await supabase.from('enquiries').select('id,userid,messages,status').eq('id', id).limit(1).single();
        if (fetchErr || !enquiry) return ResponseHelper.error(res, { code: 'not_found', message: 'Enquiry not found' }, 404);

        // allow admin to reply to any, allow patient to reply only to their own
        if (requester.role !== 'admin' && String(enquiry.userid) !== String(requester.id)) {
            return ResponseHelper.error(res, { code: 'forbidden', message: 'Insufficient permissions' }, 403);
        }

        const from = requester.role === 'admin' ? 'admin' : 'user';
        const msg = buildMessage(from, requester.name || requester.email || null, message);
        const messages = Array.isArray(enquiry.messages) ? [...enquiry.messages, msg] : [msg];

        const updates = { messages, updatedat: new Date().toISOString() };
        const { data, error } = await supabase.from('enquiries').update(updates).eq('id', id).select().single();
        if (error) return next(new ApiError('Failed to add reply', 500, 'db_error', error));

        return ResponseHelper.success(res, { enquiry: dbToModel(data) });
    } catch (err) {
        next(err);
    }
}

async function closeEnquiry(req, res, next) {
    try {
        const id = req.params.id;
        const requester = req.user || {};

        const { data: enquiry, error: fetchErr } = await supabase.from('enquiries').select('id,userid,status').eq('id', id).limit(1).single();
        if (fetchErr || !enquiry) return ResponseHelper.error(res, { code: 'not_found', message: 'Enquiry not found' }, 404);

        if (requester.role !== 'admin' && String(enquiry.userid) !== String(requester.id)) {
            return ResponseHelper.error(res, { code: 'forbidden', message: 'Insufficient permissions' }, 403);
        }

        const { data, error } = await supabase.from('enquiries').update({ status: 'closed', updatedat: new Date().toISOString() }).eq('id', id).select().single();
        if (error) return next(new ApiError('Failed to close enquiry', 500, 'db_error', error));

        return ResponseHelper.success(res, { enquiry: dbToModel(data) });
    } catch (err) {
        next(err);
    }
}

module.exports = { createEnquiry, listEnquiries, getEnquiry, addReply, closeEnquiry };
