import { AbstractTransformationStrategy } from "./abstract-transformation-strategy";

const defaultTransformations = [];

/**
 * Adds a transformation regex to the list of regexes.
 *
 * @param {string} strategyMethodName The name of the related method in the transformation strategy
 * @param {RegExp|RegExp[]} regex The regex to add
 * @param {(LiquidishTransformer, ...any) => {}|null} parseFunction The function to use for parsing the match. What it returns will be given to the strategy method. If null, the matched groups will be given to the strategy method directly.
 */
function addDefaultTransform(strategyMethodName, regex, parseFunction) {
    defaultTransformations.push({ regex, strategyMethodName, parseFunction });
}

/**
 *
 * Available transformations:
 *
 */

/**
 * Custom transformations (wont be transformed to ISPConfig's template language)
 */

// {% comment %}\nThis is a comment\nwith multiple lines\n{% endcomment %}
addDefaultTransform('comment', /{%\s*comment\s*%}([\s\S]*?){%\s*endcomment\s*%}/g);

// {% render 'COMPONENT' %}
// {% render 'COMPONENT', variable: 'value', another: 'value' %}
// {% render 'render-json-component.liquid', {
//     "slot": "{{ logout_txt }} {{ cpuser }}",
//     "attributes": [
//         ["id", "logout-button"],
//         ["data-load-content", "login/logout.php"]
//     ]
// }
// NOTE: For simplicty sake the JSON cannot contain %}
addDefaultTransform('render', /{%\s*render\s*((?:'[^']+?)'|"(?:[^']+?)"){1}(?:\s*,\s*((?:[^%]+|%(?!}))*))*\s*%}/g, (transformer, component, variablesString) => {
    const variables = {};

    if (variablesString) {
        variablesString = variablesString.trim();

        // Try parse it as JSON
        try {
            const parsed = JSON.parse(variablesString);

            if (typeof parsed === 'object') {
                for (const [key, value] of Object.entries(parsed)) {
                    variables[key] = value;
                }
            }
        } catch (e) {
            // It's not JSON, so it's a string with key-value pairs
            variablesString.replace(/(\w+):\s*((?:"(?:[^"\\]|\\.)*"|'(?:[^'\\]|\\.)*'))/g, (match, name, value) => {
                const quoteType = value[0];
                value = value.slice(1, -1);

                // Unescape the value
                value = value.replace(new RegExp(`\\\\${quoteType}`, 'g'), quoteType);

                variables[name] = value;
            });
        }
    }

    component = component.slice(1, -1); // trim quotes

    return [
        component,
        variables,
    ];
});

// {% for item in items %}
//     {{ item[0] }}="{{ item[1] }}"
// {% endfor %}
addDefaultTransform('for', /\{%\s*for\s+(\w+)\s+in\s+(\w+)\s*%\}(.*?)\{%\s*endfor\s*%\}/gs, (transformer, itemName, collectionName, statement) => {
    const scope = transformer.getScope();

    if (!Array.isArray(scope[collectionName])) {
        if (scope[collectionName] === undefined) {
            // This will happen when vite transforms the file.
            // return false;
        }

        throw new Error(`The collection ${collectionName} is not an array. It's a ${typeof scope[collectionName]} (in ${transformer.getPath()})}`);
    }

    // trim only leading whitespace
    statement = statement.replace(/^\s+/, '');

    return [
        itemName,
        collectionName,
        statement
    ];
});

/**
 * Variable
 */
// `{{ VARIABLE }}`
addDefaultTransform('variable', /{{\s*(\w+(?:\[[^\]]*\])*)?\s*}}/g);

/**
 * If-statement
 */
// `{% if VARIABLE OPERATOR 'VALUE' %}`
// `{% if VARIABLE OPERATOR "VALUE" %}`
// `{% if VARIABLE %}`
addDefaultTransform('if', /{%\s*if\s*(\w+)\s+(?:(\S+)\s*((?:'[^']+)'|"(?:[^']+)"))*\s*%}/g, (transformer, name, op, value) => {
    if (op && value) {
        value = value.slice(1, -1); // trim quotes
        return [
            name,
            op,
            value,
        ];
    }

    return [
        name,
        undefined,
        undefined,
    ];
});

// `{% elsif VARIABLE OPERATOR 'VALUE' %}`
// `{% elsif VARIABLE OPERATOR "VALUE" %}`
// `{% elsif VARIABLE %}`
addDefaultTransform('elsif', /{%\s*elsif\s*(\w+)\s+(?:(\S+)\s*((?:'[^']+)'|"(?:[^']+)"))*\s*%}/g, (transformer, name, op, value) => {
    if (op && value) {
        value = value.slice(1, -1); // trim quotes
        return [
            name,
            op,
            value,
        ];
    }

    return [
        name,
        undefined,
        undefined,
    ];
});

// `{% else %}`
addDefaultTransform('else', /{%\s*else\s*%}/g);
// `{% endif %}`
addDefaultTransform('endif', /{%\s*endif\s*%}/g);

/**
 * Unless-statement
 */
// `{% unless VARIABLE %}`
addDefaultTransform('unless', /{%\s*unless\s*(\w+)\s*%}/g);
// `{% endunless %}`
addDefaultTransform('endunless', /{%\s*endunless\s*%}/g);

export class BaseTransformationStrategy extends AbstractTransformationStrategy {
    getTransformations() {
        return defaultTransformations;
    }
}
