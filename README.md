<h1 align="center">
  cursor|<i class="text-blue">next</i>
</h1>

<p align="center">A minimalist parsing library for Node.js</p>

## Why cursor|next?

While such frameworks like nearley, ohm and peg are powerful and provide out-of-the-box features for generating and testing parser. These frameworks rely heavily upon LL and LR algorithms and grammars.

cursornext is a cursor-based general-purpose library for parsing which provides programmatic interface to interact with document. Because it does not rely too much on grammar, building a parser is much modular, customizable and easier for testing and debugging parser.

## Install

cursornext is available to install via npm:

```bash
npm install --save cursornext
```

and Yarn:

```
yarn add cursornext
```

### Create your first cursor

You can create a new cursor the start of a document by using `from()` method:

```js
const { Cursor } = require('cursornext')

const cursor = Cursor.from('Hello, World!')
```

From now on, you can keep playing around with your own cursor:

```js
cursor.next(7)
cursor.startsWith('World')
// => true
```

## Documentation

For more documentation, please checkout the [`docs`](./docs) directory:

- [Parsing Patterns](./docs/01-parsing-patterns.md)
- [Writing Tests](./docs/02-writing-tests.md)
- [Loc](./docs/03-loc.md)

## License

[MIT License](LICENSE)
