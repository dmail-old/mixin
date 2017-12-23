import {
	isProduct,
	pure,
	hasTalent as optimistHasTalent,
	mixin as optimistMixin,
	replicate as optimistReplicate,
	isHighOrderTalent,
} from "./mixin.js"
import {
	createFactory as optimistCreateFactory,
	isProductOf as optimistIsProductOf,
} from "./factory.js"

export { isProduct, pure }

export const hasTalent = (firstArg, secondArg) => {
	if (typeof firstArg !== "function") {
		throw new TypeError(`unexpected hasTalent 1st argument: must be a function`)
	}
	return optimistHasTalent(firstArg, secondArg)
}

export const mixin = (firstArg, ...remainingArgs) => {
	if (isProduct(firstArg) === false) {
		throw new TypeError(`unexpected mixin 1st argument: must be a product`)
	}
	remainingArgs.forEach((arg, index) => {
		if (typeof arg !== "function") {
			throw new TypeError(`unexpected mixin arg n°${index + 1}: must be function`)
		}
	})
	return optimistMixin(firstArg, ...remainingArgs)
}

export const createFactory = (firstArg, secondArg) => {
	if (isProduct(firstArg) === false) {
		throw new TypeError(`unexpected createFactory 1st argument: must be a product`)
	}
	if (typeof secondArg !== "function") {
		throw new TypeError(`unexpected createFactory 2nd argument: must be a function`)
	}
	if (isHighOrderTalent(secondArg)) {
		throw new TypeError(`unexpected createFactory 2nd argument: must not be an high order talent`)
	}
	return optimistCreateFactory(firstArg, secondArg)
}

export const isProductOf = (firstArg, secondArg) => {
	if (typeof firstArg !== "function") {
		throw new TypeError(`unexpected isProductOf 1st argument: must be a function`)
	}
	if (isHighOrderTalent(firstArg) === false) {
		throw new TypeError(`unexpected isProductOf 1st argument: must be a high order talent`)
	}
	return optimistIsProductOf(firstArg, secondArg)
}

export const replicate = (firstArg) => {
	if (isProduct(firstArg) === false) {
		throw new TypeError(`unexpected replicate 1st argument: got ${firstArg}, it must be a product`)
	}
	return optimistReplicate(firstArg)
}
