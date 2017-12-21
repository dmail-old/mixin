const frozenDescriptor = {
	configurable: false,
	enumerable: false,
	writable: false,
}
export const defineFrozenProperty = (object, name, value) => {
	Object.defineProperty(object, name, { ...frozenDescriptor, value })
}

// in case object is created by Object.create(null) it does not have hasOwnProperty
export const hasOwnProperty = (object, property) => {
	if (object === null || object === undefined) {
		return false
	}
	return Object.prototype.hasOwnProperty.call(object, property)
}

export const installProperties = (source, object) => {
	Object.getOwnPropertyNames(source).forEach((name) => {
		defineFrozenProperty(object, name, source[name])
	})
	Object.getOwnPropertySymbols(source).forEach((symbol) => {
		defineFrozenProperty(object, symbol, source[symbol])
	})
}

// bro you should not use array or function here
// function would not be cloned and their properties would not be frozen
// about array they would become strange objects instead of being true array
// and their values won't be frozen
// export const cloneAndFreezeDeep = (object) => {
// 	const references = []
// 	const getReference = (value) => references.find(({ from }) => from === value)
// 	const setReference = (from, to) => references.push({ from, to })

// 	const cloneAndFreeze = (object) => {
// 		const clone = Object.create(Object.getPrototypeOf(object))
// 		setReference(object, clone)

// 		const cloneProperty = (nameOrSymbol) => {
// 			const propertyValue = object[nameOrSymbol]
// 			if (typeof propertyValue === "object" && propertyValue !== null) {
// 				const reference = getReference(propertyValue)
// 				if (reference) {
// 					defineFrozenProperty(clone, nameOrSymbol, reference.target)
// 				} else {
// 					defineFrozenProperty(clone, nameOrSymbol, cloneAndFreeze(propertyValue))
// 				}
// 			} else {
// 				defineFrozenProperty(clone, nameOrSymbol, propertyValue)
// 			}
// 		}

// 		Object.getOwnPropertyNames(object).forEach((name) => cloneProperty(name))
// 		Object.getOwnPropertySymbols(object).forEach((symbol) => cloneProperty(symbol))
// 		Object.preventExtensions(clone)
// 	}

// 	return cloneAndFreeze(object)
// }
