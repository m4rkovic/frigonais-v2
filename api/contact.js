const RATE_WINDOW_MS = 15 * 60 * 1000;
const RATE_MAX_REQUESTS = 5;
const rateBuckets = globalThis.__frigonaisRateBuckets || new Map();
globalThis.__frigonaisRateBuckets = rateBuckets;

const LIMITS = {
  name: 100,
  company: 150,
  email: 254,
  phone: 40,
  product: 60,
  volume: 40,
  message: 5000,
  website: 200
};

const ALLOWED_PRODUCTS = new Set(['', 'iqf', 'jams', 'purees', 'thermostable', 'yogurt', 'fillings', 'custom']);
const ALLOWED_VOLUMES = new Set(['', 'under-1', '1-10', '10-50', '50-100', '100-plus']);

function text(value, max) {
  return String(value ?? '').trim().slice(0, max);
}

function safeHtml(value) {
  return String(value ?? '')
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#039;');
}

function clientIp(req) {
  const forwarded = req.headers['x-forwarded-for'];
  if (typeof forwarded === 'string' && forwarded) return forwarded.split(',')[0].trim();
  return req.headers['x-real-ip'] || req.socket?.remoteAddress || 'unknown';
}

function hitRateLimit(ip) {
  const now = Date.now();
  const existing = rateBuckets.get(ip);
  if (!existing || now - existing.startedAt >= RATE_WINDOW_MS) {
    rateBuckets.set(ip, { startedAt: now, count: 1 });
    return false;
  }
  existing.count += 1;
  rateBuckets.set(ip, existing);

  // Cheap opportunistic cleanup for warm serverless instances.
  if (rateBuckets.size > 1000) {
    for (const [key, bucket] of rateBuckets) {
      if (now - bucket.startedAt >= RATE_WINDOW_MS) rateBuckets.delete(key);
    }
  }
  return existing.count > RATE_MAX_REQUESTS;
}

async function verifyTurnstile(token, ip) {
  const secret = process.env.TURNSTILE_SECRET_KEY;
  if (!secret) return { ok: true, configured: false };
  if (!token) return { ok: false, configured: true };

  const body = new URLSearchParams({ secret, response: token });
  if (ip && ip !== 'unknown') body.set('remoteip', ip);

  try {
    const response = await fetch('https://challenges.cloudflare.com/turnstile/v0/siteverify', {
      method: 'POST',
      headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
      body
    });
    const data = await response.json().catch(() => ({}));
    return { ok: response.ok && data.success === true, configured: true };
  } catch {
    return { ok: false, configured: true };
  }
}

export default async function handler(req, res) {
  res.setHeader('Cache-Control', 'no-store');

  if (req.method !== 'POST') {
    res.setHeader('Allow', 'POST');
    return res.status(405).json({ error: 'Method not allowed.' });
  }

  const contentType = String(req.headers['content-type'] || '');
  if (!contentType.includes('application/json')) {
    return res.status(415).json({ error: 'JSON request body required.' });
  }

  const raw = req.body || {};
  const website = text(raw.website, LIMITS.website);
  // Honeypot: do not reveal detection behavior to bots.
  if (website) return res.status(200).json({ ok: true });

  const ip = clientIp(req);
  if (hitRateLimit(ip)) {
    res.setHeader('Retry-After', String(Math.ceil(RATE_WINDOW_MS / 1000)));
    return res.status(429).json({ error: 'Too many inquiries. Please try again later.' });
  }

  const name = text(raw.name, LIMITS.name);
  const company = text(raw.company, LIMITS.company);
  const email = text(raw.email, LIMITS.email).toLowerCase();
  const phone = text(raw.phone, LIMITS.phone);
  const product = text(raw.product, LIMITS.product);
  const volume = text(raw.volume, LIMITS.volume);
  const message = text(raw.message, LIMITS.message);
  const turnstileToken = text(raw['cf-turnstile-response'] || raw.turnstileToken, 2048);

  if (!name || !company || !email) {
    return res.status(400).json({ error: 'Name, company and email are required.' });
  }
  if (!/^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/i.test(email)) {
    return res.status(400).json({ error: 'Please provide a valid email address.' });
  }
  if (!ALLOWED_PRODUCTS.has(product) || !ALLOWED_VOLUMES.has(volume)) {
    return res.status(400).json({ error: 'Invalid product or volume selection.' });
  }

  const turnstile = await verifyTurnstile(turnstileToken, ip);
  if (!turnstile.ok) {
    return res.status(400).json({ error: 'Security verification failed. Please refresh and try again.' });
  }

  const apiKey = process.env.RESEND_API_KEY;
  const to = process.env.CONTACT_TO || 'frigonais@gmail.com';
  const from = process.env.CONTACT_FROM;
  if (!apiKey || !from) {
    return res.status(503).json({ error: 'Contact email service is not configured.' });
  }

  const html = `
    <div style="font-family:Arial,sans-serif;max-width:680px;margin:auto;color:#33312c">
      <h2 style="color:#1f5c1f">New Frigonais website inquiry</h2>
      <table style="border-collapse:collapse;width:100%">
        <tr><td style="padding:8px 0;font-weight:bold">Name</td><td>${safeHtml(name)}</td></tr>
        <tr><td style="padding:8px 0;font-weight:bold">Company</td><td>${safeHtml(company)}</td></tr>
        <tr><td style="padding:8px 0;font-weight:bold">Email</td><td>${safeHtml(email)}</td></tr>
        <tr><td style="padding:8px 0;font-weight:bold">Phone</td><td>${safeHtml(phone)}</td></tr>
        <tr><td style="padding:8px 0;font-weight:bold">Product</td><td>${safeHtml(product || 'Not specified')}</td></tr>
        <tr><td style="padding:8px 0;font-weight:bold">Estimated volume</td><td>${safeHtml(volume || 'Not specified')}</td></tr>
      </table>
      <h3 style="margin-top:24px">Message</h3>
      <p style="white-space:pre-wrap;line-height:1.6">${safeHtml(message || 'No additional message.')}</p>
    </div>`;

  const cleanCompany = company.replace(/[\r\n]+/g, ' ').slice(0, 100);
  const cleanProduct = product.replace(/[\r\n]+/g, ' ').slice(0, 50);

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
        subject: `Frigonais inquiry — ${cleanCompany}${cleanProduct ? ` — ${cleanProduct}` : ''}`,
        html
      })
    });

    const data = await response.json().catch(() => ({}));
    if (!response.ok) {
      console.error('Resend rejected Frigonais inquiry:', response.status, data?.message || 'unknown error');
      return res.status(502).json({ error: 'Email provider rejected the request.' });
    }
    return res.status(200).json({ ok: true });
  } catch (error) {
    console.error('Frigonais contact delivery failed:', error?.message || 'unknown error');
    return res.status(500).json({ error: 'Unable to send inquiry.' });
  }
}
