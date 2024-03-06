# 💧 `Liquidish`

In order to get better IDE support when working with ISPConfig's `tpl` files, we work with a Liquid-like templating language we call `Liquidish`. It is somewhat like [Liquid](https://shopify.github.io/liquid/), but with a few differences.

When building the theme, it is compiled to `.tpl.htm` files for ISPConfig.

## Migrate ISPConfig `tpl` to `Liquidish`

This is a guide for migrating ISPConfig's `tpl` files to `Liquidish`. This can be useful when porting an existing theme to this workflow.

### Variables

*E.g: `<tmpl_var name='VARIABLE'>` to `{{ VARIABLE }}`*

**There exist two variants you can match with this regex:**

  - `\{tmpl_var name="([^"]*)"\}`
  - `<tmpl_var name="([^"]*)">`

**Replacement:** `{{ $1 }}`

### If-statements

*E.g: `<tmpl_if name="logged_in">` to `{% if logged_in %}`*
*E.g: `<tmpl_if name="logged_in" value="y">` to `{% if logged_in == 'y' %}`*
E.g: `<tmpl_if name="logged_in" op="!=" value="y">` to `{% if logged_in != 'y' %}`

**Match the operator-less if with:** `<tmpl_if name="([^"]*)">`
**Replacement:** `{% if $1 %}`

**Match the implicit operator if with:** `<tmpl_if name="([^"]*)" value="([^"]*)">`
**Replacement:** `{% if $1 == '$2' %}`

**Match the operator if with:** `<tmpl_if name="([^"]*)" op="([^']*)" value="([^"]*)">`
**Replacement:** `{% if $1 $2 '$3' %}`

**Replace the closing tag matched with:** `</tmpl_if>` by `{% endif %}`

### Loops

*E.g: `<tmpl_loop name="VARIABLE">` to `{% for VARIABLE in VARIABLES %}`*

**Match:** `<tmpl_loop name="([^"]*)">`
**Replacement:** `{% for $1 %}`

Note the difference with Liquidish, where the `in` keyword is used to specify the iterable. Sadly in ISPConfig's `tpl` files, the iterable is not specified.

**Replace the closing tag matched with:** `</tmpl_loop>` by `{% endfor %}`
