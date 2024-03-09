import { getIndentationFromLineStart, readComponentWithIndentation, buildVariablesScope } from './utils';

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
addDefaultTransform([
    /{%\s*render_json\s*'([^']+)'\s*,\s*({.*?})\s*%}/gs,
    /{%\s*render_json\s*"([^"]+)"\s*,\s*({.*?})\s*%}/gs
], ({ transformer, match }, component, json, offset, string) => {
    const variables = JSON.parse(json);

    const { contents, path } = readComponentWithIndentation(transformer.getPath(), component, getIndentationFromLineStart(string, offset));

    transformer.pushToScope({
        ...variables,
        path
    });

    const rendered = transformer.transform(contents);

    return rendered;
});

// {% render 'COMPONENT', variable: 'value', another: 'value' %} -> {contents of that COMPONENT file with the variables replaced}
addDefaultTransform([
    /{%\s*render\s*'([^']+)'\s*,\s*([^%]+)\s*%}/g,
    /{%\s*render\s*"([^"]+)"\s*,\s*([^%]+)\s*%}/g
], ({ transformer }, component, variablesString, offset, string) => {
    const variables = {};

    variablesString.replace(/(\w+):\s*((?:"(?:[^"\\]|\\.)*"|'(?:[^'\\]|\\.)*'))/g, (match, name, value) => {
        const quoteType = value[0];
        value = value.slice(1, -1);

        // Unescape the value
        value = value.replace(new RegExp(`\\\\${quoteType}`, 'g'), quoteType);

        variables[name] = value;
    });

    const { contents, path } = readComponentWithIndentation(transformer.getPath(), component, getIndentationFromLineStart(string, offset));

    transformer.pushToScope({
        ...variables,
        path
    });

    const rendered = transformer.transform(contents);

    return rendered;
});

// {% render 'COMPONENT' %} -> {contents of that COMPONENT file}
addDefaultTransform([
    /{%\s*render\s*'([^']+)'\s*%}/g,
    /{%\s*render\s*"([^"]+)"\s*%}/g
], ({ transformer }, component, offset, string) => {
    const { contents, path } = readComponentWithIndentation(transformer.getPath(), component, getIndentationFromLineStart(string, offset));

    transformer.pushToScope({ path });

    return transformer.transform(contents);
});

// {% for item in items %}
//     {{ item[0] }}="{{ item[1] }}"
// {% endfor %} -> X=Y (as many times as there are attributes)
addDefaultTransform(/\{%\s*for\s+(\w+)\s+in\s+(\w+)\s*%\}(.*?)\{%\s*endfor\s*%\}/gs, ({ transformer, match }, itemName, collectionName, statement, offset, string) => {
    const scope = transformer.getScope();

    if (!Array.isArray(scope[collectionName])) {
        if (scope[collectionName] === undefined) {
            // This will happen when vite transforms the file.
            return '';
        }

        throw new Error(`The collection ${collectionName} is not an array. It's a ${typeof scope[collectionName]} (in ${transformer.getPath()})}`);
    }

    // trim only leading whitespace
    statement = statement.replace(/^\s+/, '');

    return scope[collectionName].map(item => {
        const variables = {};
        buildVariablesScope(item, itemName, variables);

        transformer.pushToScope(variables);

        return transformer.transform(statement);
    }).join('');
});

/**
 * The below transformations are the ones that are specific to ISPConfig's template language.
 */

/**
 * Variable
 */
// `{{ VARIABLE }}` -> {tmpl_var name="VARIABLE"}
addDefaultTransform(/{{\s*(\w+(?:\[[^\]]*\])*)?\s*}}/g, ({ transformer }, variable) => {
    const scope = transformer.getScope();

    // If the variable is defined in the current scope, use it
    if (scope[variable] !== undefined) {
        return scope[variable];
    }

    // Otherwise it's a template variable
    return `{tmpl_var name="${variable}"}`;
});

/**
 * If-statement
 */
// `{% if VARIABLE %}` -> {tmpl_if name="VARIABLE"}
addDefaultTransform(/{%\s*if\s*(\w+)\s*%}/g, '{tmpl_if name="$1"}');
// `{% if VARIABLE OPERATOR 'VALUE' %}` -> {tmpl_if name="VARIABLE" op="OPERATOR" value="VALUE"}
addDefaultTransform([
    /{%\s*if\s*(\w+)\s*(\S+)\s*'([^']*)'\s*%}/g,
    /{%\s*if\s*(\w+)\s*(\S+)\s*"([^"]*)"\s*%}/g
], '{tmpl_if name="$1" op="$2" value="$3"}');

// `{% elsif VARIABLE %}` -> {tmpl_elseif name="VARIABLE"}
addDefaultTransform(/{%\s*elsif\s*(\w+)\s*%}/g, '{tmpl_elseif name="$1"}');
// `{% elsif VARIABLE OPERATOR 'VALUE' %}` -> {tmpl_elseif name="VARIABLE" op="OPERATOR" value="VALUE"}
addDefaultTransform([
    /{%\s*elsif\s*(\w+)\s*(\S+)\s*'([^']*)'\s*%}/g,
    /{%\s*elsif\s*(\w+)\s*(\S+)\s*"([^"]*)"\s*%}/g
], '{tmpl_elseif name="$1" op="$2" value="$3"}');

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
addDefaultTransform([
    /{%\s*dyninclude\s*'([^']+)'\s*%}/g,
    /{%\s*dyninclude\s*"([^"]+)"\s*%}/g
], '{tmpl_dyninclude name="$1"}');

/**
 * Hook
 */
// {% hook 'HOOKNAME' %} -> {tmpl_hook name="HOOKNAME"}
addDefaultTransform([
    /{%\s*hook\s*'([^']+)'\s*%}/g,
    /{%\s*hook\s*"([^"]+)"\s*%}/g
], '{tmpl_hook name="$1"}');

export class LiquidishTransformer {
    constructor(options = {}) {
        this.showComments = options.showComments || false;

        this.transformRegexes = [
            ...defaultTransformations,
            ...(options.transformRegexes || []),
        ];

        // Used to store nested scopes for variables
        this.variableScopes = [];

        // Used to keep track of the current file being transformed
        this.basePath = null;
    }

    // Create a new scope object and push it onto the stack
    pushToScope(variables) {
        this.variableScopes.push(variables);

        return this.variableScopes[this.variableScopes.length - 1];
    }

    peekScope() {
        return this.variableScopes[this.variableScopes.length - 1];
    }

    popScope() {
        // Remove the topmost scope from the stack
        if (this.variableScopes.length > 0) {
            const pop = this.variableScopes.pop();

            return pop;
        }

        return {};
    }

    // Return the entire scope as a flat key and value map, let later scopes override earlier ones
    getScope() {
        const scope = {};

        for (const s of this.variableScopes) {
            for (const [key, value] of Object.entries(s)) {
                scope[key] = value;
            }
        }

        return scope;
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
        const topScope = this.peekScope();

        if (topScope?.path) {
            return topScope.path;
        }

        return this.basePath;
    }

    /**
     * Keeps transforming the provided contents to ISPConfig tpl format until
     * no more transformations are occurring, or when the maximum number of
     * iterations is reached.
     */
    transform(contents, path = null) {
        if (path) {
            this.basePath = path;
        }

        for (const { regex, replacement } of this.transformRegexes) {
            if (Array.isArray(regex)) {
                for (const r of regex) {
                    if (contents.match(r)) {
                        contents = this.transformContents({
                            contents,
                            regex: r,
                            replacement,
                        });
                    }
                }
            } else {
                if (contents.match(regex)) {
                    contents = this.transformContents({
                        contents,
                        regex,
                        replacement,
                    });
                }
            }
        }

        // Clean up the scope after processing a block/component
        this.popScope();

        return contents;
    }
}
