const mongoose = require('mongoose');

async function run() {
  await mongoose.connect('mongodb+srv://sarojpadhi28:IBqTzLV0d2TBTuDj@cluster0.n9zjrky.mongodb.net/?retryWrites=true&w=majority&appName=Cluster0');
  const Lead = require('./models/Lead');
  const Provider = require('./models/Provider');

  const providers = await Provider.find({}).lean();
  console.log(`Found ${providers.length} providers.`);
  
  const withLeads = await Promise.all(providers.map(async p => {
    const leads = await Lead.find({ assignedProviders: p._id }).populate('service').lean();
    return { name: p.name, leadsCount: leads.length };
  }));
  
  console.log(withLeads);

  process.exit(0);
}
run();
