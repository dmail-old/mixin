import { createFactory, isProductOf } from "./factory.js"
import { pure, replicate, mixin, hasTalent } from "./mixin.js"
import { createTest } from "@dmail/test"
import { expectMatch, expectFunction, expectChain, matchNot, expectProperties } from "@dmail/expect"

export const test = createTest({
	"createFactory called without talent": () => {
		const input = pure
		const factory = createFactory(input)
		return expectChain(
			() => expectFunction(factory),
			() => {
				const output = factory(10)
				return expectMatch(output, matchNot(input))
			},
		)
	},
	"createFactory called with one talent": () => {
		let talentArguments
		const talent = (...args) => {
			talentArguments = args
			return { foo: true }
		}
		const factory = createFactory(pure, talent)
		const object = {}
		const args = [0, 1, object]
		const output = factory(...args)

		return expectChain(
			() => expectProperties(talentArguments, args),
			() => expectMatch(hasTalent(talent, output), true),
			() => expectMatch(output.foo, true),
			() => {
				// you can still mutate original object (but should not do it)
				object.bar = true
				return expectMatch(object.bar, true)
			},
		)
	},
	"createFactory called with 2 talent (or more)": () => {
		let firstArgs
		const firstTalent = (...args) => {
			firstArgs = args
			return { first: true }
		}
		let secondArgs
		const secondTalent = (...args) => {
			secondArgs = args
			return { second: true }
		}
		const factory = createFactory(pure, firstTalent, secondTalent)
		const args = [0, 1]
		const output = factory(...args)

		return expectChain(
			() => expectProperties(firstArgs, args),
			() => expectProperties(secondArgs, [output]),
			() => expectMatch(output.first, true),
			() => expectMatch(output.second, true),
		)
	},
	"isProductOf on factory product, and other factoryProduct": () => {
		const expectTrue = ({ factory, product }) => {
			return expectMatch(isProductOf(factory, product), true)
		}
		const expectFalse = ({ factory, product }) => {
			return expectMatch(isProductOf(factory, product), false)
		}

		const factory = createFactory(pure)
		const product = factory()
		const nestedFactory = createFactory(product)
		const otherFactory = createFactory(pure)
		const otherProduct = otherFactory()

		return expectChain(
			() => expectFalse({ factory, product: null }),
			() => expectFalse({ factory, product: undefined }),
			() => expectFalse({ factory, product: {} }),
			() => expectFalse({ factory, product: true }),
			() => expectFalse({ factory, product: pure }),
			() => expectFalse({ factory, product: otherProduct }),
			() => expectFalse({ factory: otherFactory, product }),
			() => expectTrue({ factory, product }),
			() => expectTrue({ factory: otherFactory, product: otherProduct }),
			// you can mix product they still know their factory
			() => expectTrue({ factory, product: mixin(product) }),
			() => expectTrue({ factory, product: mixin(product, () => {}) }),
			// // you can nest factory, they still know their factories
			() => expectTrue({ factory, product: nestedFactory() }),
			() => expectTrue({ factory: nestedFactory, product: nestedFactory() }),
		)
	},
	"replicate on factory": () => {
		const factory = createFactory(pure, (value) => {
			return {
				setValue: (arg) => {
					value = arg
				},
				getValue: () => value,
			}
		})
		const product = factory(10)
		product.setValue(5)
		const clone = replicate(product)
		return expectMatch(clone.getValue(), 10)
	},
})
