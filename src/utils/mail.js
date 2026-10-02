import Mailgen from "mailgen";
import nodemailer from "nodemailer";
import dotenv from "dotenv";
dotenv.config({
    path: "./.env",
});

const sendMail = async (options) => {
    let mailGenerator = new Mailgen({
        theme: "default",
        product: {
            name: "Task Manager",
            link: "https://mailgen.js/"
        }
    });

    // creating a HTML email
    let emailHTML = mailGenerator.generate(options.mailGenContent);
    // creating a Plain Text email
    let emailText = mailGenerator.generatePlaintext(options.mailGenContent);

    const transporter = nodemailer.createTransport({
        host: process.env.MAILTRAP_SMTP_HOST,
        port: process.env.MAILTRAP_SMTP_PORT,
        secure: false,
        auth: {
            user: process.env.MAILTRAP_SMTP_USERNAME,
            pass: process.env.MAILTRAP_SMTP_PASSWORD,
        },
    });

    let mail = {
        from: "yuvrajkumar9572@gmail.com",
        to: options.email,
        subject: options.subject,
        text: emailText,
        html: emailHTML
    };

    try {
        await transporter.sendMail(mail);
    } catch (error) {
        console.error("Email Failed", error);
    }
};

const emailVerificationMailGenContent = (username, verificationUrl) => {
    return {
        body: {
            name: username,
            intro: 'Welcome to Task Manager! We\'re very excited to have you on board.',
            action: {
                instructions: 'To verify your account, please click the button below:',
                button: {
                    color: '#22BC66', // Optional action button color
                    text: 'Confirm your account',
                    link: verificationUrl,
                }
            },
            outro: 'If you did not create this account, you can safely ignore this email.'
        }
    }
}

export { sendMail, emailVerificationMailGenContent }