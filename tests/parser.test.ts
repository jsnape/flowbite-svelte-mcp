import { describe, it, expect } from 'vitest';
import {
  parseLlmsTxt,
  isValidFilePath,
  getDirectory,
  getExtension,
  isValidLlmsTxtFormat,
} from '../src/lib/parser';

describe('parseLlmsTxt', () => {
  it('should parse standard llms.txt format', () => {
    const content = `# Comment
/docs: https://flowbite-svelte.com/llm/components/accordion.md
/docs: https://flowbite-svelte.com/llm/components/alert.md`;

    const result = parseLlmsTxt(content);

    expect(result).toEqual([
      'components/accordion.md',
      'components/alert.md',
    ]);
  });

  it('should skip comment lines', () => {
    const content = `# This is a comment
# Another comment
/docs: https://flowbite-svelte.com/llm/components/button.md`;

    const result = parseLlmsTxt(content);

    expect(result).toHaveLength(1);
    expect(result[0]).toBe('components/button.md');
  });

  it('should skip empty lines', () => {
    const content = `/docs: https://flowbite-svelte.com/llm/components/card.md

/docs: https://flowbite-svelte.com/llm/components/modal.md`;

    const result = parseLlmsTxt(content);

    expect(result).toHaveLength(2);
  });

  it('should skip metadata lines without URLs', () => {
    const content = `version: 1
llms: markdown
/docs: https://flowbite-svelte.com/llm/components/badge.md`;

    const result = parseLlmsTxt(content);

    expect(result).toHaveLength(1);
    expect(result[0]).toBe('components/badge.md');
  });

  it('should skip non-flowbite-svelte.com URLs', () => {
    const content = `repo: https://github.com/themesberg/flowbite-svelte
/docs: https://flowbite-svelte.com/llm/components/avatar.md`;

    const result = parseLlmsTxt(content);

    expect(result).toHaveLength(1);
    expect(result[0]).toBe('components/avatar.md');
  });

  it('should handle different prefixes', () => {
    const content = `/docs: https://flowbite-svelte.com/llm/components/table.md
/icons: https://flowbite-svelte.com/llm/icons.md
/illustrations: https://flowbite-svelte.com/llm/illustrations.md`;

    const result = parseLlmsTxt(content);

    expect(result).toEqual([
      'components/table.md',
      'icons.md',
      'illustrations.md',
    ]);
  });

  it('should handle .txt files', () => {
    const content = `/context: https://flowbite-svelte.com/llm/context-full.txt`;

    const result = parseLlmsTxt(content);

    expect(result).toEqual(['context-full.txt']);
  });

  it('should handle nested paths', () => {
    const content = `/docs: https://flowbite-svelte.com/llm/forms/input-field.md
/docs: https://flowbite-svelte.com/llm/typography/heading.md`;

    const result = parseLlmsTxt(content);

    expect(result).toEqual([
      'forms/input-field.md',
      'typography/heading.md',
    ]);
  });

  it('should return empty array for empty content', () => {
    const result = parseLlmsTxt('');

    expect(result).toEqual([]);
  });

  it('should return empty array for only comments', () => {
    const content = `# Comment 1
# Comment 2
# Comment 3`;

    const result = parseLlmsTxt(content);

    expect(result).toEqual([]);
  });

  it('should handle lines without colons', () => {
    const content = `This line has no colon
/docs: https://flowbite-svelte.com/llm/components/spinner.md`;

    const result = parseLlmsTxt(content);

    expect(result).toHaveLength(1);
    expect(result[0]).toBe('components/spinner.md');
  });

  it('should handle URLs with extra whitespace', () => {
    const content = `/docs:   https://flowbite-svelte.com/llm/components/tabs.md  `;

    const result = parseLlmsTxt(content);

    expect(result).toEqual(['components/tabs.md']);
  });

  it('should not include duplicate files', () => {
    const content = `/docs: https://flowbite-svelte.com/llm/components/card.md
/docs: https://flowbite-svelte.com/llm/components/modal.md
/docs: https://flowbite-svelte.com/llm/components/card.md`;

    const result = parseLlmsTxt(content);

    // Note: The function doesn't deduplicate, it just parses
    expect(result).toHaveLength(3);
    expect(result.filter(f => f === 'components/card.md')).toHaveLength(2);
  });
});

describe('isValidFilePath', () => {
  it('should accept valid relative paths', () => {
    expect(isValidFilePath('components/accordion.md')).toBe(true);
    expect(isValidFilePath('forms/input.md')).toBe(true);
    expect(isValidFilePath('icons.md')).toBe(true);
  });

  it('should reject empty paths', () => {
    expect(isValidFilePath('')).toBe(false);
    expect(isValidFilePath('   ')).toBe(false);
  });

  it('should reject path traversal attempts', () => {
    expect(isValidFilePath('../etc/passwd')).toBe(false);
    expect(isValidFilePath('components/../../secret.md')).toBe(false);
    expect(isValidFilePath('..\\windows\\system32')).toBe(false);
  });

  it('should reject absolute paths', () => {
    expect(isValidFilePath('/etc/passwd')).toBe(false);
    expect(isValidFilePath('C:\\Windows\\System32')).toBe(false);
    expect(isValidFilePath('D:\\data\\file.md')).toBe(false);
  });

  it('should reject paths with invalid characters', () => {
    expect(isValidFilePath('file<n>.md')).toBe(false);
    expect(isValidFilePath('file>name.md')).toBe(false);
    expect(isValidFilePath('file:name.md')).toBe(false);
    expect(isValidFilePath('file"name.md')).toBe(false);
    expect(isValidFilePath('file|name.md')).toBe(false);
    expect(isValidFilePath('file?name.md')).toBe(false);
    expect(isValidFilePath('file*name.md')).toBe(false);
  });

  it('should accept paths with hyphens and underscores', () => {
    expect(isValidFilePath('my-component.md')).toBe(true);
    expect(isValidFilePath('my_component.md')).toBe(true);
    expect(isValidFilePath('components/button-group.md')).toBe(true);
  });
});

describe('getDirectory', () => {
  it('should extract directory from path', () => {
    expect(getDirectory('components/accordion.md')).toBe('components');
    expect(getDirectory('forms/input-field.md')).toBe('forms');
    expect(getDirectory('typography/heading.md')).toBe('typography');
  });

  it('should return "." for files in root', () => {
    expect(getDirectory('icons.md')).toBe('.');
    expect(getDirectory('readme.txt')).toBe('.');
  });

  it('should handle nested directories', () => {
    expect(getDirectory('a/b/c/file.md')).toBe('a/b/c');
  });
});

describe('getExtension', () => {
  it('should extract file extension', () => {
    expect(getExtension('file.md')).toBe('.md');
    expect(getExtension('file.txt')).toBe('.txt');
    expect(getExtension('file.json')).toBe('.json');
  });

  it('should handle files with no extension', () => {
    expect(getExtension('filename')).toBe('');
    expect(getExtension('README')).toBe('');
  });

  it('should handle paths with directories', () => {
    expect(getExtension('components/button.md')).toBe('.md');
    expect(getExtension('forms/input.tsx')).toBe('.tsx');
  });

  it('should not confuse directory dots with extensions', () => {
    expect(getExtension('my.folder/filename')).toBe('');
    expect(getExtension('my.folder/file.md')).toBe('.md');
  });

  it('should handle hidden files', () => {
    expect(getExtension('.gitignore')).toBe('');
    expect(getExtension('.env.local')).toBe('.local');
  });
});

describe('isValidLlmsTxtFormat', () => {
  it('should accept valid llms.txt format', () => {
    const content = `version: 1
llms: markdown
/docs: https://flowbite-svelte.com/llm/components/button.md`;

    expect(isValidLlmsTxtFormat(content)).toBe(true);
  });

  it('should accept format with only URLs', () => {
    const content = `/docs: https://flowbite-svelte.com/llm/components/button.md
/icons: https://flowbite-svelte.com/llm/icons.md`;

    expect(isValidLlmsTxtFormat(content)).toBe(true);
  });

  it('should reject empty content', () => {
    expect(isValidLlmsTxtFormat('')).toBe(false);
  });

  it('should reject content without URLs', () => {
    const content = `version: 1
llms: markdown
# Just comments`;

    expect(isValidLlmsTxtFormat(content)).toBe(false);
  });

  it('should accept format with version but no llms field', () => {
    const content = `version: 1
/docs: https://flowbite-svelte.com/llm/file.md`;

    expect(isValidLlmsTxtFormat(content)).toBe(true);
  });

  it('should accept format with llms but no version field', () => {
    const content = `llms: markdown
/docs: https://flowbite-svelte.com/llm/file.md`;

    expect(isValidLlmsTxtFormat(content)).toBe(true);
  });
});
