# metalsmith-super-excerpt

A [Metalsmith](https://metalsmith.io/) plugin for Confluence-style excerpts: mark any part of a page as its excerpt, or give an excerpt a name and reuse it on other pages and in templates.

Most excerpt plugins take everything before a WordPress-style `<!-- more -->` marker. Here, shortcodes mark the excerpt, so it can be any text anywhere in the page:

```
[excerpt]This page explains the build.[/excerpt]
```

A named excerpt is shared across the whole site:

```
[excerpt name=build-overview]...[/excerpt]      <!-- on one page -->
[insertExcerpt name=build-overview]             <!-- on any other -->
```

## Installation

It isn't on npm; install it from GitHub:

```sh
npm install --save-dev dmccuskey/metalsmith-super-excerpt
```

## Quick Start

The following takes about five minutes with Node.js (14 or later) and Metalsmith 2. It builds a two-page site in which one page shows an excerpt written on the other.

`build.js`:

```js
var Metalsmith = require('metalsmith'),
  markdown = require('metalsmith-markdown'),
  superExcerpt = require('metalsmith-super-excerpt');

Metalsmith(__dirname)
  .use(markdown())
  .use(superExcerpt({ clean: true }))
  .destination('./build')
  .build(function (err) {
    if (err) throw err;
  });
```

`src/a.md`:

```
# Page A

[excerpt]This is the *page* excerpt.[/excerpt]

[excerpt name=shared hidden=true]Shared **content**.[/excerpt]

Body text.
```

`src/b.md`:

```
# Page B

[insertExcerpt name=shared]
```

Run `npm install metalsmith@2 metalsmith-markdown@1 dmccuskey/metalsmith-super-excerpt`, then `node build.js`. `build/a.html` keeps its own excerpt and hides the named one; `build/b.html` gets the named excerpt:

```html
<!-- build/a.html -->
<h1 id="page-a">Page A</h1>
<p>This is the <em>page</em> excerpt.</p>
<p>Body text.</p>

<!-- build/b.html -->
<h1 id="page-b">Page B</h1>
Shared <strong>content</strong>.
```

## Usage

### Options

| option | default | effect |
|---|---|---|
| `clean` | `false` | Use it when the plugin runs after Markdown. Markdown wraps a shortcode on its own line in `<p>...</p>`, which breaks a multi-paragraph excerpt; `clean` removes those wrappers, and the empty paragraphs hidden excerpts leave. |

Run the plugin after Markdown (or another converter) to get HTML excerpts; before it, the excerpts are raw source.

### Page Excerpts

```
[excerpt]content[/excerpt]
[excerpt hidden=true]content[/excerpt]
```

The content becomes the file's `excerpt` property, and stays on the page unless `hidden=true`. The content may span several paragraphs: put each tag on its own line and use `clean`. A page with several unnamed excerpts keeps the last one. Show it in a template, e.g. in Swig (`safe` keeps the HTML from being escaped):

```
{{ excerpt | safe }}
```

### Named Excerpts

```
[excerpt name=my-name]content[/excerpt]
[insertExcerpt name=my-name]
```

A named excerpt goes into the global metadata table `insertExcerpt` instead of the file's `excerpt`; `hidden=true` works the same. `insertExcerpt` puts it into any page, in a second pass, so the defining page may come later in the build. An unknown name inserts nothing. In templates:

```
{{ insertExcerpt['my-name'] | safe }}
```

Names are letters, digits, `-` and `_`, or a quoted string. Names are global, so a second excerpt with the same name replaces the first.

One use: a superclass's API page wraps its method list in a named excerpt, and each subclass page inserts it.

## Similar Plugins

- [metalsmith-excerpts](https://github.com/segmentio/metalsmith-excerpts): the first paragraph as the excerpt.
- [metalsmith-better-excerpts](https://github.com/simbo/metalsmith-better-excerpts): an excerpt from the content or metadata, with more options.

## License

MIT; see [LICENSE](LICENSE).
