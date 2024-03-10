import { resolve } from 'path';
import { readFileSync } from 'fs';
import { trimTrailingNewline } from '../utils';

export const fixturesPath = resolve(__dirname, 'fixtures');

/**
 * Reads the contents of the fixture file with the provided name.
 * Trims the trailing newline, because it's a nice convention for our source files,
 * but in the rendered files it doesn't look good.
 */
export function readFixtureFile(name) {
    return trimTrailingNewline(readFileSync(resolve(fixturesPath, name), 'utf8'));
}
