/*
talent, trait, mixin, stampit
// https://gist.github.com/petsel/7677638
*/

import { installProperties, hasOwnProperty, defineFrozenProperty } from "./helper.js"

const talentSymbol = Symbol.for("talent")

const getPrototype = (product) => Object.getPrototypeOf(product)

export const isProduct = (arg) => hasOwnProperty(arg, talentSymbol)

const createSelfAndPrototypeIterable = (product) => {
	const selfAndPrototypes = []
	while (isProduct(product)) {
		selfAndPrototypes.push(product)
		product = getPrototype(product)
	}
	return selfAndPrototypes
}

export const getTalent = (product) => product[talentSymbol]

export const someSelfOrPrototype = (product, predicate) => {
	for (const selfOrModel of createSelfAndPrototypeIterable(product)) {
		if (predicate(selfOrModel)) {
			return true
		}
	}
	return false
}

export const isComposedOf = (product, value) => {
	if (!isProduct(value)) {
		return false
	}
	let proto = getPrototype(value)
	while (proto) {
		if (proto === product) {
			return true
		}
		proto = getPrototype(proto)
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
	return someSelfOrPrototype(product, (selfOrPrototype) => {
		const productUnwrappedTalent = unwrapTalentDeep(getTalent(selfOrPrototype))
		return productUnwrappedTalent === unwrappedTalent
	})
}

const addTalent = (talent, input) => {
	const output = Object.create(input)

	defineFrozenProperty(output, "getComposite", () => output)
	defineFrozenProperty(output, talentSymbol, talent)

	// talent is allowed to be null, it means
	// we created an other object without a talent associated to this creation
	if (talent) {
		const returnValue = talent(output)
		if (returnValue !== null && typeof returnValue === "object") {
			installProperties(returnValue, output)
		}
	}

	let getLastComposite
	if (hasOwnProperty(input, "getLastComposite")) {
		getLastComposite = input.getLastComposite
		getLastComposite.update(output)
	} else {
		let lastValue = output
		getLastComposite = () => lastValue
		getLastComposite.update = (value) => {
			lastValue = value
		}
	}
	defineFrozenProperty(output, "getLastComposite", getLastComposite)

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
	for (const selfOrPrototype of createSelfAndPrototypeIterable(product)) {
		const talent = getTalent(selfOrPrototype)
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
