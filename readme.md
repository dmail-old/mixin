# Mixin

[![npm](https://badge.fury.io/js/%40dmail%2Fmixin.svg)](https://badge.fury.io/js/%40dmail%2Fmixin)
[![build](https://travis-ci.org/dmail/mixin.svg?branch=master)](http://travis-ci.org/dmail/mixin)
[![codecov](https://codecov.io/gh/dmail/mixin/branch/master/graph/badge.svg)](https://codecov.io/gh/dmail/mixin)

Object composition helper

## Example

```javascript
import { mixin, pure } from "@dmail/mixin"

const walkTalent = ({ name }) => {
	const walk = () => `${name} walk`

	return {
		walk,
	}
}

const flyTalent = ({ name }) => {
	const fly = () => `${name} fly`

	return {
		fly,
	}
}

const dog = mixin(pure, () => ({ name: "dog" }), walkTalent)
const duck = mixin(pure, () => ({ name: "duck" }), walkTalent, flyTalent)

dog.walk() // dog walk
dog.fly // undefined

duck.walk() // duck walk
duck.fly() // duck fly
```

* [API documentation](./docs/api.md)
* [Talent documentation](./docs/talent.md)
* [Product documentation](./docs/product.md)
