import { Resend } from "resend"

const resend = new Resend(process.env.RESEND_API_KEY)
const FROM = "noreply@team06.cpsc4911.com"

export async function sendAccountInfoChangedEmail(to: string, username: string) {
  await resend.emails.send({
    from: FROM,
    to,
    subject: "Your account information was updated",
    html: `<p>Hi ${username},</p>
<p>Your account information was recently updated. If you did not make this change, please contact support immediately.</p>`,
  })
}

export async function sendPasswordChangedEmail(to: string, username: string) {
  await resend.emails.send({
    from: FROM,
    to,
    subject: "Your password was changed",
    html: `<p>Hi ${username},</p>
<p>Your password was recently changed. If you did not make this change, please reset your password immediately or contact support.</p>`,
  })
}

export async function sendDroppedBySponsorEmail(to: string, username: string, orgName: string) {
  await resend.emails.send({
    from: FROM,
    to,
    subject: "You have been removed from a sponsor organization",
    html: `<p>Hi ${username},</p>
<p>You have been removed from <strong>${orgName}</strong> by your sponsor. If you have questions, please contact your sponsor directly.</p>`,
  })
}
