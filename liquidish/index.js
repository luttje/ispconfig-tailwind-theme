import { getIndentationFromLineStart, readComponentWithIndentation } from './utils';

/**
 * Liquidish is a custom template language that is similar to Liquid, but with some differences.
 *
 * It transpiles to the ISPConfig template language.
 */

const defaultTransformations = [];

/**
 * Adds a transformation regex to the list of regexes.
 *
 * @param {RegExp|RegExp[]} regex The regex to add
 * @param {string} replacement The replacement string
 */
function addDefaultTransform(regex, replacement) {
    defaultTransformations.push({ regex, replacement });
}

/**
 *
 * Available transformations:
 *
 */

/**
 * Variable
 */
// `{{ VARIABLE }}` -> {tmpl_var name="VARIABLE"}
addDefaultTransform(/{{\s*(\w+)\s*}}/g, '{tmpl_var name="$1"}');

/**
 * If-statement
 */
// `{% if VARIABLE %}` -> {tmpl_if name="VARIABLE"}
addDefaultTransform(/{%\s*if\s*(\w+)\s*%}/g, '{tmpl_if name="$1"}');
// `{% if VARIABLE OPERATOR 'VALUE' %}` -> {tmpl_if name="VARIABLE" op="OPERATOR" value="VALUE"}
addDefaultTransform(/{%\s*if\s*(\w+)\s*(\S+)\s*'([^']*)'\s*%}/g, '{tmpl_if name="$1" op="$2" value="$3"}');

// `{% elsif VARIABLE %}` -> {tmpl_elseif name="VARIABLE"}
addDefaultTransform(/{%\s*elsif\s*(\w+)\s*%}/g, '{tmpl_elseif name="$1"}');
// `{% elsif VARIABLE OPERATOR 'VALUE' %}` -> {tmpl_elseif name="VARIABLE" op="OPERATOR" value="VALUE"}
addDefaultTransform(/{%\s*elsif\s*(\w+)\s*(\S+)\s*'([^']*)'\s*%}/g, '{tmpl_elseif name="$1" op="$2" value="$3"}');

// `{% else %}` -> {tmpl_else}
addDefaultTransform(/{%\s*else\s*%}/g, '{tmpl_else}');
// `{% endif %}` -> {/tmpl_if}
addDefaultTransform(/{%\s*endif\s*%}/g, '{/tmpl_if}');

/**
 * Unless-statement
 */
// `{% unless VARIABLE %}` -> {tmpl_unless name="VARIABLE"}
addDefaultTransform(/{%\s*unless\s*(\w+)\s*%}/g, '{tmpl_unless name="$1"}');
// `{% endunless %}` -> {/tmpl_unless}
addDefaultTransform(/{%\s*endunless\s*%}/g, '{/tmpl_unless}');

/**
 * Loop
 */
// `{% loop VARIABLE %}` -> {tmpl_loop name="VARIABLE"}
addDefaultTransform(/{%\s*loop\s*(\w+)\s*%}/g, '{tmpl_loop name="$1"}');
// `{% endfor %}` -> {/tmpl_loop}
addDefaultTransform(/{%\s*endloop\s*%}/g, '{/tmpl_loop}');

/**
 * Dyninclude
 */
// {% dyninclude 'COMPONENT' %} -> {tmpl_dyninclude name="COMPONENT"}
addDefaultTransform(/{%\s*dyninclude\s*'([^']+)'\s*%}/g, '{tmpl_dyninclude name="$1"}');

/**
 * Hook
 */
// {% hook 'HOOKNAME' %} -> {tmpl_hook name="HOOKNAME"}
addDefaultTransform(/{%\s*hook\s*'([^']+)'\s*%}/g, '{tmpl_hook name="$1"}');

/**
 * Custom additions
 */

// {% comment %}\nThis is a comment\nwith multiple lines\n{% endcomment %} -> <!--\nThis is a comment\nwith multiple lines\n-->
addDefaultTransform(/{%\s*comment\s*%}([\s\S]*?){%\s*endcomment\s*%}/g, ({ path, transformer }, comment) => {
    if (transformer.showComments === true) {
        return `<!--${comment}-->`;
    }

    return '';
});

// {% render 'COMPONENT' %} -> {contents of that COMPONENT file}
const renderRegexes = [
    /{%\s*render\s*'([^']+)'\s*%}/g,
    /{%\s*render\s*"([^"]+)"\s*%}/g
];
addDefaultTransform(renderRegexes, ({ path, transformer }, component, offset, string) => {
    return readComponentWithIndentation(path, component, getIndentationFromLineStart(string, offset));
});

// {% render 'COMPONENT', variable: 'value', another: 'value' %} -> {contents of that COMPONENT file with the variables replaced}
const renderWithVariablesRegexes = [
    /{%\s*render\s*'([^']+)'\s*,\s*([^%]+)\s*%}/g,
    /{%\s*render\s*"([^"]+)"\s*,\s*([^%]+)\s*%}/g
];
addDefaultTransform(renderWithVariablesRegexes, ({ path, transformer }, component, variables, offset, string) => {
    const parsedVariables = variables.split(',').map(variable => {
        const [name, value] = variable.split(':')
            .map(v => v.trim().replace(/^['"]|['"]$/g, ''));

        return { name, value };
    });

    let contents = readComponentWithIndentation(path, component, getIndentationFromLineStart(string, offset));
    for (const { name, value } of parsedVariables) {
        contents = contents.replace(new RegExp(`{{\\s*${name}\\s*}}`, 'g'), value);
    }

    return contents;
});

export class LiquidishTransformer {
    constructor(options = {}) {
        this.showComments = options.showComments || false;
        this.maxRenderDepth = options.maxRenderDepth || 100;
        this.transformRegexes = [
            ...defaultTransformations,
            ...(options.transformRegexes || []),
        ]
    }

    transformContents({ contents, path, regex, replacement }) {
        if (typeof replacement === 'function') {
            const transformer = this;

            contents = contents.replace(regex, function (match, ...args) {
                return replacement({
                    path,
                    match,
                    transformer,
                }, ...args);
            });
        } else {
            contents = contents.replace(regex, replacement);
        }

        return contents;
    }

    /**
     * Keeps transforming the provided contents to ISPConfig tpl format until
     * no more transformations are occurring, or when the maximum number of
     * iterations is reached.
     */
    transform(contents, path) {
        let iterations = 0;
        let transformed = true;

        while (transformed && iterations < this.maxRenderDepth) {
            transformed = false;

            for (const { regex, replacement } of this.transformRegexes) {
                if (Array.isArray(regex)) {
                    for (const r of regex) {
                        if (contents.match(r)) {
                            contents = this.transformContents({
                                contents,
                                path,
                                regex: r,
                                replacement,
                            });
                            transformed = true;
                        }
                    }
                } else {
                    if (contents.match(regex)) {
                        contents = this.transformContents({
                            contents,
                            path,
                            regex,
                            replacement,
                        });
                        transformed = true;
                    }
                }
            }

            if (!transformed) {
                break;
            }

            iterations++;
        }

        if (iterations >= this.maxRenderDepth) {
            throw new Error(`Max render depth of ${this.maxRenderDepth} reached. Aborting transformation.`);
        }

        return contents;
    }
}
