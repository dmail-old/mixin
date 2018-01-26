/*
talent, trait, mixin, stampit
// https://gist.github.com/petsel/7677638
*/

import { hasOwnProperty, defineFrozenProperty, installProperties } from "./helper.js"

const talentSymbol = Symbol.for("talent")

const getPrototype = (value) => Object.getPrototypeOf(value)

export const isProduct = (arg) => hasOwnProperty(arg, talentSymbol)

const createSelfAndPrototypeIterable = (product) => {
	const selfAndPrototypes = []
	while (product) {
		selfAndPrototypes.push(product)
		product = getPrototype(product)
	}
	return selfAndPrototypes
}

const getTalent = (product) => product[talentSymbol]

export const someSelfOrPrototype = (product, predicate) => {
	for (const selfOrModel of createSelfAndPrototypeIterable(product)) {
		if (predicate(selfOrModel)) {
			return true
		}
	}
	return false
}

export const isComposedOf = (possiblePrototype, value) => {
	return Object.prototype.isPrototypeOf.call(possiblePrototype, value)
}

export const hasTalent = (talent, product) => {
	return someSelfOrPrototype(product, (selfOrPrototype) => {
		return getTalent(selfOrPrototype) === talent
	})
}

export const hasTalentOf = (a, b) => {
	return hasTalent(getTalent(a), b)
}

const addTalent = (talent, input) => {
	const output = Object.create(input)

	defineFrozenProperty(output, talentSymbol, talent)
	defineFrozenProperty(output, "self", output)
	// temp fix, can be removed when updating @dmail/expect
	output.hasOwnProperty = Object.prototype.hasOwnProperty
	// temp fix, can be remove when updating @dmail/uneval#getCompositeType
	// which expect an object to have a constructor property
	output.constructor = Object

	// talent is allowed to be null, it means
	// we created an other object without a talent associated to this creation
	if (talent) {
		const returnValue = talent(output)
		if (returnValue !== null && typeof returnValue === "object") {
			if (isProduct(returnValue)) {
				return returnValue
			}
			installProperties(returnValue, output)
		}
	}

	Object.preventExtensions(output)

	return output
}

export const pure = addTalent(null, null)

export const compose = (...talents) => (product) => {
	return talents.reduce((accumulator, talent) => addTalent(talent, accumulator), product)
}

export const mixin = (product, ...talents) => {
	if (talents.length === 0) {
		return addTalent(null, product)
	}
	return talents.reduce((accumulator, talent) => addTalent(talent, accumulator), product)
}

const getTalents = (product) => {
	const talents = []
	for (const selfOrPrototype of createSelfAndPrototypeIterable(product)) {
		talents.unshift(getTalent(selfOrPrototype))
	}
	return talents
}

export const replicate = (product) => mixin(pure, ...getTalents(product))
