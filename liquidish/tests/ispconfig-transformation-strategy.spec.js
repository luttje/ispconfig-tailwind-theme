import { describe, it, expect } from 'vitest';
import { resolve } from 'path';
import { ISPConfigTransformationStrategy } from '../strategies/ispconfig-transformation-strategy';
import { LiquidishTransformer } from '../transformer';
import { fixturesPath, readFixtureFile } from './test-utils';

function getISPConfigTransform(contents, path) {
    return new LiquidishTransformer({
        strategyBuilder: (transformer) => new ISPConfigTransformationStrategy(transformer)
    }).transform(contents, path ?? fixturesPath);
}

describe('ISPConfig Transformation Strategy', () => {
    it('should transform variables', () => {
        const transformed = getISPConfigTransform(`{{ VARIABLE }}`);
        expect(transformed).toBe('{tmpl_var name="VARIABLE"}');
    });

    it('should transform if statements', () => {
        const transformed = getISPConfigTransform(`{% if VARIABLE %}`);
        expect(transformed).toBe('{tmpl_if name="VARIABLE"}');
    });

    it('should transform if statements with operators', () => {
        const transformed1 = getISPConfigTransform(`{% if VARIABLE OPERATOR 'VALUE' %}`);
        const transformed2 = getISPConfigTransform(`{% if VARIABLE OPERATOR "VALUE" %}`);
        expect(transformed1).toBe('{tmpl_if name="VARIABLE" op="OPERATOR" value="VALUE"}');
        expect(transformed2).toBe('{tmpl_if name="VARIABLE" op="OPERATOR" value="VALUE"}');
    });

    it('should transform elsif statements', () => {
        const transformed = getISPConfigTransform(`{% elsif VARIABLE %}`);
        expect(transformed).toBe('{tmpl_elseif name="VARIABLE"}');
    });

    it('should transform elsif statements with operators', () => {
        const transformed1 = getISPConfigTransform(`{% elsif VARIABLE OPERATOR 'VALUE' %}`);
        const transformed2 = getISPConfigTransform(`{% elsif VARIABLE OPERATOR "VALUE" %}`);
        expect(transformed1).toBe('{tmpl_elseif name="VARIABLE" op="OPERATOR" value="VALUE"}');
        expect(transformed2).toBe('{tmpl_elseif name="VARIABLE" op="OPERATOR" value="VALUE"}');
    });

    it('should transform else statements', () => {
        const transformed = getISPConfigTransform(`{% else %}`);
        expect(transformed).toBe('{tmpl_else}');
    });

    it('should transform endif statements', () => {
        const transformed = getISPConfigTransform(`{% endif %}`);
        expect(transformed).toBe('{/tmpl_if}');
    });

    it('should transform unless statements', () => {
        const transformed = getISPConfigTransform(`{% unless VARIABLE %}`);
        expect(transformed).toBe('{tmpl_unless name="VARIABLE"}');
    });

    it('should transform endunless statements', () => {
        const transformed = getISPConfigTransform(`{% endunless %}`);
        expect(transformed).toBe('{/tmpl_unless}');
    });

    it('should transform loop statements', () => {
        const transformed = getISPConfigTransform(`{% loop VARIABLE %}`);
        expect(transformed).toBe('{tmpl_loop name="VARIABLE"}');
    });

    it('should transform endloop statements', () => {
        const transformed = getISPConfigTransform(`{% endloop %}`);
        expect(transformed).toBe('{/tmpl_loop}');
    });

    it('should transform dyninclude statements', () => {
        const transformed1 = getISPConfigTransform(`{% dyninclude 'COMPONENT' %}`);
        const transformed2 = getISPConfigTransform(`{% dyninclude "COMPONENT" %}`);
        expect(transformed1).toBe('{tmpl_dyninclude name="COMPONENT"}');
        expect(transformed2).toBe('{tmpl_dyninclude name="COMPONENT"}');
    });

    it('should transform hook statements', () => {
        const transformed1 = getISPConfigTransform(`{% hook 'HOOKNAME' %}`);
        const transformed2 = getISPConfigTransform(`{% hook "HOOKNAME" %}`);
        expect(transformed1).toBe('{tmpl_hook name="HOOKNAME"}');
        expect(transformed2).toBe('{tmpl_hook name="HOOKNAME"}');
    });

    it('should transform render statements', () => {
        const transformed1 = getISPConfigTransform(`{% render './render-basic.liquid' %}`, resolve(fixturesPath, 'render-basic.liquid'));
        const transformed2 = getISPConfigTransform(`{% render "render-basic.liquid" %}`, resolve(fixturesPath, 'render-basic.liquid'));
        const expected = readFixtureFile('render-basic.ispconfig.expected.htm');

        expect(transformed1).toBe(expected);
        expect(transformed2).toBe(expected);
    });

    it('should transform render statements with implicit .liquid extension', () => {
        const transformed1 = getISPConfigTransform(`{% render './render-basic' %}`, resolve(fixturesPath, 'render-basic.liquid'));
        const transformed2 = getISPConfigTransform(`{% render "render-basic" %}`, resolve(fixturesPath, 'render-basic.liquid'));
        const expected = readFixtureFile('render-basic.ispconfig.expected.htm');

        expect(transformed1).toBe(expected);
        expect(transformed2).toBe(expected);
    });

    it('should transform render statements within render statements', () => {
        const transformed1 = getISPConfigTransform(`{% render './render-sub-components.liquid' %}`, resolve(fixturesPath, 'render-sub-components.liquid'));
        const transformed2 = getISPConfigTransform(`{% render "render-sub-components.liquid" %}`, resolve(fixturesPath, 'render-sub-components.liquid'));
        const expected = readFixtureFile('render-sub-components.ispconfig.expected.htm');

        expect(transformed1).toBe(expected);
        expect(transformed2).toBe(expected);
    });

    it('should transform render statements relative to the current file', () => {
        const transformed1 = getISPConfigTransform(`{% render './subdir/render-subdir-sub.liquid' %}`, resolve(fixturesPath, 'render-from-root.liquid'));
        const transformed2 = getISPConfigTransform(`{% render "subdir/render-subdir-sub.liquid" %}`, resolve(fixturesPath, 'render-from-root.liquid'));
        const expected = readFixtureFile('subdir/render-subdir-sub.expected.htm');

        expect(transformed1).toBe(expected);
        expect(transformed2).toBe(expected);
    });

    it('should render variables with other quote types correctly', () => {
        const transformed1 = getISPConfigTransform(`{% render './render-attributes-component.liquid', slot: '{{ logout_txt }} {{ cpuser }}', attributes: 'data-load-content="login/logout.php"' %}`, resolve(fixturesPath, 'render-attributes.liquid'));
        const transformed2 = getISPConfigTransform(`{% render "render-attributes-component.liquid", slot: "{{ logout_txt }} {{ cpuser }}", attributes: 'data-load-content="login/logout.php"' %}`, resolve(fixturesPath, 'render-attributes.liquid'));
        const expected = readFixtureFile('render-attributes.ispconfig.expected.htm');

        expect(transformed1).toBe(expected);
        expect(transformed2).toBe(expected);
    });

    it('should render variables that contain quotes correctly', () => {
        const transformed1 = getISPConfigTransform(`{% render './render-quotes-component.liquid', type: 'password', value: '{{ value }}', onkeyup: "pass_check(this.value);checkPassMatch('password','repeat_password');" %}`, resolve(fixturesPath, 'render-quotes.liquid'));
        const transformed2 = getISPConfigTransform(`{% render "render-quotes-component.liquid", type: "password", value: "{{ value }}", onkeyup: 'pass_check(this.value);checkPassMatch(\\'password\\',\\'repeat_password\\');' %}`, resolve(fixturesPath, 'render-quotes.liquid'));
        const expected = readFixtureFile('render-quotes-component.ispconfig.expected.htm');

        expect(transformed1).toBe(expected);
        expect(transformed2).toBe(expected);
    });

    it('should handle variables with percentage values correctly', () => {
        const transformed = getISPConfigTransform(`{% render './render-percentage-component.liquid', class: 'w-[8%]' %}`, resolve(fixturesPath, 'render-percentage-component.liquid'));
        const expected = readFixtureFile('render-percentage-component.expected.htm');

        expect(transformed).toBe(expected);
    });

    it('should be able to render statements', () => {
        const transformed = getISPConfigTransform(readFixtureFile('./render-json.liquid'), resolve(fixturesPath, 'render-json.liquid'));
        const expected = readFixtureFile('render-json.ispconfig.expected.htm');

        expect(transformed).toBe(expected);
    });

    it('should not show comments by default', () => {
        const transformed = getISPConfigTransform(`{% comment %} This is a comment {% endcomment %}`);
        expect(transformed).toBe('');
    });

    it('should not show multiline comment statements by default', () => {
        const transformed = getISPConfigTransform(`{% comment %}\nThis is a comment\nwith multiple lines\n{% endcomment %}`);
        expect(transformed).toBe('');
    });
});

describe('ISPConfig Transformation Strategy (customized)', () => {
    it('can be configured to show comments as HTML comments', () => {
        const transformer = new LiquidishTransformer({
            strategyBuilder: (transformer) => new ISPConfigTransformationStrategy(transformer),
            showComments: true,
        });

        const transformed = transformer.transform(`{% comment %} This is a comment {% endcomment %}`, fixturesPath);
        expect(transformed).toBe('<!-- This is a comment -->');
    });

    it('should transform multiline comment statements', () => {
        const transformer = new LiquidishTransformer({
            strategyBuilder: (transformer) => new ISPConfigTransformationStrategy(transformer),
            showComments: true,
        });

        const transformed = transformer.transform(`{% comment %}\nThis is a comment\nwith multiple lines\n{% endcomment %}`, fixturesPath);
        expect(transformed).toBe('<!--\nThis is a comment\nwith multiple lines\n-->');
    });
});
