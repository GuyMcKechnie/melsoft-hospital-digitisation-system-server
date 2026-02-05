class ResponseHelper {
    static success(res, data = null, status = 200) {
        const envelope = { success: true };
        if (data !== null) envelope.data = data;
        return res.status(status).json(envelope);
    }

    static error(res, { code, message, details } = {}, status = 400) {
        const envelope = { success: false, error: {} };
        if (code) envelope.error.code = code;
        if (message) envelope.error.message = message;
        if (details) envelope.error.details = details;
        return res.status(status).json(envelope);
    }
}

module.exports = ResponseHelper;
