/**
 * Parsing utilities for llms.txt files
 */

import { BASE_URL } from './constants.js';

/**
 * Parse llms.txt content to extract documentation file paths
 * @param {string} content - The raw llms.txt content
 * @returns {string[]} Array of relative file paths
 */
export function parseLlmsTxt(content: string): string[] {
  const lines = content.split('\n');
  const files: string[] = [];

  for (const line of lines) {
    const trimmed = line.trim();
    // Skip comments and empty lines
    if (!trimmed || trimmed.startsWith('#')) continue;

    // Parse lines in format: /prefix: https://domain.com/llm/path/to/file.md
    const colonIndex = trimmed.indexOf(':');
    if (colonIndex === -1) continue;

    const urlPart = trimmed.substring(colonIndex + 1).trim();

    // Extract path from URL
    if (urlPart.startsWith(BASE_URL)) {
      const urlPath = urlPart.replace(BASE_URL, '');
      if (urlPath.startsWith('/llm/')) {
        files.push(urlPath.replace('/llm/', ''));
      }
    }
  }

  return files;
}

/**
 * Validate a parsed file path
 * @param {string} filePath - The file path to validate
 * @returns {boolean} True if the path is valid
 */
export function isValidFilePath(filePath: string): boolean {
  // Check for empty path
  if (!filePath || filePath.trim() === '') return false;

  // Check for path traversal attempts
  if (filePath.includes('..')) return false;

  // Check for invalid characters (Windows + Unix)
  if (/[<>:"|?*\0]/.test(filePath)) return false;

  // Check for absolute paths
  if (filePath.startsWith('/') || /^[a-zA-Z]:/.test(filePath)) return false;

  return true;
}

/**
 * Extract directory from file path
 * @param {string} filePath - The file path
 * @returns {string} Directory name or '.' for root
 */
export function getDirectory(filePath: string): string {
  const lastSlash = filePath.lastIndexOf('/');
  if (lastSlash === -1) return '.';
  return filePath.substring(0, lastSlash);
}

/**
 * Extract file extension from file path
 * @param {string} filePath - The file path
 * @returns {string} File extension including the dot, or empty string
 */
export function getExtension(filePath: string): string {
  const lastDot = filePath.lastIndexOf('.');
  const lastSlash = filePath.lastIndexOf('/');
  
  // Dot must be after the last slash (if any) and not be the first character
  if (lastDot > lastSlash && lastDot > 0) {
    return filePath.substring(lastDot);
  }
  
  return '';
}

/**
 * Check if content looks like valid llms.txt format
 * @param {string} content - The content to check
 * @returns {boolean} True if it appears to be valid llms.txt
 */
export function isValidLlmsTxtFormat(content: string): boolean {
  const lines = content.split('\n');
  
  // Should have at least some content
  if (lines.length === 0) return false;
  
  // Look for URLs - the minimum requirement for llms.txt
  const hasUrls = lines.some(l => l.includes('https://'));
  
  // At minimum, should have URLs (metadata fields are optional)
  return hasUrls;
}
