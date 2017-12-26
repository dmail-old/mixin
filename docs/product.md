## product

product is the name given to objects returned by most `mixin` or `factory`.
It's a frozen object (non extensible and non configurable) and all its properties are non enumerable.
They also carry two helpers `valueOf`, `lastValueOf`.

### valueOf()

Return the object itself.
This is to be used with param destructuring because `valueOf` provides a pointer to the destructured object.

```javascript
import { pure } from "@dmail/mixin"

const functionWithDestructuring = ({ foo, valueOf }) => {
	return foo + valueOf()
}

const functionWithoutDestruturing = (product) => {
	const { foo } = product
	return foo + product
}

functionWithDestructuring(pure) // "undefined[object Object]"
functionWithoutDestruturing(pure) // "undefined[object Object]"
```

### lastValueOf()

In rare circumstances a method want to act on the final product.
`lastValueOf` returns the last product, a good use case could be a clone `method` like below:

```javascript
import { mixin, pure, replicate } from "@dmail/mixin"

const product = mixin(pure, ({ lastValueOf }) => {
	return {
		clone: replicate(lastValueOf()),
	}
})
const nextProduct = mixin(pure, () => ({ foo: true }))

nextProduct.clone().foo // true
```
