#!/usr/bin/env node

/**
 * Download Demo Videos Script v2
 * 
 * Reads from video-metadata.json and downloads the best quality available
 */

const https = require('https');
const fs = require('fs');
const path = require('path');
require('dotenv').config();

const examples = ['tutorial-cooking', 'review-smartphone', 'motivasi-pagi', 'tips-hemat'];

function downloadVideo(url, filepath, onProgress) {
    return new Promise((resolve, reject) => {
        const file = fs.createWriteStream(filepath);
        let downloadedBytes = 0;

        https.get(url, (response) => {
            const totalBytes = parseInt(response.headers['content-length'], 10);

            response.on('data', (chunk) => {
                downloadedBytes += chunk.length;
                if (onProgress && totalBytes) {
                    const percent = ((downloadedBytes / totalBytes) * 100).toFixed(1);
                    onProgress(downloadedBytes, totalBytes, percent);
                }
            });

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

async function downloadVideoForExample(exampleId) {
    console.log(`\n🎥 Processing: ${exampleId}`);

    try {
        const folder = path.join(__dirname, '../public/demo-media', exampleId);
        const metadataPath = path.join(folder, 'video-metadata.json');

        if (!fs.existsSync(metadataPath)) {
            console.log(`   ⚠️  No metadata found`);
            return false;
        }

        const metadata = JSON.parse(fs.readFileSync(metadataPath, 'utf8'));
        if (!metadata || metadata.length === 0) {
            console.log(`   ⚠️  Empty metadata`);
            return false;
        }

        const video = metadata[0];
        // Find 720p version or closest
        const videoFile = video.video_files.find(vf => vf.width === 720)
            || video.video_files.find(vf => vf.width === 540)
            || video.video_files[0];

        if (!videoFile || !videoFile.link) {
            console.log(`   ⚠️  No video link found`);
            return false;
        }

        const filename = `${exampleId}-demo.mp4`;
        const filepath = path.join(folder, filename);

        // Check if already exists and is valid
        if (fs.existsSync(filepath)) {
            const stats = fs.statSync(filepath);
            if (stats.size > 1000) { // More than 1KB means it's valid
                console.log(`   ⏭️  Already exists: ${(stats.size / 1024 / 1024).toFixed(2)} MB`);
                return true;
            } else {
                // Delete invalid file
                fs.unlinkSync(filepath);
            }
        }

        console.log(`   Downloading: ${videoFile.width}x${videoFile.height}`);

        let lastPercent = 0;
        await downloadVideo(videoFile.link, filepath, (downloaded, total, percent) => {
            if (parseFloat(percent) >= lastPercent + 10) {
                console.log(`   📥 Progress: ${percent}%`);
                lastPercent = parseFloat(percent);
            }
        });

        const stats = fs.statSync(filepath);
        console.log(`   ✅ Downloaded: ${(stats.size / 1024 / 1024).toFixed(2)} MB`);

        return true;
    } catch (error) {
        console.error(`   ❌ Error: ${error.message}`);
        return false;
    }
}

async function main() {
    console.log('🎬 Starting Demo Videos Download v2...\n');
    console.log(`Total examples: ${examples.length}`);

    let successCount = 0;

    for (const example of examples) {
        const success = await downloadVideoForExample(example);
        if (success) successCount++;

        await new Promise(resolve => setTimeout(resolve, 1000));
    }

    console.log(`\n✨ Download Complete!`);
    console.log(`   Success: ${successCount}/${examples.length}`);
    console.log(`   Output: /public/demo-media/*/\n`);
}

main().catch(console.error);
