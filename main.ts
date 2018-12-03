let globalInterval: NodeJS.Timeout

enum OffspringSelectionMethod {
  Shuffle,
  Clone,
  Average
}

enum FitnessMethod {
  Max,
  Propability,
  Propability2
}

const aElement = document.querySelector(".a") as HTMLElement
const bElement = document.querySelector(".b") as HTMLElement
const cElement = document.querySelector(".c") as HTMLElement
const distanceElement = document.querySelector(".distance") as HTMLElement
const inputs = Array.from(
  document.querySelectorAll("input")
) as HTMLInputElement[];

(document.querySelector(".x1") as HTMLLinkElement).addEventListener(
  "input",
  doTheAiMagic
);
(document.querySelector(".x2") as HTMLLinkElement).addEventListener(
  "input",
  doTheAiMagic
)

function doTheAiMagic() {
  const x1 = Number((document.querySelector(".x1") as HTMLInputElement).value)
  const x2 = Number((document.querySelector(".x2") as HTMLInputElement).value)
  clearInterval(globalInterval)

  if (Number.isNaN(x1) || Number.isNaN(x2)) {
    inputs.forEach(e => (e.style.borderColor = "red"))
    return
  }
  inputs.forEach(e => (e.style.borderColor = ""))

  const g = new GeneticStuff(x1, x2, { populationSize: 100 })

  globalInterval = setInterval(() => {
    g.NextGen()
    aElement.innerHTML = String(g.population[0].a)
    bElement.innerHTML = String(g.population[0].b)
    cElement.innerHTML = String(g.population[0].c)
    distanceElement.innerHTML = String(g.topFitness * -1)
  }, 1)
}

interface IMember {
  a: number
  b: number
  c: number
  fitness?: number
}

class GeneticStuff {
  public static GenerateOffspring(parent1: IMember, parent2: IMember): IMember {
    // prolly should be changed at some point in the future
    return {
      a: Math.random() > 0.5 ? parent1.a : parent2.a,
      b: Math.random() > 0.5 ? parent1.b : parent2.b,
      c: Math.random() > 0.5 ? parent1.c : parent2.c
    }
  }
  private static _getRand(min: number, max: number): number {
    return Math.random() * (max - min) + min
  }

  public args = {}
  public mutationRate: number
  public populationSize: number
  public numberOfParents: number
  public topFitness: number
  public x1: number
  public x2: number
  public population: IMember[]

  constructor(x1: number, x2: number, args = {}) {
    if (Number.isNaN(x1) || Number.isNaN(x2)) {
      throw new TypeError("x1 and x2 have to be numbers")
    }
    const defaultArgs = {
      mutationRate: 0.01,
      numberOfParents: 2,
      populationSize: 1000,
      ...args
    }
    this.args = defaultArgs
    this.mutationRate = defaultArgs.mutationRate
    this.populationSize = defaultArgs.populationSize
    this.numberOfParents = 2 // args.numberOfParents

    this.x1 = Number(x1)
    this.x2 = Number(x2)

    this.population = new Array(this.populationSize)
      .fill(undefined)
      .map(() => {
        const dna = {
          a: GeneticStuff._getRand(-1, 1),
          b: GeneticStuff._getRand(-1, 1),
          c: GeneticStuff._getRand(-1, 1)
        }
        return {
          ...dna,
          fitness: this.CalcFitness(dna)
        }
      })
      .sort((a, b) => b.fitness - a.fitness)

    this.topFitness = this.population[0].fitness!
  }

  public NextGen(): void {
    // generate parents
    let newGen: IMember[] = []
    for (let i = 0; i < this.numberOfParents; i++) {
      newGen.push(this.population[i])
    }

    // mating
    for (let i = 0; i < this.populationSize - this.numberOfParents; i++) {
      newGen.push(GeneticStuff.GenerateOffspring(newGen[0], newGen[1]))
    }

    // mutation
    newGen = newGen.map(this.Mutate.bind(this))

    // calc fitness and sort by it
    this.population = newGen
      .map(e => ({ ...e, fitness: this.CalcFitness(e) }))
      .sort((a, b) => b.fitness - a.fitness)

    this.topFitness = this.population[0].fitness!
  }

  public CalcFitness({ a, b, c }: IMember): number {
    return (
      (Math.abs(a * this.x1 ** 2 + b * this.x1 + c) +
        Math.abs(a * this.x2 ** 2 + b * this.x2 + c)) *
      -1
    )
  }

  public Mutate({ a, b, c }: IMember): IMember {
    return {
      a:
        Math.random() > 0.9
          ? a + GeneticStuff._getRand(-1, 1) * this.mutationRate
          : a,
      b:
        Math.random() > 0.9
          ? b + GeneticStuff._getRand(-1, 1) * this.mutationRate
          : b,
      c:
        Math.random() > 0.9
          ? c + GeneticStuff._getRand(-1, 1) * this.mutationRate
          : c
    }
  }
}

doTheAiMagic()
