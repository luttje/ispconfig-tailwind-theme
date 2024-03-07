import { describe, it, expect } from 'vitest';
import { liquidishTransform } from './index';
import { readFileSync } from 'fs';
import { resolve } from 'path';

const fixturesPath = resolve(__dirname, 'fixtures');

it('should return true', () => {
  expect(true).toBe(true);
});

it('should transform render statements', () => {
    const transformed = liquidishTransform(`{% render 'render-01-sub.liquid' %}`, resolve(fixturesPath, 'render-01.liquid'));
    const expected = readFileSync(resolve(fixturesPath, 'render-01.expected.htm'), 'utf8');

    expect(transformed).toBe(expected);
});
