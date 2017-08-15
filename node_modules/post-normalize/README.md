# post-normalize

Express middleware for populating `req.files` and `req.body` fields from `multipart/form-data` request.

# Usage

```javascript
const postNormalize = require('post-normalize'),
    express = require('express'),
    bodyParser = require('body-parser'),
    app = express();

app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));
app.use(postNormalize());
```
