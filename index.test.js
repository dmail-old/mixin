import {
	isProduct,
	pure,
	isComposedOf,
	hasTalent,
	mixin,
	replicate,
	compose,
	hasTalentOf,
} from "./index.js"
import { test } from "@dmail/test"
import {
	expectMatch,
	matchNot,
	expectProperties,
	expectChain,
	expectThrowWith,
	matchTypeError,
} from "@dmail/expect"

const expectProduct = (object) => expectMatch(isProduct(object), true)

const expectNonExtensible = (object) => expectMatch(Object.isExtensible(object), false)

const expectSelfHelper = (object) => expectMatch(object.self, object)

const expectProductSpecifications = (object) => {
	return expectChain(
		() => expectProduct(object),
		() => expectNonExtensible(object),
		() => expectSelfHelper(object),
	)
}

const expectNotProduct = (object) => expectMatch(isProduct(object), false)

// pure
test(() => expectProductSpecifications(pure))

// null
test(() => {
	return expectChain(
		() => expectNotProduct(null),
		() => expectMatch(hasTalent(() => {}, null), false),
		() => expectThrowWith(() => replicate(null), matchTypeError()),
		() => expectThrowWith(() => isComposedOf(null, {}), matchTypeError()),
		() => expectThrowWith(() => compose(null), matchTypeError()),
		() => expectThrowWith(() => hasTalent(null), matchTypeError()),
		() => expectThrowWith(() => mixin(null), matchTypeError()),
		() => expectThrowWith(() => mixin(pure, null), matchTypeError()),
		() => expectThrowWith(() => hasTalentOf(null), matchTypeError()),
	)
})

// undefined
test(() => {
	return expectChain(
		() => expectNotProduct(undefined),
		() => expectMatch(hasTalent(() => {}, undefined), false),
		() => expectThrowWith(() => replicate(undefined), matchTypeError()),
		() => expectThrowWith(() => isComposedOf(undefined, {}), matchTypeError()),
	)
})

// mixin without talent
test(() => {
	const input = pure
	const output = mixin(input)

	return expectChain(
		() => expectProductSpecifications(output),
		() => expectMatch(output, matchNot(input)),
		() => expectMatch(isComposedOf(input, output), true),
	)
})

const mixinWithTalent = () => {
	const input = pure
	const method = () => {}
	const talent = () => ({ method })
	const output = mixin(input, talent)

	return { input, method, talent, output }
}

// mixin with talent
test(() => {
	const { input, method, talent, output } = mixinWithTalent()
	const createFrozenPropertyDescriptor = (value) => ({
		enumerable: false,
		configurable: false,
		writable: false,
		value,
	})

	return expectChain(
		() => expectProductSpecifications(output),
		() => expectMatch(output, matchNot(input)),
		() => expectMatch(isComposedOf(input, output), true),
		() => expectMatch(hasTalent(talent, output), true),
		() =>
			expectProperties(
				Object.getOwnPropertyDescriptor(output, "method"),
				createFrozenPropertyDescriptor(method),
			),
	)
})

// remixing
test(() => {
	const { input, output } = mixinWithTalent()
	const nextOutput = mixin(output)

	return expectChain(
		() => expectMatch(isComposedOf(output, nextOutput), true),
		() => expectMatch(isComposedOf(input, nextOutput), true),
		() => expectProductSpecifications(output),
		() => expectProductSpecifications(nextOutput),
	)
})

// talent returning null
test(() => {
	const input = pure
	const talent = () => null
	const output = mixin(input, talent)

	return expectChain(
		() => expectProductSpecifications(output),
		() => expectMatch(hasTalent(talent, output), true),
	)
})

// mixin many talents
test(() => {
	const firstTalent = () => ({ foo: true, bar: false })
	const secondTalent = () => ({ foo: false })
	const output = mixin(pure, firstTalent, secondTalent)

	return expectChain(
		() => expectMatch(hasTalent(firstTalent, output), true),
		() => expectMatch(hasTalent(secondTalent, output), true),
		() => expectMatch(output.foo, false),
	)
})

// talent using symbol
test(() => {
	const symbol = Symbol()
	const firstTalent = () => ({ [symbol]: true })
	const secondTalent = () => ({ [symbol]: false })
	const output = mixin(pure, firstTalent, secondTalent)

	return expectMatch(output[symbol], false)
})

const mixinTalentUsingScope = () => {
	const zeroValueTalent = () => {
		let value = 0
		const get = () => value
		const set = (arg) => {
			value = arg
			return arg
		}
		return { get, set }
	}

	const incrementTalent = ({ get, set }) => {
		const increment = () => set(get() + 1)
		return { increment }
	}

	const output = mixin(pure, zeroValueTalent, incrementTalent)

	return { zeroValueTalent, incrementTalent, output }
}

test(() => {
	const { output } = mixinTalentUsingScope()

	return expectChain(() => expectMatch(output.get(), 0), () => expectMatch(output.increment(), 1))
})

test(() => {
	const { output } = mixinTalentUsingScope()
	const clone = replicate(output)

	return expectMatch(clone.increment(), 1)
})

test(() => {
	const { output } = mixinTalentUsingScope()
	const clone = replicate(output)
	clone.increment()
	const subclone = replicate(clone)

	return expectMatch(subclone.increment(), 1)
})

// compose
test(() => {
	const firstTalent = () => ({ a: true })
	const secondTalent = () => ({ b: true })
	const composedTalent = compose(firstTalent, secondTalent)
	const output = mixin(pure, composedTalent)

	return expectChain(
		() => expectMatch(hasTalent(composedTalent, output), true),
		() => expectMatch(hasTalent(firstTalent, output), true),
		() => expectMatch(hasTalent(secondTalent, output), true),
		() => expectMatch(output.a, true),
		() => expectMatch(output.b, true),
	)
})

// hasTalentOf
test(() => {
	const talent = () => {}
	const output = mixin(pure, talent)
	const similarOutput = mixin(pure, talent)
	const unrelatedOutput = mixin(pure)

	return expectChain(
		() => expectMatch(hasTalentOf(output, similarOutput), true),
		() => expectMatch(hasTalentOf(output, unrelatedOutput), false),
	)
})
