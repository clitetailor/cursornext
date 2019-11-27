# Parsing Patterns

A cursor provides general interfaces to interact with the document. There are four basic functions that a cursor can perform:

- Move
- Test
- Read
- Backtrack

## Move

To move a cursor, we can use `next()` or `setIndex()`.

`next()` moves the cursor a number of characters. By using `next()`, we ensure that the cursor will move forward only:

```ts
const cursor = Cursor.from('Hello, World!')

cursor.next(2)
t.is(cursor.index, 2)

cursor.next(-1)
t.is(cursor.index, 2)

cursor.next(2)
t.is(cursor.index, 4)
```

`setIndex()` moves the cursor by setting its index directly.

```ts
const cursor = Cursor.from('Hello, World!')

cursor.setIndex(5)
t.is(cursor.index, 5)

cursor.setIndex(3)
t.is(cursor.index, 3)
```

This can be very helpful when working with regular expression:

```ts
const cursor = Cursor.from('-----1996-----')

const regexResult = cursor.exec(/[0-9]/)
cursor.setIndex(regexResult.index)

t.true(cursor.startsWith('1996'))
```

## Test

In cursornext, there are three methods that can be used to test a cursor:

- `startsWith()`
- `oneOf()`
- `exec()`

`startsWith()` takes an input string and tests whether the document from the cursor position starts with that string. For example:

```
1 | Hello, World!
  |        ^
  |        cursor
```

```ts
t.true(cursor.startsWith('World'))
```

`oneOf()` is similar to `startsWith()`, except it tests the cursor against multiple strings and returns the first string that matches. Otherwise, it would returns `null`.

```
1 | ----abcd-----
  |     ^
  |     cursor
```

```ts
t.is(cursor.oneOf(['bcd', 'cad', 'ab', 'abcd']), 'ab')
t.is(cursor.oneOf(['bca', 'bcd']), null)
```

`exec()` executes a search against the given regular expression. The search is executed on the document from the cursor position. It returns a `RegExpExecArray` or `null`:

```
1 | ----1234----
  |   ^
  |   cursor
```

```ts
const regexResult = cursor.exec(/[0-9]+/)

t.is(regexResult[0], '1234')
t.is(regexResult.index, 4)
```

If sticky flag is enabled, the match will only success if it starts from the cursor position in the document.

```
1 | ----1234----
  |   ^
  |   cursor
```

```ts
t.is(cursor.exec(/[0-9]+/y), null)
cursor.next(2)

const regexResult = cursor.exec(/[0-9]+/y)

t.is(regexResult[0], '1234')
t.is(regexResult.index, 4)
```

## Read

In cursornext, the most common way to read the document is by using marker. We can create a marker from a cursor by using `clone()`, then read the text between two cursors by using `takeUntil()`:

```ts
const cursor = Cursor.from('Hello, World!')

const marker = cursor.clone()
cursor.next(5)

// Read the input from the marker cursor position
// to the current cursor position.
const output = marker.takeUntil(cursor)

t.is(output, 'Hello')
```

`exec()` and `lookahead()` can also be used to extract information from the document:

```ts
const cursor = Cursor.from('Hello, World!')

t.is(cursor.lookahead(5), 'Hello')
cursor.next(5)

t.is(cursor.exec(/[a-zA-Z]+/)[0], 'World')
```

## Backtrack

Sometimes, when working with complex syntax constraints, you may need to backtrack to the last checkpoint. The following example illustrates how to backtrack using `moveTo()` method:

```ts
// Mark the cursor position by cloning the cursor.
const marker = cursor.clone()

// Do something with the cursor!
// ...
// ...

// If some constraint are not sastisfied, backtrack
// the cursor to the marked position.
if (!sastisfied) {
  cursor.moveTo(marker)
}
```
