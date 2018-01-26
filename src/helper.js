const frozenDescriptor = {
	configurable: false,
	enumerable: false,
	writable: false,
}

export const defineFrozenProperty = (object, name, value) => {
	Object.defineProperty(object, name, { ...frozenDescriptor, value })
}

export const hasOwnProperty = (object, property) => {
	// in case object is created by Object.create(null) it does not have hasOwnProperty
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
