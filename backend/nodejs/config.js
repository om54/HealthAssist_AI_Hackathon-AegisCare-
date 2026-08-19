require("dotenv").config();

const JWT_USER_SECRET = process.env.JWT_USER_SECRET;
const JWT_ADMIN_SECRET = process.env.JWT_ADMIN_SECRET;
const JWT_DOCTOR_SECRET = process.env.JWT_DOCTOR_SECRET;

module.exports = {
    JWT_ADMIN_SECRET,
    JWT_USER_SECRET,
    JWT_DOCTOR_SECRET
}