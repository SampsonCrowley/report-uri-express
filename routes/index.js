import express from "express"
import nodemailer from "nodemailer"

const transporter = nodemailer.createTransport({
  port: process.env.SES_SMTP_PORT,
  host: process.env.SES_STMP_HOST,
  auth: {
    user: process.env.SES_SMTP_USERNAME,
    pass: process.env.SES_SMTP_PASSWORD,
  },
  secure: true, // upgrades later with STARTTLS -- change this based on the PORT
});

export const indexRouter = express.Router()

/* GET home page. */
indexRouter.options('/*', function(req, res, next) {
  res.set({
    "Access-Control-Allow-Methods": "OPTIONS, POST",
    "Access-Control-Allow-Origin": "*",
    "Access-Control-Allow-Headers": res.headers['Access-Control-Request-Headers']
  })

  res.send(200)
});

indexRouter.post('/*', function(req, res, next) {
  const postedBy = req.headers['X-Forwarded-For']
    || req.headers.referrer
    || req.connection.remoteAddress
    || req.socket.remoteAddress

  const mailData = {
    from: process.env.FROM_EMAIL || "no-reply@kipu.health",
    to: process.env.TARGET_EMAIL,
    subject: `An Expect-CT report was posted by ${postedBy}.`,
    text: `
      Headers:
        ${req.headers.toString()}

      Report:
        ${req.body}
    `
  }

  // Don't care if there was an error on this reporter, just respond on complete
  transporter.sendMail(mailData, () => {  res.send(200) })
});
