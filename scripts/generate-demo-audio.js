#!/usr/bin/env node

/**
 * Generate Demo Audio Script
 * 
 * This script generates demo TTS audio files for showcase page
 * using OpenAI TTS API
 */

const OpenAI = require('openai');
const fs = require('fs');
const path = require('path');
require('dotenv').config();

const openai = new OpenAI({
    apiKey: process.env.OPENAI_API_KEY
});

// Demo scripts for TTS generation
const demoScripts = [
    {
        id: 'tutorial-cooking-hook',
        filename: 'tutorial-cooking-hook.mp3',
        text: 'Pernah nggak sih bikin nasi goreng malah jadi nasi kering?',
        voice: 'nova'
    },
    {
        id: 'tutorial-cooking-intro',
        filename: 'tutorial-cooking-intro.mp3',
        text: 'Hai sobat dapur! Hari ini aku bakal share trik bikin nasi goreng yang PERFECT, dijamin nggak gagal!',
        voice: 'nova'
    },
    {
        id: 'review-smartphone-hook',
        filename: 'review-smartphone-hook.mp3',
        text: 'HP 3 jutaan dengan kamera 200MP? Worth it nggak sih?',
        voice: 'nova'
    },
    {
        id: 'motivasi-pagi-hook',
        filename: 'motivasi-pagi-hook.mp3',
        text: 'Kenapa lo masih stuck di zona nyaman?',
        voice: 'nova'
    },
    {
        id: 'tips-hemat-hook',
        filename: 'tips-hemat-hook.mp3',
        text: 'Gaji selalu habis sebelum tanggal tua? Fix, tonton ini!',
        voice: 'nova'
    }
];

async function generateAudio(script) {
    console.log(`\n🎤 Generating: ${script.filename}`);
    console.log(`   Text: "${script.text}"`);
    console.log(`   Voice: ${script.voice}`);

    try {
        const mp3 = await openai.audio.speech.create({
            model: 'gpt-4o-mini-tts',
            voice: script.voice,
            input: script.text,
            response_format: 'mp3'
        });

        const buffer = Buffer.from(await mp3.arrayBuffer());
        const outputPath = path.join(__dirname, '../public/demo-audio', script.filename);

        await fs.promises.writeFile(outputPath, buffer);

        const stats = fs.statSync(outputPath);
        console.log(`   ✅ Saved: ${outputPath} (${(stats.size / 1024).toFixed(2)} KB)`);

        return true;
    } catch (error) {
        console.error(`   ❌ Error: ${error.message}`);
        return false;
    }
}

async function main() {
    console.log('🎵 Starting Demo Audio Generation...\n');
    console.log(`Total scripts: ${demoScripts.length}`);

    let successCount = 0;

    for (const script of demoScripts) {
        const success = await generateAudio(script);
        if (success) successCount++;

        // Small delay between requests to avoid rate limiting
        await new Promise(resolve => setTimeout(resolve, 1000));
    }

    console.log(`\n✨ Generation Complete!`);
    console.log(`   Success: ${successCount}/${demoScripts.length}`);
    console.log(`   Output: /public/demo-audio/\n`);
}

main().catch(console.error);
