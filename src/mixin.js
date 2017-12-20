/*
talent, trait, mixin, stampit

// https://gist.github.com/petsel/7677638
*/

import { installMethods, hasOwnProperty, defineReadOnlyHiddenProperty } from "./helper.js"

// this is an helper to get the value from which destructured methods come from
// without it, you cannot use param destructuring and get the destructured object at the same time
// it may disappear in favor of somehting more explicit such as
// replacing test(valueOf()) by test({ foo, bar})
// const valueOfName = "valueOf"
// const installValueOfHelper = (object) => {
// 	const valueOf = () => object
// 	Object.defineProperty(object, valueOfName, {
// 		configurable: true,
// 		value: valueOf,
// 	})
// }

// // gives a pointer to the object having the exported functions as well
// // may disappear too in case it's not that usefull
// const lastValueOfName = "lastValueOf"
// const installLastValueOfHelper = (object) => {
// 	let lastValue = object
// 	const lastValueOf = () => lastValue

// 	const currentLastValueOf = object[lastValueOfName]
// 	if (currentLastValueOf) {
// 		currentLastValueOf.override(lastValue)
// 		defineReadOnlyHiddenProperty(object, lastValueOfName, currentLastValueOf)
// 	} else {
// 		lastValueOf.override = (value) => {
// 			lastValue = value
// 		}
// 		defineReadOnlyHiddenProperty(object, lastValueOfName, lastValueOf)
// 	}
// }

const talentsSymbol = Symbol.for("talents")

// chaque produit peut n'avoir qu'un seul talent puisqu'on
// ne mutate rien, chaque valeur pourrait donc avoir un symbol talent qui ne soit pas un tableau
// mais juste le talent lui même
// comme chaque produit est lié par prototype au précédent
// hasTalent pourrait utiliser Object.getPrototypeOf() pour voir si
// un des prototype parent possède ce talent
// précisons que cette implémentation a un avantage majeur:
// en case de rédéfinition de la propriété on peut toujours accéder
// à lancienne propriété puisqu'elle est définie dans le parent
// override est inutile du coup
export const createPureProduct = () => {
	const pureProduct = {} // should be Object.create(null), for now it's not well supported
	defineReadOnlyHiddenProperty(pureProduct, talentsSymbol, [])
	return pureProduct
}

export const isProduct = (arg) => hasOwnProperty(arg, talentsSymbol)

export const hasTalent = (talent, product) => {
	return product[talentsSymbol].some(
		(productTalent) => talent === productTalent || talent === productTalent.wrappedTalent,
	)
}

const addTalent = (talent, product) => {
	const returnValue = talent(product)
	const talentedProduct = Object.create(product)
	defineReadOnlyHiddenProperty(talentedProduct, talentsSymbol, [...product[talentsSymbol], talent])
	if (returnValue !== null && typeof returnValue === "object") {
		installMethods(returnValue, talentedProduct)
	}
	return talentedProduct
}

export const mixin = (product, ...talents) => {
	return talents.reduce((accumulator, talent) => {
		return addTalent(talent, accumulator)
	}, product)
}

export const replicate = (product) => {
	return product[talentsSymbol].reduce(
		(accumulator, talent) => addTalent(talent, accumulator),
		createPureProduct(),
	)
}
