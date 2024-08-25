// config/email.js
const nodemailer = require('nodemailer');

// Replace with your custom mail server details
const transporter = nodemailer.createTransport({
    host: '192.168.11.17', // Custom mail server IP
    port: 2500, // Custom SMTP port
    secure: false, // True for 465, false for other ports
    auth: {
        user: process.env.OUTLOOK_USER, // Custom email username
        pass: process.env.OUTLOOK_PASS, // Custom email password
    },
    tls: {
        rejectUnauthorized: false
    }
});

module.exports = transporter;
