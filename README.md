<h1 align="center">
  cursor|<i class="text-blue">next</i>
</h1>

<p align="center">A minimalist cursor parser for parsing things</p>

Why cursor|next?
----------------

While such frameworks like nearley, ohm and peg are powerful already and provide out-of-the-box features for generating and testing parser. These frameworks rely heavily upon LL and LR algorithms and grammars.

cursornext takes another approach, it provides the lowest lever interface to interact with document and let you decide how to parse your own syntax. The downside is that you have to put more efforts on building your own parser. Because you are not rely on any built-in algorithm and grammar thus, it may lacks of tools for checking and generating syntax tree. The upside is that building a parser tool is now more modular and customizable. The interface is also simple that it is much more friendlier to work with Chrome or Node debugger.

Usage
-----

cursornext is available to install via npm:

```bash
npm install --save cursornext
```

and Yarn:

```
yarn add cursornext
```

### Create your first cursor

You can create a new cursor the start of a document by using `Cursor.from` method:

```js
const { Cursor } = require('cursornext')

const cursor = Cursor.from('Hello, World!')
```

From now on, you can keep playing around with your own cursor:

```js
cursor.next(7)
cursor.startsWith('World') // => true
```

License
-------

[MIT License](LICENSE)
