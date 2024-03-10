import { describe, it, expect } from 'vitest';
import { resolve } from 'path';
import { LiquidishTransformer } from '../transformer';
import { PHPTransformationStrategy } from '../strategies/php-transformation-strategy';
import { fixturesPath, readFixtureFile } from './test-utils';

function getPHPConfigTransform(contents, path) {
    return new LiquidishTransformer({
        strategyBuilder: (transformer) => new PHPTransformationStrategy(transformer)
    }).transform(contents, path ?? fixturesPath);
}

describe('PHP Transformation Strategy', () => {
    it('should transform variables', () => {
        const transformed = getPHPConfigTransform(`{{ VARIABLE }}`);
        expect(transformed).toBe('<?php echo $VARIABLE; ?>');
    });

    it('should transform if statements', () => {
        const transformed = getPHPConfigTransform(`{% if VARIABLE %}`);
        expect(transformed).toBe('<?php if ($VARIABLE) : ?>');
    });

    it('should transform if statements with operators', () => {
        const transformed1 = getPHPConfigTransform(`{% if VARIABLE OPERATOR 'VALUE' %}`);
        const transformed2 = getPHPConfigTransform(`{% if VARIABLE OPERATOR "VALUE" %}`);
        expect(transformed1).toBe('<?php if ($VARIABLE OPERATOR \'VALUE\') : ?>');
        expect(transformed2).toBe('<?php if ($VARIABLE OPERATOR \'VALUE\') : ?>');
    });

    it('should transform elsif statements', () => {
        const transformed = getPHPConfigTransform(`{% elsif VARIABLE %}`);
        expect(transformed).toBe('<?php elseif ($VARIABLE) : ?>');
    });

    it('should transform elsif statements with operators', () => {
        const transformed1 = getPHPConfigTransform(`{% elsif VARIABLE OPERATOR 'VALUE' %}`);
        const transformed2 = getPHPConfigTransform(`{% elsif VARIABLE OPERATOR "VALUE" %}`);
        expect(transformed1).toBe('<?php elseif ($VARIABLE OPERATOR \'VALUE\') : ?>');
        expect(transformed2).toBe('<?php elseif ($VARIABLE OPERATOR \'VALUE\') : ?>');
    });

    it('should transform else statements', () => {
        const transformed = getPHPConfigTransform(`{% else %}`);
        expect(transformed).toBe('<?php else : ?>');
    });

    it('should transform endif statements', () => {
        const transformed = getPHPConfigTransform(`{% endif %}`);
        expect(transformed).toBe('<?php endif; ?>');
    });

    it('should transform unless statements', () => {
        const transformed = getPHPConfigTransform(`{% unless VARIABLE %}`);
        expect(transformed).toBe('<?php if (!$VARIABLE) : ?>');
    });

    it('should transform endunless statements', () => {
        const transformed = getPHPConfigTransform(`{% endunless %}`);
        expect(transformed).toBe('<?php endif; ?>');
    });

    it('should transform include statements', () => {
        const transformed1 = getPHPConfigTransform(`{% include 'COMPONENT' %}`);
        const transformed2 = getPHPConfigTransform(`{% include "COMPONENT" %}`);
        expect(transformed1).toBe('<?php include \'COMPONENT\'; ?>');
        expect(transformed2).toBe('<?php include \'COMPONENT\'; ?>');
    });

    it('should transform render statements', () => {
        const transformed1 = getPHPConfigTransform(`{% render './render-basic.liquid' %}`, resolve(fixturesPath, 'render-basic.liquid'));
        const transformed2 = getPHPConfigTransform(`{% render "render-basic.liquid" %}`, resolve(fixturesPath, 'render-basic.liquid'));
        const expected = readFixtureFile('render-basic.php.expected.php');

        expect(transformed1).toBe(expected);
        expect(transformed2).toBe(expected);
    });

    it('should transform render statements with implicit .liquid extension', () => {
        const transformed1 = getPHPConfigTransform(`{% render './render-basic' %}`, resolve(fixturesPath, 'render-basic.liquid'));
        const transformed2 = getPHPConfigTransform(`{% render "render-basic" %}`, resolve(fixturesPath, 'render-basic.liquid'));
        const expected = readFixtureFile('render-basic.php.expected.php');

        expect(transformed1).toBe(expected);
        expect(transformed2).toBe(expected);
    });

    it('should transform render statements within render statements', () => {
        const transformed1 = getPHPConfigTransform(`{% render './render-sub-components.liquid' %}`, resolve(fixturesPath, 'render-sub-components.liquid'));
        const transformed2 = getPHPConfigTransform(`{% render "render-sub-components.liquid" %}`, resolve(fixturesPath, 'render-sub-components.liquid'));
        const expected = readFixtureFile('render-sub-components.php.expected.php');

        expect(transformed1).toBe(expected);
        expect(transformed2).toBe(expected);
    });

    it('should transform render statements relative to the current file', () => {
        const transformed1 = getPHPConfigTransform(`{% render './subdir/render-subdir-sub.liquid' %}`, resolve(fixturesPath, 'render-from-root.liquid'));
        const transformed2 = getPHPConfigTransform(`{% render "subdir/render-subdir-sub.liquid" %}`, resolve(fixturesPath, 'render-from-root.liquid'));
        const expected = readFixtureFile('subdir/render-subdir-sub.expected.htm');

        expect(transformed1).toBe(expected);
        expect(transformed2).toBe(expected);
    });

    it('should render variables with other quote types correctly', () => {
        const transformed1 = getPHPConfigTransform(`{% render './render-attributes-component.liquid', slot: '{{ logout_txt }} {{ cpuser }}', attributes: 'data-load-content="login/logout.php"' %}`, resolve(fixturesPath, 'render-attributes.liquid'));
        const transformed2 = getPHPConfigTransform(`{% render "render-attributes-component.liquid", slot: "{{ logout_txt }} {{ cpuser }}", attributes: 'data-load-content="login/logout.php"' %}`, resolve(fixturesPath, 'render-attributes.liquid'));
        const expected = readFixtureFile('render-attributes.php.expected.php');

        expect(transformed1).toBe(expected);
        expect(transformed2).toBe(expected);
    });

    it('should handle variables with percentage values correctly', () => {
        const transformed = getPHPConfigTransform(`{% render './render-percentage-component.liquid', class: 'w-[8%]' %}`, resolve(fixturesPath, 'render-percentage-component.liquid'));
        const expected = readFixtureFile('render-percentage-component.expected.htm');

        expect(transformed).toBe(expected);
    });

    it('should not show comments by default (by having PHP comments)', () => {
        const transformed = getPHPConfigTransform(`{% comment %} This is a comment {% endcomment %}`);
        expect(transformed).toBe('<?php /*  This is a comment  */ ?>');
    });

    it('should not show multiline comment statements by default', () => {
        const transformed = getPHPConfigTransform(`{% comment %}\nThis is a comment\nwith multiple lines\n{% endcomment %}`);
        expect(transformed).toBe('<?php /* \nThis is a comment\nwith multiple lines\n */ ?>');
    });
});

describe('PHP Transformation Strategy (customized)', () => {
    it('can be configured to show comments as HTML comments', () => {
        const transformer = new LiquidishTransformer({
            strategyBuilder: (transformer) => new PHPTransformationStrategy(transformer),
            showComments: true,
        });

        const transformed = transformer.transform(`{% comment %} This is a comment {% endcomment %}`, fixturesPath);
        expect(transformed).toBe('<!-- This is a comment -->');
    });

    it('should transform multiline comment statements', () => {
        const transformer = new LiquidishTransformer({
            strategyBuilder: (transformer) => new PHPTransformationStrategy(transformer),
            showComments: true,
        });

        const transformed = transformer.transform(`{% comment %}\nThis is a comment\nwith multiple lines\n{% endcomment %}`, fixturesPath);
        expect(transformed).toBe('<!--\nThis is a comment\nwith multiple lines\n-->');
    });
});
