# api

* [pure](#pure)
* [isProduct(value)](#isproductvalue)
* [mixin(product, ...talents)](#mixinproduct-talents)
* [compose(...talents)](#composetalents)
* [isComposedOf(product, value)](#iscomposedofproduct-value)
* [hasTalent(talent, product)](#hastalenttalent-product)
* [replicate(product)](#replicateproduct)

## pure

An object without talent

```javascript
import { pure } from "@dmail/mixin"
```

## isProduct(value)

```javascript
import { isProduct, pure } from "@dmail/mixin"

isProduct(null) // false
isProduct({}) // false
isProduct(pure) // true
```

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

## compose(...talents)

```javascript
import { compose, pure } from "@dmail/mixin"

const talent = compose(() => ({ a: true }), () => ({ b: true }))
const output = mixin(pure, talent)

output.a // true
output.b // true
```

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
