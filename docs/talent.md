# Talent

A talent is a function that should

* read properties from argument using param destructuring
* write properties returning an object

```javascript
// wrong
const talentWithoutPattern = (product) => {
	product.value++
}

// right
const talentWithPattern = ({ value }) => {
	return {
		value: value + 1,
	}
}
```

## Talent pattern advantages

* Destructuring param shows in a glimpse what you talent needs to read
* Returned object show in a glimpse what you talent needs to write
* Destructuring param prevent temptation to mutate talent argument (the product)
* Returned object is internally used to set non configurable and non writable properties
