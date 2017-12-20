```javascript
import { createFactory, replicate, createPureProduct } from "@dmail/mixin"

const createCounter = createFactory(({ count = 0 }) => {
	const increment = () => {
		count++
		return count
	}
	increment()

	return {
		increment,
	}
})

const counter = createCounter({ count: 10 })

counter.increment() // 12

const counterClone = replicate(counter)

counterClone.increment() // 12
```
