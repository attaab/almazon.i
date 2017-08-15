
var formidable = require('formidable');

module.exports = function postNormalize() {
    return function postNormalizeHandler(req, res, next) {
        if (!/multipart\/form-data/.test(req.get('content-type'))) {
            next();

            return;
        }

        var form = new formidable.IncomingForm();

        form.hash = 'md5';

        form.parse(req, function(err, fields, files) {
            if (err) {
                return next(err);
            }

            req.files = files;
            req.body = fields;
            next();
        });
    }
};

