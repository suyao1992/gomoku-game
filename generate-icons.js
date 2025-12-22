const sharp = require('sharp');
const path = require('path');
const fs = require('fs');

const sizes = [72, 96, 128, 144, 152, 192, 384, 512];
const inputPath = path.join(__dirname, 'assets/icons/icon-512x512.png');
const outputDir = path.join(__dirname, 'assets/icons');

async function generateIcons() {
    console.log('Generating PWA icons...');

    for (const size of sizes) {
        const outputPath = path.join(outputDir, `icon-${size}x${size}.png`);

        try {
            await sharp(inputPath)
                .resize(size, size, {
                    fit: 'cover',
                    position: 'center'
                })
                .png()
                .toFile(outputPath);

            console.log(`✓ Generated: icon-${size}x${size}.png`);
        } catch (err) {
            console.error(`✗ Failed to generate icon-${size}x${size}.png:`, err.message);
        }
    }

    // Generate Apple Touch Icon (180x180)
    const appleTouchPath = path.join(outputDir, 'apple-touch-icon.png');
    try {
        await sharp(inputPath)
            .resize(180, 180, { fit: 'cover', position: 'center' })
            .png()
            .toFile(appleTouchPath);
        console.log('✓ Generated: apple-touch-icon.png (180x180)');
    } catch (err) {
        console.error('✗ Failed to generate apple-touch-icon.png:', err.message);
    }

    console.log('\nDone! All icons generated.');
}

generateIcons().catch(console.error);
