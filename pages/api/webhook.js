const { connect } = require('../../lib/db');
const Provider = require('../../models/Provider');
const mongoose = require('mongoose');

// Simple idempotency store
const WebhookEvent = require('../../models/WebhookEvent');

export default async function handler(req, res) {
  try {
    await connect(process.env.MONGODB_URI);
    if (req.method !== 'POST') return res.status(405).end();
    const { eventId, action } = req.body;
    if (!eventId) return res.status(400).json({ error: 'missing eventId' });

    // idempotency
    const exists = await WebhookEvent.findOne({ eventId });
    if (exists) return res.json({ ok: true, idempotent: true });

    if (action === 'reset_quota') {
      // reset all providers monthlyAssigned to 0 and monthlyQuota to 10
      await Provider.updateMany({}, { $set: { monthlyAssigned: 0, monthlyQuota: 10 } });
    }

    await WebhookEvent.create({ eventId, action, processedAt: new Date() });
    res.json({ ok: true });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: err.message });
  }
};
