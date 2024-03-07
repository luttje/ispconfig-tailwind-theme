import { getIndentationFromLineStart, readComponentWithIndentation, renderWithVariablesReplacement, buildVariablesScope, trimTrailingNewline, tryFindComponentPath } from './utils';
import { resolve, dirname } from 'path';
import { existsSync } from 'fs';

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
 * Custom transformations (wont be transformed to ISPConfig's template language)
 */

// {% comment %}\nThis is a comment\nwith multiple lines\n{% endcomment %} -> <!--\nThis is a comment\nwith multiple lines\n-->
addDefaultTransform(/{%\s*comment\s*%}([\s\S]*?){%\s*endcomment\s*%}/g, ({ transformer }, comment) => {
    if (transformer.showComments === true) {
        return `<!--${comment}-->`;
    }

    return '';
});

// {% render_json 'render-json-component.liquid', {
//     slot: '{{ logout_txt }} {{ cpuser }}',
//     attributes: [
//         ['id', 'logout-button'],
//         ['data-load-content', 'login/logout.php']
//     ]
// } %} -> {contents of that COMPONENT file with the variables replaced}
// NOTE: For simplicty sake the JSON cannot contain %}
const renderJsonRegexes = [
    /{%\s*render_json\s*'([^']+)'\s*,\s*({.*?})\s*%}/gs,
    /{%\s*render_json\s*"([^"]+)"\s*,\s*({.*?})\s*%}/gs
];
addDefaultTransform(renderJsonRegexes, ({ transformer, match }, component, json, offset, string) => {
    const variables = JSON.parse(json);

    transformer.pushToScope(variables);

    const { contents, path } = readComponentWithIndentation(transformer.getPath(), component, getIndentationFromLineStart(string, offset));

    return renderWithVariablesReplacement(
        transformer.fixupPathsInComponent(contents, path),
        variables
    );
});

// {% render 'COMPONENT', variable: 'value', another: 'value' %} -> {contents of that COMPONENT file with the variables replaced}
const renderWithVariablesRegexes = [
    /{%\s*render\s*'([^']+)'\s*,\s*([^%]+)\s*%}/g,
    /{%\s*render\s*"([^"]+)"\s*,\s*([^%]+)\s*%}/g
];
addDefaultTransform(renderWithVariablesRegexes, ({ transformer }, component, variablesString, offset, string) => {
    const variables = variablesString.split(',').map(variable => {
        const [name, value] = variable.split(':')
            .map(v => v.trim().replace(/^['"]|['"]$/g, ''));

        return { name, value };
    });

    transformer.pushToScope(variables);

    const { contents, path } = readComponentWithIndentation(transformer.getPath(), component, getIndentationFromLineStart(string, offset));

    return renderWithVariablesReplacement(
        transformer.fixupPathsInComponent(contents, path),
        variables
    );
});

// {% render 'COMPONENT' %} -> {contents of that COMPONENT file}
const renderRegexes = [
    /{%\s*render\s*'([^']+)'\s*%}/g,
    /{%\s*render\s*"([^"]+)"\s*%}/g
];
addDefaultTransform(renderRegexes, ({ transformer }, component, offset, string) => {
    const { contents, path } = readComponentWithIndentation(transformer.getPath(), component, getIndentationFromLineStart(string, offset));

    return transformer.fixupPathsInComponent(contents, path);
});

// {% for item in items %}
//     {{ item[0] }}="{{ item[1] }}"
// {% endfor %} -> X=Y (as many times as there are attributes)
addDefaultTransform(/\{%\s*for\s+(\w+)\s+in\s+(\w+)\s*%\}(.*?)\{%\s*endfor\s*%\}/gs, ({ transformer, match }, itemName, collectionName, statement, offset, string) => {
    const scope = transformer.getScope();

    if (!Array.isArray(scope[collectionName])) {
        throw new Error(`The collection ${collectionName} is not an array.`);
    }

    // trim only leading whitespace
    statement = statement.replace(/^\s+/, '');

    return scope[collectionName].map(item => {
        const variables = {};
        buildVariablesScope(item, itemName, variables);

        transformer.pushToScope(variables);

        return renderWithVariablesReplacement(statement, variables);
    }).join('');
});

/**
 * The below transformations are the ones that are specific to ISPConfig's template language.
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
 * Loops
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

export class LiquidishTransformer {
    constructor(options = {}) {
        this.showComments = options.showComments || false;
        this.maxRenderDepth = options.maxRenderDepth || 100;

        this.transformRegexes = [
            ...defaultTransformations,
            ...(options.transformRegexes || []),
        ];

        // Used to store render parameters to be used by the for loop
        this.variableScope = {};

        // Used to keep track of the current file being transformed
        this.basePath = null;
    }

    pushToScope(variables) {
        this.variableScope = {
            ...this.variableScope,
            ...variables,
        };

        return this.variableScope;
    }

    // TODO: Track the scope of the variables and pop them

    getScope() {
        return this.variableScope;
    }

    transformContents({ contents, regex, replacement }) {
        if (typeof replacement === 'function') {
            const transformer = this;

            contents = contents.replace(regex, function (match, ...args) {
                return replacement({
                    match,
                    transformer,
                }, ...args);
            });
        } else {
            contents = contents.replace(regex, replacement);
        }

        return contents;
    }

    getPath() {
        return this.basePath;
    }

    /**
     * Goes through the contents finding any paths and fixing them to be relative to the current file.
     */
    fixupPathsInComponent(contents, path) {
        return contents.replace(/(['"])(\.\.\/|\.\.\\|\.\/|\.\\)([^'"]+)(['"])/g, (match, quote1, dots, rest, quote2) => {
            const correctedPath = tryFindComponentPath(resolve(dirname(path), dots, rest));

            if (!existsSync(correctedPath)) {
                // Ignore paths that don't point to a file
                return match;
            }

            return `${quote1}${correctedPath}${quote2}`;
        });
    }

    /**
     * Keeps transforming the provided contents to ISPConfig tpl format until
     * no more transformations are occurring, or when the maximum number of
     * iterations is reached.
     */
    transform(contents, path) {
        let iterations = 0;
        let transformed = true;

        this.basePath = dirname(path);

        while (transformed && iterations < this.maxRenderDepth) {
            transformed = false;

            for (const { regex, replacement } of this.transformRegexes) {
                if (Array.isArray(regex)) {
                    for (const r of regex) {
                        if (contents.match(r)) {
                            contents = this.transformContents({
                                contents,
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
