#!/usr/bin/env node

/**
 * Fetch Demo Videos Script
 * 
 * This script fetches sample videos from Pexels API for showcase page
 */

const https = require('https');
const fs = require('fs');
const path = require('path');
require('dotenv').config();

const PEXELS_API_KEY = process.env.PEXELS_API_KEY;

// Demo video queries for each showcase example
const videoQueries = [
    {
        id: 'tutorial-cooking',
        query: 'cooking food preparation',
        count: 1
    },
    {
        id: 'review-smartphone',
        query: 'smartphone hands on',
        count: 1
    },
    {
        id: 'motivasi-pagi',
        query: 'morning sunrise motivation',
        count: 1
    },
    {
        id: 'tips-hemat',
        query: 'money saving piggy bank',
        count: 1
    }
];

function fetchVideosFromPexels(query, perPage = 1) {
    return new Promise((resolve, reject) => {
        const options = {
            hostname: 'api.pexels.com',
            path: `/videos/search?query=${encodeURIComponent(query)}&per_page=${perPage}&orientation=portrait`,
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

function downloadVideo(url, filepath) {
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

async function fetchVideoForQuery(videoQuery) {
    console.log(`\n🎥 Fetching: ${videoQuery.id}`);
    console.log(`   Query: "${videoQuery.query}"`);

    try {
        const data = await fetchVideosFromPexels(videoQuery.query, videoQuery.count);
        const videos = data.videos || [];

        console.log(`   Found: ${videos.length} videos`);

        // Create folder for this example
        const folder = path.join(__dirname, '../public/demo-media', videoQuery.id);
        if (!fs.existsSync(folder)) {
            fs.mkdirSync(folder, { recursive: true });
        }

        // Save video metadata as JSON
        const metadataPath = path.join(folder, 'video-metadata.json');
        const metadata = videos.map(v => ({
            id: v.id,
            width: v.width,
            height: v.height,
            duration: v.duration,
            image: v.image,
            video_files: v.video_files.map(vf => ({
                quality: vf.quality,
                width: vf.width,
                height: vf.height,
                link: vf.link
            }))
        }));

        fs.writeFileSync(metadataPath, JSON.stringify(metadata, null, 2));
        console.log(`   ✅ Saved metadata: ${metadata.length} videos`);

        // Download first video thumbnail
        if (videos.length > 0 && videos[0].image) {
            const filename = `${videoQuery.id}-video-thumb.jpg`;
            const filepath = path.join(folder, filename);

            console.log(`   Downloading thumbnail: ${filename}...`);
            await downloadVideo(videos[0].image, filepath);

            const stats = fs.statSync(filepath);
            console.log(`   ✅ Thumbnail saved: ${(stats.size / 1024).toFixed(2)} KB`);
        }

        return true;
    } catch (error) {
        console.error(`   ❌ Error: ${error.message}`);
        return false;
    }
}

async function main() {
    console.log('🎬 Starting Demo Videos Fetch...\n');
    console.log(`Total queries: ${videoQueries.length}`);

    if (!PEXELS_API_KEY) {
        console.error('\n❌ PEXELS_API_KEY not found in environment variables!');
        process.exit(1);
    }

    let successCount = 0;

    for (const videoQuery of videoQueries) {
        const success = await fetchVideoForQuery(videoQuery);
        if (success) successCount++;

        // Delay between queries to respect API rate limits
        await new Promise(resolve => setTimeout(resolve, 2000));
    }

    console.log(`\n✨ Fetch Complete!`);
    console.log(`   Success: ${successCount}/${videoQueries.length}`);
    console.log(`   Output: /public/demo-media/*/video-metadata.json\n`);
}

main().catch(console.error);
