#!/usr/bin/env tsx
/**
 * Post-build script to copy LLM data files to the build directory
 * This ensures the compiled code can find the data files at runtime
 * Run automatically after: npm run build
 */

import { promises as fs } from 'fs';
import * as path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const SOURCE_DIR = path.resolve(__dirname, '../src/data');
const DEST_DIR = path.resolve(__dirname, '../build/data');

/**
 * Recursively copy directory contents
 * @param {string} src - Source directory path
 * @param {string} dest - Destination directory path
 * @returns {Promise<void>}
 */
async function copyDir(src: string, dest: string): Promise<void> {
  await fs.mkdir(dest, { recursive: true });
  const entries = await fs.readdir(src, { withFileTypes: true });

  for (const entry of entries) {
    const srcPath = path.join(src, entry.name);
    const destPath = path.join(dest, entry.name);

    if (entry.isDirectory()) {
      await copyDir(srcPath, destPath);
    } else {
      await fs.copyFile(srcPath, destPath);
    }
  }
}

/**
 * Main execution
 * @returns {Promise<void>}
 */
async function main() {
  try {
    console.log('📦 Copying data files to build directory...');

    // Check if source directory exists
    try {
      await fs.access(SOURCE_DIR);
    } catch {
      console.error('❌ Error: Source data directory not found!');
      console.error(`   Expected: ${SOURCE_DIR}`);
      console.error('   Run "pnpm run copy:llm" first to populate the data directory.');
      process.exit(1);
    }

    // Copy data directory
    await fs.rm(DEST_DIR, { recursive: true, force: true });
    await copyDir(SOURCE_DIR, DEST_DIR);

    console.log('✅ Data files copied successfully!');
    console.log(`   From: ${SOURCE_DIR}`);
    console.log(`   To:   ${DEST_DIR}`);
  } catch (error) {
    console.error('❌ Copy failed:', error);
    process.exit(1);
  }
}

main();
