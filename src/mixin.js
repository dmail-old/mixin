/*
talent, trait, mixin, stampit
// https://gist.github.com/petsel/7677638
*/

import { installProperties, hasOwnProperty, defineFrozenProperty } from "./helper.js"

const talentSymbol = Symbol.for("talent")

const createPureProduct = () => {
	// should be Object.create(null), for now it's not well supported
	// by my other libraries
	const pureProduct = {}
	defineFrozenProperty(pureProduct, talentSymbol, null)
	Object.preventExtensions(pureProduct)
	return pureProduct
}

const getModel = (product) => Object.getPrototypeOf(product)

export const isProduct = (arg) => hasOwnProperty(arg, talentSymbol)

const createSelfAndModelIterable = (product) => {
	const products = []
	while (isProduct(product)) {
		products.push(product)
		product = getModel(product)
	}
	return products
}

export const getTalent = (product) => product[talentSymbol]

export const pure = createPureProduct()

export const someSelfOrModel = (product, predicate) => {
	for (const selfOrModel of createSelfAndModelIterable(product)) {
		if (predicate(selfOrModel)) {
			return true
		}
	}
	return false
}

export const wrapTalent = (talent, map) => {
	map.wrappedTalent = talent
	return map
}

export const isHighOrderTalent = (value) => {
	return typeof value === "function" && hasOwnProperty(value, "wrappedTalent")
}

export const unwrapTalent = (talent) => {
	return hasOwnProperty(talent, "wrappedTalent") ? talent.wrappedTalent : null
}

export const unwrapTalentDeep = (talent) => {
	let unwrappedTalent = talent
	let unwrapped
	while ((unwrapped = unwrapTalent(unwrappedTalent))) {
		unwrappedTalent = unwrapped
	}
	return unwrappedTalent
}

// export const hasOwnTalent = (talent, product) => {
// 	return isProduct(product) && unwrapDeep(getTalent(product)) === unwrapDeep(talent)
// }

export const hasTalent = (talent, product) => {
	const unwrappedTalent = unwrapTalentDeep(talent)
	return someSelfOrModel(product, (selfOrModel) => {
		return unwrapTalentDeep(getTalent(selfOrModel)) === unwrappedTalent
	})
}

const addTalent = (talent, product) => {
	const talentedProduct = Object.create(product)
	defineFrozenProperty(talentedProduct, "valueOf", () => talentedProduct)
	const returnValue = talent(talentedProduct)
	defineFrozenProperty(talentedProduct, talentSymbol, talent)
	if (returnValue !== null && typeof returnValue === "object") {
		installProperties(returnValue, talentedProduct)
	}
	Object.preventExtensions(talentedProduct)
	return talentedProduct
}

export const mixin = (product, ...talents) => {
	return talents.reduce((accumulator, talent) => addTalent(talent, accumulator), product)
}

const getTalents = (product) => {
	const talents = []
	for (const selfOrModel of createSelfAndModelIterable(product)) {
		const talent = getTalent(selfOrModel)
		if (talent) {
			talents.unshift(talent)
		}
	}
	return talents
}

export const replicate = (product) => mixin(pure, ...getTalents(product))
