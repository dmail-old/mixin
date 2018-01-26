import {
	isProduct,
	pure,
	isComposedOf as optimistIsComposedOf,
	compose as optimistCompose,
	hasTalent as optimistHasTalent,
	hasTalentOf as optimistHasTalentOf,
	mixin as optimistMixin,
	replicate as optimistReplicate,
} from "./mixin.js"

export { isProduct, pure }

export const compose = (...args) => {
	args.forEach((arg, index) => {
		if (typeof arg !== "function") {
			throw new TypeError(`unexpected compose arg n°${index + 1}: must be function`)
		}
	})
	return optimistCompose(...args)
}

export const isComposedOf = (firstArg, secondArg) => {
	if (isProduct(firstArg) === false) {
		throw new TypeError(`isComposedOf first argument must be a product`)
	}
	return optimistIsComposedOf(firstArg, secondArg)
}

export const hasTalent = (firstArg, secondArg) => {
	if (typeof firstArg !== "function") {
		throw new TypeError(`hasTalent first argument must be a function`)
	}

	return optimistHasTalent(firstArg, secondArg)
}

export const mixin = (firstArg, ...remainingArgs) => {
	if (isProduct(firstArg) === false) {
		throw new TypeError(`mixin first argument must be a product`)
	}
	remainingArgs.forEach((arg, index) => {
		if (typeof arg !== "function") {
			throw new TypeError(`unexpected mixin arg n°${index + 1}: must be function`)
		}
	})

	return optimistMixin(firstArg, ...remainingArgs)
}

export const replicate = (firstArg) => {
	if (isProduct(firstArg) === false) {
		throw new TypeError(`unexpected replicate first arg, must be a product`)
	}

	return optimistReplicate(firstArg)
}

export const hasTalentOf = (firstArg, secondArg) => {
	if (isProduct(firstArg) === false) {
		throw new TypeError(`hasTalentOf first argument must be a product`)
	}
	return optimistHasTalentOf(firstArg, secondArg)
}
