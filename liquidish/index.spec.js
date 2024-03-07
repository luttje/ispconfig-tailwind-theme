import { describe, it, expect } from 'vitest';
import { liquidishTransform } from './index';
import { readFileSync } from 'fs';
import { resolve } from 'path';
import { trimTrailingNewline } from './utils';

const fixturesPath = resolve(__dirname, 'fixtures');

/**
 * Reads the contents of the fixture file with the provided name.
 * Trims the trailing newline, because it's a nice convention for our source files,
 * but in the rendered files it doesn't look good.
 */
function readFixtureFile(name) {
    return trimTrailingNewline(readFileSync(resolve(fixturesPath, name), 'utf8'));
}

describe('liquidishTransform', () => {
    it('should transform variables', () => {
        const transformed = liquidishTransform(`{{ VARIABLE }}`);
        expect(transformed).toBe('{tmpl_var name="VARIABLE"}');
    });

    it('should transform if statements', () => {
        const transformed = liquidishTransform(`{% if VARIABLE %}`);
        expect(transformed).toBe('{tmpl_if name="VARIABLE"}');
    });

    it('should transform if statements with operators', () => {
        const transformed = liquidishTransform(`{% if VARIABLE OPERATOR 'VALUE' %}`);
        expect(transformed).toBe('{tmpl_if name="VARIABLE" op="OPERATOR" value="VALUE"}');
    });

    it('should transform elsif statements', () => {
        const transformed = liquidishTransform(`{% elsif VARIABLE %}`);
        expect(transformed).toBe('{tmpl_elseif name="VARIABLE"}');
    });

    it('should transform elsif statements with operators', () => {
        const transformed = liquidishTransform(`{% elsif VARIABLE OPERATOR 'VALUE' %}`);
        expect(transformed).toBe('{tmpl_elseif name="VARIABLE" op="OPERATOR" value="VALUE"}');
    });

    it('should transform else statements', () => {
        const transformed = liquidishTransform(`{% else %}`);
        expect(transformed).toBe('{tmpl_else}');
    });

    it('should transform endif statements', () => {
        const transformed = liquidishTransform(`{% endif %}`);
        expect(transformed).toBe('{/tmpl_if}');
    });

    it('should transform unless statements', () => {
        const transformed = liquidishTransform(`{% unless VARIABLE %}`);
        expect(transformed).toBe('{tmpl_unless name="VARIABLE"}');
    });

    it('should transform endunless statements', () => {
        const transformed = liquidishTransform(`{% endunless %}`);
        expect(transformed).toBe('{/tmpl_unless}');
    });

    it('should transform loop statements', () => {
        const transformed = liquidishTransform(`{% loop VARIABLE %}`);
        expect(transformed).toBe('{tmpl_loop name="VARIABLE"}');
    });

    it('should transform endloop statements', () => {
        const transformed = liquidishTransform(`{% endloop %}`);
        expect(transformed).toBe('{/tmpl_loop}');
    });

    it('should transform dyninclude statements', () => {
        const transformed = liquidishTransform(`{% dyninclude 'COMPONENT' %}`);
        expect(transformed).toBe('{tmpl_dyninclude name="COMPONENT"}');
    });

    it('should transform hook statements', () => {
        const transformed = liquidishTransform(`{% hook 'HOOKNAME' %}`);
        expect(transformed).toBe('{tmpl_hook name="HOOKNAME"}');
    });

    it('should transform render statements', () => {
        const transformed = liquidishTransform(`{% render 'render-01.liquid' %}`, resolve(fixturesPath, 'render-01.liquid'));
        const expected = readFixtureFile('render-01.expected.htm');

        expect(transformed).toBe(expected);
    });

    it('should transform render statements within render statements', () => {
        const transformed = liquidishTransform(`{% render 'render-02.liquid' %}`, resolve(fixturesPath, 'render-02.liquid'));
        const expected = readFixtureFile('render-02.expected.htm');

        expect(transformed).toBe(expected);
    });
});
