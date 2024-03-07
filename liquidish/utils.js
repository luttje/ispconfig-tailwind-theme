import indentString from 'indent-string';
import { resolve, dirname } from 'path';
import { existsSync, readFileSync } from 'fs';

export function trimTrailingNewline(contents) {
    return contents.replace(/\n$/, '');
}

/**
 * Escapes a string to be used in a regular expression.
 * https://stackoverflow.com/a/6969486
 */
export function escapeRegExp(string) {
    return string.replace(/[.*+?^${}()|[\]\\]/g, '\\$&'); // $& means the whole matched string
}

/**
 * Counts the indentation until the start of the line
 * before the provided offset.
 */
export function getIndentationFromLineStart(string, offset) {
    const beginningOfLine = string.slice(0, offset)
        .lastIndexOf('\n') + 1;
    return offset - beginningOfLine;
}

export function tryFindComponentPath(componentPath) {
    if (existsSync(componentPath) === false) {
        componentPath = resolve(componentPath + '.liquid');
    }

    return componentPath;
}

export function readComponentWithIndentation(path, component, indentation = 0) {
    let componentPath = tryFindComponentPath(resolve(path, component));

    if (existsSync(componentPath) === false) {
        throw new Error(`Component file not found: ${component} in ${path}`);
    }

    const contents = readFileSync(componentPath, 'utf8');
    let indented = indentString(contents, indentation);

    // The first line should not be indented (since it's indented from where we are rendering it)
    indented = indented.substring(indentation);

    // We trim the last trailing newline, because it's a nice convention for our source files, but in the rendered file it doesn't look good
    indented = trimTrailingNewline(indented);

    return { contents: indented, path: componentPath };
}

export function renderWithVariablesReplacement(contents, variables) {
    if (Array.isArray(variables)) {
        for (const { name, value } of variables) {
            contents = contents.replace(new RegExp(`{{\\s*${escapeRegExp(name)}\\s*}}`, 'g'), value);
        }
    } else {
        for (const [name, value] of Object.entries(variables)) {
            contents = contents.replace(new RegExp(`{{\\s*${escapeRegExp(name)}\\s*}}`, 'g'), value);
        }
    }

    return contents;
}

export function buildVariablesScope(item, itemName, variables) {
    variables[itemName] = item;

    if (Array.isArray(item)) {
        for (let i = 0; i < item.length; i++) {
            const element = item[i];
            const name = `${itemName}[${i}]`;
            variables[name] = element;

            // Recurse for arrays and objects within the array element
            if (Array.isArray(element) || (typeof element === 'object' && element !== null)) {
                buildVariablesScope(element, name, variables);
            }
        }
    } else if (typeof item === 'object' && item !== null) {
        for (const key of Object.keys(item)) {
            const element = item[key];
            const name = `${itemName}.${key}`;
            variables[name] = element;

            // Recurse for arrays and objects within the object property
            if (Array.isArray(element) || (typeof element === 'object' && element !== null)) {
                buildVariablesScope(element, name, variables);
            }
        }
    }
}
