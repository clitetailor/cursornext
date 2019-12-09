<div align="center">
  <h1>
    cursor|<i class="text-blue">next</i>
  </h1>

  <p>A minimalist parsing library for Node.js</p>
</div>

## Why cursor|next?

While such frameworks like nearley, ohm and peg are powerful already and provide out-of-the-box features for generating and testing parser. These frameworks rely heavily upon LL and LR algorithms and grammars.

cursornext takes another approach, it provides the lowest lever interface to interact with the document and let you decide how to parse your own syntax. The downside is that you have to put more efforts building your own parser. Because you are not rely on any built-in algorithm and grammar, it may lacks of tools for checking and generating syntax tree. The upside is that building a parser tool is now more modular and customizable. The interface is also simple that it is much more friendlier to work with Chrome or Node debugger.

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

To create a new cursor, you can use `Cursor.from()` method:

```js
const { Cursor } = require('cursornext')

const cursor = Cursor.from('Hello, World!')
```

Now you can move and test the cursor using `next()` and `startsWith()`.

```ts
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
