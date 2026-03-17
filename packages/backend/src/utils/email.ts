/**
 * @copyright 2026 David Shurgold <aomdoa@gmail.com>
 */
import nodemailer from 'nodemailer'
import { config } from './config'
import logger from './logger'

const serviceLog = logger.child({ file: 'email.ts' })

let transporter: nodemailer.Transporter | null = null
export async function createTransporter() {
  if (transporter) return transporter

  if (process.env.NODE_ENV === 'development') {
    const testAccount = await nodemailer.createTestAccount()

    transporter = nodemailer.createTransport({
      host: testAccount.smtp.host,
      port: testAccount.smtp.port,
      secure: testAccount.smtp.secure,
      auth: {
        user: testAccount.user,
        pass: testAccount.pass,
      },
    })
    serviceLog.debug(`Ethereal email account ${testAccount.user} has been created`)
  } else {
    transporter = nodemailer.createTransport({
      host: config.SMTP_HOST,
      port: Number(config.SMTP_PORT),
      secure: true,
      auth: {
        user: config.SMTP_USER,
        pass: config.SMTP_PASS,
      },
    })
  }
  return transporter
}

export async function sendConfirmationEmail(to: string, token: string) {
  const transporter = await createTransporter()
  const from = `"Brainwave Confirmation" ${config.SMTP_FROM}`
  const subject = 'Confirm Brainwave Account'
  const link = `${config.FRONTEND_URL}confirm?email=${to}&token=${token}`
  const text = `Please confirm your brainwave account by going to ${link}`
  const html = `Please confirm your brainwave account by going to <a href="${link}">${link}</a>`
  const info = await transporter.sendMail({ from, to, subject, text, html })
  if (process.env.NODE_ENV === 'development') {
    serviceLog.debug(`Preview URL: ${nodemailer.getTestMessageUrl(info)}`)
  }
  serviceLog.debug(`Email to ${to}: ${JSON.stringify(info)}`)
  return info
}
