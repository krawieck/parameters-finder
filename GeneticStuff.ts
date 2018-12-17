export enum OffspringGenerationMethod {
  Shuffle,
  Clone,
  Average
}

export enum FitnessMethod {
  Max,
  Propability,
  Propability2
}

export enum ParentsSelectionMethod {
  Top,
  SpinTheCheese
}

export type Dna = {
  [key: string]: number;
}

export type Member = {
  dna: Dna;
  fitness: number;
}

export interface IGeneticStuffArgs {
  mutationRate?: number
  numberOfParents?: number
  populationSize?: number
  messiahChance?: number
  fitnessMethod?: FitnessMethod
  offspringGenerationMethod?: OffspringGenerationMethod
  parentsSelectionMethod?: ParentsSelectionMethod
}

const getRand = (min: number, max: number): number =>
  Math.random() * (max - min) + min

export default class GeneticStuff {
  public topFitness: number
  public population: Member[]

  public mutationRate: number
  public numberOfParents: number
  public populationSize: number
  public messiahChance: number

  public fitnessMethod: FitnessMethod
  public offspringGenerationMethod: OffspringGenerationMethod
  public parentsSelectionMethod: ParentsSelectionMethod

  constructor(
    public dnaTemplate: Dna,
    public CalcFitness: (dna: Dna) => number,
    {
      messiahChance = 0.001,
      populationSize = 100,
      mutationRate = 0.01,
      numberOfParents = 2,
      fitnessMethod = FitnessMethod.Max,
      offspringGenerationMethod = OffspringGenerationMethod.Shuffle,
      parentsSelectionMethod = ParentsSelectionMethod.SpinTheCheese
    }: IGeneticStuffArgs = {
      messiahChance: 0.001,
      populationSize: 100,
      mutationRate: 0.01,
      numberOfParents: 2,
      fitnessMethod: FitnessMethod.Max,
      offspringGenerationMethod: OffspringGenerationMethod.Shuffle,
      parentsSelectionMethod: ParentsSelectionMethod.SpinTheCheese
    }
  ) {
    this.mutationRate = mutationRate
    this.populationSize = populationSize
    this.numberOfParents = numberOfParents
    this.fitnessMethod = fitnessMethod
    this.offspringGenerationMethod = offspringGenerationMethod
    this.parentsSelectionMethod = parentsSelectionMethod
    this.messiahChance = messiahChance

    // intialize population with random values
    this.population = new Array(this.populationSize)
      .fill(undefined)
      .map(() => {
        // JavaScript-y (retarded) way
        // Object.keys(this.dnaTemplate)
        //   .map(e => [e, getRand(-1, 1)])
        //   .reduce((sum, [key, val]) => ({ ...sum, [key]: val }), {})

        // normal way
        // @TODO somehow make dnaTemplate into array with just keys
        const dna: Dna = {}
        for (const key of Object.keys(this.dnaTemplate)) {
          dna[key] = getRand(-1, 1)
        }

        // previous, non reusable way
        // const dna: Dna = {
        //   a: getRand(-1, 1),
        //   b: getRand(-1, 1),
        //   c: getRand(-1, 1)
        // }
        return {
          dna,
          fitness: this.CalcFitness(dna)
        }
      })
      .sort((a, b) => b.fitness - a.fitness)

    this.topFitness = this.population[0].fitness
  }

  public NextGen(): void {
    // generate parents
    const newGen: Dna[] = this.SelectParents(this.population)

    // mating
    for (let i = 0; i < this.populationSize - this.numberOfParents; i++) {
      newGen.push(
        this.GenerateOffspring(newGen.slice(0, this.numberOfParents))
      )
    }

    // calc fitness and sort by it
    this.population = newGen
      // mutation
      .map(this.Mutate.bind(this))
      // calc fitness and sort by it
      .map(dna => ({ dna, fitness: this.CalcFitness(dna) } as Member))
      .sort((a, b) => b.fitness - a.fitness)

    this.topFitness = this.population[0].fitness
  }

  public GenerateOffspring(parents: Dna[]): Dna {
    switch (this.offspringGenerationMethod) {
      case OffspringGenerationMethod.Shuffle: {
        const child: Dna = {}
        for (const key of Object.keys(this.dnaTemplate)) {
          child[key] = parents[Math.floor(Math.random() * parents.length)][key]
        }
        return child
      }

      case OffspringGenerationMethod.Clone: {
        return parents[Math.floor(Math.random() * parents.length)]
      }

      case OffspringGenerationMethod.Average: {
        const child: Dna = {}
        for (const key of Object.keys(this.dnaTemplate)) {
          child[key] =
            parents.reduce((sum, curr) => sum + curr[key], 0) / parents.length
        }

        return child
      }

      default:
        throw new Error("You selected wrong offspringGenerationMethod")
        break
    }
  }

  public SelectParents(population: Member[]): Dna[] {
    switch (this.parentsSelectionMethod) {
      case ParentsSelectionMethod.Top: {
        population = population
          .map(e => ({ ...e, fitness: this.CalcFitness(e.dna) }))
          .sort((a, b) => b.fitness - a.fitness)
        return population.slice(0, this.numberOfParents).map(e => e.dna)
      }
      case ParentsSelectionMethod.SpinTheCheese: {
        // @FIXME IS IT WORKING CORRECTLY?
        function spinTheCheese(sortedPopulation: Member[]): [Member, Member[]] {
          const sum = sortedPopulation.reduce((s, a) => s + a.fitness, 0)
          const slice = getRand(0, sum)

          let max = 0
          for (const [i, e] of sortedPopulation.entries()) {
            // @FIXME resolve the <= and >=
            if (
              (max <= slice && max + e.fitness >= slice) ||
              (max >= slice && max + e.fitness <= slice)
            ) {
              return [sortedPopulation.splice(i, 1)[0], sortedPopulation]
            }

            max += e.fitness
          }
          // this should never happen
          throw new Error("idk what happened, but u messed sth up")
        }

        // calculate fitness and sort the population by it
        population = population
          .map(e => ({ ...e, fitness: this.CalcFitness(e.dna) }))
          .sort((a, b) => b.fitness - a.fitness)

        const parents = []
        let curr: Member
        for (let i = 0; i < this.numberOfParents; i++) {
          [curr, population] = spinTheCheese(population)
          parents.push(curr)
        }
        return population.map(e => e.dna)
      }
      default:
        throw new Error("Invalid parentsSelectionMethod")
    }
  }

  public Mutate(dna: Dna): Dna {
    const mutant: Dna = {}
    if (Math.random() > this.messiahChance) {
      for (const [key, val] of Object.entries(dna)) {
        mutant[key] = getRand(-10, 10)
      }
    }
    for (const [key, val] of Object.entries(dna)) {
      mutant[key] =
        Math.random() > 0.9 ? val + getRand(-1, 1) * this.mutationRate : val // @TODO is it right?
    }

    return mutant
  }
}
