# api

* [pure](#pure)
* [isProduct(value)](#isproductvalue)
* [mixin(product, ...talents)](#mixinproduct-talents)
* [isComposedOf(product, value)][#iscomposedofproduct-value]
* [hasTalent(talent, product)](#hastalenttalent-product)
* [createFactory(product, argumentsTalent, ...talents)](#createfactoryproduct-argumentstalent-talents)
* [isProductOf(factory, product)](#isproductoffactory-product)
* [replicate(product)](#replicateproduct)

## pure

An object without talent

```javascript
import { pure } from "@dmail/mixin"
```

[source](../src/mixin.js) | [test](../src/mixin.test.js)

## isProduct(value)

```javascript
import { isProduct, pure } from "@dmail/mixin"

isProduct(null) // false
isProduct({}) // false
isProduct(pure) // true
```

[source](../src/mixin.js) | [test](../src/mixin.test.js)

## mixin(product, ...talents)

```javascript
import { mixin, pure } from "@dmail/mixin"

const answerToEverythingTalent = () => ({ getAnswer: () => 42 })
const oppositeAnswerTalent = ({ getAnswer }) => ({ getAnswerOpposite: () => getAnswer() * -1 })

const intermediateProduct = mixin(pure, answerToEverythingTalent)
const product = mixin(intermediateProduct, oppositeAnswerTalent)

product.getAnswer() // 42
product.getAnswerOpposite() // -42
```

[source](../src/mixin.js) | [test](../src/mixin.test.js)

## isComposedOf(product, value)

```javascript
import { mixin, pure, isComposedOf } from "@dmail/mixin"

const output = mixin(pure)
const nextOutput = mixin(output)

isComposedOf(pure, output) // true
isComposedOf(pure, nextOutput) // true
isComposedOf(output, nextOutput) // true

isComposedOf(nextOutput, output) // false
isComposedOf(output, pure) // false
```

## hasTalent(talent, product)

```javascript
import { mixin, pure, hasTalent } from "@dmail/mixin"

const talent = () => null
const talentedProduct = mixin(pure, talent)

hasTalent(talent, pure) // false
hasTalent(talent, talentedProduct) // true
```

[source](../src/mixin.js) | [test](../src/mixin.test.js)

## createFactory(product, argumentsTalent, ...talents)

createFactory is very usefull to abstract usage of miwin behind a regular function

```javascript
import { createFactory, pure } from "@dmail/mixin"

const createCounter = createFactory(pure, (count = 0) => {
	const increment = () => {
		count++
		return count
	}

	return { increment }
})

const counter = createCounter(1)
counter.increment() // 2
```

### What is argumentsTalent ?

createFactory introduce a special kind of talent.
Instead of receive one argument, as a regular talent would, createFactory second argument receive raw factory arguments.
When you need both arguments & product helpers such as `valueOf` & `lastValueOf` you can forward
arguments to the next talent as shown below:

```javascript
import { createFactory, pure } from "@dmail/mixin"

const factory = createFactory(
	pure,
	({ compare = (a, b) => a === b } = {}) => {
		return { compare }
	},
	({ compare, lastValueOf }) => {
		return { isSame: (other) => compare(other.lastValueOf(), lastValueOf()) }
	},
)

const output = factory()
const otherOutput = factory()

output.isSame(otherOutput) // false
```

[source](../src/factory.js) | [test](../src/factory.test.js)

## isProductOf(factory, product)

```javascript
import { isProductOf, createFactory, pure } from "@dmail/mixin"

const factory = createFactory()
const factoryProduct = factory()

isProductOf(factory, pure) // false
isProductOf(factory, factoryProduct) // true
```

[source](../src/factory.js) | [test](../src/factory.test.js)

## replicate(product)

```javascript
import { createFactory, replicate } from "@dmail/mixin"

const createCounter = createFactory((count = 0) => {
	const increment = () => {
		count++
		return count
	}

	return {
		increment,
	}
})

const counter = createCounter(10)
counter.increment() // 11
counter.increment() // 12
const counterClone = replicate(counter)
counterClone.increment() // 11
```

[source](../src/mixin.js) | [test](../src/mixin.test.js)

### Replicate expect talents to be pure functions

To replicate a product, replicate will reuse talents.
Consequently if some talent functions behaves differently when reused, the resulting product will inherit thoose differences.

#### Unpure talent example

```javascript
import { mixin, pure, replicate } from "@dmail/mixin"

const properties = {}
const unpureTalent = () => properties

const productModel = mixin(pure, unpureTalent)
properties.foo = true
const productCopy = replicate(productModel)

productModel.foo // undefined
productCopy.foo // true
```

Because of the mutation `productCopy` is not equivalent to `productModel`

### Replicate expect no mutation on factory arguments

Example of factory arguments mutation which make replicate fail.

```javascript
import { createFactory, replicate } from "@dmail/mixin"

const args = [{ value: 0 }]
const factory = createFactory(pure, ({ value }) => ({ value }))

const productModel = factory(...args)
args[0].value = 10
const productCopy = replicate(productModel)

productModel.value // 0
productCopy.value // 10
```
