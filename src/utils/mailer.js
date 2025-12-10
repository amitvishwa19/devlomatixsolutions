import nodemailer from 'nodemailer';
import bcryptjs from 'bcryptjs';



export const sendEmail = async ({ email, emailType, userId, token }) => {
    try {
        // create a hased token
        const hashedToken = await bcryptjs.hash(userId.toString(), 10)
        console.log('Hashed token', hashedToken)

        // if (emailType === "verify") {
        //     await User.findByIdAndUpdate(userId,
        //         { verifyToken: hashedToken, verifyTokenExpiry: Date.now() + 3600000 })
        // } else if (emailType === "reset") {
        //     await User.findByIdAndUpdate(userId,
        //         { forgotPasswordToken: hashedToken, forgotPasswordTokenExpiry: Date.now() + 3600000 })
        // }

        var transport = nodemailer.createTransport({
            host: process.env.MAIL_SERVICE_HOST,
            port: process.env.MAIL_SERVICE_PORT,
            secure: false,
            auth: {
                user: process.env.MAIL_SERVICE_USERNAME,
                pass: process.env.MAIL_SERVICE_PASSWORD
            }
        });

        let mailOptions = {}

        if (emailType === 'verify') {
            mailOptions = {
                from: {
                    name: process.env.MAIL_SERVICE_NAME,
                    address: process.env.MAIL_SERVER_ADDRESS
                },
                to: email,
                subject: `Activate  your ${process.env.APP_NAME} account `,
                html: `<p>Click <a href="${process.env.APP_URL}/verify?token=${token}">here</a> to  verify your email 
                or copy and paste the link below in your browser. <br> ${process.env.APP_URL}/verify?token=${token}
                </p>`
            }
        }

        if (emailType === 'forget') {
            mailOptions = {
                from: {
                    name: process.env.MAIL_SERVICE_NAME,
                    address: process.env.MAIL_SERVER_ADDRESS
                },
                to: email,
                subject: "Reset your password",
                html: `<p>Click <a href="${process.env.APP_URL}/reset?token=${hashedToken}">here</a> to reset your password
                or copy and paste the link below in your browser. <br> ${process.env.APP_URL}/reset?token=${hashedToken}
                </p>`
            }
        }

        if (emailType === 'reset') {
            mailOptions = {
                from: {
                    name: process.env.MAIL_SERVICE_NAME,
                    address: process.env.MAIL_SERVER_ADDRESS
                },
                to: email,
                subject: "Verify your email",
                html: `<p>Click <a href="${process.env.APP_URL}/reset?token=${hashedToken}">here</a> to ${emailType === "verify" ? "verify your email" : "reset your password"}
                or copy and paste the link below in your browser. <br> ${process.env.APP_URL}/reset?token=${hashedToken}
                </p>`
            }
        }

        // const mailOptions = {
        //     from: 'info@devlomatix.com',
        //     to: email,
        //     subject: emailType === "verify" ? "Verify your email" : "Reset your password",
        //     html: `<p>Click <a href="${appConfig.app.appUri}/auth/${emailType}?token=${hashedToken}">here</a> to ${emailType === "verify" ? "verify your email" : "reset your password"}
        //     or copy and paste the link below in your browser. <br> ${appConfig.app.appUri}/auth/${emailType}?token=${hashedToken}
        //     </p>`
        // }

        const mailresponse = await transport.sendMail
            (mailOptions);
        return mailresponse;

    } catch (error) {
        throw new Error(error.message);
    }
}