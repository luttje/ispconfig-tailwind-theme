# 💧 `Liquidish`

In order to get better IDE support when working with ISPConfig's `tpl` files, we work with a Liquid-like templating language we call `Liquidish`. It is somewhat like [Liquid](https://shopify.github.io/liquid/), but with a few differences.

When building the theme, it is compiled to `.tpl.htm` files for ISPConfig.

> Check out one of these VSCode extensions for Liquid syntax highlighting and other language features:
>
> - [Official Shopify Liquid extension](https://marketplace.visualstudio.com/items?itemName=Shopify.theme-check-vscode)
> - [Alternative extension](https://marketplace.visualstudio.com/items?itemName=sissel.shopify-liquid) 

## 📚 Liquidish Syntax (Transpiled)

This syntax is transpiled (translated) to ISPConfig's `tpl` syntax.

### Variables

Variables are defined with double curly braces: `{{ VARIABLE }}`.

> ![NOTE]
> If variables are known at compile-time (e.g: when using `render`/`render_json` or `for` loops), they will be replaced with their value at compile-time.

### If-statements

If-statements are defined with `{% if VARIABLE %}`. You can also use `==`, `!=`, `>`, `<`, `>=`, `<=` as operators.

### Unless-statements

Unless-statements are defined with `{% unless VARIABLE %}`.

### Loops

Loops are defined with `{% loop VARIABLE %}`. Unlike Liquid, the `in` keyword is not used to specify the iterable.

### Dyninclude

Dyninclude are defined with `{% dyninclude 'content_tpl' %}`.

#### Hooks

Hooks are defined with `{% hook 'content' %}`.

#### 🔥 Extra Syntax Features

These features suplement the ISPConfig `tpl` syntax, by performing string manipulation at compile-time.

> [!WARNING]
> These features are implement using very basic string manipulation. They can be error-prone if not used correctly.

### Commenting out code

You can comment out code using `{% comment %}` and `{% endcomment %}`.

```liquid
{% comment %}
    This is a comment
{% endcomment %}
```

By default this will be removed from the output.

### Pre-compiling snippets with `{% render ... %}`

When using `{% render './path/to/sub-template.liquid' %}` the sub-template will be compiled to the final `.tpl.htm` file. This is unlike the `dyninclude` tag, which is included at runtime by ISPConfig.

You must provide the path starting with `./` or `../` so it can be adjusted to the correct path when compiled.

```liquid
{% render './components/button.liquid' %}
```

To pass parameters to the sub-template, you can use following syntax:

```liquid
{% render './components/button', variable: 'value', another_variable: 'another_value' %}
```

Note that the `.liquid` extension is optional.

### Pre-compiling snippets with `{% render_json ... %}`

In order to pass complex JSON objects/arrays to a component you can use:

```liquid
{% render_json 'components/heading', {
    "slot": "{{ logout_txt }} {{ cpuser }}",
    "attributes": [
        ["id", "logout-button"],
        ["data-load-content", "login/logout.php"]
    ]
} %}
```

Due to the limited implementation of this feature, you can not have the JSON object contain `%}`.

### Looping over variables with `{% for ... in ... %}`

Where `{% loop ... %}` transpiles to a runtime loop. `{% for ... in ... %}` transpiles to a compile-time loop.

Provide it with a variable that is known at compile-time, and it will loop over it:

```liquid
{% for item in items %}
    {{ item }}
{% endfor %}
```

This can be useful when you want to loop over a bunch of items that are known at compile-time, e.g: for attributes in a button component:

```liquid
<button class="px-4 py-2"
        {% for attribute in attributes %}
        {{ attribute[0] }}="{{ attribute[1] }}"
        {% endfor %}>
        {{ slot }}
</button>
```

The attributes would be provided like this:

```liquid
{% render_json 'components/button', {
    "slot": "Click me",
    "attributes": [
        ["id", "click-me"],
        ["data-load-content", "click.php"]
    ]
} %}
```

## Migrate ISPConfig `tpl` to `Liquidish`

This is a guide for migrating ISPConfig's `tpl` files to `Liquidish`. This can be useful when porting an existing theme to this workflow.

### Migrating Variables

*E.g: `<tmpl_var name='VARIABLE'>` to `{{ VARIABLE }}`*

**There exist two variants you can match with this regex:**

  - `\{tmpl_var name="([^"]*?)"\}`
  - `\{tmpl_var name='([^']*?)'\}`
  - `\{tmpl_var name=([^ ]*?)\}`
  - `<tmpl_var name="([^"]*?)">`
  - `<tmpl_var name='([^']*?)'>`
  - `<tmpl_var name=([^ ]*?)>`
  - There is some funky stuff out there (like opened by &lt;tmpl_var and closed by }), so just search for `tmpl_var` and finish the job manually.

**Replacement:** `{{ $1 }}`

### Migrating If-statements

*E.g: `<tmpl_if name="logged_in">` to `{% if logged_in %}`*
*E.g: `<tmpl_if name="logged_in" value="y">` to `{% if logged_in == 'y' %}`*
E.g: `<tmpl_if name="logged_in" op="!=" value="y">` to `{% if logged_in != 'y' %}`

**Match the operator-less if with:** `<tmpl_if name="([^"]*?)">`
**Or:** `\{tmpl_if name="([^"]*?)"\}`
**Or:** `<tmpl_if name='([^']*?)'>`
**Or:** `\{tmpl_if name='([^']*?)'\}`
**Replacement:** `{% if $1 %}`

**Match the implicit operator if with:** `<tmpl_if name="([^"]*?)" value="([^"]*?)">`
**Or:** `\{tmpl_if name="([^"]*?)" value="([^"]*?)"\}`
**Or:** `<tmpl_if name='([^']*?)' value='([^']*?)'>`
**Or:** `\{tmpl_if name='([^']*?)' value='([^']*?)'\}`
**Replacement:** `{% if $1 == '$2' %}`

**Match the operator if with:** `<tmpl_if name="([^"]*?)" op="([^']*?)" value="([^"]*?)">`
**Or:** `\{tmpl_if name="([^"]*?)" op="([^']*?)" value="([^"]*?)"\}`
**Or:** `<tmpl_if name='([^']*?)' op='([^']*?)' value='([^']*?)'>`
**Or:** `\{tmpl_if name='([^']*?)' op='([^']*?)' value='([^']*?)'\}`
**Replacement:** `{% if $1 $2 '$3' %}`

**Also some weird ones, like:** `<tmpl_if name='__EVEN__'}`
**Replacement:** `{% if __EVEN__ %}`

**And ones like this (just search them by tmpl_if, its only a few):** `<tmpl_if name='show_delete_on_forms' op="==" value="y">`
**Replacement:** `{% if show_delete_on_forms == 'y' %}`

**Replace the else tag matched with:** `</tmpl_else>` or `<tmpl_else>` or `\{tmpl_else\}` or `\{/tmpl_else\}` by `{% else %}`

**Replace else-if tag matched with:** `<tmpl_elseif name="([^"]*?)" value="([^"]*?)">` or `\{tmpl_elseif name="([^"]*?)" value="([^"]*?)"\}` or `<tmpl_elseif name='([^']*?)' value='([^']*?)'>` or `\{tmpl_elseif name='([^']*?)' value='([^']*?)'\}`
**Replacement:** `{% elsif $1 == '$2' %}`

**Or else-if with operators matched with:** `<tmpl_elseif name="([^"]*?)" op="([^']*?)" value="([^"]*?)">` or `\{tmpl_elseif name="([^"]*?)" op="([^']*?)" value="([^"]*?)"\}` or `<tmpl_elseif name='([^']*?)' op='([^']*?)' value='([^']*?)'>` or `\{tmpl_elseif name='([^']*?)' op='([^']*?)' value='([^']*?)'\}`
**Replacement:** `{% elsif $1 $2 '$3' %}`

**Or else-if with no op and no value matched with:** `<tmpl_elseif name="([^"]*?)">` or `\{tmpl_elseif name="([^"]*?)"\}` or `<tmpl_elseif name='([^']*?)'>` or `\{tmpl_elseif name='([^']*?)'\}`
**Replacement:** `{% elsif $1 %}`

**Replace the closing tag matched with:** `</tmpl_if>` or `\{/tmpl_if\}` by `{% endif %}`

### Migrating Unless-statements

*E.g: `<tmpl_unless name="logged_in">` to `{% unless logged_in %}`*

**Match:** `<tmpl_unless name="([^"]*?)">` or `<tmpl_unless name='([^']*?)'>` or `\{tmpl_unless name="([^"]*?)"\}` or `\{tmpl_unless name='([^']*?)'\}`
**Replacement:** `{% unless $1 %}`

**Replace the closing tag matched with:** `</tmpl_unless>` or `\{/tmpl_unless\}` by `{% endunless %}`

### Migrating Loops

*E.g: `<tmpl_loop name="VARIABLE">` to `{% loop VARIABLE %}`*

**Match:** `<tmpl_loop name="([^"]*?)">` or `<tmpl_loop name='([^']*?)'>`
**Replacement:** `{% loop $1 %}`
\
**Replace the closing tag matched with:** `</tmpl_loop>` by `{% endloop %}`

### Migrating Dyninclude

*E.g: `<tmpl_dyninclude name="content_tpl">` to `{% dyninclude 'content_tpl' %}`*

**Match:** `<tmpl_dyninclude name="([^"]*?)">` or `<tmpl_dyninclude name='([^']*?)'>`
**Replacement:** `{% dyninclude '$1' %}`

### Migrating Hooks

*E.g: `{tmpl_hook name="content"} to {% hook 'content' %}`*

**Match:** `\{tmpl_hook name="([^"]*?)"\}` or `\{tmpl_hook name='([^']*?)'\}`
**Replacement:** `{% hook '$1' %}`

### Renaming all files

Using powershell, you can rename all files in a directory with the following command:

```powershell
Get-ChildItem -Path ".\src\templates" -Filter *.htm -Recurse | Rename-Item -NewName { $_.Name -replace '.htm$', '.liquid' }
```
