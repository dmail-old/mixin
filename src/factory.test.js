import { createFactory, isProducedBy } from "./factory.js"
import { replicate } from "./mixin.js"
import { createTest } from "@dmail/test"
import { expectMatch, expectFunction, expectProperties, expectChain } from "@dmail/expect"

export const test = createTest({
	"createFactory(fn) returns a function": () => {
		const factory = createFactory(() => {})
		return expectFunction(factory)
	},
	"createFactory(fn) returned function args are passed to factory": () => {
		let passedArgs
		const factory = createFactory((...args) => {
			passedArgs = args
		})
		const args = [0, 1]
		factory(...args)
		return expectProperties(passedArgs, args)
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
