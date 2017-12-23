import { mixin, wrapTalent, someSelfOrModel, unwrapTalent, getTalent } from "./mixin.js"

export const createFactory = (product, talent) => {
	const factorized = (...args) => {
		const parameterized = () => talent(...args)
		return mixin(product, wrapTalent(factorized, parameterized))
	}
	return wrapTalent(talent, factorized)
}

// en fait lorsque le talent est installé sur product
// product se retrouve avec un talent parameterized qui lui même est factorized
// pour savoir si un produit provient d'une factory
// on peut alors unwrap le produit de 1 et vérifier qu'on retrouve bien factory
// mais attention il manque le fait que le produit peut avori été modifié
// il faut aussi vérifier que niv de produit comme le ferai un hasTalent
// pour chaque parent vérifier si le talent unwrap 1fois est bien la factory
export const isProductOf = (factory, product) => {
	return someSelfOrModel(product, (selfOrModel) => unwrapTalent(getTalent(selfOrModel)) === factory)
}
