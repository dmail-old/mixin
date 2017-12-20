import {
	isProduct,
	hasTalent as optimistHasTalent,
	mixin as optimistMixin,
	replicate as optimistReplicate,
} from "./mixin.js"
import {
	createFactory as optimistCreateFactory,
	isProducedBy as optimistIsProducedBy,
} from "./factory.js"

export { isProduct }

export const hasTalent = (firstArg, secondArg) => {
	if (typeof firstArg !== "function") {
		throw new TypeError(`hasTalent first argument must be a function`)
	}
	if (isProduct(secondArg) === false) {
		throw new TypeError(`hasTalent second arg must be a product`)
	}
	return optimistHasTalent(firstArg, secondArg)
}

export const mixin = (firstArg, ...remainingArgs) => {
	if (isProduct(firstArg) === false) {
		throw new TypeError(`mixin first argument must be a product`)
	}
	remainingArgs.forEach((arg) => {
		if (typeof arg !== "function") {
			throw new TypeError(`mixin args after product must be function`)
		}
	})
	return optimistMixin(firstArg, ...remainingArgs)
}

export const replicate = (firstArg) => {
	if (isProduct(firstArg) === false) {
		throw new TypeError(`replicate first argument must be a product, got ${firstArg}`)
	}
	return optimistReplicate(firstArg)
}

export const createFactory = (firstArg) => {
	if (typeof firstArg !== "function") {
		throw new TypeError(`createFactory first argument must be a function`)
	}
	return optimistCreateFactory(firstArg)
}

export const isProducedBy = (firstArg, secondArg) => {
	if (typeof firstArg !== "function") {
		throw new TypeError(`isProducedBy first argument must be a function`)
	}
	if (isProduct(secondArg) === false) {
		throw new TypeError(`isProducedBy second arg must be a product`)
	}
	return optimistIsProducedBy(firstArg, secondArg)
}
