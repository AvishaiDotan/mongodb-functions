import { MongoClient, Db, Collection, Document, ObjectId } from "mongodb";
import config from './config';
import { EntityGeneratorService, Field, Item, Table, User, Workbook } from './helpers/entity-generator.service';
import * as fs from 'fs';


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
        const user = EntityGeneratorService.generateUser(true);
        if (withId) {
            user._id = new ObjectId();
        }
        const database = client.db('app');
        const collection = database.collection('users');
        const res = await collection.insertOne(user);
    } catch (error) {
        console.error('Failed to insert user data:', error);
    }
}

export async function insertMany(withId: boolean = true): Promise<void> {
    try {
        const users = EntityGeneratorService.generateUsers(10, true);
        if (withId) {
            users.forEach(user => {
                user._id = new ObjectId();
            });
        }
        const database = client.db('app');
        const collection = database.collection('users');
        const res = await collection.insertMany(users);
    } catch (error) {
        console.error('Failed to insert user data:', error);
    }
}

export async function insert1000(withId: boolean = true): Promise<void> {
    try {
        const users = EntityGeneratorService.generateUsers(1000, true);
        if (withId) {
            users.forEach(user => {
                user._id = new ObjectId();
            });
        }
        const database = client.db('app');
        const collection = database.collection('users');
        const res = await collection.insertMany(users);
    } catch (error) {
        console.error('Failed to insert user data:', error);
    }
}

export async function insertBulkWrite(withId: boolean = true): Promise<void> {
    try {
        const users = EntityGeneratorService.generateUsers(1000, true);
        if (withId) {
            users.forEach(user => {
                user._id = new ObjectId();
            });
        }
        const database = client.db('app');
        const collection = database.collection('users');
        
        // Convert users to insertOne operations
        const operations = users.map(user => ({
            insertOne: { document: user }
        }));
        
        const res = await collection.bulkWrite(operations);
    } catch (error) {
        console.error('Failed to perform bulk write:', error);
    }
}

export async function insert10K(withId: boolean = true): Promise<void> {
    try {
        const users = EntityGeneratorService.generateUsers(10000, true);
        if (withId) {
            users.forEach(user => {
                user._id = new ObjectId();
            });
        }
        const database = client.db('app');
        const collection = database.collection('users');
        const res = await collection.insertMany(users);
    } catch (error) {
        console.error('Failed to perform bulk write:', error);
    }
}

export async function findOne(collectionName: string, query: any = {}): Promise<Document | null> {
    try {
        const database = client.db('app');
        const collection = database.collection(collectionName);
        const result = await collection.findOne(query);
        return result;
    } catch (error) {
        console.error('Failed to find document:', error);
        return null;
    }
}

export async function find(collectionName: string, query: any = {}, limit: number = 10): Promise<Document[]> {
    try {
        const database = client.db('app');
        const collection = database.collection(collectionName);
        const data = await collection.find(query).limit(limit).toArray();
        return data;
    } catch (error) {
        console.error('Failed to find documents:', error);
        return [];
    }
}

export async function findOneFull(): Promise<any | null> {
    try {
        
        const database = client.db('app');
        
        // First, get a single user
        const user = await database.collection('users').findOne({_id: new ObjectId('67f78fabdb26954b9481f510')});
        
        if (!user) {
            console.log('No users found in the database');
            return null;
        }
        
        // Get workbooks for this specific user
        const workbooks = await database.collection('workbooks')
            .find({ userId: user._id })
            .toArray();
            
        // Create a map of workbook IDs and collect them in an array
        const workbookIds = workbooks.map(wb => wb._id);
        const workbooksMap = new Map(workbooks.map(wb => [wb._id.toString(), { ...wb, tables: [] as Document[] }]));
        
        // Get all tables for these workbooks in one query
        const tables = await database.collection('tables')
            .find({ workbookId: { $in: workbookIds } })
            .toArray();
            
        // Create a map of table IDs and organize by workbook
        const tableIds = tables.map(table => table._id);
        const tablesMap = new Map(tables.map(table => [table._id.toString(), { ...table, items: [] as Document[], fields: [] as Document[] }]));
        
        // Get all fields for these tables in one query
        const fields = await database.collection('fields')
            .find({ tableId: { $in: tableIds } })
            .toArray();
            
        // Get all items for these tables in one query
        const items = await database.collection('items')
            .find({ tableId: { $in: tableIds } })
            .toArray();
            
        // Organize fields and items by table
        fields.forEach(field => {
            const tableId = field.tableId.toString();
            if (tablesMap.has(tableId)) {
                const table = tablesMap.get(tableId)!;
                table.fields.push(field);
            }
        });
        
        items.forEach(item => {
            const tableId = item.tableId.toString();
            if (tablesMap.has(tableId)) {
                const table = tablesMap.get(tableId)!;
                table.items.push(item);
            }
        });
        
        // Organize tables by workbook
        tables.forEach(table => {
            const workbookId = table.workbookId.toString();
            if (workbooksMap.has(workbookId)) {
                const workbook = workbooksMap.get(workbookId)!;
                const tableWithData = tablesMap.get(table._id.toString());
                if (tableWithData) {
                    workbook.tables.push(tableWithData);
                }
            }
        });
        
        // Build the final result
        const result = {
            ...user,
            workbooks: Array.from(workbooksMap.values())
        };
        
        return result;
    } catch (error) {
        console.error('Failed to find full user data:', error);
        return null;
    }
}

export async function findWorkbookWithTablesSimple(): Promise<Workbook | null> {
    try {
        const database = client.db('app');
        const collection = database.collection('workbooks');
        const result = await collection.findOne<Workbook>();
        const tables = await database.collection('tables').find<Table>({ workbookId: result?._id }).toArray();
        if (result !== null) {
            result.tables = tables;
        }

        return result;
    } catch (error) {
        console.error('Failed to find workbook with tables:', error);
        return null;
    }
}

export async function findWorkbookWithTablesAggregate(): Promise<Workbook | null> {
    try {
        const database = client.db('app');
        const collection = database.collection('workbooks');

        const result = await collection.aggregate<Workbook>([
            {
                $lookup: {
                    from: 'tables',
                    localField: '_id',
                    foreignField: 'workbookId',
                    as: 'tables'
                }
            },
            { $limit: 1 } // Fetch only one workbook
        ]).toArray();

        return result[0] || null;
    } catch (error) {
        console.error('Failed to find workbook with tables:', error);
        return null;
    }
}

export async function findWorkbookWithTablesAndFieldsSimple(): Promise<Workbook | null> {
    try {
        const database = client.db('app');
        const collection = database.collection('workbooks');
        const result = await collection.findOne<Workbook>();
        const tables = await database.collection('tables').find<Table>({ workbookId: result?._id }).toArray();
        const fields = await database.collection('fields').find<Field>({ tableId: tables[0]._id }).toArray();
        if (result !== null) {
            result.tables = tables;
            result.tables[0].fields = fields;
        }

        return result;
    } catch (error) {
        console.error('Failed to find workbook with tables:', error);
        return null;
    }
}

export async function findWorkbookWithTablesAndFieldsAggregate(): Promise<Workbook | null> {
    try {
        const database = client.db('app');
        const collection = database.collection('workbooks');

        const result = await collection.aggregate<Workbook>([
            {
                $lookup: {
                    from: 'tables',
                    localField: '_id',
                    foreignField: 'workbookId',
                    as: 'tables'
                }
                },
            {
                $unwind: '$tables'
            },
            {
                $lookup: {
                    from: 'fields',
                    localField: 'tables._id',
                    foreignField: 'tableId',
                    as: 'tables.fields'
                }
            },
            { $limit: 1 } // Fetch only one workbook
        ]).toArray();

        return result[0] || null;
    } catch (error) {
        console.error('Failed to find workbook with tables:', error);
        return null;
    }
}   

export async function findWorkbookWithTablesAndFieldsAndItemsSimple(): Promise<Workbook | null> {
    try {
        const database = client.db('app');
        const collection = database.collection('workbooks');
        const result = await collection.findOne<Workbook>();
        const tables = await database.collection('tables').find<Table>({ workbookId: result?._id }).toArray();
        const fields = await database.collection('fields').find<Field>({ tableId: tables[0]._id }).toArray();
        const items = await database.collection('items').find<Item>({ tableId: tables[0]._id }).toArray();
        if (result !== null) {
            result.tables = tables;
            result.tables[0].fields = fields;
            result.tables[0].items = items;
        }

        return result;
    } catch (error) {
        console.error('Failed to find workbook with tables:', error);
        return null;
    }
}

export async function findWorkbookWithTablesAndFieldsAndItemsAggregate(): Promise<Workbook | null> {
    try {
        const database = client.db('app');
        const collection = database.collection('workbooks');

        const result = await collection.aggregate<Workbook>([
            {
                $lookup: {
                    from: 'tables',
                    localField: '_id',
                    foreignField: 'workbookId',
                    as: 'tables'
                }
                },
            {
                $unwind: '$tables'
            },
            {
                $lookup: {
                    from: 'fields',
                    localField: 'tables._id',
                    foreignField: 'tableId',
                    as: 'tables.fields'
                }
            },
            {
                $lookup: {
                    from: 'items',
                    localField: 'tables._id',
                    foreignField: 'tableId',
                    as: 'tables.items'
                }
            },
            { $limit: 1 } // Fetch only one workbook
        ]).toArray();


        return result[0] || null;
    } catch (error) {
        console.error('Failed to find workbook with tables:', error);
        return null;
    }
}  

export async function findUserWithWorkbookWithTablesAndFieldsAndItemsAggregate(): Promise<User | null> {
    try {
        const database = client.db('app');
        const collection = database.collection('users');

        const result = await collection.aggregate<User>([
            { 
                $match: { 
                  _id: new ObjectId('67f78fabdb26954b9481f510') 
                }
              },
              { 
                $lookup: { 
                  from: "workbooks", 
                  localField: "_id", 
                  foreignField: "userId", 
                  as: "workbooks" 
                } 
              },
              { 
                $unwind: {
                  path: "$workbooks",
                  preserveNullAndEmptyArrays: true
                }
              },
              { 
                $lookup: { 
                  from: "tables", 
                  localField: "workbooks._id", 
                  foreignField: "workbookId", 
                  as: "workbooks.tables" 
                }
              },
              {
                $unwind: {
                  path: "$workbooks.tables",
                  preserveNullAndEmptyArrays: true
                }
              },
              {
                $lookup: {
                  from: "items",
                  localField: "workbooks.tables._id",
                  foreignField: "tableId",
                  as: "workbooks.tables.items"
                }
              },
              {
                $lookup: {
                  from: "fields",
                  localField: "workbooks.tables._id",
                  foreignField: "tableId",
                  as: "workbooks.tables.fields"
                }
              },
              {
                $group: {
                  _id: {
                    workbookId: "$workbooks._id",
                    tableId: "$workbooks.tables._id"
                  },
                  tableName: { $first: "$workbooks.tables.name" },
                  tableDescription: { $first: "$workbooks.tables.description" },
                  tableCreatedAt: { $first: "$workbooks.tables.createdAt" },
                  tableUpdatedAt: { $first: "$workbooks.tables.updatedAt" },
                  items: { $first: "$workbooks.tables.items" },
                  fields: { $first: "$workbooks.tables.fields" },
                  workbookName: { $first: "$workbooks.name" },
                  workbookDescription: { $first: "$workbooks.description" },
                  workbookCreatedAt: { $first: "$workbooks.createdAt" },
                  workbookUpdatedAt: { $first: "$workbooks.updatedAt" },
                  userId: { $first: "$_id" },
                  name: { $first: "$name" },
                  email: { $first: "$email" },
                  createdAt: { $first: "$createdAt" },
                  updatedAt: { $first: "$updatedAt" }
                }
              },
              {
                $group: {
                  _id: "$_id.workbookId",
                  workbookName: { $first: "$workbookName" },
                  workbookDescription: { $first: "$workbookDescription" },
                  workbookCreatedAt: { $first: "$workbookCreatedAt" },
                  workbookUpdatedAt: { $first: "$workbookUpdatedAt" },
                  userId: { $first: "$userId" },
                  name: { $first: "$name" },
                  email: { $first: "$email" },
                  createdAt: { $first: "$createdAt" },
                  updatedAt: { $first: "$updatedAt" },
                  tables: {
                    $push: {
                      _id: "$_id.tableId",
                      name: "$tableName",
                      createdAt: "$tableCreatedAt",
                      updatedAt: "$tableUpdatedAt",
                      description: "$tableDescription",
                      items: "$items",
                      fields: "$fields"
                    }
                  }
                }
              },
              {
                $group: {
                  _id: "$userId",
                  name: { $first: "$name" },
                  email: { $first: "$email" },
                  createdAt: { $first: "$createdAt" },
                  updatedAt: { $first: "$updatedAt" },
                  workbooks: {
                    $push: {
                      _id: "$_id",
                      name: "$workbookName",
                      description: "$workbookDescription",
                      createdAt: "$workbookCreatedAt",
                      updatedAt: "$workbookUpdatedAt",
                      tables: "$tables"
                    }
                  }
                }
              }
        ]).toArray();


        return result[0] || null;
    } catch (error) {
        console.error('Failed to find user with workbooks:', error);
        return null;
    }
}  

export async function findTablesWithNameContainingIEWithoutIndex(): Promise<Document[]> {
    try {
        await client.connect();
        const database = client.db('app');
        const collection = database.collection('tables');
        
        // Using $regex to find names containing both 'i' and 'e'
        const query = {
            name2: {
                $regex: '^(?=.*i)(?=.*e).*$',
                $options: 'i' // case-insensitive
            }
        };
        
        const data = await collection.find(query).limit(100).toArray();
        return data;
    } catch (error) {
        console.error('Failed to find tables:', error);
        return [];
    }
}

export async function findTablesWithNameContainingIEWithIndex(): Promise<Document[]> {
    try {
        await client.connect();
        const database = client.db('app');
        const collection = database.collection('tables');
        
        // Using $regex to find names containing both 'i' and 'e'
        const query = {
            name: {
                $regex: '^(?=.*i)(?=.*e).*$',
                $options: 'i' // case-insensitive
            }
        };
        
        const data = await collection.find(query).limit(100).toArray();
        return data;
    } catch (error) {
        console.error('Failed to find tables:', error);
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

    // Test the findOneFull function
    // const a: User | null = await findOneFull();
    // console.log(a?.name);
    // const b = await findUserWithWorkbookWithTablesAndFieldsAndItemsAggregate();
    // console.log(b?.name);
    // console.log(a?.name === b?.name);
    
    // // Write JSON to files
    // fs.writeFileSync('a.srt', JSON.stringify(a, null, 2));
    // fs.writeFileSync('b.srt', JSON.stringify(b, null, 2));

  } finally {
    await client.close();
  }
}

run().catch(console.dir); 