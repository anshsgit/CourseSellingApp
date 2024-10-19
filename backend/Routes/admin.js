const express = require('express');
const router  = express.Router();
const { adminSecretKey } = require('../config');
const jwt = require('jsonwebtoken');

const bcrypt = require('bcrypt');
const {z} = require('zod');

const {Admin, Course} = require('../Db/index')
const {adminMiddleware} = require('../Authorization/index');

router.post('/signup', async (req, res) => {
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
    try{
        console.log(Admin);
        const admin = await Admin.findOne({username});
        if(admin) {
            res.status(400).json({message: "Account already exists."});
        } else {
                const hashPassword = await bcrypt.hash(password, 5);
                await Admin.create({
                    name,
                    username,
                    password: hashPassword
                })
                res.status(200).json({message: "Admin created successfully."})

        }
    } catch(error) {
        console.error("Error in creating the admin: " +error)
        res.status(500).json({message: "Error in creating the admin."})
    }
    
    }

    
});

router.post('/login', async (req, res) => {
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

    const {username,password} = req.body;
    try {
        const admin = await Admin.findOne({username});
        if(admin) {
            const result = await bcrypt.compare(password, admin.password);

            if(result) {
                const token = jwt.sign({id: admin._id}, adminSecretKey);
                res.status(200).json({token});
            } else {
                res.status(400).json({message: "Incorrect password."});
            }
            
    } else {
        res.status(400).json({message: "Admin does not exist."})
    }
    } catch(error) {
        console.error('Error in login: ' +error);
        res.status(500).json({message: "Error in login."})
    }
}
    
});

router.get('/course', adminMiddleware, async (req, res) => {
    try {
        const courses = await Course.find({});
        res.status(200).json({courses});
    } catch(error) {
        res.status(500).json({message: "Error in fetching the courses"});
        console.error("Error in fetching the courses: " + error);
    }
})

router.post('/course', adminMiddleware, async (req, res) => {
    const requiredBody = z.object({
        title: z.string().min(3).max(50),
        description: z.string().min(3).max(200),
        price: z.string(),
        imageLink: z.string()
    });
    const parse = requiredBody.safeParse(req.body);
    if(!parse.success) {
        console.log("Body not uptodate.")
        res.status(400).json({
            message: "Body not uptodate",
            error: parse.error
        })
    } else {
    const {title, description, price, imageLink} = req.body;
    try {
        await Course.create({
            adminId: req.id,
            title,
            description,
            price,
            imageLink
        });
        res.status(200).json({message: "Course created successfully."});
    } catch(error) {
        console.error('Error in creating the course: ' +error);
        res.status(500).json({message: "Error in creating the course."});
    }
}
});

router.put('/course/:id', adminMiddleware, async (req, res) => {
    const requiredBody = z.object({
        title: z.string().min(3).max(50),
        description: z.string().min(3).max(200),
        price: z.string(),
        imageLink: z.string()
    });
    const parse = requiredBody.safeParse(req.body);
    if(!parse.success) {
        console.log("Body not uptodate.")
        res.status(400).json({
            message: "Body not uptodate",
            error: parse.error
        })
    } else {
    const id = req.params.id;
    const {title, description, price, imageLink} = req.body;
    try {
        const course = await Course.updateOne({_id: id}, {
            adminId: req.id, 
            title,
            description,
            price,
            imageLink
        });
        res.status(200).json({message: "Course updated successfully."})
        
    } catch(error) {
        console.error('Error in updating the course: ' +error);
        res.status(500).json({message: "Error in updating the course."});
    }
}
})

router.delete('/course/:id', adminMiddleware, async (req, res) => {
    const id = req.params.id;
    try {
        const course = await Course.deleteOne({_id: id})
    if(course.acknowledged) {
        res.status(200).json({message: "Course deleted successfully."});
    } else {
        res.status(400).json({message: "Id did not match."})
    }
    } catch(error) {
        console.error("Error in deleting the course: " +error);
        res.status(500).json({message: "Error in deleting the course."});
    }
    
});

module.exports = router;