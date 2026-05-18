const { connect } = require('../../lib/db');
const Service = require('../../models/Service');

export default async function handler(req, res) {
  try {
    await connect(process.env.MONGODB_URI);
    const services = await Service.find({}).sort({ code: 1 });
    res.json({ services });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: err.message });
  }
}
