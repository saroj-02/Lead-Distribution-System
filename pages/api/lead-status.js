const { connect } = require('../../lib/db');
const Lead = require('../../models/Lead');
const emitter = require('../../lib/events');

const VALID_STATUSES = ['assigned', 'accepted', 'contacted', 'closed'];

export default async function handler(req, res) {
  try {
    await connect(process.env.MONGODB_URI);

    if (req.method !== 'POST') return res.status(405).json({ error: 'Method not allowed' });
    const { leadId, status, note } = req.body;
    if (!leadId || !status || !VALID_STATUSES.includes(status)) {
      return res.status(400).json({ error: 'Invalid lead status request' });
    }

    const lead = await Lead.findById(leadId);
    if (!lead) return res.status(404).json({ error: 'Lead not found' });

    lead.status = status;
    lead.statusHistory.push({ status, changedAt: new Date(), note: note || `${status.charAt(0).toUpperCase() + status.slice(1)} by provider` });
    lead.updatedAt = new Date();
    await lead.save();

    const populated = await Lead.findById(lead._id).populate('assignedProviders').populate('service');
    emitter.emit('lead', populated);

    res.json({ ok: true, lead: populated });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: err.message });
  }
};