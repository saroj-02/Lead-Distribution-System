const { connect } = require('../../../lib/db');
const Service = require('../../../models/Service');

export default async function handler(req, res) {
  try {
    await connect(process.env.MONGODB_URI);
    if (req.method !== 'POST') return res.status(405).end();
    const { count = 10 } = req.body;
    const services = await Service.find({});
    const serviceCodes = services.map(s => s.code);

    // determine host from current request if env base URL is not correct
    const origin = process.env.NEXT_PUBLIC_BASE_URL || `${req.headers['x-forwarded-proto'] || 'http'}://${req.headers.host}`;
    const promises = [];
    for (let i = 0; i < count; i++) {
      const svc = serviceCodes[i % serviceCodes.length];
      const body = { name: `Bulk ${Date.now()}-${i}`, phone: `9${Math.floor(Math.random()*100000000)}`, city: 'City', description: 'bulk', serviceCode: svc };
      promises.push(fetch(`${origin}/api/leads`, { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(body) }));
    }

    const results = await Promise.all(promises);
    res.json({ ok: true, results: results.map(r => r.status) });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: err.message });
  }
};
