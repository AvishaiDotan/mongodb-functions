// @ts-ignore
const Benchmark = require('benchmark')
import { Event, Suite } from 'benchmark';
import { client, insertOne, insertMany, insert1000, connectionTest, insertBulkWrite, insert10K, findOne, find, findOneFull, findWorkbookWithTablesSimple, findWorkbookWithTablesAggregate, findWorkbookWithTablesAndFieldsSimple, findWorkbookWithTablesAndFieldsAggregate, findWorkbookWithTablesAndFieldsAndItemsSimple, findWorkbookWithTablesAndFieldsAndItemsAggregate, findTablesWithNameContainingIEWithIndex, findTablesWithNameContainingIEWithoutIndex } from '../index';

function formatNumber(num: number | undefined): string {
    if (num === undefined || isNaN(num)) return 'N/A';
    return num.toLocaleString('en-US', { maximumFractionDigits: 2 });
}

function formatTime(seconds: number | undefined): string {
    if (seconds === undefined || isNaN(seconds)) return 'N/A';
    return `${(seconds * 1000).toFixed(2)} ms`;
}

function printDetailedResults(suite: Suite) {
    console.log('\nDetailed Benchmark Results:');
    console.log('='.repeat(80));
    console.log('Test Name'.padEnd(40) + 'Ops/sec'.padStart(15) + 'Mean Time'.padStart(15) + 'Std Dev'.padStart(15));
    console.log('-'.repeat(80));

    suite.forEach((bench: any) => {
        const stats = bench.stats;
        const opsPerSec = formatNumber(bench.hz);
        const meanTime = formatTime(stats?.mean);
        const stdDev = formatTime(stats?.deviation);
        console.log(
            bench.name.padEnd(40) +
            opsPerSec.padStart(15) +
            meanTime.padStart(15) +
            stdDev.padStart(15)
        );
    });

    console.log('='.repeat(80));
    console.log('\nAdditional Statistics:');
    console.log('-'.repeat(80));
    // suite.forEach((bench: any) => {
    //     const stats = bench.stats;
    //     console.log(`\n${bench.name}:`, stats);
    // });
}

async function runBenchmarks(samples: number = 100) {
    try {
        console.log('Connected to MongoDB successfully');
        console.log(`Running benchmarks with ${samples} samples per test`);

        const suite: Suite = new Benchmark.Suite;

        // Add tests
        suite
            .add('Connection Test', {
                defer: true,
                minSamples: 1,


                fn: function (deferred: { resolve: () => void }) {
                    connectionTest().then(() => deferred.resolve());
                }
            })
            // .add('Insert One Document with ID', {
            //     defer: true,
            //     minSamples: samples,
            //     fn: function (deferred: { resolve: () => void }) {
            //         insertOne(true).then(() => deferred.resolve());
            //     }
            // })
            // .add('Insert One Document without ID', {
            //     defer: true,
            //     minSamples: samples,
            //     fn: function (deferred: { resolve: () => void }) {
            //         insertOne(false).then(() => deferred.resolve());
            //     }
            // })
            // .add('Insert 10 Documents with ID', {
            //     defer: true,
            //     minSamples: samples,
            //     fn: function (deferred: { resolve: () => void }) {
            //         insertMany(true).then(() => deferred.resolve());
            //     }
            // })
            // .add('Insert 10 Documents without ID', {
            //     defer: true,
            //     minSamples: samples,
            //     fn: function (deferred: { resolve: () => void }) {
            //         insertMany(false).then(() => deferred.resolve());
            //     }
            // })
            // .add('Insert 1000 Documents with ID (bulk)', {
            //     defer: true,
            //     minSamples: samples,
            //     fn: function (deferred: { resolve: () => void }) {
            //         insert1000(true).then(() => deferred.resolve());
            //     }
            // })
            // .add('Insert 1000 Documents without ID (bulk)', {
            //     defer: true,
            //     minSamples: samples,
            //     fn: function (deferred: { resolve: () => void }) {
            //         insert1000(false).then(() => deferred.resolve());
            //     }
            // })
            // .add('Insert 1000 Documents with ID (individual)', {
            //     defer: true,
            //     minSamples: samples,
            //     fn: function (deferred: { resolve: () => void }) {
            //         Promise.all(Array(1000).fill(null).map(() => insertOne(true)))
            //             .then(() => deferred.resolve());
            //     }
            // })
            // .add('Insert 1000 Documents without ID (individual)', {
            //     defer: true,
            //     minSamples: samples,
            //     fn: function (deferred: { resolve: () => void }) {
            //         Promise.all(Array(1000).fill(null).map(() => insertOne(false)))
            //             .then(() => deferred.resolve());
            //     }
            // })
            // .add('Insert 1000 Documents with ID (bulk write)', {
            //     defer: true,
            //     minSamples: samples,
            //     fn: function (deferred: { resolve: () => void }) {
            //         insertBulkWrite(true).then(() => deferred.resolve());
            //     }
            // })
            // .add('Insert 1000 Documents without ID (bulk write)', {
            //     defer: true,
            //     minSamples: samples,
            //     fn: function (deferred: { resolve: () => void }) {
            //         insertBulkWrite(false).then(() => deferred.resolve());
            //     }
            // })
            // .add('Insert 10k Documents with ID', {
            //     defer: true,
            //     minSamples: samples,
            //     fn: function (deferred: { resolve: () => void }) {
            //         insert10K(true).then(() => deferred.resolve());
            //     }
            // })
            // .add('Find One Document', {
            //     defer: true,
            //     minSamples: samples,
            //     fn: function (deferred: { resolve: () => void }) {
            //         findOne("users", {
                        
            //         }).then(() => deferred.resolve());
            //     }
            // })
            // .add('Find more then one Documents', {
            //     defer: true,
            //     minSamples: samples,
            //     fn: function (deferred: { resolve: () => void }) {
            //         find("users", {email: { $regex: "gmail", $options: "i" }}).then(() => deferred.resolve());
            //     }
            // })
            // .add('Find alot of documents', {
            //     defer: true,
            //     minSamples: samples,
            //     fn: function (deferred: { resolve: () => void }) {
            //         find("users", {}, 1000).then(() => deferred.resolve());
            //     }
            // })
            // .add("Find one user with enriched data", {
            //     defer: true,
            //     minSamples: samples,
            //     fn: function (deferred: { resolve: () => void }) {
            //         findOneFull().then(() => deferred.resolve());
            //     }
            // })
            // .add("Find workbook with tables - simple", {
            //     defer: true,
            //     minSamples: samples,
            //     fn: function (deferred: { resolve: () => void }) {
            //         findWorkbookWithTablesSimple().then(() => deferred.resolve());
            //     }
            // })
            // .add("Find workbook with tables - aggregate", {
            //     defer: true,
            //     minSamples: samples,
            //     fn: function (deferred: { resolve: () => void }) {
            //         findWorkbookWithTablesAggregate().then(() => deferred.resolve());
            //     }
            // })
            // .add("Find workbook with tables and fields - simple", {
            //     defer: true,
            //     minSamples: samples,
            //     fn: function (deferred: { resolve: () => void }) {
            //         findWorkbookWithTablesAndFieldsSimple().then(() => deferred.resolve());
            //     }
            // })
            // .add("Find workbook with tables and fields - aggregate", {
            //     defer: true,
            //     minSamples: samples,
            //     fn: function (deferred: { resolve: () => void }) {
            //         findWorkbookWithTablesAndFieldsAggregate().then(() => deferred.resolve());
            //     }
            // })
            // .add("Find workbook with tables and fields and items - simple", {
            //     defer: true,
            //     minSamples: samples,
            //     fn: function (deferred: { resolve: () => void }) {
            //         findWorkbookWithTablesAndFieldsAndItemsSimple().then(() => deferred.resolve());
            //     }
            // })
            // .add("Find workbook with tables and fields and items - aggregate", {
            //     defer: true,
            //     minSamples: samples,
            //     fn: function (deferred: { resolve: () => void }) {
            //         findWorkbookWithTablesAndFieldsAndItemsAggregate().then(() => deferred.resolve());
            //     }
            // })
            .add("Find tables with name containing 'ie' with index", {
                defer: true,
                minSamples: samples,
                fn: function (deferred: { resolve: () => void }) {
                    findTablesWithNameContainingIEWithIndex().then(() => deferred.resolve());
                }
            })
            .add("Find tables with name containing 'ie' without index", {
                defer: true,
                minSamples: samples,
                fn: function (deferred: { resolve: () => void }) {
                    findTablesWithNameContainingIEWithoutIndex().then(() => deferred.resolve());
                }
            })
            .on('cycle', function (event: Event) {
                console.log(String(event.target));
            })
            .on('complete', function (this: Suite) {
                console.log('\nFastest is ' + this.filter('fastest').map('name'));
                printDetailedResults(this);
                // Close the connection after benchmarks are complete
                client.close().then(() => {
                    console.log('\nMongoDB connection closed');
                    process.exit(0);
                });
            })
            // Run async
            .run({ 'async': true, });
    } catch (error) {
        console.error('Failed to run benchmarks:', error);
        process.exit(1);
    }
}

// Get samples from command line argument or use default
const samples = process.argv[2] ? parseInt(process.argv[2]) : 100;
runBenchmarks(samples); 