import { createPureProduct, mixin, hasTalent } from "./mixin.js"

export const createFactory = (talent) => {
	const pureProduct = createPureProduct()
	const factory = (...args) => {
		const parametrizedTalent = () => talent(...args)
		parametrizedTalent.wrappedTalent = talent
		return mixin(pureProduct, parametrizedTalent)
	}
	factory.wrappedTalent = talent
	return factory
}

export const isProducedBy = (factory, product) => {
	return hasTalent(factory.wrappedTalent, product)
}
