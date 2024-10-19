const { adminSecretKey, userSecretKey} = require('../config');
const jwt = require('jsonwebtoken');

const adminMiddleware = (req, res, next) => {
    const auth = req.headers.authorization;

    if(auth.startsWith('Bearer')) {
        const token = auth.split(' ');

        try {
            const verify = jwt.verify(token[1], adminSecretKey);
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
    } else {
        res.status(400).json({message: "Authorization token missing or malformed."})
    }
    
    
}

const userMiddleware = (req, res, next) => {
    const auth = req.headers.authorization;

    if(auth.startsWith('Bearer')) {
    const token = auth.split(' ');
    try {
        const verify = jwt.verify(token[1], userSecretKey);
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
    } else {
        res.status(400).json({message: "Authorization token missing or malformed."})
    }
    
}

module.exports = {adminMiddleware, userMiddleware};