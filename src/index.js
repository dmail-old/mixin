import {
	isProduct,
	pure,
	hasTalent as optimistHasTalent,
	mixin as optimistMixin,
	replicate as optimistReplicate,
} from "./mixin.js"
import {
	createFactory as optimistCreateFactory,
	isProductOf as optimistIsProductOf,
} from "./factory.js"

export { isProduct, pure }

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
			throw new TypeError(`unexpected mixin n°${index + 1}: must be function`)
		}
	})

	return optimistMixin(firstArg, ...remainingArgs)
}

export const createFactory = (firstArg, ...remainingArgs) => {
	if (isProduct(firstArg) === false) {
		throw new TypeError(`unexpected createFactory 1st argument: must be a product`)
	}
	remainingArgs.forEach((remainingArg, index) => {
		if (typeof remainingArg !== "function") {
			throw new TypeError(`unexpected createFactory arg n°${index + 1}: must be a function`)
		}
	})

	return optimistCreateFactory(firstArg, ...remainingArgs)
}

export const isProductOf = (firstArg, secondArg) => {
	if (typeof firstArg !== "function") {
		throw new TypeError(`unexpected isProductOf 1st arg, must be a function`)
	}
	if (isProduct(secondArg) === false) {
		throw new TypeError(`unexpected isProductOf 2nd arg, must be a product`)
	}

	return optimistIsProductOf(firstArg, secondArg)
}

export const replicate = (firstArg) => {
	if (isProduct(firstArg) === false) {
		throw new TypeError(`unexpected replicate first arg, must be a product`)
	}

	return optimistReplicate(firstArg)
}
