const mongoSanitize = require('express-mongo-sanitize')

const sanitize = (req, res, next) => {
	if (req.body) {
		req.body = mongoSanitize.sanitize(req.body, { replaceWith: '_' })
	}
	if (req.params) {
		req.params = mongoSanitize.sanitize(req.params, { replaceWith: '_' })
	}
	next()
}

module.exports = { sanitize }
