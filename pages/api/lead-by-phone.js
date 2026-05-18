const { connect } = require('../../lib/db');
const Lead = require('../../models/Lead');

export default async function handler(req, res) {
  try {
    await connect(process.env.MONGODB_URI);
    const { phone } = req.query;
    if (!phone) return res.status(400).json({ error: 'Phone number is required' });

    const leads = await Lead.find({ phone }).populate('service assignedProviders').sort({ createdAt: -1 }).lean();
    res.json({ leads });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: err.message });
  }
};