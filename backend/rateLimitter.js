const rateLimit = require('express-rate-limit');

const limitter = rateLimit({
    windowMs: 5*60*1000,
    limit: 5,
    message: "Sorry! You have completed your max request per session.",
    statusCode: 429,

})

module.exports = limitter;