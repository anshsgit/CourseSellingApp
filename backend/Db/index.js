const mongoose = require('mongoose');
const { mongoURL } = require('../config')

async function mongo() {
    try {
        await mongoose.connect(mongoURL);
    } catch(error) {
        res.status(500).json({message: "Error in creating the database."});
        console.error('Error in creating the database: ' +error);
    }
    
}
mongo();

const schema = mongoose.Schema;
const objectId = mongoose.Schema.Types.ObjectId;

const adminSchema = new schema({
    name: {type: 'String', required: true},
    username: {type: 'String', required: true},
    password: {type: 'String', required: true}
});
const Admin = mongoose.model('Admin', adminSchema);

const courseSchema = new schema({
    adminId : {type: objectId},
    title: {type: 'String', required: true},
    description: {type: 'String', required: true},
    price: {type: 'Number', required: true},
    imageLink: {type: 'String', required: true},
});
const Course = mongoose.model('Course', courseSchema);

const userSchema = new schema({
    name: {type: 'String', required: true},
    username: {type: 'String', required: true},
    password: {type: 'String', required: true},
    purchasedCourses: [{type: objectId, ref: 'Course'}]
});
const User = mongoose.model('User', userSchema);


module.exports = {Admin, Course, User};