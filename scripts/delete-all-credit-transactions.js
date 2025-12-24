#!/usr/bin/env node

/**
 * Delete All Credit Transactions Script
 * 
 * WARNING: This will permanently delete ALL credit transaction records
 * Use with caution!
 */

const { PrismaClient } = require('@prisma/client');
const readline = require('readline');

const prisma = new PrismaClient();

const rl = readline.createInterface({
    input: process.stdin,
    output: process.stdout
});

function askQuestion(question) {
    return new Promise((resolve) => {
        rl.question(question, (answer) => {
            resolve(answer);
        });
    });
}

async function main() {
    console.log('\n⚠️  WARNING: Delete All Credit Transactions\n');
    console.log('This will permanently delete ALL credit transaction records from the database.');
    console.log('This action CANNOT be undone!\n');

    try {
        // Count existing transactions
        const count = await prisma.creditTransaction.count();
        console.log(`📊 Current credit transactions in database: ${count}\n`);

        if (count === 0) {
            console.log('✅ No credit transactions found. Nothing to delete.\n');
            rl.close();
            return;
        }

        // First confirmation
        const answer1 = await askQuestion('Are you sure you want to delete ALL credit transactions? (yes/no): ');

        if (answer1.toLowerCase() !== 'yes') {
            console.log('\n❌ Operation cancelled.\n');
            rl.close();
            return;
        }

        // Second confirmation (extra safety)
        const answer2 = await askQuestion(`\nType "DELETE ALL ${count} TRANSACTIONS" to confirm: `);

        if (answer2 !== `DELETE ALL ${count} TRANSACTIONS`) {
            console.log('\n❌ Confirmation text does not match. Operation cancelled.\n');
            rl.close();
            return;
        }

        console.log('\n🗑️  Deleting all credit transactions...');

        // Perform deletion
        const result = await prisma.creditTransaction.deleteMany({});

        console.log(`✅ Successfully deleted ${result.count} credit transactions.\n`);

    } catch (error) {
        console.error('\n❌ Error:', error.message);
    } finally {
        rl.close();
        await prisma.$disconnect();
    }
}

main().catch(console.error);
