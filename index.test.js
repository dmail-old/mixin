import {
	isProduct,
	pure,
	isComposedOf,
	hasTalent,
	mixin,
	createFactory,
	isProductOf,
	replicate,
} from "./index.js"
import { plan } from "@dmail/test"
import {
	expectMatch,
	matchNot,
	expectProperties,
	expectChain,
	expectThrowWith,
	matchTypeError,
} from "@dmail/expect"

export const test = plan("api", ({ scenario, test }) => {
	scenario("pure", () => {
		test("is a product", () => expectMatch(isProduct(pure), true))

		test("is non extensible", () => expectMatch(Object.isExtensible(pure), false))

		test("has getComposite() helper", () => expectMatch(pure.getComposite(), pure))

		test("has getLastComposite() helper", () =>
			expectMatch(typeof pure.getLastComposite, "function"))
	})

	scenario("null value", () => {
		test("is not a product", () => expectMatch(isProduct(null), false))

		test("has not a given talent", () => expectMatch(hasTalent(() => {}, null), false))

		test("throw when used with replicate", () =>
			expectThrowWith(() => replicate(null), matchTypeError()))

		test("throw when used with isComposedOf", () =>
			expectThrowWith(() => isComposedOf(null, {}), matchTypeError()))

		test("throw when used as first argument of isProductOf", () =>
			expectThrowWith(() => isProductOf(undefined, {}), matchTypeError()))

		test("return false when used as second argument of isProductOf", () =>
			expectMatch(isProductOf(() => {}, null), false))
	})

	scenario("undefined value", () => {
		test("is not a product", () => expectMatch(isProduct(undefined), false))

		test("has not a given talent", () => expectMatch(hasTalent(() => {}, undefined), false))

		test("throw when used with replicate", () =>
			expectThrowWith(() => replicate(undefined), matchTypeError()))

		test("throw when used with isComposedOf", () =>
			expectThrowWith(() => isComposedOf(undefined, {}), matchTypeError()))
	})

	scenario("mixin untalented output", () => {
		const input = pure

		test("is a product", () => expectMatch(isProduct(mixin(input)), true))

		test("is different from input", () => expectMatch(mixin(input), matchNot(input)))

		test("is non extensible", () => expectMatch(Object.isExtensible(mixin(input)), false))

		test("is a product", () => expectMatch(isProduct(mixin(input)), true))

		test("is composed of the input", () => expectMatch(isComposedOf(input, mixin(input)), true))

		test("has getComposite helper", () => {
			const output = mixin(input)
			return expectMatch(output.getComposite(), output)
		})

		test("has getLastComposite helper", () => {
			const output = mixin(input)
			return expectMatch(output.getLastComposite(), output)
		})
	})

	scenario("mixin talented output", () => {
		const input = pure
		const method = () => {}
		const talent = () => ({ method })

		test("is a product", () => expectMatch(isProduct(mixin(input, talent)), true))

		test("is different from input", () => expectMatch(mixin(input, talent), matchNot(input)))

		test("is non extensible", () => expectMatch(Object.isExtensible(mixin(input, talent)), false))

		test("is a product", () => expectMatch(isProduct(mixin(input, talent)), true))

		test("is composed of the input", () =>
			expectMatch(isComposedOf(input, mixin(input, talent)), true))

		test("has talent", () => expectMatch(hasTalent(talent, mixin(input, talent)), true))

		test("has talent method set as a frozen property", () => {
			return expectProperties(Object.getOwnPropertyDescriptor(mixin(input, talent), "method"), {
				enumerable: false,
				configurable: false,
				writable: false,
				value: method,
			})
		})

		test("has getComposite helper", () => {
			const output = mixin(input, talent)
			return expectMatch(output.getComposite(), output)
		})

		test("has getLastComposite helper", () => {
			const output = mixin(input, talent)
			return expectMatch(output.getLastComposite(), output)
		})
	})

	scenario("mixin on mixin output", () => {
		const input = pure
		const output = mixin(input)

		test("is composed of previous output & input", () => {
			const nextOutput = mixin(output)

			return expectChain(
				() => expectMatch(isComposedOf(output, nextOutput), true),
				() => expectMatch(isComposedOf(input, nextOutput), true),
			)
		})

		test("intermediated output getLastComposite", () => {
			const nextOutput = mixin(output)
			return expectMatch(output.getLastComposite(), nextOutput)
		})

		test("has getComposite helper", () => {
			const nextOutput = mixin(output)
			return expectMatch(nextOutput.getComposite(), nextOutput)
		})

		test("has getLastComposite helper", () => {
			const nextOutput = mixin(output)
			return expectMatch(nextOutput.getLastComposite(), nextOutput)
		})
	})

	scenario("mixin with talent returning null", () => {
		const talent = () => null

		test("has talent", () => expectMatch(hasTalent(talent, mixin(pure, talent)), true))
	})

	scenario("mixin two talent with name conflict", () => {
		const firstTalent = () => ({ foo: true, bar: false })
		const secondTalent = () => ({ foo: false })

		test("has the first talent", () =>
			expectMatch(hasTalent(firstTalent, mixin(pure, firstTalent, secondTalent)), true))

		test("has the second talent", () =>
			expectMatch(hasTalent(secondTalent, mixin(pure, firstTalent, secondTalent)), true))

		test("property is overriden", () =>
			expectMatch(mixin(pure, firstTalent, secondTalent).foo, false))
	})

	scenario("mixin two talent with symbol conflict", () => {
		const symbol = Symbol()
		const firstTalent = () => ({ [symbol]: true })
		const secondTalent = () => ({ [symbol]: false })

		test("symbol is overriden", () =>
			expectProperties(mixin(pure, firstTalent, secondTalent), { [symbol]: false }))
	})

	// during talent execution getLastComposite returns composite - 1
	// if a previous composite is using getLastComposite
	// and the current talent is calling that method
	// you prevent an infinite recursion between them
	scenario("getLastComposite called during talent execution", () => {
		test("getLastComposite available on first talent", () => {
			const input = pure
			const output = mixin(input, ({ getLastComposite }) => {
				return { value: getLastComposite() }
			})
			return expectMatch(output.value, input)
		})

		test("getLastComposite is the current composite", () => {
			const input = mixin(pure, () => ({ foo: true }))
			const talent = ({ getLastComposite }) => ({ value: getLastComposite() })
			const output = mixin(input, talent)
			return expectMatch(output.value, input)
		})
	})

	scenario("getLastComposite called on input, intermediate and last", () => {
		test("getLastComposite returns last", () => {
			const input = pure
			const intermediate = mixin(pure, () => ({ foo: true }))
			const last = mixin(intermediate, () => ({ bar: true }))

			return expectChain(
				() => expectMatch(input.getLastComposite(), last),
				() => expectMatch(intermediate.getLastComposite(), last),
				() => expectMatch(last.getLastComposite(), last),
				() => {
					const otherIntermediate = mixin(input, () => {})
					return expectChain(
						() => expectMatch(input.getLastComposite(), otherIntermediate),
						() => expectMatch(otherIntermediate.getLastComposite(), otherIntermediate),
						() => expectMatch(intermediate.getLastComposite(), last),
						() => expectMatch(last.getLastComposite(), last),
					)
				},
			)
		})
	})

	scenario("with two scope dependent talents", () => {
		const zeroValueTalent = () => {
			let value = 0
			const get = () => value
			const set = (arg) => {
				value = arg
				return arg
			}
			return { get, set }
		}
		const incrementTalent = ({ get, set }) => {
			const increment = () => set(get() + 1)
			return { increment }
		}

		test("work as expected", () => {
			const output = mixin(pure, zeroValueTalent, incrementTalent)
			return expectChain(
				() => expectMatch(output.get(), 0),
				() => expectMatch(output.increment(), 1),
			)
		})

		test("can replicate and get independent state", () => {
			const output = mixin(pure, zeroValueTalent, incrementTalent)
			const clone = replicate(output)
			return expectMatch(clone.increment(), 1)
		})

		test("can replicate on clone too", () => {
			const output = mixin(pure, zeroValueTalent, incrementTalent)
			const clone = replicate(output)
			clone.increment()
			const subclone = replicate(clone)
			return expectMatch(subclone.increment(), 1)
		})
	})

	scenario("product from factory without talent", () => {
		const input = pure
		const factory = createFactory(input)

		test("is a product", () => expectMatch(isProduct(factory()), true))

		test("is product of the factory", () => expectMatch(isProductOf(factory, factory()), true))
	})

	scenario("product from factory with one talent", () => {
		let talentArguments
		const talent = (...args) => {
			talentArguments = args
			return { foo: true }
		}
		const factory = createFactory(pure, talent)
		const object = {}
		const args = [0, 1, object]

		test("talent is called with factory arguments", () => {
			factory(...args)
			return expectProperties(talentArguments, args)
		})

		test("product got the talent", () => expectMatch(hasTalent(talent, factory()), true))

		test("product is product of the factory", () =>
			expectMatch(isProductOf(factory, factory()), true))

		test("you can still mutate arguments", () => {
			// but you should NOT DO THIS
			object.bar = true
			return expectMatch(object.bar, true)
		})
	})

	scenario("product from factory with 2 talents", () => {
		let firstArgs
		const firstTalent = (...args) => {
			firstArgs = args
			return { first: true }
		}
		let secondArgs
		const secondTalent = (...args) => {
			secondArgs = args
			return { second: true }
		}
		const factory = createFactory(pure, firstTalent, secondTalent)
		const args = [0, 1]

		test("first talent called with factory arguments", () => {
			factory(...args)
			return expectProperties(firstArgs, args)
		})

		test("second talent called with product", () => {
			const output = factory()
			return expectProperties(secondArgs, [Object.getPrototypeOf(output)])
		})

		test("first talent property installed", () => expectMatch(factory().first, true))

		test("second talent property installed", () => expectMatch(factory().second, true))

		test("can be replicated", () => {
			const clone = replicate(factory())
			return expectChain(
				() => expectMatch(clone.first, true),
				() => expectMatch(clone.second, true),
			)
		})
	})

	scenario("product from factory of factory", () => {
		const factory = createFactory(pure)
		const subfactory = createFactory(factory())

		test("is product of factory", () => expectMatch(isProductOf(subfactory, subfactory()), true))

		test("is product of ancestor factory", () =>
			expectMatch(isProductOf(factory, subfactory()), true))

		test("remixed product still know their factories", () =>
			expectMatch(isProductOf(factory, mixin(subfactory())), true))
	})
})
