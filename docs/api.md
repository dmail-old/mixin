# api

* [createPureProduct()](#createpureproduct)
* [isProduct(value)](#isproductvalue)
* [mixin(product, ...talents)](#mixinproduct-talents)
* [hasTalent(talent, product)](#hastalenttalent-product)
* [createFactory(fn)](#createfactoryfn)
* [isProducedBy(factory, value)](#isproducedbyfactory-value)
* [replicate(product)](#replicateproduct)

## createPureProduct()

Returns a product without any talent (see this as an empty object).

```javascript
import { createPureProduct } from "@dmail/mixin"

const pureProduct = createPureProduct()
```

[source](../src/mixin.js) | [test](../src/mixin.test.js)

## isProduct(value)

```javascript
import { isProduct, createPureProduct } from "@dmail/mixin"

isProduct(null) // false
isProduct({}) // false
isProduct(createPureProduct()) // true
```

[source](../src/mixin.js) | [test](../src/mixin.test.js)

## mixin(product, ...talents)

```javascript
import { createPureProduct, mixin } from "@dmail/mixin"

const product = mixin(
	createPureProduct(),
	() => {
		return { getAnswer: () => 42 }
	},
	({ getAnswer }) => {
		return { getAnswerOpposite: () => getAnswer() * -1 }
	},
)

product.getAnswer() // 42
product.getAnswerOpposite() // -42
```

[source](../src/mixin.js) | [test](../src/mixin.test.js)

## hasTalent(talent, product)

```javascript
import { createPureProduct, mixin, hasTalent } from "@dmail/mixin"

const pureProduct = createPureProduct()
const talent = () => null
const talentedProduct = mixin(pureProduct, talent)

hasTalent(talent, pureProduct) // false
hasTalent(talent, talentedProduct) // true
```

[source](../src/mixin.js) | [test](../src/mixin.test.js)

## createFactory(fn)

```javascript
import { createFactory } from "@dmail/mixin"

const createCounter = createFactory(({ count = 0 }) => {
	const get = () => count
	const increment = () => {
		count++
		return count
	}

	return { get, increment }
})

const counter = createCounter()
```

[source](../src/factory.js) | [test](../src/factory.test.js)

## isProducedBy(factory, product)

```javascript
import { createFactory, createPureProduct } from "@dmail/mixin"

const factory = createFactory()

const pureProduct = createPureProduct()
const factoryProduct = factory()

isProducedBy(factory, pureProduct) // false
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

[source](../src/factory.js) | [test](../src/factory.test.js)

Please note you can also use replicate on product returned by createPureProduct() or mixin()
