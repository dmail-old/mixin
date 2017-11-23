# Mixin

[![npm](https://badge.fury.io/js/%40dmail%2Fmixin.svg)](https://badge.fury.io/js/%40dmail%2Fmixin)
[![build](https://travis-ci.org/dmail/mixin.svg?branch=master)](http://travis-ci.org/dmail/mixin)
[![codecov](https://codecov.io/gh/dmail/mixin/branch/master/graph/badge.svg)](https://codecov.io/gh/dmail/mixin)

Factory functions composition

## Example

```javascript
import { mixin, override } from "@dmail/mixin"

const walkTalent = ({ name }) => {
	return {
		walk: () => `${name} walk`,
	}
}

const flyTalent = ({ name }) => {
	return {
		fly: () => `${name} fly`,
	}
}

const animal = mixin({ name: "foo" }, walkTalent, flyTalent)

animal.walk() // foo walk
animal.fly() // foo fly
```

Check the [API Documentation](./docs/api.md) for more
