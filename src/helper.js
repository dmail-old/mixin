export const defineReadOnlyHiddenProperty = (object, name, value) => {
	Object.defineProperty(object, name, {
		configurable: true,
		enumerable: false,
		writable: false,
		value,
	})
}

// in case object is created by Object.create(null) it does not have hasOwnProperty
export const hasOwnProperty = (object, property) => {
	if (object === null || object === undefined) {
		return false
	}
	return Object.prototype.hasOwnProperty.call(object, property)
}

const installMethod = (object, name, value) => {
	if (typeof value !== "function") {
		// do not forget value can be a symbol, that's why there is String(value)
		throw new Error(
			`installMethod third argument must be a function (got ${String(value)} for ${String(name)})`,
		)
	}
	defineReadOnlyHiddenProperty(object, name, value)
}

export const installMethods = (methods, object) => {
	Object.getOwnPropertyNames(methods).forEach((name) => {
		installMethod(object, name, methods[name])
	})
	Object.getOwnPropertySymbols(methods).forEach((symbol) => {
		installMethod(object, symbol, methods[symbol])
	})
}
