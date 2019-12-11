# hade

HTTPArchive DOM Explorer command line tool.

[![Run on Repl.it](https://repl.it/badge/github/tomhodgins/hade)](https://repl.it/github/tomhodgins/hade)

## About

This utility lets you filter and sort data exported from the HTTPArchive crawl of 9,669,416 websites. Enter a search term, an optional matching type, an optional sorting order, and an output format.

> Note: Current data in [data/html-data-aug-2019.json](data/html-data-aug-2019.json) is from August 2019

## Usage

You can use hade with Node or Deno, the options are the same. To search for `<accordion>` tag usage, you can use either `node index.js` or `deno index.js`, followed by the term you wish to search, `accordion`, and any additional options you want to specify. In this case we will search for exact matches to `accordion`, to we can add `-t exact` or `--type exact`:

```bash
node index.js accordion -t exact
```

By default the output will look like this:

```bash
$ node index.js accordion -t exact

<accordion> [mobile] 0.01% (375/5297442)
<accordion> [desktop] 0% (216/4371974)
```

This shows us that `<accordion>` is used on `0.01%` of mobile websites observed, and `0%` of desktop websites surveyed. The actual numbers are `375` mobile websites and `216` desktop sites in total.

To get the same information in a different format we can specify `-o json` or `--output json` for JSON output:

```bash
$ node index.js accordion -t exact -o json

[
  {
    "client": "mobile",
    "element": "accordion",
    "pages": 375,
    "totalPages": "5297442",
    "pct": 0.01
  },
  {
    "client": "desktop",
    "element": "accordion",
    "pages": 216,
    "totalPages": "4371974",
    "pct": 0
  }
]
```

And to output the results as CSV you can use `-o csv` or `--output csv`:

```bash
$ node index.js accordion --t exact -o csv

Tag Name, Data set, Percentage, Pages Seen, Pages Crawled
"accordion","mobile","0.01","375","5297442"
"accordion","desktop","0","216","4371974"
```

## Options

### `-m` or `--mobile`

Use this option to exclude mobile data from the output

### `-d` or `--desktop`

Use this option to exclude desktop data from the output.

### `-t` or `--type`

Use this option to specify which type of string matching to use. Available options are:

- `regex`: use search term as a regular expression to match tag name
- `startsWith`: use search term to match start of tag name to match
- `endsWith`: use search term to match end of tag name to match
- `includes`: search term must appear somewhere in tag name to match
- `exact`: search term must match tag name exactly
(case sensitive)
- `loose`: search term must loosely match tag name (case insensitive)

### `-s` or `--sort`

Use this option to specify which sorting option you would like. Available options are:

- `mostUsed`: Show most-used tags at the top of the results, moving toward least-used
- `leastUsed`: Show least-used tags at the top of the results, moving toward most-used
- `alphabetical`: Show tags in alphabetical order
- `resverse`: Show tags in reverse alphabetical order
- `mobile`: Show mobile tags first
- `desktop`: Show desktop tags first

### `-o` or `--output`

You can use this option to specify the format of the output. By default it will display information in a format for reading on the command-line. Available options are:

- `json` for JSON-formatted data
- `csv` for Comma Separated Value formatting for use as a spreadsheet

### `-h` or `--help`

Display help text in the console.

## Examples

To display stats for `<body>` tag usage:

```bash
$ node hade.js body -t exact
```

To find all tag names starting with `modal-`

```bash
$ deno hade.js 'modal-' -t startsWith
```

To find all tag names ending with `-modal` sorted alphabetically

```bash
$ node hade.js '-modal' -t endsWith -s alphabetical
```

To display JSON output

```bash
$ deno hade.js noscript -t exact -o json
```

To display all HTML tags in order of use

```bash
$ node hade.js "^(a|abbr|acronym|address|applet|area|article|aside|audio|b|base|basefont|bdi|bdo|bgsound|big|blockquote|body|br|button|canvas|caption|center|cite|code|col|colgroup|command|content|data|datalist|dd|del|details|dfn|dir|dialog|div|dl|dt|em|embed|fieldset|figcaption|figure|font|footer|form|frame|frameset|h1|h2|h3|h4|h5|h6|head|header|hgroup|hr|html|i|iframe|image|img|input|ins|kbd|keygen|label|layer|legend|li|link|listing|main|map|mark|marquee|menu|meta|meter|nav|nobr|noembed|noframes|nolayer|object|ol|optgroup|option|output|shadow|p|param|picture|plaintext|portal|pre|progress|q|rb|rp|rt|rtc|ruby|s|samp|script|section|select|slot|small|source|span|strike|strong|style|sub|summary|sup|table|tbody|td|template|textarea|tfoot|th|thead|time|title|tr|track|tt|u|ul|var|video|wbr|xmp|noscript)\\$"
```