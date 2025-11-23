import { describe, it, expect } from 'vitest';
import { promises as fs } from 'fs';
import * as path from 'path';
import { fileURLToPath } from 'url';
import { parseLlmsTxt, isValidFilePath } from '../src/lib/parser';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

describe('Integration: Real llms.txt file', () => {
  it('should successfully parse the actual llms.txt file', async () => {
    const llmsTxtPath = path.resolve(__dirname, '../src/data/llm/llms.txt');
    
    // Check if file exists
    try {
      await fs.access(llmsTxtPath);
    } catch {
      // Skip test if file doesn't exist yet
      console.log('⚠️  llms.txt not found, skipping integration test');
      return;
    }

    const content = await fs.readFile(llmsTxtPath, 'utf-8');
    const files = parseLlmsTxt(content);

    // Basic sanity checks
    expect(files.length).toBeGreaterThan(0);
    expect(files.length).toBeLessThan(200); // Reasonable upper bound

    // All files should have valid paths
    files.forEach(file => {
      expect(isValidFilePath(file)).toBe(true);
    });

    // Should have some expected directories
    const directories = new Set(
      files.map(f => {
        const lastSlash = f.lastIndexOf('/');
        return lastSlash === -1 ? '.' : f.substring(0, lastSlash);
      })
    );

    // We expect at least components, forms, and pages
    expect(directories.has('components')).toBe(true);
    expect(directories.has('forms')).toBe(true);
    expect(directories.has('pages')).toBe(true);

    // All files should have extensions
    files.forEach(file => {
      const ext = path.extname(file);
      expect(['.md', '.txt']).toContain(ext);
    });

    // No duplicates
    const uniqueFiles = new Set(files);
    expect(uniqueFiles.size).toBe(files.length);

    console.log(`✅ Successfully parsed ${files.length} files from real llms.txt`);
  });

  it('should not have any security vulnerabilities in parsed paths', async () => {
    const llmsTxtPath = path.resolve(__dirname, '../src/data/llm/llms.txt');
    
    try {
      await fs.access(llmsTxtPath);
    } catch {
      return; // Skip if file doesn't exist
    }

    const content = await fs.readFile(llmsTxtPath, 'utf-8');
    const files = parseLlmsTxt(content);

    // Security checks
    files.forEach(file => {
      // No path traversal
      expect(file).not.toContain('..');
      
      // No absolute paths
      expect(file.startsWith('/')).toBe(false);
      expect(/^[a-zA-Z]:/.test(file)).toBe(false);
      
      // No null bytes
      expect(file).not.toContain('\0');
      
      // No dangerous characters
      expect(/[<>:"|?*]/.test(file)).toBe(false);
    });

    console.log('✅ Security validation passed for all parsed paths');
  });
});
