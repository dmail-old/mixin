/*
talent, trait, mixin, stampit

// https://gist.github.com/petsel/7677638
*/

const overrideSymbol = Symbol()
export const override = value => ({
	[overrideSymbol]: value,
})

const installMethods = (target, methods) => {
	Object.keys(methods).forEach(key => {
		let value = methods[key]
		let preventOverride
		if (value.hasOwnProperty(overrideSymbol)) {
			value = value[overrideSymbol]
			preventOverride = false
		} else {
			preventOverride = true
		}

		if (typeof value !== "function") {
			throw new Error(
				`installMethods second argument must be an object with only functions (got ${value} for ${
					key
				})`,
			)
		}
		if (preventOverride && target.hasOwnProperty(key)) {
			throw new Error(`${target} has already a property named ${key}`)
		}
		Object.defineProperty(target, key, {
			value,
			writable: true,
			configurable: true,
		})
	})
}

export const clone = target => {
	const clone = Object.create(Object.getPrototypeOf(target))
	Object.getOwnPropertyNames(target).forEach(name => {
		Object.defineProperty(clone, name, Object.getOwnPropertyDescriptor(target, name))
	})
	return clone
}

const installValueOfHelper = (target, getLastTarget) => {
	const currentValueOf = target.valueOf
	let valueOf
	if (currentValueOf && currentValueOf.hasOwnProperty("overrideGetter")) {
		currentValueOf.overrideGetter(getLastTarget)
		valueOf = currentValueOf
	} else {
		let targetGetter = getLastTarget
		valueOf = () => targetGetter()
		valueOf.overrideGetter = getter => {
			targetGetter = getter
		}
	}
	Object.defineProperty(target, "valueOf", {
		value: valueOf,
		configurable: true,
	})
}

export const mixin = (target, ...fns) => {
	let lastTarget = target
	const getLastTarget = () => lastTarget

	return fns.reduce((previousTarget, fn) => {
		const target = clone(previousTarget)
		// this is an helper to get the value from which destructured methods come from
		// without it, you cannot use param destructuring and get the destructured object at the same time
		// with it you can do the following
		// const target = {}
		// mixin(target, ({ valueOf }) => { valueOfEqualsTarget: () => valueOf() === target } )
		// additionnaly valueOf will always return the last target
		// so that you have access to the target with all the methods and the one user will use
		installValueOfHelper(target, getLastTarget)

		lastTarget = target

		const returnValue = fn(target)
		if (typeof returnValue === "object" && returnValue !== null) {
			installMethods(target, returnValue)
		}

		return target
	}, target)
}

export const createMixin = mainFn => (target = {}, ...fns) => mixin(target, mainFn, ...fns)
