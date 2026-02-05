async function list(req, res) {
    res.status(501).json({ success: false, error: { message: 'Not implemented' } });
}

async function create(req, res) {
    res.status(501).json({ success: false, error: { message: 'Not implemented' } });
}

async function getById(req, res) {
    res.status(501).json({ success: false, error: { message: 'Not implemented' } });
}

async function update(req, res) {
    res.status(501).json({ success: false, error: { message: 'Not implemented' } });
}

async function cancel(req, res) {
    res.status(501).json({ success: false, error: { message: 'Not implemented' } });
}

module.exports = { list, create, getById, update, cancel };
