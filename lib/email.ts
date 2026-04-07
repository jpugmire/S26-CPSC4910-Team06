import { Resend } from "resend"

const FROM = "noreply@team06.cpsc4911.com"

function getResend() {
  return new Resend(process.env.RESEND_API_KEY)
}

export async function sendAccountInfoChangedEmail(to: string, username: string) {
  await getResend().emails.send({
    from: FROM,
    to,
    subject: "Your account information was updated",
    html: `<p>Hi ${username},</p>
<p>Your account information was recently updated. If you did not make this change, please contact support immediately.</p>`,
  })
}

export async function sendPasswordChangedEmail(to: string, username: string) {
  await getResend().emails.send({
    from: FROM,
    to,
    subject: "Your password was changed",
    html: `<p>Hi ${username},</p>
<p>Your password was recently changed. If you did not make this change, please reset your password immediately or contact support.</p>`,
  })
}

export async function sendPointValueChangedEmail(to: string, username: string, orgName: string, newValue: number) {
  await getResend().emails.send({
    from: FROM,
    to,
    subject: `Point value updated for ${orgName}`,
    html: `<p>Hi ${username},</p>
<p>The point dollar value for <strong>${orgName}</strong> has been updated to <strong>$${newValue.toFixed(2)}</strong> per point.</p>`,
  })
}

export async function sendDroppedBySponsorEmail(to: string, username: string, orgName: string) {
  await getResend().emails.send({
    from: FROM,
    to,
    subject: "You have been removed from a sponsor organization",
    html: `<p>Hi ${username},</p>
<p>You have been removed from <strong>${orgName}</strong> by your sponsor. If you have questions, please contact your sponsor directly.</p>`,
  })
}
