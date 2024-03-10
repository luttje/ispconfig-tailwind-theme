export class LiquidishTransformer {
    constructor(options = {}) {
        if (!options.strategyBuilder) {
            throw new Error('No strategy builder provided');
        }

        this.showComments = options.showComments || false;

        this.strategy = options.strategyBuilder(this);

        this.transformRegexes = this.strategy.getTransformations() || [];

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

    transformContents({ contents, regex, strategyMethodName, parseFunction }) {
        const transformer = this;

        if (parseFunction) {
            contents = contents.replace(regex, function (match, ...args) {
                const parsed = parseFunction(transformer, ...args);

                // append the offset and the string to the parsed array
                parsed.push(args[args.length - 2], args[args.length - 1]);

                return transformer.strategy[strategyMethodName](...parsed);
            });
        } else {
            contents = contents.replace(regex, function (match, ...args) {
                return transformer.strategy[strategyMethodName](...args);
            });
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

        for (const { strategyMethodName, regex, parseFunction } of this.transformRegexes) {
            if (Array.isArray(regex)) {
                for (const r of regex) {
                    if (contents.match(r)) {
                        contents = this.transformContents({
                            contents,
                            regex: r,
                            strategyMethodName,
                            parseFunction,
                        });
                    }
                }
            } else {
                if (contents.match(regex)) {
                    contents = this.transformContents({
                        contents,
                        regex,
                        strategyMethodName,
                        parseFunction,
                    });
                }
            }
        }

        // Clean up the scope after processing a block/component
        this.popScope();

        return contents;
    }
}
