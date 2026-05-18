const { connect } = require('../../lib/db');
const Provider = require('../../models/Provider');
const Lead = require('../../models/Lead');

export default async function handler(req, res) {
  try {
    await connect(process.env.MONGODB_URI);
    const providers = await Provider.find({}).lean();
    // attach recent leads for each provider
    const withLeads = await Promise.all(providers.map(async p => {
      const leads = await Lead.find({ assignedProviders: p._id }).populate('service').lean();
      return { ...p, leads };
    }));
    res.json({ providers: withLeads });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: err.message });
  }
};
