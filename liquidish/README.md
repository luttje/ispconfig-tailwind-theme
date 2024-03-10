# 💧 `Liquidish`

This variant of Liquid was created to compile Liquid-like syntax to another templating language. Originally, it was created to compile to ISPConfig's `tpl` syntax.

Liquidish is designed to work with Vite, but it can be used with any build tool that allows transforming files (e.g: Webpack and Rollup).

> [!WARNING]
> This is a work in progress. It's not finished yet.
> The documentation below may be incorrect or incomplete.

## 🚀 Using Liquidish

We'll assume you have a Vite project set up. If not, you can create one with:

```bash
npm init vite@latest
```

1. Install the package:

    ```bash
    npm install luttje/liquidish
    ```

2. Create a bunch of `.liquid` files in a directory, e.g: `src/templates`.

    > See the [📚 Liquidish Syntax](#-liquidish-syntax) for the syntax.

3. We use the [`vite-plugin-static-copy`](https://www.npmjs.com/package/vite-plugin-static-copy) to copy the `.liquid` files to the `templates` directory. Install it with:

    ```bash
    npm install vite-plugin-static-copy
    ```

4. Modify your `vite.config.js` to include the Liquidish transformer:

    ```javascript
    import { resolve } from 'path';
    import { defineConfig } from 'vite';
    import { viteStaticCopy } from 'vite-plugin-static-copy';
    import { LiquidishTransformer } from 'liquidish';
    import { ISPConfigTransformationStrategy } from 'liquidish/strategies';

    // Where the `.liquid` files are located
    const srcTemplatesPath = 'src/templates';

    // Create a transformer and specify the strategy
    // This example transforms the Liquidish syntax to ISPConfig's `tpl` syntax
    const liquidish = new LiquidishTransformer({
      strategyBuilder: (transformer) => new ISPConfigTransformationStrategy(transformer)
    });

    export default defineConfig({
      build: {
        // ...
      },

      plugins: [
        viteStaticCopy({
            targets: [
              {
                src: `${srcTemplatesPath}/**/*.liquid`,
                dest: 'templates',

                transform: (contents, path) => liquidish.transform(contents, path),

                rename: function (name, ext, fullPath) {
                  const path = fullPath.replace(resolve(__dirname, srcTemplatesPath), '');

                  // Rename the extension to what you want.
                  // In our case ISPConfig expects `.htm` files
                  return path.replace(/\.liquid$/, '.htm');
                },
              },
            ],
          }),
      ],
    });
    ```

5. Run Vite:

    ```bash
    npm run dev
    ```

*🎉 The `.liquid` files will now be transformed to `.htm` files in the `templates` directory.*

> ### Next steps
>
> - **[📚 Learn about the Liquidish Syntax](#-liquidish-syntax)**
>
> - **Check out one of these VSCode extensions** for Liquid syntax highlighting and other language features:
>   - [Alternative extension](https://marketplace.visualstudio.com/items?itemName=sissel.shopify-liquid)
>   - [Official Shopify Liquid extension](https://marketplace.visualstudio.com/items?itemName=Shopify.theme-check-vscode)
>
> - **[👷 Learn how to contribute to this project](CONTRIBUTING.md)**

## 📚 Liquidish Syntax

Liquidish does not support all of Liquid's features. It is a subset of Liquid, with a few extra features.

> [!WARNING]
> Beware that most of the below features can not contain `%}` in their content. This is because the transformation is done by matching the `{%` and `%}` characters.
>
> **TODO: Add a way to escape the `%}` characters.*

### Variables

Variables are defined with double curly braces: `{{ VARIABLE }}`. They're mostly used to output the value of a variable at runtime.

If variables are known at compile-time (e.g: when using `render` or `for` loops), they will be replaced with their value at compile-time. See the [render](#render) and [for](#for) sections for more information.

```liquid
<h1>{{ title }}</h1>
```

### If-statements

If-statements are defined with `{% if VARIABLE %}` or `{% if VARIABLE == 'VALUE' %}`. You can expand the if-statement with `{% elsif VARIABLE %}` or `{% elsif VARIABLE == 'VALUE' %}` and `{% else %}`. They end with `{% endif %}`.

You can also use `!=`, `>`, `<`, `>=`, `<=` as operators for if/elsif statements.

```liquid
{% if VARIABLE %}
    This will be shown if VARIABLE is truthy
{% elsif VARIABLE == 'VALUE' %}
    This will be shown if VARIABLE is 'VALUE'
{% else %}
    This will be shown if none of the above are true
{% endif %}
```

### Unless statements

Unless-statements are defined with `{% unless VARIABLE %}` and are the opposite of if-statements. They end with `{% endunless %}`.

```liquid
{% unless VARIABLE %}
    This will be shown if VARIABLE is falsy
{% endunless %}
```

### Comments

You can comment out code using `{% comment %}` and `{% endcomment %}`.

```liquid
{% comment %}
    This is a comment
{% endcomment %}
```

By default this will be removed from the output. If you want to keep the comments, you can set `showComments` to `true` on the transformer:

```javascript
const liquidish = new LiquidishTransformer({
  //...
  showComments: true,
});
```

### Render

When using `{% render './path/to/sub-template.liquid' %}` the sub-template will be compiled to the final output. This is useful for reusing components.

You must provide the path starting with `./` or `../` so it can be adjusted to the correct path when compiled to its final location.

```liquid
{% render './components/button.liquid' %}
```

*The `.liquid` extension is optional and will be added automatically if the specified path without it does not exist.*

To pass parameters to the sub-template, you can use following syntax:

```liquid
{% render './components/button', parameter: 'My cool button text', another_parameter: 'another_value' %}
```

> [!NOTE]
> The provided parameters will be known at compile-time and will be replaced with their value in the sub-template:
>
> ```liquid
> <!-- ./components/button.liquid -->
> <button class="px-4 py-2">{{ parameter }}</button>
> ```
>
> Will be compiled to:
>
> ```html
> <button class="px-4 py-2">My cool button text</button>
> ```

In order to pass complex JSON objects/arrays to a component you can use:

```liquid
{% render 'components/heading', {
    "slot": "{{ logout_txt }} {{ cpuser }}",
    "attributes": [
        ["id", "logout-button"],
        ["data-load-content", "login/logout.php"]
    ]
} %}
```

The JSON must be a valid JSON object. This means that you can only use double quotes for strings and not single quotes.

### For

`{% for ... in ... %}` compiles to output at compile-time using known variables. It does not support iterating over unknown variables at runtime.

Provide it with a variable that is known at compile-time, and it will loop over it:

```liquid
{% for item in items %}
    {{ item }}
{% endfor %}
```

This can be useful when you want to loop over a bunch of items that are known at compile-time, e.g: for attributes in a button component:

```liquid
<!-- ./components/button.liquid -->
<button class="px-4 py-2"
        {% for attribute in attributes %}
        {{ attribute[0] }}="{{ attribute[1] }}"
        {% endfor %}>
        {{ slot }}
</button>
```

The attributes would be provided like this:

```liquid
{% render './components/button', {
    "slot": "Click me",
    "attributes": [
        ["id", "click-me"],
        ["data-load-content", "click.php"]
    ]
} %}
```

This will be compiled to:

```html
<button class="px-4 py-2" id="click-me" data-load-content="click.php">Click me</button>
```

### Other syntax

Transformations can be added to Liquidish by using transformation strategies like those provided in the [🗺 Transformation Strategies](#-transformation-strategies) section.

You can also [create a 🧩 Custom Transformation Strategy](#-custom-transformation-strategy).

## 🗺 Transformation Strategies

Liquidish accepts a strategy that defines how the Liquidish syntax is transformed to the target language.

### 🖥 `ISPConfigTransformationStrategy`

This strategy transforms Liquidish to ISPConfig's `tpl` syntax.

To use it, you instantiate a new `LiquidishTransformer` like this:

```javascript
import { ISPConfigTransformationStrategy } from 'liquidish/strategies/ispconfig-transformation-strategy';
import { LiquidishTransformer } from 'liquidish';

const liquidish = new LiquidishTransformer({
    strategyBuilder: (transformer) => new ISPConfigTransformationStrategy(transformer)
});
```

It compiles Liquidish syntax to ISPConfig's `tpl` syntax in the following ways:

| Liquidish Syntax | ISPConfig `.tpl` Syntax | `strategyMethodName` | Notes |
|---|---|---|---|
| `{{ VARIABLE }}` | `{tmpl_var name="VARIABLE"}` | `variable` | If the variable is known at compile-time, it will be replaced with its value. For example when using `render` or `for` loops |
| `{% comment %} ... {% endcomment %}` | `<!-- ... -->` | `comment` | Outputs nothing if `showComments` is set to false on the transformer |
| `{% render './template' %}` | *Replaced with the contents of the `./template.liquid` file* | `render` | The `.liquid` extension does not have to be provided |
| `{% render './template', parameter1: 'value', parameter2: '{{ cool }}' %}` | *Replaced with the contents of the `./template.liquid` file* | `render` | The provided parameters are used to replace the variables in the sub-template at compile-time |
| `{% render './template', { "parameter1": "{{ logout_txt }}", "parameter2": ["arrays", "are", "supported"] } %}` | *Replaced with the contents of the `./template.liquid` file* | `render` | You can provide JSON of which the keys are passed as parameters to the sub-template |
| `{% for item in items %}{{ item }}{% endfor %}` | *Replaced with item, repeated for each item in the collection at compile time* | `for` |  |
| `{% if VARIABLE %}` | `{tmpl_if VARIABLE}` | `if` |  |
| `{% if VARIABLE == 'VALUE' %}` | `{tmpl_if name="VARIABLE" op="==" value="VALUE"}` | `if` | The `==` operator can be replaced with `!=`, `>`, `<`, `>=`, `<=` |
| `{% elsif VARIABLE %}` | `{tmpl_elseif VARIABLE}` | `elsif` |  |
| `{% elsif VARIABLE == 'VALUE' %}` | `{tmpl_elseif name="VARIABLE" op="==" value="VALUE"}` | `elsif` |  |
| `{% else %}` | `{tmpl_else}` | `else` |  |
| `{% endif %}` | `{/tmpl_if}` | `endif` |  |
| `{% unless VARIABLE %}` | `{tmpl_unless VARIABLE}` | `unless` |  |
| `{% endunless %}` | `{/tmpl_unless}` | `endunless` |  |

In addition to the standard Liquidish syntax, it also includes:

#### Loops

Loops compile to ISPConfig's loops. For example, this Liquidish code:

```liquid
{% loop items %}
    {{ item }}
{% endloop %}
```

Becomes this ISPConfig code:

```js
{tmpl_loop name="items"}
    {{ item }}
{/tmpl_loop}
```

*Unlike with `for` loops, the `in` keyword is not available to specify the iterable.*

#### Dyninclude

Dyninclude are defined with `{% dyninclude 'template-file' %}` and compile to ISPConfig's `dyninclude` tag:

```javascript
{tmpl_dyninclude name="template-file"}
```

#### Hooks

Hooks are defined with `{% hook 'hookName' %}` and compile to ISPConfig's `hook` tag:

```javascript
{tmpl_hook name="hookName"}
```

### 🌍 `PHPTransformationStrategy`

The PHP transformation strategy is a simple example of how to transform Liquidish to PHP. It is included as an example.

It is used like this:

```javascript
import { PHPTransformationStrategy } from 'liquidish/strategies/php-transformation-strategy';
import { LiquidishTransformer } from 'liquidish';

const liquidish = new LiquidishTransformer({
    strategyBuilder: (transformer) => new PHPTransformationStrategy(transformer)
});
```

It compiles Liquidish syntax to PHP in the following ways:

| Liquidish Syntax | PHP Syntax | `strategyMethodName` | Notes |
|---|---|---|---|
| `{{ VARIABLE }}` | `<?php echo $VARIABLE; ?>` | `variable` | If the variable is known at compile-time, it will be replaced with its value. For example when using `render` or `for` loops |
| `{% comment %} ... {% endcomment %}` | `<!-- ... -->` | `comment` | Outputs PHP comments (`<?php /* ... */ ?>`) if `showComments` is set to false on the transformer |
| `{% render './template' %}` | *Replaced with the contents of the `./template.liquid` file* | `render` | The `.liquid` extension does not have to be provided |
| `{% render './template', parameter1: 'value', parameter2: '{{ cool }}' %}` | *Replaced with the contents of the `./template.liquid` file* | `render` | The provided parameters are used to replace the variables in the sub-template at compile-time |
| `{% render './template', { "parameter1": "{{ logout_txt }}", "parameter2": ["arrays", "are", "supported"] } %}` | *Replaced with the contents of the `./template.liquid` file* | `render` | You can provide JSON of which the keys are passed as parameters to the sub-template |
| `{% for item in items %}{{ item }}{% endfor %}` | *Replaced with item, repeated for each item in the collection at compile time* | `for` |  |
| `{% if VARIABLE %}` | `<?php if ($VARIABLE) : ?>` | `if` |  |
| `{% if VARIABLE == 'VALUE' %}` | `<?php if ($VARIABLE == 'VALUE') : ?>` | `if` | The `==` operator can be replaced with `!=`, `>`, `<`, `>=`, `<=` |
| `{% elsif VARIABLE %}` | `<?php elseif ($VARIABLE) : ?>` | `elsif` |  |
| `{% elsif VARIABLE == 'VALUE' %}` | `<?php elseif ($VARIABLE == 'VALUE') : ?>` | `elsif` |  |
| `{% else %}` | `<?php else : ?>` | `else` |  |
| `{% endif %}` | `<?php endif; ?>` | `endif` |  |
| `{% unless VARIABLE %}` | `<?php if (!$VARIABLE) : ?>` | `unless` |  |
| `{% endunless %}` | `<?php endif; ?>` | `endunless` |  |

And it includes an additional `include` tag:

```liquid
{% include './header.php' %}
```

This will be transformed to PHP's `include` statement.

```php
<?php include './header.php'; ?>
```

### 🧩 Custom Transformation Strategy

You can create your own transformation strategy by extending the `TransformationStrategy` class.

```javascript
import { BaseTransformationStrategy } from 'liquid/strategies';
import { resolve } from 'path';

export class CustomTransformationStrategy extends BaseTransformationStrategy {
  getTransformations() {
    const transformations = [];

    // Call the parent class to include the default transformations (if, else, for, etc)
    transformations.push(...super.getTransformations());

    // Add your custom transformations

    transformations.push({
      // Each transformation has a strategyMethodName, which is the method that will be called on this strategy
      strategyMethodName: 'custom',

      // A regex to match the Liquidish syntax you want to transform
      regex: /{%\s*custom\s*((?:'[^']+?)'|"(?:[^']+?)"){1}\s*%}/g,
    });

    transformations.push({
      strategyMethodName: 'include',
      regex: /{%\s*include\s*((?:'[^']+?)'|"(?:[^']+?)"){1}\s*%}/g,

      // Optionally you can provide a parseFunction which will be called with the transformer and matched regex groups
      // The parseFunction should return an array. Those arrays will be passed to the method specified in strategyMethodName
      parseFunction: (transformer, includePath) => {
        // Remove the quotes from the path
        includePath = includePath.slice(1, -1);

        return [
          includePath,
        ];
      }
    });

    return transformations;
  }

  custom(customWithQuotes) {
    return `<?php custom(${customWithQuotes}); ?>`;
  }

  include(includePath) {
    return `<?php include '${includePath}'; ?>`;
  }
}
```
