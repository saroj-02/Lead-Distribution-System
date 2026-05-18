const { connect } = require('../../lib/db');
const Lead = require('../../models/Lead');
const Service = require('../../models/Service');
const Provider = require('../../models/Provider');
const AllocationState = require('../../models/AllocationState');
const emitter = require('../../lib/events');
const mongoose = require('mongoose');

const MONTHLY_QUOTA = 10;

async function assignProviders(serviceCode) {
  // mandatory rules
  const mandatoryMap = {
    1: [1],
    2: [5],
    3: [1,4]
  };

  const mandatoryCodes = mandatoryMap[serviceCode] || [];
  const assigned = [];

  // include mandatory providers if quota available (atomic)
  for (const code of mandatoryCodes) {
    const prov = await Provider.findOneAndUpdate({ code, monthlyAssigned: { $lt: MONTHLY_QUOTA } }, { $inc: { monthlyAssigned: 1, leadsCount: 1 } }, { new: true });
    if (prov) assigned.push(prov._id);
  }

  // fill remaining using AllocationState round-robin, reserve one by one atomically
  const slotsNeeded = 3 - assigned.length;
  if (slotsNeeded <= 0) return assigned;

  const alloc = await AllocationState.findOne({ serviceCode });
  if (!alloc) throw new Error('No allocation state for service');

  let attempts = 0;
  while (assigned.length < 3 && attempts < alloc.order.length * 5) {
    attempts++;
    // reserve one slot
    const before = await AllocationState.findOneAndUpdate({ _id: alloc._id }, { $inc: { counter: 1 } }, { new: false });
    if (!before) break;
    const idx = (before.counter % alloc.order.length + alloc.order.length) % alloc.order.length;
    const candidateId = alloc.order[idx];
    if (assigned.find(a => a.equals(candidateId))) continue;
    // try to increment provider quota atomically
    const prov = await Provider.findOneAndUpdate({ _id: candidateId, monthlyAssigned: { $lt: MONTHLY_QUOTA } }, { $inc: { monthlyAssigned: 1, leadsCount: 1 } }, { new: true });
    if (prov) assigned.push(prov._id);
  }

  return assigned;
}

export default async function handler(req, res) {
  try {
    await connect(process.env.MONGODB_URI);

    if (req.method !== 'POST') return res.status(405).end();
    const { name, phone, city, description, serviceCode } = req.body;
    const serviceCodeNumber = Number(serviceCode);
    if (!name || !phone || !serviceCode || Number.isNaN(serviceCodeNumber)) return res.status(400).json({ error: 'missing fields' });

    const service = await Service.findOne({ code: serviceCodeNumber });
    if (!service) return res.status(400).json({ error: 'invalid service' });

    // try create lead (enforces unique phone+service)
    const session = await mongoose.startSession();
    let lead;
    try {
      session.startTransaction();
      // assign providers
      const assigned = await assignProviders(serviceCodeNumber);
      if (assigned.length === 0) {
        await session.abortTransaction();
        return res.status(400).json({ error: 'no providers available' });
      }

      lead = await Lead.create([{ name, phone, city, description, service: service._id, assignedProviders: assigned, status: 'assigned', statusHistory: [{ status: 'assigned', changedAt: new Date(), note: 'Lead assigned to providers' }] }], { session });
      await session.commitTransaction();
      lead = lead[0];
    } catch (err) {
        await session.abortTransaction();
        // duplicate key
        if (err.code === 11000) return res.status(409).json({ error: 'duplicate lead for this service and phone' });
        console.error('Lead creation error:', err.stack || err);
        return res.status(500).json({ error: err.message, stack: err.stack });
    } finally {
      session.endSession();
    }

    const populated = await Lead.findById(lead._id).populate('assignedProviders').populate('service');
    emitter.emit('lead', populated);

    res.json({ ok: true, lead: populated });
  } catch (err) {
    console.error('Unhandled leads handler error:', err.stack || err);
    // expose stack in dev for debugging
    const payload = { error: err.message };
    if (process.env.NODE_ENV !== 'production') payload.stack = err.stack;
    res.status(500).json(payload);
  }
};
