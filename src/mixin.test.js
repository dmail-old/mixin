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
import { plan } from "@dmail/test"
import { expectMatch, matchNot, expectProperties, expectChain } from "@dmail/expect"

export const test = plan("mixin", ({ scenario, test }) => {
	scenario("pure", () => {
		test("pure caracteristics", () => {
			return expectChain(
				() => expectMatch(Object.isExtensible(pure), false),
				() => expectMatch(isProduct(pure), true),
			)
		})
	})

	scenario("mixin", () => {
		test("mixin called without talent", () => {
			const input = pure
			const output = mixin(input)
			return expectChain(
				() => expectMatch(output, matchNot(input)),
				() => expectMatch(Object.isExtensible(output), false),
				() => expectMatch(isProduct(output), true),
				() => expectMatch(isComposedOf(input, output), true),
			)
		})

		test("mixin call with a talent returning a method", () => {
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
		})

		test("mixin called on previous mixin output", () => {
			const input = pure
			const output = mixin(input)
			const nextOutput = mixin(output)

			return expectChain(
				() => expectMatch(isProduct(nextOutput), true),
				() => expectMatch(isComposedOf(output, nextOutput), true),
				() => expectMatch(isComposedOf(input, nextOutput), true),
			)
		})

		test("mixin called with a talent returning null", () => {
			const talent = () => null
			const output = mixin(pure, talent)

			return expectChain(
				() => expectMatch(hasTalent(talent, output), true),
				() => expectProperties(output, {}),
			)
		})

		test("mixin called with two talent using same property names", () => {
			const firstTalent = () => ({ foo: true, bar: false })
			const secondTalent = () => ({ foo: false })

			const output = mixin(pure, firstTalent, secondTalent)
			return expectChain(
				() => expectMatch(hasTalent(firstTalent, output), true),
				() => expectMatch(hasTalent(secondTalent, output), true),
				() => expectMatch(output.foo, false),
				() => expectMatch(output.bar, false),
			)
		})

		test("mixin called with two talent using same symbol", () => {
			const symbol = Symbol()
			const output = mixin(pure, () => ({ [symbol]: true }), () => ({ [symbol]: false }))
			return expectProperties(output, { [symbol]: false })
		})
	})

	scenario("isProduct", () => {
		test("isProduct() called on non product", () => {
			return expectChain(
				() => expectMatch(isProduct(null), false),
				() => expectMatch(isProduct(undefined), false),
				() => expectMatch(isProduct({}), false),
			)
		})
	})

	scenario("hasTalent", () => {
		test("hasTalent() called on non product", () => {
			const talent = () => {}

			return expectChain(
				() => expectMatch(hasTalent(talent, null), false),
				() => expectMatch(hasTalent(talent, undefined), false),
				() => expectMatch(hasTalent(talent, {}), false),
			)
		})
	})

	scenario("helpers", () => {
		test("getComposite()", () => {
			const output = mixin(pure)
			return expectMatch(output.getComposite(), output)
		})

		test("getLastComposite()", () => {
			const output = mixin(pure)
			const nextOutput = mixin(output, ({ getLastComposite }) => {
				return {
					getLastCompositeResultDuringTalent: getLastComposite(),
				}
			})
			const lastOutput = nextOutput
			return expectChain(
				() => expectMatch(output.getLastComposite(), lastOutput),
				() => expectMatch(nextOutput.getLastComposite(), lastOutput),
				// during talent execution getLastComposite returns composite - 1
				// if a previous composite is using getLastComposite
				// and the current talent is calling that method
				// you prevent an infinite recursion between them
				() => expectMatch(nextOutput.getLastCompositeResultDuringTalent, output),
			)
		})
	})

	scenario("replicate", () => {
		test("replicate() a product with many talents", () => {
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
		})
	})

	scenario("wrapping and unwrapping", () => {
		test("talent wrapping and unwrapping", () => {
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
		})
	})
})
