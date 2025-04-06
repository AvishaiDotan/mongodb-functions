import { MongoClient, Db, Collection, Document } from "mongodb";
import config from './config';

import { RandomService } from './helpers/random.service';

const uri: string = config.mongoURI;
export const client: MongoClient = new MongoClient(uri);

export async function connectionTest(): Promise<boolean> {
  try {
    await client.connect();
    return true;
  } catch (error) {
    console.error('Failed to connect to MongoDB:', error);
    return false;
  }
}

export async function insertOne(withId: boolean = true): Promise<void> {
    try {
        const randomItem = RandomService.generate(withId);
        const database = client.db('app');
        const collection = database.collection('items');
        const res = await collection.insertOne(randomItem);
    } catch (error) {
        console.error('Failed to insert random data:', error);
    }
}

export async function insertMany(withId: boolean = true): Promise<void> {
    try {
        const randomItems = RandomService.generateMany(10, withId);
        const database = client.db('app');
        const collection = database.collection('items');
        const res = await collection.insertMany(randomItems);
    } catch (error) {
        console.error('Failed to insert random data:', error);
    }
}

export async function insert1000(withId: boolean = true): Promise<void> {
    try {
        const randomItems = RandomService.generateMany(1000, withId);
        const database = client.db('app');
        const collection = database.collection('items');
        const res = await collection.insertMany(randomItems);
    } catch (error) {
        console.error('Failed to insert random data:', error);
    }
}

export async function insertBulkWrite(withId: boolean = true): Promise<void> {
    try {
        const randomItems = RandomService.generateMany(1000, withId);
        const database = client.db('app');
        const collection = database.collection('items');
        
        // Convert items to insertOne operations
        const operations = randomItems.map(item => ({
            insertOne: { document: item }
        }));
        
        const res = await collection.bulkWrite(operations);
    } catch (error) {
        console.error('Failed to perform bulk write:', error);
    }
}

export async function insertMillion(withId: boolean = true): Promise<void> {
    try {
        const randomItems = RandomService.generateMany(1000000, withId);
        const database = client.db('app');
        const collection = database.collection('items');
        const res = await collection.insertMany(randomItems);
    } catch (error) {
        console.error('Failed to perform bulk write:', error);
    }
}

export async function findOne(query: any = {}): Promise<Document | null> {
    try {
        const database = client.db('app');
        const collection = database.collection('items');
        const result = await collection.findOne(query);
        return result;
    } catch (error) {
        console.error('Failed to find document:', error);
        return null;
    }
}

export async function find(query: any = {}, limit: number = 10): Promise<Document[]> {
    try {
        const database = client.db('app');
        const collection = database.collection('items');
        const cursor = collection.find(query).limit(limit);
        const results = await cursor.toArray();
        return results;
    } catch (error) {
        console.error('Failed to find documents:', error);
        return [];
    }
}

async function run(): Promise<void> {
  try {
    
    const isConnected = await connectionTest();
    if (!isConnected) {
      return;
    }

    // await insertOne();
    // await insertMany();
    // await insert1000();
    // await insertBulkWrite();
    // await insertMillion(false);

  } finally {
    await client.close();
  }
}

run().catch(console.dir); 