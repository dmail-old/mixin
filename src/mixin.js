/*
talent, trait, mixin, stampit
// https://gist.github.com/petsel/7677638
*/

import { installProperties, hasOwnProperty, defineFrozenProperty } from "./helper.js"

const talentSymbol = Symbol.for("talent")

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
	while (talent) {
		const unwrappedTalent = unwrapTalent(talent)
		if (unwrappedTalent) {
			talent = unwrappedTalent
		} else {
			break
		}
	}
	return talent
}

export const hasTalent = (talent, product) => {
	const unwrappedTalent = unwrapTalentDeep(talent)
	return someSelfOrModel(product, (selfOrModel) => {
		const productUnwrappedTalent = unwrapTalentDeep(getTalent(selfOrModel))
		return productUnwrappedTalent === unwrappedTalent
	})
}

const addTalent = (talent, input) => {
	const output = Object.create(input)

	defineFrozenProperty(output, "valueOf", () => output)
	let lastValueOf
	if (hasOwnProperty(input, "lastValueOf")) {
		lastValueOf = input.lastValueOf
		lastValueOf.update(output)
	} else {
		let lastValue = output
		lastValueOf = () => lastValue
		lastValueOf.update = (value) => {
			lastValue = value
		}
	}
	defineFrozenProperty(output, "lastValueOf", lastValueOf)
	defineFrozenProperty(output, talentSymbol, talent)

	// talent is allowed to be null, it means
	// we created an other object without a talent associated to this creation
	if (talent) {
		const returnValue = talent(output)
		if (returnValue !== null && typeof returnValue === "object") {
			installProperties(returnValue, output)
		}
	}

	Object.preventExtensions(output)

	return output
}

export const pure = addTalent(
	null,
	// should be null, (that would internall do Object.create(null))
	// for now it's not well supported because some code does object.hasOwnProperty()
	// to check some stuff so we pass {} for now
	{},
)

export const mixin = (product, ...talents) => {
	if (talents.length === 0) {
		return addTalent(null, product)
	}
	return talents.reduce((accumulator, talent) => addTalent(talent, accumulator), product)
}

const getTalents = (product) => {
	const talents = []
	for (const selfOrModel of createSelfAndModelIterable(product)) {
		const talent = getTalent(selfOrModel)
		// returns null talent as well
		// so that replicate can create the exact same level of object delegation
		// even if object without talent are "the same" than their prototype
		// if (talent) {
		talents.unshift(talent)
		// }
	}
	return talents
}

export const replicate = (product) => mixin(pure, ...getTalents(product))
