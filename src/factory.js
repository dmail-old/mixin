/*
factory and mark will be deprecated because mixin + talent are enough
and must be favored because more powerfull and explicit
factory introduce too much magic and two way of doing things
*/

import { mixin, wrapTalent, hasTalent } from "./mixin.js"

export const mark = (fn) => {
	const markTalent = () => {}
	const markedFunction = (...args) => mixin(fn(...args), markTalent)
	markedFunction.talent = markTalent
	return markedFunction
}

export const isProductOf = (factory, product) => hasTalent(factory.talent, product)

export const createFactory = (product, ...talents) => {
	const talentLength = talents.length

	if (talentLength === 0) {
		return mark(() => mixin(product))
	}

	const [firstTalent, ...remainingTalents] = talents
	return mark((...args) =>
		mixin(product, wrapTalent(firstTalent, () => firstTalent(...args)), ...remainingTalents),
	)
}
