# 💧 Migrate ISPConfig `tpl` to `Liquidish`

This is a guide for migrating ISPConfig's `tpl` files to `Liquidish`. This can be useful when porting an existing theme to this workflow.

💡 *I hope to one day use this information to create a migration script. But for now just making note of this will do.*

## Migrating Variables

*E.g: `<tmpl_var name='VARIABLE'>` to `{{ VARIABLE }}`*

**There exist two variants you can match with this regex:**

  - `\{tmpl_var name="([^"]*?)"\}`
  - `\{tmpl_var name='([^']*?)'\}`
  - `\{tmpl_var name=([^ ]*?)\}`
  - `<tmpl_var name="([^"]*?)">`
  - `<tmpl_var name='([^']*?)'>`
  - `<tmpl_var name=([^ ]*?)>`
  - There is some funky stuff out there (like opened by `<tmpl_var` and closed by `}`), so just search for `tmpl_var` and finish the job manually.

**Replacement:** `{{ $1 }}`

## Migrating If-statements

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

## Migrating Unless-statements

*E.g: `<tmpl_unless name="logged_in">` to `{% unless logged_in %}`*

**Match:** `<tmpl_unless name="([^"]*?)">` or `<tmpl_unless name='([^']*?)'>` or `\{tmpl_unless name="([^"]*?)"\}` or `\{tmpl_unless name='([^']*?)'\}`
**Replacement:** `{% unless $1 %}`

**Replace the closing tag matched with:** `</tmpl_unless>` or `\{/tmpl_unless\}` by `{% endunless %}`

## Migrating Loops

*E.g: `<tmpl_loop name="VARIABLE">` to `{% loop VARIABLE %}`*

**Match:** `<tmpl_loop name="([^"]*?)">` or `<tmpl_loop name='([^']*?)'>`
**Replacement:** `{% loop $1 %}`
\
**Replace the closing tag matched with:** `</tmpl_loop>` by `{% endloop %}`

## Migrating Dyninclude

*E.g: `<tmpl_dyninclude name="content_tpl">` to `{% dyninclude 'content_tpl' %}`*

**Match:** `<tmpl_dyninclude name="([^"]*?)">` or `<tmpl_dyninclude name='([^']*?)'>`
**Replacement:** `{% dyninclude '$1' %}`

## Migrating Hooks

*E.g: `{tmpl_hook name="content"} to {% hook 'content' %}`*

**Match:** `\{tmpl_hook name="([^"]*?)"\}` or `\{tmpl_hook name='([^']*?)'\}`
**Replacement:** `{% hook '$1' %}`

## Renaming all files

Using powershell, you can rename all files in a directory with the following command:

```powershell
Get-ChildItem -Path ".\src\templates" -Filter *.htm -Recurse | Rename-Item -NewName { $_.Name -replace '.htm$', '.liquid' }
```
