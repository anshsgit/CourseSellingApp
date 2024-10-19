const mongoURL = process.env.mongoURL;
const adminSecretKey = process.env.adminSecretKey;
const userSecretKey = process.env.userSecretKey;
const PORT = process.env.PORT;

module.exports = {
    mongoURL,
    adminSecretKey,
    userSecretKey,
    PORT
}