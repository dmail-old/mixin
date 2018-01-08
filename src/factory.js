import { mixin, wrapTalent, hasTalent } from "./mixin.js"

export const createFactory = (product, ...talents) => {
	const factoryTalent = () => {}
	const talentLength = talents.length

	if (talentLength === 0) {
		const factory = () => mixin(product, factoryTalent)
		factory.talent = factoryTalent
		return factory
	}

	const [firstTalent, ...remainingTalents] = talents
	const factory = (...args) =>
		mixin(
			product,
			factoryTalent,
			wrapTalent(firstTalent, () => firstTalent(...args)),
			...remainingTalents,
		)
	factory.talent = factoryTalent
	return factory
}

export const isProductOf = (factory, product) => hasTalent(factory.talent, product)
