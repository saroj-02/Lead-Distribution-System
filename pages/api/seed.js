const { connect } = require('../../lib/db');
const Service = require('../../models/Service');
const Provider = require('../../models/Provider');
const AllocationState = require('../../models/AllocationState');

export default async function handler(req, res) {
  try {
    await connect(process.env.MONGODB_URI);

    // Create services
    const services = [
      { name: 'Service 1', code: 1 },
      { name: 'Service 2', code: 2 },
      { name: 'Service 3', code: 3 }
    ];
    await Service.deleteMany({});
    await Provider.deleteMany({});
    await AllocationState.deleteMany({});

    const createdServices = await Service.insertMany(services);

    // Create 8 providers
    const providers = [];
    for (let i = 1; i <= 8; i++) providers.push({ name: `Provider ${i}`, code: i, monthlyQuota: 10 });
    const createdProviders = await Provider.insertMany(providers);

    const byCode = (code) => createdProviders.find(p => p.code === code)._id;

    // Allocation orders per service
    const orders = [
      { serviceCode: 1, order: [byCode(2), byCode(3), byCode(4)] },
      { serviceCode: 2, order: [byCode(6), byCode(7), byCode(8)] },
      { serviceCode: 3, order: [byCode(2), byCode(3), byCode(5), byCode(6), byCode(7), byCode(8)] }
    ];

    await AllocationState.insertMany(orders);

    res.status(200).json({ ok: true, services: createdServices.length, providers: createdProviders.length });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: err.message });
  }
};
