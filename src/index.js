import {
	isProduct,
	pure,
	isComposedOf as optimistIsComposedOf,
	hasTalent as optimistHasTalent,
	mixin as optimistMixin,
	replicate as optimistReplicate,
} from "./mixin.js"
import {
	mark as optimistMark,
	isProductOf as optimistIsProductOf,
	createFactory as optimistCreateFactory,
} from "./factory.js"

export { isProduct, pure }

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
			throw new TypeError(`unexpected mixin n°${index + 1}: must be function`)
		}
	})

	return optimistMixin(firstArg, ...remainingArgs)
}

export const mark = (firstArg) => {
	if (typeof firstArg !== "function") {
		throw new TypeError(`unexpected mark 1st arg, must be a function`)
	}
	return optimistMark(firstArg)
}

export const isProductOf = (firstArg, secondArg) => {
	if (typeof firstArg !== "function") {
		throw new TypeError(`unexpected isProductOf 1st arg, must be a function`)
	}
	return optimistIsProductOf(firstArg, secondArg)
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

export const replicate = (firstArg) => {
	if (isProduct(firstArg) === false) {
		throw new TypeError(`unexpected replicate first arg, must be a product`)
	}

	return optimistReplicate(firstArg)
}
