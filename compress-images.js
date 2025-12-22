/**
 * 图片压缩脚本 - 将所有图片转换为 WebP 格式并压缩
 * 使用方法: node compress-images.js
 */

const sharp = require('sharp');
const fs = require('fs');
const path = require('path');

// 配置
const config = {
    quality: 80, // WebP 质量 (0-100)
    directories: [
        'assets/images',
        'assets/images/story'
    ]
};

// 统计
let stats = {
    processed: 0,
    savedBytes: 0,
    errors: []
};

async function compressImage(inputPath) {
    const ext = path.extname(inputPath).toLowerCase();
    if (!['.jpg', '.jpeg', '.png'].includes(ext)) {
        return;
    }

    const outputPath = inputPath.replace(/\.(jpg|jpeg|png)$/i, '.webp');
    const backupPath = inputPath + '.backup';

    try {
        const inputStats = fs.statSync(inputPath);
        const inputSize = inputStats.size;

        // 压缩为 WebP
        await sharp(inputPath)
            .webp({ quality: config.quality })
            .toFile(outputPath);

        const outputStats = fs.statSync(outputPath);
        const outputSize = outputStats.size;
        const saved = inputSize - outputSize;
        const percent = ((saved / inputSize) * 100).toFixed(1);

        // 备份原文件
        fs.renameSync(inputPath, backupPath);

        console.log(`✅ ${path.basename(inputPath)}`);
        console.log(`   ${(inputSize / 1024 / 1024).toFixed(2)}MB → ${(outputSize / 1024 / 1024).toFixed(2)}MB (节省 ${percent}%)`);

        stats.processed++;
        stats.savedBytes += saved;

    } catch (error) {
        console.error(`❌ 错误: ${inputPath} - ${error.message}`);
        stats.errors.push(inputPath);
    }
}

async function processDirectory(dir) {
    const fullPath = path.join(__dirname, dir);

    if (!fs.existsSync(fullPath)) {
        console.log(`⚠️ 目录不存在: ${dir}`);
        return;
    }

    const files = fs.readdirSync(fullPath);

    for (const file of files) {
        const filePath = path.join(fullPath, file);
        const stat = fs.statSync(filePath);

        if (stat.isFile()) {
            await compressImage(filePath);
        }
    }
}

async function main() {
    console.log('🚀 开始压缩图片...\n');
    console.log(`📋 质量设置: ${config.quality}%\n`);

    for (const dir of config.directories) {
        console.log(`\n📁 处理目录: ${dir}`);
        console.log('─'.repeat(40));
        await processDirectory(dir);
    }

    console.log('\n' + '═'.repeat(40));
    console.log('📊 压缩完成！');
    console.log(`   处理文件: ${stats.processed} 个`);
    console.log(`   节省空间: ${(stats.savedBytes / 1024 / 1024).toFixed(2)} MB`);

    if (stats.errors.length > 0) {
        console.log(`   失败文件: ${stats.errors.length} 个`);
    }

    console.log('\n⚠️ 原文件已备份为 .backup 后缀');
    console.log('💡 压缩完成后，请更新代码中的图片路径 (.jpg/.png → .webp)');
}

main().catch(console.error);
