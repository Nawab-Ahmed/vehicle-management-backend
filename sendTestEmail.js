// sendTestEmail.js
require('dotenv').config();
const transporter = require('./config/email'); // Adjust the path if necessary

const sendTestEmail = () => {
    const mailOptions = {
        from: process.env.OUTLOOK_USER, // Sender address (SMTP user)
        to: process.env.ADMIN_EMAIL,    // Recipient address (Admin's email)
        subject: 'Test Email',
        text: 'This is a test email to verify the email sending functionality.',
    };

    transporter.sendMail(mailOptions, (error, info) => {
        if (error) {
            console.error('Error sending email:', error);
        } else {
            console.log('Email sent:', info.response);
        }
    });
};

sendTestEmail();
