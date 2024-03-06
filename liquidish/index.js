/**
 * Liquidish is a custom template language that is similar to Liquid, but with some differences.
 * 
 * It transpiles to the ISPConfig template language.
 * 
 * The following transformations are made:
 * 
 * - `{{ VARIABLE }}` -> {tmpl_var name="VARIABLE"}
 * 
 * - `{% if VARIABLE %}` -> {tmpl_if name="VARIABLE"}
 * - `{% if VARIABLE OPERATOR 'VALUE' %}` -> {tmpl_if name="VARIABLE" op="OPERATOR" value="VALUE"}
 * - `{% elsif VARIABLE %}` -> {tmpl_elseif name="VARIABLE"}
 * - `{% elsif VARIABLE OPERATOR 'VALUE' %}` -> {tmpl_elseif name="VARIABLE" op="OPERATOR" value="VALUE"}
 * - `{% else %}` -> {tmpl_else}
 * - `{% endif %}` -> {/tmpl_if}
 * 
 * - `{% unless VARIABLE %}` -> {tmpl_unless name="VARIABLE"}
 * - `{% endunless %}` -> {/tmpl_unless}
 * 
 * - `{% for VARIABLE %}` -> {tmpl_loop name="VARIABLE"}
 * - `{% endfor %}` -> {/tmpl_loop}
 * 
 * - {% render 'COMPONENT' %} -> {tmpl_dyninclude name="COMPONENT"}
 * 
 * - {% hook 'HOOKNAME' %} -> {tmpl_hook name="HOOKNAME"}
 */
const transformRegexes = [];

/**
 * Adds a transformation regex to the list of regexes.
 * 
 * @param {RegExp} regex The regex to add
 * @param {string} replacement The replacement string
 */
function addTransform(regex, replacement) {
  transformRegexes.push({ regex, replacement });
}

// Add the transformations
addTransform(/{{\s*(\w+)\s*}}/g, '{tmpl_var name="$1"}');
addTransform(/{%\s*if\s*(\w+)\s*%}/g, '{tmpl_if name="$1"}');
addTransform(/{%\s*if\s*(\w+)\s*(\S+)\s*'([^']+)'\s*%}/g, '{tmpl_if name="$1" op="$2" value="$3"}');
addTransform(/{%\s*elsif\s*(\w+)\s*%}/g, '{tmpl_elseif name="$1"}');
addTransform(/{%\s*elsif\s*(\w+)\s*(\S+)\s*'([^']+)'\s*%}/g, '{tmpl_elseif name="$1" op="$2" value="$3"}');
addTransform(/{%\s*else\s*%}/g, '{tmpl_else}');
addTransform(/{%\s*endif\s*%}/g, '{/tmpl_if}');
addTransform(/{%\s*unless\s*(\w+)\s*%}/g, '{tmpl_unless name="$1"}');
addTransform(/{%\s*endunless\s*%}/g, '{/tmpl_unless}');
addTransform(/{%\s*for\s*(\w+)\s*%}/g, '{tmpl_loop name="$1"}');
addTransform(/{%\s*endfor\s*%}/g, '{/tmpl_loop}');
addTransform(/{%\s*render\s*'([^']+)'\s*%}/g, '{tmpl_dyninclude name="$1"}');
addTransform(/{%\s*hook\s*'([^']+)'\s*%}/g, '{tmpl_hook name="$1"}');

export function liquidishTransform(contents, path) {
  for (const { regex, replacement } of transformRegexes) {
    contents = contents.replace(regex, replacement);
  }

  return contents;
}