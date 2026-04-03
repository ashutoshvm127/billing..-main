import nodemailer from 'nodemailer'

export type SmtpMailConfig = {
  host: string
  port: number
  secure: boolean
  user: string
  pass: string
  from: string
  fromName: string
  replyTo: string
}

export function getSmtpMailConfig(): SmtpMailConfig {
  const host = process.env.SMTP_HOST
  const port = Number(process.env.SMTP_PORT ?? 587)
  const secure = (process.env.SMTP_SECURE ?? 'false') === 'true'
  const user = process.env.SMTP_USER
  const pass = process.env.SMTP_PASS
  const from = process.env.MAIL_FROM ?? user
  const fromName = process.env.MAIL_FROM_NAME ?? 'Billing Team'
  const replyTo = process.env.MAIL_REPLY_TO ?? from

  if (!host || !user || !pass || !from) {
    throw new Error(
      'SMTP is not configured. Set SMTP_HOST, SMTP_PORT, SMTP_SECURE, SMTP_USER, SMTP_PASS, and MAIL_FROM in environment variables.'
    )
  }

  return { host, port, secure, user, pass, from, fromName, replyTo }
}

export function createSmtpTransporter() {
  const config = getSmtpMailConfig()

  return {
    config,
    transporter: nodemailer.createTransport({
      host: config.host,
      port: config.port,
      secure: config.secure,
      auth: {
        user: config.user,
        pass: config.pass,
      },
    }),
  }
}
