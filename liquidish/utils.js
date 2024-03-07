import indentString from 'indent-string';
import { resolve, dirname } from 'path';
import { existsSync, readFileSync } from 'fs';

export function trimTrailingNewline(contents) {
    return contents.replace(/\n$/, '');
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

export function readComponentWithIndentation(path, component, indentation = 0) {
    let componentPath = resolve(dirname(path), component);

    if (existsSync(componentPath) === false) {
        componentPath = resolve(dirname(path), component + '.liquid');
    }

    const contents = readFileSync(componentPath, 'utf8');
    let indented = indentString(contents, indentation);

    // The first line should not be indented (since it's indented from where we are rendering it)
    indented = indented.substring(indentation);

    // We trim the last trailing newline, because it's a nice convention for our source files, but in the rendered file it doesn't look good
    indented = trimTrailingNewline(indented);

    return indented;
}
