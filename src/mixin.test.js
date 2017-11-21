import { mixin, override, createMixin } from "./mixin.js"
import { createTest } from "@dmail/test"
import {
	expectMatch,
	matchNot,
	expectProperties,
	expectThrow,
	expectThrowWith,
	matchErrorWith,
	expectChain,
	expectFunction,
	expectObject,
} from "@dmail/expect"

export default createTest({
	"mixin passing only an object": () => {
		const input = {}
		const output = mixin(input)
		return expectMatch(input, output)
	},
	"mixin does not mutate its first arg": () => {
		const input = {}
		const output = mixin(input, () => {})
		return expectMatch(input, matchNot(output))
	},
	"talent returning null": () => {
		return expectProperties(mixin({}, () => null), {})
	},
	"mixin property descriptor": () => {
		const method = () => {}
		const output = mixin({}, () => ({ method }))
		const methodDescriptor = Object.getOwnPropertyDescriptor(output, "method")
		return expectProperties(methodDescriptor, {
			enumerable: false,
			configurable: true,
			writable: true,
			value: method,
		})
	},
	"mixin preserves original properties": () => {
		const input = {}
		const get = () => true
		Object.defineProperty(input, "foo", {
			get,
		})
		const output = mixin(input, () => {})
		const descriptor = Object.getOwnPropertyDescriptor(output, "foo")
		return expectProperties(descriptor, Object.getOwnPropertyDescriptor(input, "foo"))
	},
	"throw when talent return existing property": () => {
		return expectThrowWith(
			() => mixin({ foo: true }, () => ({ foo: () => {} })),
			matchErrorWith({
				message: "[object Object] has already a property named foo",
			}),
		)
	},
	"override allow to redefine an existing method": () => {
		const foo = () => {}
		const output = mixin({ foo: true }, () => ({
			foo: override(foo),
		}))
		return expectChain(
			() => expectMatch(output.foo, foo),
			// we ensure a given function can serve as override for a first mixin
			// but still throws for an other miwin (if not wrapped by override)
			() =>
				expectThrow(() =>
					mixin({ foo: true }, () => ({
						foo,
					})),
				),
		)
	},
	"throw when talent return an object with something else than a function": () => {
		return expectThrowWith(
			() => mixin({}, () => ({ foo: true })),
			matchErrorWith({
				message:
					"installMethods second argument must be an object with only functions (got true for foo)",
			}),
		)
	},
	"valueOf with many talents": () => {
		let output = mixin(
			{},
			({ valueOf }) => ({
				firstValueOf: valueOf,
			}),
			({ valueOf }) => {
				const intermediateTarget = valueOf()
				return {
					getIntermediateScopedValueOf: () => intermediateTarget,
				}
			},
		)
		output = mixin(output, ({ valueOf }) => ({
			lastValueOf: valueOf,
		}))
		return expectChain(
			() => expectMatch(output.firstValueOf(), output),
			() => expectMatch(output.getIntermediateScopedValueOf(), matchNot(output)),
			() => expectMatch(output.lastValueOf(), output),
		)
	},
	"createMixin()": () => {
		const createStuff = createMixin(target => {
			return {
				getTarget: () => target,
			}
		})
		return expectChain(
			() => expectFunction(createStuff),
			() => expectObject(createStuff().getTarget()),
		)
	},
	"createMixin(target)": () => {
		const createStuff = createMixin(target => ({
			getTarget: () => target,
		}))
		const target = { foo: true }
		const method = () => {}
		const stuff = createStuff(target, () => ({
			method,
		}))
		return expectChain(
			() => expectMatch(stuff.getTarget(), matchNot(target)),
			() => expectProperties(stuff, target),
			() => expectMatch(stuff.method, method),
		)
	},
})
