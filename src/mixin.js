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

export const pure = createPureProduct()

export const isProduct = (arg) => hasOwnProperty(arg, talentSymbol)

const getModel = (product) => Object.getPrototypeOf(product)

const findModel = (product, predicate) => {
	let model = getModel(product)
	while (model) {
		if (predicate(model)) {
			return model
		}
		model = getModel(model)
	}
	return null
}

const hasOwnTalent = (talent, product) => product[talentSymbol] === talent

export const hasTalent = (talent, product) => {
	if (hasOwnTalent(talent, product)) {
		return true
	}
	return Boolean(findModel(product, (model) => hasOwnTalent(talent, model)))
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
	return talents.reduce((accumulator, talent) => {
		return addTalent(talent, accumulator)
	}, product)
}

export const replicate = (product) => {
	const talents = []
	const unshiftTalent = (product) => {
		const talent = product[talentSymbol]
		if (talent) {
			talents.unshift(talent)
		}
	}

	unshiftTalent(product)
	findModel(product, unshiftTalent)

	return mixin(pure, ...talents)
}
