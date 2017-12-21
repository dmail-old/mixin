import { pure, mixin, hasTalent } from "./mixin.js"

export const createFactory = (talent) => {
	const factory = (...args) => {
		const { length } = args
		if (length === 0) {
			return mixin(pure, talent)
		}
		if (length === 1) {
			const [arg] = args
			if (typeof arg !== "object") {
				throw new TypeError(`factory first argument must be an object`)
			}
			return mixin(pure, () => arg, talent)
		}
		throw new Error(`factory must be called with 1 or zero argument`)
	}
	factory.wrappedTalent = talent
	return factory
}

export const isProducedBy = (factory, product) => {
	return hasTalent(factory.wrappedTalent, product)
}
