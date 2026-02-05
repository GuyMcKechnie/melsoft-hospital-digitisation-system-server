const ApiError = require('../utils/apiError');

function validateBody(schema) {
    return async (req, res, next) => {
        try {
            const value = await schema.validateAsync(req.body, { abortEarly: false, stripUnknown: true });
            req.body = value;
            next();
        } catch (err) {
            // Joi error bubbles to errorHandler via next(err)
            next(err);
        }
    };
}

function validateQuery(schema) {
    return async (req, res, next) => {
        try {
            const value = await schema.validateAsync(req.query, { abortEarly: false, stripUnknown: true });
            req.query = value;
            next();
        } catch (err) {
            next(err);
        }
    };
}

module.exports = { validateBody, validateQuery };
