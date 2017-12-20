export const defineReadOnlyHiddenProperty = (object, name, value) => {
	Object.defineProperty(object, name, {
		configurable: true,
		enumerable: false,
		writable: false,
		value,
	})
}

const installObjectProperties = (object, otherObject) => {
	Object.getOwnPropertyNames(otherObject).forEach((name) => {
		Object.defineProperty(object, name, Object.getOwnPropertyDescriptor(otherObject, name))
	})
	Object.getOwnPropertySymbols(otherObject).forEach((symbol) => {
		Object.defineProperty(object, symbol, Object.getOwnPropertyDescriptor(otherObject, symbol))
	})
}

const createEmpty = (object) => {
	return Object.create(Object.getPrototypeOf(object))
}

export const createClone = (object) => {
	if (typeof object !== "object") {
		throw new TypeError(`createClone first argument must be an object, got ${object}`)
	}
	const objectClone = createEmpty(object)
	installObjectProperties(objectClone, object)
	return objectClone
}

// in case object is created by Object.create(null) it does not have hasOwnProperty
export const hasOwnProperty = (object, property) => {
	if (object === null || object === undefined) {
		return false
	}
	return Object.prototype.hasOwnProperty.call(object, property)
}

export const canHaveOwnProperty = (value) => {
	if (value === null) {
		return false
	}
	return typeof value === "object" || typeof value === "function"
}

const installMethod = (object, name, value) => {
	if (typeof value !== "function") {
		throw new Error(
			`installMethod third argument must be a function (got ${value} for ${String(name)})`,
		)
	}
	defineReadOnlyHiddenProperty(object, name, value)
}

export const installMethods = (object, methods) => {
	Object.getOwnPropertyNames(methods).forEach((name) => {
		installMethod(object, name, methods[name])
	})
	Object.getOwnPropertySymbols(methods).forEach((symbol) => {
		installMethod(object, symbol, methods[symbol])
	})
}
