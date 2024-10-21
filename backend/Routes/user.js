const express = require("express");
const router = express.Router();
const bcrypt = require('bcrypt');
const { userSecretKey } = require('../config');
const {z} = require('zod');
const jwt = require('jsonwebtoken');

const {User, Course} = require('../Db/index');
const {userMiddleware} = require('../Authorization/index');

// User Routes
router.post('/signup', async (req, res) => {
    // Implement user signup logic
    const requiredBody = z.object({
        name: z.string().min(3).max(50),
        username: z.string().min(3).max(50),
        password: z.string().min(8).max(50)
    })
    const parsedData = requiredBody.safeParse(req.body);

    if(!parsedData.success) {
        console.log("Body not uptodate")
        res.status(400).json({message: "Incorrect format", error: parsedData.error})
    } else {
    const {name, username, password} = req.body;
    const hashedPassword = await bcrypt.hash(password, 5);
    try {
        await User.create({
            name,
            username,
            password: hashedPassword
        });
        res.status(200).json('User created successfully.');
    } catch(error) {
        console.error("Error in creating the user: " +error);
        res.status(500).json('Error in creating the user.');
    }
}

});

router.post('/login', async (req, res) => {
    // Implement admin signup logic
    const requiredBody = z.object({
        username: z.string().min(3).max(50),
        password: z.string().min(3).max(50)
    });
    const parse = requiredBody.safeParse(req.body);
    if(!parse.success) {
        console.log("Body not uptodate.")
        res.status(400).json({
            message: "Body not uptodate",
            error: parse.error
        })
    } else {
    const {username, password} = req.body;
    
    try {
        const user = await User.findOne({username});
        if(user) {
            const result = await bcrypt.compare(password, user.password);

            if(result) {
                const token = jwt.sign({id: user._id}, userSecretKey, { expiresIn: '1h' });
                res.cookie('token', token, {
                    httpOnly: true,
                    maxAge: 60*60*1000,
                    sameSite: 'strict',
                    secure: process.env.NODE_ENV === 'production'
                })
                res.status(200).json({message: "Token sent in the cookie."});

            } else {
                res.status(400).json({message: "Incorrect password."});
            }
            
        } else {
            res.status(404).json({message: "User does not exist."})
        }

    } catch(error) {
        console.error('Error in finding the user: ' +error);
        res.status(500).json({message : "Error in finding the user."})
    }
    }

});

router.get('/courses', userMiddleware, async (req, res) => {
    // Implement listing all courses logic
    try {
        const courses = await Course.find({}, {__v:0});
        res.status(200).json({courses});
    } catch(error) {
        console.error("Error in finding the courses: " +error);
        res.status(500).json({message: "Error in finding the courses."});
    }

});

router.post('/purchase/:courseId', userMiddleware, async (req, res) => {
    // Implement course purchase logic
    const id = req.params.courseId;
    try {
        const course = await Course.findOne({_id: id});
        if(course) {
            await User.updateOne({_id: req.id}, {
                $push: {purchasedCourses: id}
            });
            res.status(200).json({message: "Course purchased successfully."});

        } else{
            res.status(400).json({message: "Sorry, course does not exist."});
        }
    } catch(error) {
        console.error('Error in purchasing the course: ' +error);
        res.status(500).json({message: "Error in purchasing the course."});
    }
    
});

router.get('/purchasedCourses', userMiddleware, async (req, res) => {
    // Implement fetching purchased courses logic
    
    try {
        const user = await User.findOne({_id: req.id});
        const courses = await Course.find({_id: {$in: user.purchasedCourses}});
        res.status(200).json({courses});

    } catch(error) {
        console.error("Error in retreiving the purchased courses: " +error);
        res.status(500).json({message: "Error in retreiving the purchased courses."});
    }
});

module.exports = router