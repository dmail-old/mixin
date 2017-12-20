import { createPureProduct, isProduct, mixin, replicate } from "./mixin.js"
import { createTest } from "@dmail/test"
import {
	expectMatch,
	matchNot,
	expectProperties,
	expectThrowWith,
	matchErrorWith,
	expectChain,
} from "@dmail/expect"

export const test = createTest({
	"mixin does not mutate product": () => {
		const pureProduct = createPureProduct()
		const product = mixin(pureProduct, () => {})
		return expectMatch(pureProduct, matchNot(product))
	},
	"mixin on talent returning null": () => {
		return expectProperties(mixin(createPureProduct(), () => null), {})
	},
	"mixin return product with hidden method returned by talent": () => {
		const method = () => {}
		const product = mixin(createPureProduct(), () => ({ method }))
		const methodDescriptor = Object.getOwnPropertyDescriptor(product, "method")
		return expectProperties(methodDescriptor, {
			enumerable: false,
			configurable: true,
			writable: false,
			value: method,
		})
	},
	"mixin with talent returning existing property name": () => {
		const firstMethod = () => {}
		const secondMethod = () => {}
		const product = mixin(
			createPureProduct(),
			() => ({ foo: firstMethod }),
			() => ({ foo: secondMethod }),
		)
		return expectProperties(product, {
			foo: secondMethod,
		})
	},
	"mixin with talent returning existing property anonymous symbol": () => {
		const firstMethod = () => {}
		const secondMethod = () => {}
		const propertySymbol = Symbol()
		const product = mixin(
			createPureProduct(),
			() => ({ [propertySymbol]: firstMethod }),
			() => ({ [propertySymbol]: secondMethod }),
		)
		return expectProperties(product, {
			[propertySymbol]: secondMethod,
		})
	},
	// should also be tested with anonymous symbol & named symbol
	// to check the produced error message
	"mixin with talent returning something a boolean value for a property": () => {
		return expectThrowWith(
			() => mixin(createPureProduct(), () => ({ foo: true })),
			matchErrorWith({
				message: "installMethod third argument must be a function (got true for foo)",
			}),
		)
	},
	"isProduct() on createPureProduct()": () => {
		return expectMatch(isProduct(createPureProduct()), true)
	},
	"isProduct() on mixed pure product": () => {
		return expectMatch(isProduct(mixin(createPureProduct(), () => {})), true)
	},
	"isProduct(null)": () => {
		return expectMatch(isProduct(null), false)
	},
	"isProduct(undefined)": () => {
		return expectMatch(isProduct(undefined), false)
	},
	// hasTalent must be tested
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

		const pure = createPureProduct()
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
})
