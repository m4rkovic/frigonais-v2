export default async function handler(req, res) {
  if (req.method !== 'POST') {
    res.setHeader('Allow', 'POST');
    return res.status(405).json({ error: 'Method not allowed' });
  }

  const {
    name = '',
    company = '',
    email = '',
    phone = '',
    product = '',
    volume = '',
    message = '',
    website = ''
  } = req.body || {};

  // Honeypot: silently accept obvious bot submissions.
  if (website) return res.status(200).json({ ok: true });

  if (!name.trim() || !company.trim() || !email.trim()) {
    return res.status(400).json({ error: 'Name, company and email are required.' });
  }

  if (!/^\S+@\S+\.\S+$/.test(email)) {
    return res.status(400).json({ error: 'Please provide a valid email address.' });
  }

  const apiKey = process.env.RESEND_API_KEY;
  const to = process.env.CONTACT_TO || 'frigonais@gmail.com';
  const from = process.env.CONTACT_FROM;

  if (!apiKey || !from) {
    return res.status(503).json({ error: 'Contact email service is not configured.' });
  }

  const safe = (value) => String(value || '')
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#039;');

  const html = `
    <div style="font-family:Arial,sans-serif;max-width:680px;margin:auto;color:#33312c">
      <h2 style="color:#1f5c1f">New Frigonais website inquiry</h2>
      <table style="border-collapse:collapse;width:100%">
        <tr><td style="padding:8px 0;font-weight:bold">Name</td><td>${safe(name)}</td></tr>
        <tr><td style="padding:8px 0;font-weight:bold">Company</td><td>${safe(company)}</td></tr>
        <tr><td style="padding:8px 0;font-weight:bold">Email</td><td>${safe(email)}</td></tr>
        <tr><td style="padding:8px 0;font-weight:bold">Phone</td><td>${safe(phone)}</td></tr>
        <tr><td style="padding:8px 0;font-weight:bold">Product</td><td>${safe(product)}</td></tr>
        <tr><td style="padding:8px 0;font-weight:bold">Estimated volume</td><td>${safe(volume)}</td></tr>
      </table>
      <h3 style="margin-top:24px">Message</h3>
      <p style="white-space:pre-wrap;line-height:1.6">${safe(message)}</p>
    </div>`;

  try {
    const response = await fetch('https://api.resend.com/emails', {
      method: 'POST',
      headers: {
        Authorization: `Bearer ${apiKey}`,
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        from,
        to: [to],
        reply_to: email,
        subject: `Frigonais inquiry — ${safe(company)}${product ? ` — ${safe(product)}` : ''}`,
        html
      })
    });

    const data = await response.json().catch(() => ({}));
    if (!response.ok) {
      console.error('Resend error:', data);
      return res.status(502).json({ error: 'Email provider rejected the request.' });
    }

    return res.status(200).json({ ok: true });
  } catch (error) {
    console.error('Contact form error:', error);
    return res.status(500).json({ error: 'Unable to send inquiry.' });
  }
}
