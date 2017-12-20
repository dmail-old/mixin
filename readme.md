# Mixin

[![npm](https://badge.fury.io/js/%40dmail%2Fmixin.svg)](https://badge.fury.io/js/%40dmail%2Fmixin)
[![build](https://travis-ci.org/dmail/mixin.svg?branch=master)](http://travis-ci.org/dmail/mixin)
[![codecov](https://codecov.io/gh/dmail/mixin/branch/master/graph/badge.svg)](https://codecov.io/gh/dmail/mixin)

Factory functions composition

## Example

```javascript
import { createFactory, mixin } from "@dmail/mixin"

const walkTalent = ({ getName }) => {
	return {
		walk: () => `${getName()} walk`,
	}
}

const flyTalent = ({ getName }) => {
	return {
		fly: () => `${getName()} fly`,
	}
}

const createAnimal = createFactory(({ name }) => {
	const getName = () => name
	return { getName }
})

const animal = mixin(createAnimal({ name: "foo" }), walkTalent, flyTalent)

animal.walk() // foo walk
animal.fly() // foo fly
```

Check the [API Documentation](./docs/api.md) for more
