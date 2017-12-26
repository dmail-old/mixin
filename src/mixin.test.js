import {
	pure,
	isProduct,
	isComposedOf,
	mixin,
	replicate,
	hasTalent,
	wrapTalent,
	isHighOrderTalent,
	unwrapTalent,
	unwrapTalentDeep,
} from "./mixin.js"
import { createTest } from "@dmail/test"
import { expectMatch, matchNot, expectProperties, expectChain } from "@dmail/expect"

export const test = createTest({
	"pure caracteristics": () => {
		return expectChain(
			() => expectMatch(Object.isExtensible(pure), false),
			() => expectMatch(isProduct(pure), true),
		)
	},
	"mixin called without talent": () => {
		const input = pure
		const output = mixin(input)
		return expectChain(
			() => expectMatch(output, matchNot(input)),
			() => expectMatch(Object.isExtensible(output), false),
			() => expectMatch(isProduct(output), true),
			() => expectMatch(isComposedOf(input, output), true),
		)
	},
	"mixin call with a talent returning a method": () => {
		const method = () => {}
		const talent = () => ({ method })
		const input = pure
		const output = mixin(input, talent)

		return expectChain(
			() => expectMatch(Object.isExtensible(output), false),
			() => expectMatch(isProduct(output), true),
			() => expectMatch(isComposedOf(input, output), true),
			() => expectMatch(hasTalent(talent, output), true),
			() => {
				return expectProperties(Object.getOwnPropertyDescriptor(output, "method"), {
					enumerable: false,
					configurable: false,
					writable: false,
					value: method,
				})
			},
		)
	},
	"mixin called on previous mixin output": () => {
		const input = pure
		const output = mixin(input)
		const nextOutput = mixin(output)

		return expectChain(
			() => expectMatch(isProduct(nextOutput), true),
			() => expectMatch(isComposedOf(output, nextOutput), true),
			() => expectMatch(isComposedOf(input, nextOutput), true),
		)
	},
	"mixin called with a talent returning null": () => {
		const talent = () => null
		const output = mixin(pure, talent)

		return expectChain(
			() => expectMatch(hasTalent(talent, output), true),
			() => expectProperties(output, {}),
		)
	},
	"mixin called with two talent using same property names": () => {
		const firstTalent = () => ({ foo: true, bar: false })
		const secondTalent = () => ({ foo: false })

		const output = mixin(pure, firstTalent, secondTalent)
		return expectChain(
			() => expectMatch(hasTalent(firstTalent, output), true),
			() => expectMatch(hasTalent(secondTalent, output), true),
			() => expectMatch(output.foo, false),
			() => expectMatch(output.bar, false),
		)
	},
	"mixin called with two talent using same symbol": () => {
		const symbol = Symbol()
		const output = mixin(pure, () => ({ [symbol]: true }), () => ({ [symbol]: false }))
		return expectProperties(output, { [symbol]: false })
	},
	"isProduct() called on non product": () => {
		return expectChain(
			() => expectMatch(isProduct(null), false),
			() => expectMatch(isProduct(undefined), false),
			() => expectMatch(isProduct({}), false),
		)
	},
	"hasTalent() called on non product": () => {
		const talent = () => {}

		return expectChain(
			() => expectMatch(hasTalent(talent, null), false),
			() => expectMatch(hasTalent(talent, undefined), false),
			() => expectMatch(hasTalent(talent, {}), false),
		)
	},
	"valueOf()": () => {
		const talent = ({ valueOf }) => ({ self: valueOf() })
		const output = mixin(pure, talent)
		return expectMatch(output.self, output)
	},
	"lastValueOf()": () => {
		const talent = ({ lastValueOf }) => ({ getLast: () => lastValueOf() })
		const output = mixin(pure, talent, () => {})
		return expectMatch(output.getLast(), output)
	},
	"replicate() a product with many talents": () => {
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

		const product = mixin(pure, zeroValueTalent, incrementTalent)

		return expectChain(
			() => expectMatch(product.get(), 0),
			() => expectMatch(product.increment(), 1),
			() => expectMatch(product.increment(), 2),
			() => {
				const clone = replicate(product)
				return expectChain(
					() => expectMatch(clone.get(), 0),
					() => expectMatch(clone.increment(), 1),
					() => {
						const subclone = replicate(clone)
						return expectChain(
							() => expectMatch(subclone.get(), 0),
							() => expectMatch(subclone.increment(), 1),
						)
					},
				)
			},
		)
	},
	"talent wrapping and unwrapping": () => {
		const talent = () => ({ foo: true })
		const wrappedTalent = wrapTalent(talent, () => talent())
		const deeplyWrappedTalent = wrapTalent(wrappedTalent, () => wrappedTalent())
		return expectChain(
			() => expectMatch(isHighOrderTalent(talent), false),
			() => expectMatch(isHighOrderTalent(wrappedTalent), true),
			() => expectMatch(isHighOrderTalent(deeplyWrappedTalent), true),
			() => expectMatch(unwrapTalent(deeplyWrappedTalent), wrappedTalent),
			() => expectMatch(unwrapTalent(unwrapTalent(deeplyWrappedTalent)), talent),
			() => expectMatch(unwrapTalentDeep(deeplyWrappedTalent), talent),
			() => {
				const output = mixin(pure, wrappedTalent)
				return expectChain(
					() => expectProperties(output, { foo: true }),
					() => expectMatch(hasTalent(talent, output), true),
					() => expectMatch(hasTalent(wrappedTalent, output), true),
					() => expectMatch(hasTalent(deeplyWrappedTalent, output), true),
				)
			},
		)
	},
})
