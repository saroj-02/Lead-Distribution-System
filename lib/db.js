const mongoose = require('mongoose');

let cached = global._mongoose;
if (!cached) cached = global._mongoose = { conn: null, promise: null };

async function connect(uri) {
  if (!uri) {
    throw new Error('MONGODB_URI is required and must be set in .env');
  }
  if (cached.conn) return cached.conn;
  if (!cached.promise) {
    cached.promise = mongoose.connect(uri, { });
  }
  cached.conn = await cached.promise;
  return cached.conn;
}

module.exports = { connect };
