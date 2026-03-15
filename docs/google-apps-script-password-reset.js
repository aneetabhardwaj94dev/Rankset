/**
 * Rankset - Password Reset Email (Google Apps Script)
 * 
 * SETUP:
 * 1. Go to https://script.google.com
 * 2. New project → paste this entire file
 * 3. Save (Ctrl+S)
 * 4. Deploy → New deployment → Type: Web app
 *    - Description: Rankset password reset
 *    - Execute as: Me
 *    - Who has access: Anyone
 * 5. Authorize when prompted (allow sending email as you)
 * 6. Copy the Web app URL and set it as PASSWORD_RESET_SCRIPT_URL in your backend .env
 * 
 * Your backend will POST: { "email": "user@example.com", "resetLink": "https://..." }
 */

function doPost(e) {
  const output = ContentService.createTextOutput();
  output.setMimeType(ContentService.MimeType.JSON);

  try {
    if (!e || !e.postData || !e.postData.contents) {
      output.setContent(JSON.stringify({ success: false, error: 'No data' }));
      return output;
    }

    const data = JSON.parse(e.postData.contents);
    const email = data.email && String(data.email).trim();
    const resetLink = data.resetLink && String(data.resetLink).trim();

    if (!email || !resetLink) {
      output.setContent(JSON.stringify({ success: false, error: 'Missing email or resetLink' }));
      return output;
    }

    const subject = 'Rankset - Reset your password';
    const body = [
      'Hello,',
      '',
      'You requested a password reset for your Rankset account.',
      '',
      'Click the link below to set a new password (valid for 1 hour):',
      resetLink,
      '',
      'If you did not request this, please ignore this email. Your password will not be changed.',
      '',
      '— Rankset'
    ].join('\n');

    const htmlBody = [
      '<p>Hello,</p>',
      '<p>You requested a password reset for your <strong>Rankset</strong> account.</p>',
      '<p><a href="' + resetLink + '" style="display:inline-block;padding:10px 20px;background:#1a365d;color:#fff;text-decoration:none;border-radius:6px;">Reset password</a></p>',
      '<p>Or copy this link: <br><a href="' + resetLink + '">' + resetLink + '</a></p>',
      '<p><small>Link is valid for 1 hour. If you did not request this, ignore this email.</small></p>',
      '<p>— Rankset</p>'
    ].join('');

    GmailApp.sendEmail(email, subject, body, {
      htmlBody: htmlBody,
      name: 'Rankset'
    });

    output.setContent(JSON.stringify({ success: true, message: 'Email sent' }));
  } catch (err) {
    output.setContent(JSON.stringify({
      success: false,
      error: err.message || 'Failed to send email'
    }));
  }

  return output;
}

/**
 * Optional: test that the deployment works (open Web app URL in browser).
 * Returns a simple message so you know the script is deployed.
 */
function doGet(e) {
  const output = ContentService.createTextOutput();
  output.setMimeType(ContentService.MimeType.TEXT);
  output.setContent('Rankset password reset script is running. Use POST with { "email", "resetLink" } to send reset emails.');
  return output;
}
