import { MongoClient } from "mongodb";
import config from '../config';
import { connectionTest, insertOne, insertMany, insert1000 } from '../index';

// Mock MongoDB client
jest.mock('mongodb', () => ({
  MongoClient: jest.fn().mockImplementation(() => ({
    connect: jest.fn(),
    close: jest.fn(),
    db: jest.fn().mockReturnValue({
      collection: jest.fn().mockReturnValue({
        insertOne: jest.fn().mockResolvedValue({
          insertedId: 'test-id',
          acknowledged: true
        }),
        insertMany: jest.fn().mockResolvedValue({
          insertedCount: 10,
          insertedIds: { 0: 'test-id-1', 1: 'test-id-2' },
          acknowledged: true
        })
      })
    })
  }))
}));

describe('MongoDB Functions', () => {
  let client: MongoClient;

  beforeEach(() => {
    client = new MongoClient(config.mongoURI);
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  describe('connectionTest', () => {
    it('should return true when connection is successful', async () => {
      const result = await connectionTest();
      expect(result).toBe(true);
      expect(client.connect).toHaveBeenCalled();
    });

    it('should return false when connection fails', async () => {
      (client.connect as jest.Mock).mockRejectedValueOnce(new Error('Connection failed'));
      const result = await connectionTest();
      expect(result).toBe(false);
    });
  });

  describe('insertOne', () => {
    it('should insert one document successfully', async () => {
      await insertOne();
      expect(client.db).toHaveBeenCalledWith('app');
      expect(client.db('app').collection).toHaveBeenCalledWith('items');
    });
  });

  describe('insertMany', () => {
    it('should insert multiple documents successfully', async () => {
      await insertMany();
      expect(client.db).toHaveBeenCalledWith('app');
      expect(client.db('app').collection).toHaveBeenCalledWith('items');
    });
  });

  describe('insert1000', () => {
    it('should insert 1000 documents successfully', async () => {
      await insert1000();
      expect(client.db).toHaveBeenCalledWith('app');
      expect(client.db('app').collection).toHaveBeenCalledWith('items');
    });
  });
}); 