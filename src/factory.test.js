import { createFactory, isProductOf } from "./factory.js"
import { pure, replicate, mixin } from "./mixin.js"
import { createTest } from "@dmail/test"
import { expectMatch, expectFunction, expectChain } from "@dmail/expect"

export const test = createTest({
	"createFactory(pure, fn) returns a function": () => {
		const factory = createFactory(pure, () => {})
		return expectFunction(factory)
	},
	"createFactory(pure, fn) calling returned factory with an object": () => {
		let passedObject
		const factory = createFactory(pure, (arg) => {
			passedObject = arg
		})
		const object = { foo: true }
		factory(object)

		return expectChain(
			() => expectMatch(passedObject.foo, true),
			() => expectMatch(Object.isExtensible(passedObject), true),
			() => {
				// you can still mutate original object (but should not do it)
				object.bar = true
				return expectMatch(object.bar, true)
			},
		)
	},
	// "calling returned factory with 1 argument which is not an object": () => {
	// 	const factory = createFactory(pure, () => {})
	// 	return expectThrowWith(
	// 		() => factory(true),
	// 		matchTypeErrorWith({
	// 			message: "factory first argument must be an object",
	// 		}),
	// 	)
	// },
	// "calling factory with more than 2 argument": () => {
	// 	const factory = createFactory(pure, () => {})
	// 	return expectThrowWith(
	// 		() => factory(true, true),
	// 		matchErrorWith({
	// 			message: "factory must be called with 1 or zero argument",
	// 		}),
	// 	)
	// },
	"createFactory can return properties which are set on return value": () => {
		const method = () => {}
		const factory = createFactory(pure, () => ({ method }))
		const product = factory()
		return expectMatch(product.method, method)
	},
	"isProductOf on factory product, and other factoryProduct": () => {
		const factory = createFactory(pure, () => {})
		const product = factory()
		const otherFactory = createFactory(pure, () => {})
		const otherProduct = otherFactory()
		return expectChain(
			() => expectMatch(isProductOf(factory, product), true),
			() => expectMatch(isProductOf(factory, otherProduct), false),
			() => expectMatch(isProductOf(otherFactory, product), false),
			() => expectMatch(isProductOf(otherFactory, otherProduct), true),
		)
	},
	"isProductOf on talent installed directly on product": () => {
		const talent = () => {}
		const factory = createFactory(pure, talent)
		const factoryProduct = factory()
		const remixedFactoryProduct = mixin(factoryProduct, () => {})
		const mixedProduct = mixin(pure, talent)
		const mixedDeepProduct = mixin(pure, () => {}, talent)
		return expectChain(
			() => expectMatch(isProductOf(factory, factoryProduct), true),
			() => expectMatch(isProductOf(factory, remixedFactoryProduct), true),
			() => expectMatch(isProductOf(factory, mixedProduct), false),
			() => expectMatch(isProductOf(factory, mixedDeepProduct), false),
		)
	},
	"createFactory nested()": () => {
		const shared = {}
		const sharedFactory = createFactory(pure, () => ({ shared }))
		const own = {}
		const factory = createFactory(sharedFactory(), () => ({ own }))
		const product = factory()
		return expectChain(
			() => expectMatch(product.shared, shared),
			() => expectMatch(product.own, own),
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
