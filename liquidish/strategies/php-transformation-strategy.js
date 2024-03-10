import { BaseTransformationStrategy } from './base-transformation-strategy';
import { buildVariablesScope, getIndentationFromLineStart, readComponentWithIndentation } from '../utils';

export class PHPTransformationStrategy extends BaseTransformationStrategy {
    getTransformations() {
        return [
            ...super.getTransformations(),
            ...[
                {
                    strategyMethodName: 'include',
                    regex: /{%\s*include\s*((?:'[^']+?)'|"(?:[^']+?)"){1}\s*%}/g,
                }
            ],
        ];
    }

    comment(comment) {
        if (this.transformer.showComments === true) {
            return `<!--${comment}-->`;
        }

        return '<?php /* ' + comment + ' */ ?>';
    }

    render(component, variables, offset, string) {
        const { contents, path } = readComponentWithIndentation(this.transformer.getPath(), component, getIndentationFromLineStart(string, offset));

        this.transformer.pushToScope({
            ...variables,
            path
        });

        return this.transformer.transform(contents);
    }

    for(itemName, collectionName, statement) {
        const scope = this.transformer.getScope();

        if (!Array.isArray(scope[collectionName])) {
            if (scope[collectionName] === undefined) {
                // This will happen when vite transforms the file.
                return '';
            }

            throw new Error(`The collection ${collectionName} is not an array. It's a ${typeof scope[collectionName]} (in ${this.transformer.getPath()})}`);
        }

        return scope[collectionName].map(item => {
            const variables = {};
            buildVariablesScope(item, itemName, variables);

            this.transformer.pushToScope(variables);

            return this.transformer.transform(statement);
        }).join('');
    }

    if(name, op, value) {
        if (op && value) {
            return `<?php if ($${name} ${op} '${value}') : ?>`;
        }

        return `<?php if ($${name}) : ?>`;
    }

    elsif(name, op, value) {
        if (op && value) {
            return `<?php elseif ($${name} ${op} '${value}') : ?>`;
        }

        return `<?php elseif ($${name}) : ?>`;
    }

    else() {
        return '<?php else : ?>';
    }

    endif() {
        return '<?php endif; ?>';
    }

    unless(name) {
        return `<?php if (!$${name}) : ?>`;
    }

    endunless() {
        return '<?php endif; ?>';
    }

    variable(variable) {
        const scope = this.transformer.getScope();

        // If the variable is defined in the current scope, use it
        if (scope[variable] !== undefined) {
            return scope[variable];
        }

        // Otherwise it's a template variable
        return `<?php echo $${variable}; ?>`;
    }

    include(component) {
        component = component.slice(1, -1); // trim quotes
        return `<?php include '${component}'; ?>`;
    }
}
