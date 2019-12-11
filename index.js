#!/usr/bin/env node

let data
let args
let options = {
  term: '',          // always the first argument
  device: {
    mobile: true,    // -m or --mobile to exclude
    desktop: true    // -d or --desktop to exclude
  },
  type: 'regex',     // -t or --type {regex | startsWith | endsWith | contains | matches}
  sort: 'mostUsed',  // -s or --sort {mostUsed | leastUsed | alphabetical}
  output: 'cli',     // -o or --output {cli | json}
  helpMode: false    // -h or --help to output help text
}

const filtering = {
  regex: string =>  data.filter(({element}) => {
    let [pattern, flags] = string.split('/')
    return element.match(new RegExp(pattern, flags))
  }),
  startsWith: string => data.filter(({element}) => element.startsWith(string)),
  endsWith: string => data.filter(({element}) => element.endsWith(string)),
  includes: string => data.filter(({element}) => element.includes(string)),
  exact: string => data.filter(({element}) => element === string),
  loose: string => data.filter(({element}) =>
    element.toLowerCase().trim() === string.toLowerCase().trim()  
  )
}

const sorting = {
  mostUsed: obj => obj.sort((a, b) => b.pct - a.pct),
  leastUsed: obj => obj.sort((a, b) => a.pct - b.pct),
  alphabetical: obj => obj.sort((a, b) => a.element[0].charCodeAt(0) - b.element[0].charCodeAt(0)),
  reverse: obj => obj.sort((a, b) => b.element[0].charCodeAt(0) - a.element[0].charCodeAt(0)),
  mobile: obj => obj.sort((a, b) => b.client[0].charCodeAt(0) - a.client[0].charCodeAt(0)),
  desktop: obj => obj.sort((a, b) => a.client[0].charCodeAt(0) - b.client[0].charCodeAt(0))
}

const formatting = {
  cli: arr => arr
    .map(obj => `<${obj.element}> [${obj.client}] ${obj.pct}% (${obj.pages}/${obj.totalPages})`)
    .join('\n'),
  csv: arr => 'Tag Name, Data set, Percentage, Pages Seen, Pages Crawled\n'
    + arr
      .map(({client, element, pages, totalPages, pct}) => 
        [element, client, pct, pages, totalPages]
          .map(cell => `"${String(cell).replace(/"/g, '""')}"`)
          .join(',')
      )
      .join('\n'),
  json: arr => JSON.stringify(arr, null, 2)
}

// Deno CLI support
if (typeof Deno !== 'undefined') {
  args = Deno.args.slice(1)
  data = JSON.parse(
    new TextDecoder('utf-8').decode(
      Deno.readFileSync('./data/html-data-aug-2019.json')
    )
  )
}

// Node CLI support
if (typeof process !== 'undefined') {
  args = process.argv.slice(2)
  require = require || function() {}
  data = require('./data/html-data-aug-2019.json')
}

let desktopTotal = Number(data.find(obj => obj.client === 'desktop').totalPages)
let mobileTotal = Number(data.find(obj => obj.client === 'mobile').totalPages)

// Argument parsing
args.forEach((arg, index, list) => {

  // First argument is always our search term
  if (index === 0) {
    options.term = arg
  }

  // -m or --mobile to include mobile data in output
  if (
    ['-m', '--mobile'].some(term => term === arg)
  ) {
    options.device.mobile = false
  }

  // -d or --desktop to include desktop data in output
  if (
    ['-d', '--desktop'].some(term => term === arg)
  ) {
    options.device.desktop = false
  }

  // -t or --type to specify type of filter to use
  if (
    ['-t', '--type'].some(term => term === arg)
    && list[index + 1]
    && typeof list[index + 1] === 'string'
    && Object.keys(filtering).some(term => term === list[index + 1])
  ) {
    options.type = list[index + 1]
  }

  // -s or --sort to specify type of sorting to use
  if (
    ['-s', '--sort'].some(term => term === arg)
    && list[index + 1]
    && typeof list[index + 1] === 'string'
    && Object.keys(sorting).some(term => term === list[index + 1])
  ) {
    options.sort = list[index + 1]
  }

  // -o or --output to choose output format (JSON or CLI output)
  if (
    ['-o', '--output'].some(term => term === arg)
    && list[index + 1]
    && typeof list[index + 1] === 'string'
    && Object.keys(formatting).some(term => term === list[index + 1])
  ) {
    options.output = list[index + 1]
  }

  // -h or --help to output help text, or no args given
  if (['-h', '--help'].some(term => term === arg)) {
    options.helpMode = true
  }
})

// If no arguments given, enable help mode
if (args.length === 0) {
  options.helpMode = true
}

// Remove the default object from the data
data = data.filter(({client}) => client !== 'client')

// Optionally remove mobile data
if (options.device.mobile === false) {
  data = data.filter(({client}) => client !== 'mobile')
}

// Optionally remove desktop data
if (options.device.desktop === false) {
  data = data.filter(({client}) => client !== 'desktop')
}

// Apply search term, filter, and sort to data
data = formatting[options.output](
  sorting[options.sort](
    filtering[options.type](
      options.term
    )
  )
)

const helpMessage = () => `
HTTPArchive DOM Explorer

About:

This utility lets you filter and sort data exported from the HTTPArchive crawl of ${(desktopTotal + mobileTotal).toLocaleString()} websites. Enter a search term, an optional matching type, an optional sorting order, and an output format.

Options:

  -m, --mobile     exclude mobile data from output
  -d, --desktop    exclude desktop data from output
  -t, --type       specify which type of term matching to use
  -s, --sort       specify the ordering of the results
  -o, --output     declare the formatting of the output
  -h, --help       display this help message

Matching types available:
${Object.keys(filtering).map(plugin => `\n  - ${plugin}`).join('')}

Sorting orders available:
${Object.keys(sorting).map(plugin => `\n  - ${plugin}`).join('')}

Output formats available:
${Object.keys(formatting).map(plugin => `\n  - ${plugin}`).join('')}

Usage:

  To display stats for <body> tag usage:

    $ node hade.js body -t exact

  To find all tag names starting with 'modal-'

    $ deno hade.js 'modal-' -t startsWith

  To find all tag names ending with '-modal' sorted alphabetically

    $ node hade.js '-modal' -t endsWith -s alphabetical

  To display JSON output

    $ deno hade.js noscript -t exact -o json

`

// Output formatted result to console if not empty and no help text displayed
if (
  options.helpMode === false
  && data.length
) {
  console.log(data)
} else if (options.helpMode === true) {
  console.log(helpMessage())
}