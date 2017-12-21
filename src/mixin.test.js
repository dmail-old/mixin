import { pure, isProduct, mixin, replicate, hasTalent } from "./mixin.js"
import { createTest } from "@dmail/test"
import { expectMatch, matchNot, expectProperties, expectChain } from "@dmail/expect"

export const test = createTest({
	"pure is a non extensible obect": () => {
		return expectMatch(Object.isExtensible(pure), false)
	},
	"mixin returns a new product": () => {
		const product = mixin(pure, () => {})
		return expectMatch(pure, matchNot(product))
	},
	"mixin return a non extensible object": () => {
		const product = mixin(pure, () => {})
		return expectMatch(Object.isExtensible(product), false)
	},
	"mixin return product with frozen property returned by talent": () => {
		const method = () => {}
		const product = mixin(pure, () => ({ method }))
		const methodDescriptor = Object.getOwnPropertyDescriptor(product, "method")
		return expectProperties(methodDescriptor, {
			enumerable: false,
			configurable: false,
			writable: false,
			value: method,
		})
	},
	"mixin on talent returning null": () => {
		return expectProperties(mixin(pure, () => null), {})
	},
	"mixin with talent returning existing property name": () => {
		const firstMethod = () => {}
		const secondMethod = () => {}
		const product = mixin(pure, () => ({ foo: firstMethod }), () => ({ foo: secondMethod }))
		return expectProperties(product, {
			foo: secondMethod,
		})
	},
	"mixin with talent returning existing property anonymous symbol": () => {
		const firstMethod = () => {}
		const secondMethod = () => {}
		const propertySymbol = Symbol()
		const product = mixin(
			pure,
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
		return expectProperties(mixin(pure, () => ({ foo: true })), { foo: true })
	},
	"isProduct() on pure": () => {
		return expectMatch(isProduct(pure), true)
	},
	"isProduct() on mixed pure product": () => {
		return expectMatch(isProduct(mixin(pure, () => {})), true)
	},
	"isProduct(null)": () => {
		return expectMatch(isProduct(null), false)
	},
	"isProduct(undefined)": () => {
		return expectMatch(isProduct(undefined), false)
	},
	"hasTalent()": () => {
		const talent = () => {}

		return expectChain(
			() => expectMatch(hasTalent(talent, pure), false),
			() => expectMatch(hasTalent(talent, mixin(pure, talent)), true),
			() => expectMatch(hasTalent(talent, mixin(pure, talent, () => {})), true),
		)
	},
	"valueOf()": () => {
		const talent = ({ valueOf }) => ({ self: valueOf() })
		const product = mixin(pure, talent)
		return expectMatch(product.self, product)
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
})
