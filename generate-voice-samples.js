const fs = require('fs');
const path = require('path');

require('dotenv').config();
const OPENAI_API_KEY = process.env.OPENAI_API_KEY;

const voices = [
    { id: 'alloy', name: 'Alloy' },
    { id: 'echo', name: 'Echo' },
    { id: 'fable', name: 'Fable' },
    { id: 'onyx', name: 'Onyx' },
    { id: 'nova', name: 'Nova' },
    { id: 'shimmer', name: 'Shimmer' }
];

const sampleText = "Halo, ini adalah contoh suara voice ini. Cocok gak buat konten kamu?";
const outputDir = path.join(__dirname, 'public', 'voice-samples');

// Create directory if not exists
if (!fs.existsSync(outputDir)) {
    fs.mkdirSync(outputDir, { recursive: true });
}

async function generateVoiceSample(voiceId, voiceName) {
    console.log(`Generating sample for ${voiceName}...`);

    try {
        const response = await fetch('https://api.openai.com/v1/audio/speech', {
            method: 'POST',
            headers: {
                'Authorization': `Bearer ${OPENAI_API_KEY}`,
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({
                model: 'gpt-4o-mini-tts',
                voice: voiceId,
                input: sampleText,
                speed: 1.0
            })
        });

        if (!response.ok) {
            const errorText = await response.text();
            console.error(`❌ Error for ${voiceName}:`, response.status, errorText);
            return false;
        }

        const arrayBuffer = await response.arrayBuffer();
        const buffer = Buffer.from(arrayBuffer);

        const outputPath = path.join(outputDir, `${voiceId}.mp3`);
        fs.writeFileSync(outputPath, buffer);

        console.log(`✅ Generated: ${outputPath}`);
        return true;
    } catch (error) {
        console.error(`❌ Failed to generate ${voiceName}:`, error.message);
        return false;
    }
}

async function generateAllSamples() {
    console.log('🎤 Starting voice sample generation...\n');

    for (const voice of voices) {
        await generateVoiceSample(voice.id, voice.name);
        // Small delay to avoid rate limits
        await new Promise(resolve => setTimeout(resolve, 500));
    }

    console.log('\n✨ Done! Voice samples saved to public/voice-samples/');
}

generateAllSamples();
