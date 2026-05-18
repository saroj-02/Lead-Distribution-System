import { MongoClient } from 'mongodb';

let client;
let clientPromise;

if(!process.env.MONGODB_URI){
  // clientPromise left undefined when no URI provided
  clientPromise = null;
} else {
  client = new MongoClient(process.env.MONGODB_URI);
  clientPromise = client.connect();
}

export default clientPromise;
