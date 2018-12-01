let globalInterval

const a_ = document.querySelector('.a')
const b_ = document.querySelector('.b')
const c_ = document.querySelector('.c')
const distance_ = document.querySelector('.distance')
const inputs = Array.from(document.querySelectorAll('input'))

document.querySelector('.x1').addEventListener('input', doTheAiMagic)
document.querySelector('.x2').addEventListener('input', doTheAiMagic)

function doTheAiMagic() {
	const x1 = Number(document.querySelector('.x1').value)
	const x2 = Number(document.querySelector('.x2').value)
	clearInterval(globalInterval)

	if (Number.isNaN(x1) || Number.isNaN(x2)) {
		inputs.forEach(e => (e.style = 'border-color: red;'))
		return
	}
	inputs.forEach(e => (e.style = ''))

	const g = new GeneticStuff(x1, x2, { populationSize: 100 })

	globalInterval = setInterval(() => {
		g.NextGen()
		a_.innerHTML = g.population[0].a
		b_.innerHTML = g.population[0].b
		c_.innerHTML = g.population[0].c
		distance_.innerHTML = g.topFitness * -1
	}, 1)
}

class GeneticStuff {
	constructor(x1, x2, args = {}) {
		if (Number.isNaN(x1) || Number.isNaN(x2)) throw new TypeError('x1 and x2 have to be numbers')
		const defaultArgs = {
			populationSize: 1000,
			numberOfParents: 2,
			mutationRate: 0.01,
			...args,
		}
		this.args = defaultArgs
		this.mutationRate = defaultArgs.mutationRate
		this.populationSize = defaultArgs.populationSize
		this.numberOfParents = 2 //args.numberOfParents

		this.x1 = Number(x1)
		this.x2 = Number(x2)

		this.population = new Array(this.populationSize)
			.fill(undefined)
			.map(() => {
				const dna = { a: this._getRand(-1, 1), b: this._getRand(-1, 1), c: this._getRand(-1, 1) }
				return {
					...dna,
					fitness: this.CalcFitness(dna),
				}
			})
			.sort((a, b) => b.fitness - a.fitness)

		this.topFitness = this.population[0].fitness
	}

	NextGen() {
		// generate parents
		let newGen = []
		for (let i = 0; i < this.numberOfParents; i++) {
			newGen.push(this.population[i])
		}

		// mating
		for (let i = 0; i < this.populationSize - this.numberOfParents; i++)
			newGen.push(this.GenerateOffspring(newGen[0], newGen[1]))

		// mutation
		newGen = newGen.map(this.Mutate.bind(this))

		// calc fitness and sort by it
		this.population = newGen
			.map(e => ({ ...e, fitness: this.CalcFitness(e) }))
			.sort((a, b) => b.fitness - a.fitness)

		this.topFitness = this.population[0].fitness
	}

	static _getRand(min, max) {
		return Math.random() * (max - min) + min
	}

	CalcFitness({ a, b, c }) {
		return (
			(Math.abs(a * this.x1 ** 2 + b * this.x1 + c) +
				Math.abs(a * this.x2 ** 2 + b * this.x2 + c)) *
			-1
		)
	}

	static GenerateOffspring(parent1, parent2) {
		// prolly should be changed at some point in the future
		return {
			a: Math.random() > 0.5 ? parent1.a : parent2.a,
			b: Math.random() > 0.5 ? parent1.b : parent2.b,
			c: Math.random() > 0.5 ? parent1.c : parent2.c,
		}
	}

	Mutate({ a, b, c }) {
		return {
			a: Math.random() > 0.9 ? a + this._getRand(-1, 1) * this.mutationRate : a,
			b: Math.random() > 0.9 ? b + this._getRand(-1, 1) * this.mutationRate : b,
			c: Math.random() > 0.9 ? c + this._getRand(-1, 1) * this.mutationRate : c,
		}
	}
}
doTheAiMagic()
