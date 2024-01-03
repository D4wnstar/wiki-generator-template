import { describe, it, expect } from 'vitest';
import { slugifyPath, getPathCombinations } from '$lib/notes';

describe('sum test', () => {
	it('adds 1 + 2 to equal 3', () => {
		expect(1 + 2).toBe(3);
	});
});

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
	  expect(getPathCombinations('path/to/folder')).toEqual(['path', 'path/to', 'path/to/folder']);
	});
  
	it('should return the path itself when there are no slashes', () => {
	  expect(getPathCombinations('path')).toEqual(['path']);
	});
  
	it('should handle paths with multiple consecutive slashes', () => {
	  expect(getPathCombinations('path//to/folder')).toEqual(['path', 'path/to', 'path/to/folder']);
	});
  
	it('should return an empty array for an empty path', () => {
	  expect(getPathCombinations('')).toEqual([]);
	});
  });