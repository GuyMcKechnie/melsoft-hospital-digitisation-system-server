const nodemailer = require('nodemailer');

const transporter = nodemailer.createTransport({
    host: process.env.EMAIL_HOST || 'localhost',
    port: process.env.EMAIL_PORT ? parseInt(process.env.EMAIL_PORT, 10) : 1025,
    secure: false,
    auth: process.env.EMAIL_USER ? { user: process.env.EMAIL_USER, pass: process.env.EMAIL_PASS } : undefined
});

async function sendMail({ to, subject, text, html }) {
    const msg = { from: process.env.EMAIL_FROM || 'noreply@example.com', to, subject, text, html };
    return transporter.sendMail(msg);
}

module.exports = { sendMail };
