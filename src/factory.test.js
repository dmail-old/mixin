import { createFactory, isProducedBy } from "./factory.js"
import { replicate } from "./mixin.js"
import { createTest } from "@dmail/test"
import {
	expectMatch,
	expectFunction,
	expectChain,
	expectThrowWith,
	matchErrorWith,
	matchTypeErrorWith,
} from "@dmail/expect"

export const test = createTest({
	"createFactory(fn) returns a function": () => {
		const factory = createFactory(() => {})
		return expectFunction(factory)
	},
	"createFactory(fn) calling returned factory with an object": () => {
		let passedObject
		const factory = createFactory((arg) => {
			passedObject = arg
		})
		const object = { foo: true }
		factory(object)

		return expectChain(
			() => expectMatch(passedObject.foo, true),
			() => expectMatch(Object.isExtensible(passedObject), false),
			() => {
				// you can still mutate original object (but should not do it)
				object.bar = true
				return expectMatch(object.bar, true)
			},
		)
	},
	"calling returned factory with 1 argument which is not an object": () => {
		const factory = createFactory(() => {})
		return expectThrowWith(
			() => factory(true),
			matchTypeErrorWith({
				message: "factory first argument must be an object",
			}),
		)
	},
	"calling factory with more than 2 argument": () => {
		const factory = createFactory(() => {})
		return expectThrowWith(
			() => factory(true, true),
			matchErrorWith({
				message: "factory must be called with 1 or zero argument",
			}),
		)
	},
	"createFactory can return properties which are set on return value": () => {
		const method = () => {}
		const factory = createFactory(() => ({ method }))
		const product = factory()
		return expectMatch(product.method, method)
	},
	"isProducedBy on factory product, and other factoryProduct": () => {
		const factory = createFactory(() => {})
		const otherFactory = createFactory(() => {})
		const product = factory()
		const otherProduct = otherFactory()
		return expectChain(
			() => expectMatch(isProducedBy(factory, product), true),
			() => expectMatch(isProducedBy(factory, otherProduct), false),
			() => expectMatch(isProducedBy(otherFactory, product), false),
			() => expectMatch(isProducedBy(otherFactory, otherProduct), true),
		)
	},
	"replicate on factory": () => {
		const factory = createFactory(({ value }) => {
			return {
				setValue: (arg) => {
					value = arg
				},
				getValue: () => value,
			}
		})
		const product = factory({ value: 10 })
		product.setValue(5)
		const clone = replicate(product)
		return expectMatch(clone.getValue(), 10)
	},
})
