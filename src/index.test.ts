import { describe, it, expect } from 'vitest';
import { slugifyPath, getPathCombinations, deletePathAndDescendants } from '$lib/notes';

describe('slugifyPath function', () => {
	it('should return a slug for a single word', () => {
		expect(slugifyPath('Hello')).toBe('hello');
	});

	it('should return a slug for a sentence', () => {
		expect(slugifyPath('Hello World')).toBe('hello-world');
	});

	it('should return a slug for a path with spaces', () => {
		expect(slugifyPath('Hello World/This is a test')).toBe('hello-world/this-is-a-test');
	});

	it('should remove special characters', () => {
		expect(slugifyPath("Don't use special characters!")).toBe('dont-use-special-characters');
	});

	it('should return a slug for a path with special characters', () => {
		expect(slugifyPath("Hello/Don't use special characters!")).toBe('hello/dont-use-special-characters');
	});

	it('should return a slug for a url', () => {
		expect(
			slugifyPath("some path/with spaces/don't/Break")
		).toBe("some-path/with-spaces/dont/break")
	});
});

describe('getPathCombinations function', () => {
	it('should return all combinations for a given path', () => {
	  expect(getPathCombinations('path/to/folder')).toEqual(new Set(['path', 'path/to', 'path/to/folder']));
	});
  
	it('should return the path itself when there are no slashes', () => {
	  expect(getPathCombinations('path')).toEqual(new Set(['path']));
	});
  
	it('should handle paths with multiple consecutive slashes', () => {
	  expect(getPathCombinations('path//to/folder')).toEqual(new Set(['path', 'path/to', 'path/to/folder']));
	});
  
	it('should return an empty array for an empty path', () => {
	  expect(getPathCombinations('')).toEqual(new Set());
	});
  });


  describe('deletePathAndDescendants function', () => {
	it('deletes a path and its children', () => {
		const paths = new Set([
			'path/to',
			'path/to/a',
			'path/to/b',
			'path/to/c',
			'path/other',
			'path/other/d'
		]);

		deletePathAndDescendants(paths, 'path/to');

		expect(paths.has('path/to')).toBe(false);
		expect(paths.has('path/to/a')).toBe(false);
		expect(paths.has('path/to/b')).toBe(false);
		expect(paths.has('path/to/c')).toBe(false);
		expect(paths.has('path/other')).toBe(true);
		expect(paths.has('path/other/d')).toBe(true);
	});

	it('does not delete unrelated paths', () => {
		const paths = new Set([
			'path/to',
			'path/to/a',
			'path/other',
			'path/other/d'
		]);

		deletePathAndDescendants(paths, 'path/to');

		expect(paths.has('path/to')).toBe(false);
		expect(paths.has('path/to/a')).toBe(false);
		expect(paths.has('path/other')).toBe(true);
		expect(paths.has('path/other/d')).toBe(true);
	});

	it('handles empty sets', () => {
		const paths = new Set<string>();

		deletePathAndDescendants(paths, 'path/to');

		expect(paths.size).toBe(0);
	});

	it('handles paths not in the set', () => {
		const paths = new Set([
			'path/to',
			'path/to/a',
			'path/other',
			'path/other/d'
		]);

		deletePathAndDescendants(paths, 'path/nonexistent');

		expect(paths.has('path/to')).toBe(true);
		expect(paths.has('path/to/a')).toBe(true);
		expect(paths.has('path/other')).toBe(true);
		expect(paths.has('path/other/d')).toBe(true);
	});
});