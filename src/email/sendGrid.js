const sgMail = require('@sendgrid/mail')
sgMail.setApiKey(process.env.SENDGRID_API_KEY);

const sendWelcomeEmail = (email, name) => {
    sgMail.send({
        to: email,
        from: 'amine.mohamed.rg@gmail.com',
        subject: 'Thanks for joining Us!',
        text: `Welcome to the app, ${name} let me know how you get along with the App!`
    })
}

const sendCancelEmail = (email, name) => {
    sgMail.send({
        to: email,
        from: 'amine.mohamed.rg@gmail.com',
        subject: 'Confirme cancelling email!',
        text: `Hey, ${name} let me know why you canceled the App. so we can improve it!`
    })
}

module.exports = {
    sendWelcomeEmail,
    sendCancelEmail
}