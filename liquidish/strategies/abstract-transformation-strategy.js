export class AbstractTransformationStrategy {
    constructor(transformer) {
        if (new.target === AbstractTransformationStrategy) {
            throw new TypeError(`Cannot construct ${new.target.name} instances directly`);
        }

        this.transformer = transformer;

        const requiredMethods = [
            'comment',
            'render',
            'for',
            'if',
            'elsif',
            'else',
            'endif',
            'unless',
            'endunless',
            'variable',
        ];

        for (const method of requiredMethods) {
            if (typeof this[method] !== 'function') {
                throw new TypeError(`Class ${this.constructor.name} must implement method ${method}`);
            }
        }
    }
}
