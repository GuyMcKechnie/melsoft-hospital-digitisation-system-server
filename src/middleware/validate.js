const { ZodError } = require('zod');

function validate(schema, where = 'body') {
    return (req, res, next) => {
        try {
            const target = where === 'body' ? req.body : req.query;
            const result = schema.parse(target);
            // attach cleaned data
            if (where === 'body') req.body = result;
            else req.query = result;
            next();
        } catch (err) {
            if (err instanceof ZodError) {
                const details = err.errors.map(e => ({ path: e.path.join('.'), message: e.message }));
                return res.status(422).json({ success: false, error: { message: 'Validation failed', details } });
            }
            next(err);
        }
    };
}

module.exports = { validate };
