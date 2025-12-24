#!/usr/bin/env node

/**
 * Fetch Demo Media Script
 * 
 * This script fetches sample images from Pexels API for showcase page
 */

const https = require('https');
const fs = require('fs');
const path = require('path');
require('dotenv').config();

const PEXELS_API_KEY = process.env.PEXELS_API_KEY;

// Demo media queries for each showcase example
const mediaQueries = [
    {
        id: 'tutorial-cooking',
        query: 'fried rice cooking',
        count: 2
    },
    {
        id: 'review-smartphone',
        query: 'smartphone technology',
        count: 2
    },
    {
        id: 'motivasi-pagi',
        query: 'morning motivation sunrise',
        count: 2
    },
    {
        id: 'tips-hemat',
        query: 'money saving finance',
        count: 2
    }
];

function fetchFromPexels(query, perPage = 2) {
    return new Promise((resolve, reject) => {
        const options = {
            hostname: 'api.pexels.com',
            path: `/v1/search?query=${encodeURIComponent(query)}&per_page=${perPage}&orientation=landscape`,
            headers: {
                'Authorization': PEXELS_API_KEY
            }
        };

        https.get(options, (res) => {
            let data = '';

            res.on('data', (chunk) => {
                data += chunk;
            });

            res.on('end', () => {
                if (res.statusCode === 200) {
                    resolve(JSON.parse(data));
                } else {
                    reject(new Error(`HTTP ${res.statusCode}: ${data}`));
                }
            });
        }).on('error', reject);
    });
}

function downloadImage(url, filepath) {
    return new Promise((resolve, reject) => {
        const file = fs.createWriteStream(filepath);

        https.get(url, (response) => {
            response.pipe(file);
            file.on('finish', () => {
                file.close();
                resolve();
            });
        }).on('error', (err) => {
            fs.unlink(filepath, () => { });
            reject(err);
        });
    });
}

async function fetchMediaForQuery(mediaQuery) {
    console.log(`\n📸 Fetching: ${mediaQuery.id}`);
    console.log(`   Query: "${mediaQuery.query}"`);

    try {
        const data = await fetchFromPexels(mediaQuery.query, mediaQuery.count);
        const photos = data.photos || [];

        console.log(`   Found: ${photos.length} photos`);

        // Create folder for this example
        const folder = path.join(__dirname, '../public/demo-media', mediaQuery.id);
        if (!fs.existsSync(folder)) {
            fs.mkdirSync(folder, { recursive: true });
        }

        // Download each photo
        for (let i = 0; i < photos.length; i++) {
            const photo = photos[i];
            const filename = `${mediaQuery.id}-${i + 1}.jpg`;
            const filepath = path.join(folder, filename);

            console.log(`   Downloading: ${filename}...`);
            await downloadImage(photo.src.large, filepath);

            const stats = fs.statSync(filepath);
            console.log(`   ✅ Saved: ${(stats.size / 1024).toFixed(2)} KB`);

            // Small delay between downloads
            await new Promise(resolve => setTimeout(resolve, 500));
        }

        return true;
    } catch (error) {
        console.error(`   ❌ Error: ${error.message}`);
        return false;
    }
}

async function main() {
    console.log('🖼️  Starting Demo Media Fetch...\n');
    console.log(`Total queries: ${mediaQueries.length}`);

    if (!PEXELS_API_KEY) {
        console.error('\n❌ PEXELS_API_KEY not found in environment variables!');
        process.exit(1);
    }

    let successCount = 0;

    for (const mediaQuery of mediaQueries) {
        const success = await fetchMediaForQuery(mediaQuery);
        if (success) successCount++;

        // Delay between queries to respect API rate limits
        await new Promise(resolve => setTimeout(resolve, 2000));
    }

    console.log(`\n✨ Fetch Complete!`);
    console.log(`   Success: ${successCount}/${mediaQueries.length}`);
    console.log(`   Output: /public/demo-media/\n`);
}

main().catch(console.error);
