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

export async function sendEmailVerificationEmail(to: string, username: string, token: string) {
  const verifyUrl = `${process.env.NEXTAUTH_URL}/api/auth/verify-email?token=${token}`
  await getResend().emails.send({
    from: FROM,
    to,
    subject: "Verify your email address",
    html: `<p>Hi ${username},</p>
<p>Thanks for creating an account. Please verify your email address by clicking the link below:</p>
<p><a href="${verifyUrl}">Verify my email</a></p>
<p>This link expires in 24 hours. If you did not create an account, you can ignore this email.</p>`,
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

export async function sendOrderConfirmationEmail(
  to: string,
  username: string,
  items: { name: string; points: number }[],
  totalPoints: number
) {
  const itemRows = items
    .map((i) => `<tr><td style="padding:4px 8px">${i.name}</td><td style="padding:4px 8px;text-align:right">${i.points} pts</td></tr>`)
    .join("")
  await getResend().emails.send({
    from: FROM,
    to,
    subject: "Your order confirmation",
    html: `<p>Hi ${username},</p>
<p>Your order has been placed successfully. Here's a summary:</p>
<table style="border-collapse:collapse;width:100%;max-width:400px">
  <thead><tr><th style="padding:4px 8px;text-align:left">Item</th><th style="padding:4px 8px;text-align:right">Points</th></tr></thead>
  <tbody>${itemRows}</tbody>
  <tfoot><tr><td style="padding:4px 8px"><strong>Total</strong></td><td style="padding:4px 8px;text-align:right"><strong>${totalPoints} pts</strong></td></tr></tfoot>
</table>
<p>Thank you!</p>`,
  })
}

export async function sendPointsChangedEmail(
  to: string,
  username: string,
  delta: number,
  newTotal: number,
  reason?: string | null
) {
  const direction = delta >= 0 ? "added" : "removed"
  const amount = Math.abs(delta)
  await getResend().emails.send({
    from: FROM,
    to,
    subject: "Your points balance has been updated",
    html: `<p>Hi ${username},</p>
<p><strong>${amount} point${amount !== 1 ? "s" : ""}</strong> ${direction === "added" ? "have been added to" : "have been removed from"} your account.</p>
${reason ? `<p>Reason: ${reason}</p>` : ""}
<p>Your new balance is <strong>${newTotal} point${newTotal !== 1 ? "s" : ""}</strong>.</p>`,
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
