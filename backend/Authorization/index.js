const { adminSecretKey, userSecretKey} = require('../config');
const jwt = require('jsonwebtoken');

const adminMiddleware = (req, res, next) => {
    const token = req.cookies.token;

        try {
            const verify = jwt.verify(token, adminSecretKey);
        if(verify) {
            req.id = verify.id;
            next();
        } else {
            res.status(400).json({message: "Admin not authorized."});
        }
    
        } catch(error) {
            console.error('Error in verifying the token: ' +error);
            res.status(500).json({message: "Error in verifying the token."})
        }
    
    
}

const userMiddleware = (req, res, next) => {
    const token = req.cookies.token;
    try {
        const verify = jwt.verify(token, userSecretKey);
    if(verify) {
        req.id = verify.id;
        next();
    } else {
        res.status(400).json({message: "User not authorized."});
    }

    } catch(error) {
        console.error('Error in verifying the token: ' +error);
        res.status(500).json({message: "Error in verifying the token."})
    }
    
    
}

module.exports = {adminMiddleware, userMiddleware};