import { describe, it, expect } from 'vitest';
import { LiquidishTransformer } from './index';
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

function getDefaultTransform(contents, path) {
    return new LiquidishTransformer().transform(contents, path);
}

describe('LiquidishTransformer (default)', () => {
    it('should transform variables', () => {
        const transformed = getDefaultTransform(`{{ VARIABLE }}`);
        expect(transformed).toBe('{tmpl_var name="VARIABLE"}');
    });

    it('should transform if statements', () => {
        const transformed = getDefaultTransform(`{% if VARIABLE %}`);
        expect(transformed).toBe('{tmpl_if name="VARIABLE"}');
    });

    it('should transform if statements with operators', () => {
        const transformed = getDefaultTransform(`{% if VARIABLE OPERATOR 'VALUE' %}`);
        expect(transformed).toBe('{tmpl_if name="VARIABLE" op="OPERATOR" value="VALUE"}');
    });

    it('should transform elsif statements', () => {
        const transformed = getDefaultTransform(`{% elsif VARIABLE %}`);
        expect(transformed).toBe('{tmpl_elseif name="VARIABLE"}');
    });

    it('should transform elsif statements with operators', () => {
        const transformed = getDefaultTransform(`{% elsif VARIABLE OPERATOR 'VALUE' %}`);
        expect(transformed).toBe('{tmpl_elseif name="VARIABLE" op="OPERATOR" value="VALUE"}');
    });

    it('should transform else statements', () => {
        const transformed = getDefaultTransform(`{% else %}`);
        expect(transformed).toBe('{tmpl_else}');
    });

    it('should transform endif statements', () => {
        const transformed = getDefaultTransform(`{% endif %}`);
        expect(transformed).toBe('{/tmpl_if}');
    });

    it('should transform unless statements', () => {
        const transformed = getDefaultTransform(`{% unless VARIABLE %}`);
        expect(transformed).toBe('{tmpl_unless name="VARIABLE"}');
    });

    it('should transform endunless statements', () => {
        const transformed = getDefaultTransform(`{% endunless %}`);
        expect(transformed).toBe('{/tmpl_unless}');
    });

    it('should transform loop statements', () => {
        const transformed = getDefaultTransform(`{% loop VARIABLE %}`);
        expect(transformed).toBe('{tmpl_loop name="VARIABLE"}');
    });

    it('should transform endloop statements', () => {
        const transformed = getDefaultTransform(`{% endloop %}`);
        expect(transformed).toBe('{/tmpl_loop}');
    });

    it('should transform dyninclude statements', () => {
        const transformed = getDefaultTransform(`{% dyninclude 'COMPONENT' %}`);
        expect(transformed).toBe('{tmpl_dyninclude name="COMPONENT"}');
    });

    it('should transform hook statements', () => {
        const transformed = getDefaultTransform(`{% hook 'HOOKNAME' %}`);
        expect(transformed).toBe('{tmpl_hook name="HOOKNAME"}');
    });

    it('should transform render statements', () => {
        const transformed = getDefaultTransform(`{% render 'render-basic.liquid' %}`, resolve(fixturesPath, 'render-basic.liquid'));
        const expected = readFixtureFile('render-basic.expected.htm');

        expect(transformed).toBe(expected);
    });

    it('should transform render statements with implicit .liquid extension', () => {
        const transformed = getDefaultTransform(`{% render 'render-basic' %}`, resolve(fixturesPath, 'render-basic.liquid'));
        const expected = readFixtureFile('render-basic.expected.htm');

        expect(transformed).toBe(expected);
    });

    it('should transform render statements within render statements', () => {
        const transformed = getDefaultTransform(`{% render 'render-sub-components.liquid' %}`, resolve(fixturesPath, 'render-sub-components.liquid'));
        const expected = readFixtureFile('render-sub-components.expected.htm');

        expect(transformed).toBe(expected);
    });

    it('should render variables with other quote types correctly', () => {
        const transformed = getDefaultTransform(`{% render 'render-attributes-component.liquid', slot: '{{ logout_txt }} {{ cpuser }}', attributes: 'data-load-content="login/logout.php"' %}`, resolve(fixturesPath, 'render-attributes.liquid'));
        const expected = readFixtureFile('render-attributes.expected.htm');

        expect(transformed).toBe(expected);
    });

    it('should not show comments by default', () => {
        const transformed = getDefaultTransform(`{% comment %} This is a comment {% endcomment %}`);
        expect(transformed).toBe('');
    });

    it('should not show multiline comment statements by default', () => {
        const transformed = getDefaultTransform(`{% comment %}\nThis is a comment\nwith multiple lines\n{% endcomment %}`);
        expect(transformed).toBe('');
    });
});

describe('LiquidishTransformer (customized)', () => {
    it('can be configured to allow no deep rendering', () => {
        const transformer = new LiquidishTransformer({ maxRenderDepth: 1 });

        expect(
            () => transformer.transform(`{% render 'render-sub-components.liquid' %}`, resolve(fixturesPath, 'render-sub-components.liquid'))
        ).toThrowError('Max render depth of 1 reached. Aborting transformation.');
    });

    it('can be configured to show comments as HTML comments', () => {
        const transformer = new LiquidishTransformer({ showComments: true });

        const transformed = transformer.transform(`{% comment %} This is a comment {% endcomment %}`);
        expect(transformed).toBe('<!-- This is a comment -->');
    });

    it('should transform multiline comment statements', () => {
        const transformer = new LiquidishTransformer({ showComments: true });

        const transformed = transformer.transform(`{% comment %}\nThis is a comment\nwith multiple lines\n{% endcomment %}`);
        expect(transformed).toBe('<!--\nThis is a comment\nwith multiple lines\n-->');
    });
});
