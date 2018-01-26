# Talent

A talent is a function that

* must expect one argument
* must expect first argument to be a [product](./product.md)
* should read properties from product using param destructuring
* should write properties returning an object

```javascript
// wrong
const talentWithoutPattern = (product) => {
	product.value++
}

// right
const talentWithPattern = ({ value }) => {
	return {
		value: value + 1,
	}
}
```

## Talent pattern advantages

* Destructuring param shows in a glimpse what you talent needs to read
* Returned object show in a glimpse what you talent needs to write
* Destructuring param prevent temptation to mutate talent argument (the product)
* Returned object is internally used to set non configurable and non writable properties

## Compose, construct & typing comparison

### Using constructor

```javascript
const constructorA = function() {
	this.b = true
}
constructorA.prototype.a = true

const constructorB = function() {
	this.d = true
}
constructorB.prototype.c = true

// compose
const constructorC = function() {
	constructorA.apply(this, arguments)
	constructorB.apply(this, arguments)
}
constructorC.prototype = Object.create(
	Object.create(constructorA.prototype, Object.getOwnPropertyDescriptors(constructorB.prototype)),
)

// construct
const object = new constructorC()

// typing
constructorC.prototype.isPrototypeOf(object)
```

#### Using class

```javascript
class classA {
	constructor() {
		this.b = true
	}

	a = true
}

class classB {
	constructor() {
		this.d = true
	}

	c = true
}

// compose
class classC {}
// I don't know how to create a class being composition of two others

// constructor
const object = new classC()

// type checking
object instanceof classA
```

#### Using mixin

```javascript
import { mixin, pure, compose, isComposedOf } from "@dmail/mixin"

const talentAPrototype = () => ({ a: true })
const talentA = () => {
	return { b: true }
}

const talentBPrototype = () => ({ c: true })
const talentB = () => {
	return { d: true }
}

// composition
const talentC = compose(talentAPrototype, talentA, talentBPrototype, talentB)

// construct
const object = mixin(pure, talentC)

// type checking
hasTalent(talentA, object)
```

### Article links

* https://medium.com/javascript-scene/why-composition-is-harder-with-classes-c3e627dcd0aa
