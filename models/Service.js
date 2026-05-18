const mongoose = require('mongoose');

const ServiceSchema = new mongoose.Schema({
  name: String,
  code: Number
});

module.exports = mongoose.models.Service || mongoose.model('Service', ServiceSchema);
