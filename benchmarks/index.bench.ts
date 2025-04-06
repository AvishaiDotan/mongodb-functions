// @ts-ignore
const Benchmark = require('benchmark')
import { Event, Suite } from 'benchmark';
import { client, insertOne, insertMany, insert1000, connectionTest, insertBulkWrite, insertMillion, findOne, find } from '../index';

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
        // Connect to MongoDB
        await client.connect();
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
            // .add('Insert 1000000 Documents with ID', {
            //     defer: true,
            //     minSamples: samples,
            //     fn: function (deferred: { resolve: () => void }) {
            //         insertMillion(true).then(() => deferred.resolve());
            //     }
            // })
            .add('Find One Document', {
                defer: true,
                minSamples: samples,
                fn: function (deferred: { resolve: () => void }) {
                    findOne({
                        _id: 'cc9a53c0-685e-4e1c-9396-3658178e1a30'
                    }).then(() => deferred.resolve());
                }
            })
            .add('Find more then one Documents', {
                defer: true,
                minSamples: samples,
                fn: function (deferred: { resolve: () => void }) {
                    find({age: 23}).then(() => deferred.resolve());
                }
            })
            .add('Find alot of documents', {
                defer: true,
                minSamples: samples,
                fn: function (deferred: { resolve: () => void }) {
                    find({}).then(() => deferred.resolve());
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
            .run({ 'async': true });
    } catch (error) {
        console.error('Failed to run benchmarks:', error);
        process.exit(1);
    }
}

// Get samples from command line argument or use default
const samples = process.argv[2] ? parseInt(process.argv[2]) : 100;
runBenchmarks(samples); 