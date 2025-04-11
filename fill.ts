import { InsertManyResult, InsertOneResult, MongoClient, BulkWriteResult } from 'mongodb';
import config from './config';
import { EntityGeneratorService, Field, Item, Table, User, Workbook } from './helpers/entity-generator.service';
const TOTAL_DOCUMENTS = 100000000000; // 100 billion
const CHUNK_SIZE = 10000; // Number of documents to insert in each batch

export async function fill100BillionEntries(): Promise<void> {
    console.log('Starting data insertion process...');
    console.log(`Total documents to insert: ${TOTAL_DOCUMENTS.toLocaleString()}`);
    console.log(`Batch size: ${CHUNK_SIZE.toLocaleString()} documents per batch`);
    console.log('----------------------------------------');

    let processedCount = 0;
    let lastProgressUpdate = 0;
    const progressInterval = 1000000; // Update progress every 1 million documents

    try {
        while (processedCount < TOTAL_DOCUMENTS) {
            const batchSize = Math.min(CHUNK_SIZE, TOTAL_DOCUMENTS - processedCount);
            
            console.log(`\nProcessing batch ${Math.ceil(processedCount / CHUNK_SIZE) + 1}...`);
            console.log(`Generating ${batchSize.toLocaleString()} random records...`);
            const users = EntityGeneratorService.generateUsers(batchSize);
            console.log('Random users generated successfully');

            const startTime = Date.now();
            console.log('Inserting documents into MongoDB...');
            
            // Process each user individually using insertEntityWithSubEntities
            for (const user of users) {
                await insertEntityWithSubEntities(user);
            }

            const duration = (Date.now() - startTime) / 1000;
            const rate = users.length / duration;

            processedCount += users.length;

            if (processedCount - lastProgressUpdate >= progressInterval) {
                const progress = (processedCount / TOTAL_DOCUMENTS * 100).toFixed(4);
                console.log('\n----------------------------------------');
                console.log(`Progress Update:`);
                console.log(`- Overall Progress: ${progress}%`);
                console.log(`- Documents Processed: ${processedCount.toLocaleString()}`);
                console.log(`- Documents Remaining: ${(TOTAL_DOCUMENTS - processedCount).toLocaleString()}`);
                console.log(`- Last Batch Performance:`);
                console.log(`  - Documents: ${users.length.toLocaleString()}`);
                console.log(`  - Duration: ${duration.toFixed(2)}s`);
                console.log(`  - Rate: ${rate.toLocaleString()} docs/s`);
                console.log('----------------------------------------');
                lastProgressUpdate = processedCount;
            }
        }

        console.log('\n========================================');
        console.log('Data insertion completed successfully!');
        console.log(`Total documents processed: ${processedCount.toLocaleString()}`);
        console.log('========================================');
    } catch (error) {
        console.error('\nError during data insertion:');
        console.error(error);
        console.log(`Process stopped at ${processedCount.toLocaleString()} documents`);
    }
}

export async function insertEntityWithSubEntities(entity: User) {
    console.log('\nStarting entity insertion process...');
    const startTime = Date.now();
    const client = new MongoClient(config.mongoURI);
    try {
        console.log('Connecting to MongoDB...');
        await client.connect();
        console.log('Successfully connected to MongoDB');
        
        const db = client.db('app');
        console.log('Using database: app');

        const usersCollection = db.collection('users');
        const workbookCollection = db.collection('workbooks');
        const tableCollection = db.collection('tables');
        const itemCollection = db.collection('items');
        const fieldCollection = db.collection('fields');

        console.log('\nInserting user data...');
        const userToInsert = {
            ...entity,
            workbooks: []
        }
        const { insertedId: userId } = await usersCollection.insertOne(userToInsert);
        console.log(`User inserted successfully with ID: ${userId}`);

        console.log(`\nProcessing ${entity.workbooks.length} workbooks...`);
        for (const workbook of entity.workbooks) {
            console.log(`\nInserting workbook: ${workbook.name}`);
            const workbookToInsert = {
                userId,
                ...workbook,
                tables: []
            };
            const { insertedId: workbookId } = await workbookCollection.insertOne(workbookToInsert);
            console.log(`Workbook inserted with ID: ${workbookId}`);

            console.log(`Processing ${workbook.tables.length} tables...`);
            for (const table of workbook.tables) {
                console.log(`\nInserting table: ${table.name}`);
                const tableToInsert = {
                    ...table,
                    fields: [],
                    items: [],
                    workbookId
                };

                const { insertedId: tableId } = await tableCollection.insertOne(tableToInsert);
                console.log(`Table inserted with ID: ${tableId}`);

                console.log(`Processing ${table.items.length} items...`);
                for (const item of table.items) {
                    const itemToInsert = {
                        ...item,
                        tableId
                    };
                    await itemCollection.insertOne(itemToInsert);
                }
                console.log(`Successfully inserted ${table.items.length} items`);

                console.log(`Processing ${table.fields.length} fields...`);
                for (const field of table.fields) {
                    const fieldToInsert = {
                        ...field,
                        tableId
                    };
                    await fieldCollection.insertOne(fieldToInsert);
                }
                console.log(`Successfully inserted ${table.fields.length} fields`);
            }
        }

        const duration = (Date.now() - startTime) / 1000;
        console.log('\n========================================');
        console.log('Entity insertion completed successfully!');
        console.log(`Total duration: ${duration.toFixed(2)} seconds`);
        console.log('========================================');

    } catch (err) {
        console.error('\nError during entity insertion:');
        console.error(err);
        const duration = (Date.now() - startTime) / 1000;
        console.log(`Process failed after ${duration.toFixed(2)} seconds`);
    } finally {
        console.log('\nClosing MongoDB connection...');
        await client.close();
        console.log('Connection closed successfully');
    }
}

console.log('Starting fill100BillionEntries process...');
fill100BillionEntries();
