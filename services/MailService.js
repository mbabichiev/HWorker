const nodemailer = require('nodemailer');


class MailService {


    async #sendMail(to, theme, text, html) {
        let testAccount = await nodemailer.createTestAccount();

        let transporter = nodemailer.createTransport({
            host: process.env.SMTP_HOST,
            port: process.env.SMTP_PORT,
            secure: false,
            auth: {
                user: testAccount.user,
                pass: testAccount.pass,
            },
            tls: {
                rejectUnauthorized: false
            }
        });

        let result = await transporter.sendMail({
            from: process.env.SMTP_USER,
            to: to,
            subject: theme,
            text: text,
            html: html
        });

        console.log("Message URL: %s", nodemailer.getTestMessageUrl(result));
    }


    async sendGreetings(to) {
        if (!to) {
            return;
        }

        await this.#sendMail(to, "Welcome to the HWorker!", '',
            `
            <div>
                <h1>Welcome to the HWorker!</h1>
                <p>Thank you for registering. Create the first events in the main calendar :)</p>
            </div>        
        `)
    }


    async sendInvitation(to, link, inviter_name, calendar_name) {
        if(!to || !link || !calendar_name || !inviter_name) {
            return
        }

        await this.#sendMail(to, "Invitation to the calendar", '', 
        `
        <div>
            <h1>${inviter_name} invite you to the calendar "${calendar_name}". Follow this link to get into the calendar:</h1>
            <a>${link}</a>
            <h2>Attention! Link will be active for 30 minutes!</h2>
        </div>
        `)
    }


    async sendMessage(to, theme, text, html) {
        await this.#sendMail(to, theme, text, html);
    }


    async sendResetLink(email, link) {
        await this.#sendMail(email, "Hworker: activation link", '', 
        `
            <div>
                <h1>Your activation link.\nWarning! Don't tap on link if you did't asked for it!</h1>
                <p>Link: <a>${link}</a></p>
            </div>  
        `)
    }
}

module.exports = MailService;