import sharp from 'sharp';
import path from 'path';
import { fileURLToPath } from 'url';
import { dirname } from 'path';
import fs from 'fs';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

async function generatePWAIcons() {
    const inputPath = path.join(__dirname, 'public', 'logo.png');
    const outputPath = path.join(__dirname, 'public');
    
    // Check if logo.png exists
    if (!fs.existsSync(inputPath)) {
        console.error('Error: logo.png not found in public directory');
        return;
    }
    
    try {
        // Generate 192x192 icon
        await sharp(inputPath)
            .resize(192, 192)
            .png()
            .toFile(path.join(outputPath, 'pwa-192x192.png'));
        
        // Generate 512x512 icon
        await sharp(inputPath)
            .resize(512, 512)
            .png()
            .toFile(path.join(outputPath, 'pwa-512x512.png'));
        
        console.log('PWA icons generated successfully!');
        console.log('- pwa-192x192.png');
        console.log('- pwa-512x512.png');
    } catch (error) {
        console.error('Error generating PWA icons:', error);
    }
}

generatePWAIcons();