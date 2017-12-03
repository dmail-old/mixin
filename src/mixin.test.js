import {
	mixin,
	override,
	createFactory,
	createFactoryWith,
	createFactoryAdvanced,
	isFactoryOf,
} from "./mixin.js"
import { createTest } from "@dmail/test"
import {
	expectMatch,
	matchNot,
	expectProperties,
	expectThrow,
	expectThrowWith,
	matchErrorWith,
	expectChain,
	matchFunction,
	expectFunction,
} from "@dmail/expect"

export default createTest({
	"mixin({ foo: true })": () => {
		const input = { foo: true }
		const output = mixin(input)
		return expectMatch(input, matchNot(output))
	},
	"mixin property descriptor preserved": () => {
		const input = {}
		const get = () => true
		Object.defineProperty(input, "foo", {
			get,
		})
		const output = mixin(input)
		const descriptor = Object.getOwnPropertyDescriptor(output, "foo")
		return expectProperties(descriptor, Object.getOwnPropertyDescriptor(input, "foo"))
	},
	"helpers presence": () => {
		return expectProperties(mixin({}), {
			replicate: matchFunction(),
			valueOf: matchFunction(),
			lastValueOf: matchFunction(),
		})
	},
	"valueOf() helper": () => {
		const input = {
			foo: true,
		}
		const product = mixin(
			input,
			({ valueOf }) => ({ firstTalentValueOf: valueOf }),
			({ valueOf }) => ({ middleTalentValueOf: valueOf }),
			({ valueOf }) => ({ lastTalentValueOf: valueOf }),
		)
		return expectChain(
			() =>
				expectProperties(product.firstTalentValueOf(), {
					foo: true,
					firstTalentValueOf: matchFunction(),
				}),
			() => expectMatch(product.firstTalentValueOf(), matchNot(input)),
			() =>
				expectProperties(product.middleTalentValueOf(), {
					foo: true,
					firstTalentValueOf: matchFunction(),
					middleTalentValueOf: matchFunction(),
				}),
			() => expectMatch(product.middleTalentValueOf(), matchNot(product.firstTalentValueOf())),
			() =>
				expectProperties(product.lastTalentValueOf(), {
					foo: true,
					firstTalentValueOf: matchFunction(),
					middleTalentValueOf: matchFunction(),
					lastTalentValueOf: matchFunction(),
				}),
			() => expectMatch(product.lastTalentValueOf(), matchNot(product)),
		)
	},
	"lastValueOf() helper": () => {
		const input = {
			foo: true,
		}
		const product = mixin(
			input,
			({ lastValueOf: firstLastValueOf }) => {
				const returnValue = firstLastValueOf()
				return {
					firstLastValueOf,
					getEarlyLastValueOfReturnValue: () => returnValue,
				}
			},
			({ lastValueOf: middleLastValueOf }) => ({ middleLastValueOf }),
			({ lastValueOf: lastLastValueOf }) => ({ lastLastValueOf }),
		)
		return expectChain(
			() => expectMatch(product.firstLastValueOf(), product),
			() => expectMatch(product.getEarlyLastValueOfReturnValue(), undefined),
			() => expectMatch(product.middleLastValueOf(), product),
			() => expectMatch(product.lastLastValueOf(), product),
		)
	},
	"lastValueOf() with multiple mixin call": () => {
		let product = mixin({}, ({ lastValueOf: firstTalentLastValueOf }) => ({
			firstTalentLastValueOf,
		}))
		product = mixin(product, ({ lastValueOf: lastTalentLastValueOf }) => ({
			lastTalentLastValueOf,
		}))
		return expectChain(
			() => expectMatch(product.firstTalentLastValueOf(), product),
			() => expectMatch(product.lastTalentLastValueOf(), product),
		)
	},
	"replicate() scoped per talent": () => {
		const first = () => {}
		const second = () => {}
		const firstTalent = ({ replicate }) => ({
			firstReplicate: replicate,
			first,
		})
		const secondTalent = ({ replicate }) => ({
			secondReplicate: replicate,
			second,
		})
		const { firstReplicate, secondReplicate, replicate } = mixin({}, firstTalent, secondTalent)

		return expectChain(
			() => expectMatch(firstReplicate().first, undefined),
			() => expectMatch(secondReplicate().first, first),
			() => expectMatch(secondReplicate().second, undefined),
			() => expectProperties(replicate(), { first, second }),
		)
	},
	"replicate() helper": () => {
		const counterTalent = () => {
			let counter = 0
			const increment = () => {
				counter++
			}
			const getCounter = () => counter
			return {
				increment,
				getCounter,
			}
		}
		const input = { foo: true }
		const output = mixin(input, counterTalent)
		const replicatedOutput = output.replicate()
		const nestedReplicatedOutput = replicatedOutput.replicate()

		return expectChain(
			() => expectMatch(output, matchNot(replicatedOutput)),
			() => expectProperties(replicatedOutput, input),
			() => expectProperties(nestedReplicatedOutput, input),
			() => expectMatch(output.lastValueOf(), output),
			() => expectMatch(replicatedOutput.lastValueOf(), replicatedOutput),
			() => expectMatch(nestedReplicatedOutput.lastValueOf(), nestedReplicatedOutput),
			() => expectMatch(output.getCounter(), 0),
			() => output.increment(),
			() => expectMatch(output.getCounter(), 1),
			() => expectMatch(replicatedOutput.getCounter(), 0),
			() => replicatedOutput.increment(),
			() => expectMatch(replicatedOutput.getCounter(), 1),
			() => expectMatch(nestedReplicatedOutput.getCounter(), 0),
			() => nestedReplicatedOutput.increment(),
			() => expectMatch(replicatedOutput.getCounter(), 1),
		)
	},
	"talent returning null": () => {
		return expectProperties(mixin({}, () => null), {})
	},
	"talent methods property descriptor": () => {
		const method = () => {}
		const output = mixin({}, () => ({ method }))
		const methodDescriptor = Object.getOwnPropertyDescriptor(output, "method")
		return expectProperties(methodDescriptor, {
			enumerable: false,
			configurable: true,
			writable: false,
			value: method,
		})
	},
	"throw when talent return existing property": () => {
		return expectThrowWith(
			() => mixin({ foo: true }, () => ({ foo: () => {} })),
			matchErrorWith({
				message: "[object Object] already has property foo",
			}),
		)
	},
	"throw when talent return existing anonymous symbol": () => {
		const anonymousSymbol = Symbol()

		return expectThrowWith(
			() =>
				mixin(
					{
						[anonymousSymbol]: true,
					},
					() => ({
						[anonymousSymbol]: () => {},
					}),
				),
			matchErrorWith({
				message: "[object Object] already has symbol Symbol()",
			}),
		)
	},
	"throw when talent return existing named symbol": () => {
		const namedSymbol = Symbol("foo")
		return expectThrowWith(
			() =>
				mixin(
					{
						[namedSymbol]: true,
					},
					() => ({
						[namedSymbol]: () => {},
					}),
				),
			matchErrorWith({
				message: `[object Object] already has symbol Symbol(foo)`,
			}),
		)
	},
	"throw also on existing property on Object.create(null)": () => {
		const object = Object.create(null)
		object.foo = true
		return expectThrowWith(
			() => mixin(object, () => ({ foo: () => {} })),
			matchErrorWith({
				message: "[object Object] already has property foo",
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
				message: "installMethod third argument must be a function (got true for foo)",
			}),
		)
	},
	"createFactory(fn)": () => {
		const createStuff = createFactory(() => {})
		return expectFunction(createStuff)
	},
	"createFactory(fn) returned function called without argument": () => {
		const createStuff = createFactory(() => {})
		const output = createStuff()
		return expectProperties(output, {})
	},
	"createFactory(fn) returned function called with one argument": () => {
		const createStuff = createFactory(() => {})
		const target = { foo: true }
		const output = createStuff(target)
		const replicated = output.replicate()
		return expectChain(
			() => expectProperties(output, target),
			() => expectProperties(replicated, target),
		)
	},
	"isFactoryOf()": () => {
		const factory = createFactory(() => {})
		const output = factory()
		const replicat = output.replicate()

		return expectChain(
			() => expectMatch(isFactoryOf(factory, null), false),
			() => expectMatch(isFactoryOf(factory, true), false),
			() => expectMatch(isFactoryOf(factory, {}), false),
			() => expectMatch(isFactoryOf(factory, output), true),
			() => expectMatch(isFactoryOf(factory, replicat), true),
		)
	},
	"createFactoryWith(behaviour, talent)": () => {
		const behaviourMethod = () => {}
		const talentMethod = () => {}
		const createStuff = createFactoryWith(() => ({ behaviourMethod }), () => ({ talentMethod }))
		const stuff = createStuff()

		return expectChain(
			() => expectMatch(stuff.behaviourMethod, behaviourMethod),
			() => expectMatch(stuff.talentMethod, talentMethod),
		)
	},
	"createFactoryAdvanced with create option": () => {
		const target = { foo: true }
		const method = () => {}
		const createStuff = createFactoryAdvanced({
			create: () => ({ ...target }),
			refine: () => ({ method }),
		})
		const expectedProperties = {
			...target,
			method,
		}

		return expectChain(
			() => expectProperties(createStuff(), expectedProperties),
			() => expectProperties(createStuff().replicate(), expectedProperties),
		)
	},
	"createFactoryAdvanced() can be called without arg": () => {
		const createStuff = createFactoryAdvanced()
		const stuff = createStuff()
		return expectProperties(stuff, {})
	},
})
