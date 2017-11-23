/*
talent, trait, mixin, stampit

// https://gist.github.com/petsel/7677638
*/

const defineReadOnlyHiddenProperty = (object, name, value) => {
	Object.defineProperty(object, name, {
		configurable: true,
		enumerable: false,
		writable: false,
		value,
	})
}

const valueOfName = "valueOf"
const installValueOfHelper = object => {
	// this is an helper to get the value from which destructured methods come from
	// without it, you cannot use param destructuring and get the destructured object at the same time
	// with it you can do the following
	// const target = {}
	// mixin(target, ({ valueOf }) => { valueOfEqualsTarget: () => valueOf() === target } )
	const valueOf = () => object
	Object.defineProperty(object, valueOfName, {
		configurable: true,
		value: valueOf,
	})
}

const lastValueOfName = "lastValueOf"
const installLastValueOfHelper = (object, lastValueOfGetter) => {
	const currentLastValueOf = object[lastValueOfName]
	if (currentLastValueOf) {
		currentLastValueOf.overrideGetter(lastValueOfGetter)
		defineReadOnlyHiddenProperty(object, lastValueOfName, currentLastValueOf)
	} else {
		const lastValueOf = () => lastValueOfGetter()
		lastValueOf.overrideGetter = getter => {
			lastValueOfGetter = getter
		}
		defineReadOnlyHiddenProperty(object, lastValueOfName, lastValueOf)
	}
}

const installObjectProperties = (object, otherObject) => {
	Object.getOwnPropertyNames(otherObject).forEach(name => {
		if (name === valueOfName) {
			return
		}
		Object.defineProperty(object, name, Object.getOwnPropertyDescriptor(otherObject, name))
	})
}

// in case object is created by Object.create(null) it does not have hasOwnProperty
const hasOwnProperty = (object, name) => Object.prototype.hasOwnProperty.call(object, name)

const overrideSymbol = Symbol()
export const override = value => ({
	[overrideSymbol]: value,
})

const installMethods = (object, methods) => {
	// we should install symbol as well using Object.getOwnSymbols(methods)
	Object.getOwnPropertyNames(methods).forEach(name => {
		let value = methods[name]
		let preventOverride
		if (hasOwnProperty(value, overrideSymbol)) {
			value = value[overrideSymbol]
			preventOverride = false
		} else {
			preventOverride = true
		}

		if (typeof value !== "function") {
			throw new Error(
				`installMethods second argument must be an object with only functions (got ${value} for ${
					name
				})`,
			)
		}
		if (preventOverride && hasOwnProperty(object, name)) {
			const convertObjectToString = object => {
				if (Object.getPrototypeOf(object) === null) {
					return "[object Object]"
				}
				return String(object)
			}
			throw new Error(`${convertObjectToString(object)} has already a property named ${name}`)
		}
		defineReadOnlyHiddenProperty(object, name, value)
	})
}

const replicateName = "replicate"
const createEmpty = object => {
	return Object.create(Object.getPrototypeOf(object))
}
const createClone = object => {
	const objectClone = createEmpty(object)
	installObjectProperties(objectClone, object)
	return objectClone
}
export const replicateObject = object => {
	return hasOwnProperty(object, replicateName) ? object[replicateName]() : createClone(object)
}

export const pureMixin = (createRawProduct, ...fns) => {
	let lastValueOf
	// rename getFinalProduct, getProcessedProduct ?
	// j'aime pas trop l'idée d'avoir une méthode aussi longue
	// j'aimerais bien un nom pour le produit de base "rawProduct"
	// chaque produit intermédiaire "processedProduct"
	// et le produit final "finalProduct"
	// mais chaque processedProduct est possiblement un finalProduct selon
	// d'ou on se place
	const lastValueOfGetter = () => lastValueOf

	const iterate = (product, index) => {
		installValueOfHelper(product)
		// we could have a nextValueOf() helper, would it be useful?
		installLastValueOfHelper(product, lastValueOfGetter)
		const replicate = () => {
			const productClone = pureMixin(createRawProduct, ...fns.slice(0, index))
			defineReadOnlyHiddenProperty(productClone, replicateName, replicate)
			return productClone
		}
		defineReadOnlyHiddenProperty(product, replicateName, replicate)

		if (index === fns.length) {
			return product
		}
		const fn = fns[index]
		const returnValue = fn(product)
		if (typeof returnValue === "object" && returnValue !== null) {
			installMethods(product, returnValue)
		}
		return iterate(createClone(product), index + 1)
	}

	lastValueOf = iterate(createRawProduct(), 0)
	return lastValueOf
}

export const mixin = (object, ...fns) => pureMixin(() => replicateObject(object), ...fns)

const defaultCreateRawProduct = () => {
	return {}
}

export const createFactoryAdvanced = (
	{ create = defaultCreateRawProduct, refine = () => {}, talents = [] } = {},
) => {
	const createProduct = product => {
		let createRawProduct
		if (product === undefined) {
			createRawProduct = create
		} else {
			createRawProduct = () => replicateObject(product)
		}
		return pureMixin(createRawProduct, refine, ...talents)
	}
	return createProduct
}

export const createFactory = behaviour => createFactoryAdvanced({ refine: behaviour })

export const createFactoryWith = (behaviour, ...talents) =>
	createFactoryAdvanced({
		refine: behaviour,
		talents,
	})
