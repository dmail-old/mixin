# Mixin

[![npm](https://badge.fury.io/js/%40dmail%2Fmixin.svg)](https://badge.fury.io/js/%40dmail%2Fmixin)
[![build](https://travis-ci.org/dmail/mixin.svg?branch=master)](http://travis-ci.org/dmail/mixin)
[![codecov](https://codecov.io/gh/dmail/mixin/branch/master/graph/badge.svg)](https://codecov.io/gh/dmail/mixin)

Factory functions composition

```javascript
import { mixin, override } from "@dmail/mixin"

const flyTalent = ({ name }) => {
	return {
		fly: () => `${name} fly`,
	}
}

const walkTalent = ({ name }) => {
	return {
		walk: () => `${name} walk`,
	}
}

const logFlyTalent = ({ fly }) => {
	return {
		fly: override(() => {
			console.log("fly called")
			return fly()
		}),
	}
}

const animal = mixin({ name: "foo" }, walkTalent, flyTalent, logFlyTalent)

animal.fly()
// logs "fly called" and return "foo fly"
```
