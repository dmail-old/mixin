# api

* [pure](#pure)
* [isProduct(value)](#isproductvalue)
* [mixin(product, ...talents)](#mixinproduct-talents)
* [hasTalent(talent, product)](#hastalenttalent-product)
* [createFactory(talent)](#createfactorytalent)
* [isProducedBy(factory, product)](#isproducedbyfactory-product)
* [replicate(product)](#replicateproduct)

## pure

An object without any talent

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

## hasTalent(talent, product)

```javascript
import { mixin, pure, hasTalent } from "@dmail/mixin"

const talent = () => null
const talentedProduct = mixin(pure, talent)

hasTalent(talent, pure) // false
hasTalent(talent, talentedProduct) // true
```

[source](../src/mixin.js) | [test](../src/mixin.test.js)

## createFactory(talent)

Returns a function which, when called, will return a talented product

```javascript
import { createFactory } from "@dmail/mixin"

const createCounter = createFactory(({ count = 0 }) => {
	const increment = () => {
		count++
		return count
	}

	return { increment }
})

const counter = createCounter({ count: 1 })
counter.increment() // 2
```

[source](../src/factory.js) | [test](../src/factory.test.js)

## isProducedBy(factory, product)

```javascript
import { isProducedBy, createFactory, pure } from "@dmail/mixin"

const factory = createFactory()
const factoryProduct = factory()

isProducedBy(factory, pure) // false
isProducedBy(factory, factoryProduct) // true
```

[source](../src/factory.js) | [test](../src/factory.test.js)

## replicate(product)

```javascript
import { createFactory, replicate } from "@dmail/mixin"

const createCounter = createFactory(({ count = 0 }) => {
	const increment = () => {
		count++
		return count
	}

	return {
		increment,
	}
})

const counter = createCounter({ count: 10 })
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
import { miwin, pure, replicate } from "@dmail/mixin"

const properties = {}
const unpureTalent = () => properties

const productModel = mixin(pure, unpureTalent)
properties.foo = true // mutate talent return value
const productCopy = replicate(productModel)

productModel.foo // undefined
productCopy.foo // true
```

Because of the mutation `productCopy` is not equivalent to `productModel`
