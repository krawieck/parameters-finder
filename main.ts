import GeneticStuff, { Dna, ParentsSelectionMethod } from "./GeneticStuff"

let globalInterval: NodeJS.Timeout

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
);
(document.querySelector("#try-again") as HTMLButtonElement).addEventListener(
  "click",
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

  const g = new GeneticStuff(
    { a: 0, b: 0, c: 0 },
    ({ a, b, c }: Dna) =>
      (Math.abs(a * x1 ** 2 + b * x1 + c) +
        Math.abs(a * x2 ** 2 + b * x2 + c)) *
      -1,
    {
      parentsSelectionMethod: ParentsSelectionMethod.SpinTheCheese,
      populationSize: 10
    }
  )

  globalInterval = setInterval(() => {
    g.NextGen()
    aElement.innerHTML = String(g.population[0].dna.a)
    bElement.innerHTML = String(g.population[0].dna.b)
    cElement.innerHTML = String(g.population[0].dna.c)
    distanceElement.innerHTML = String(g.topFitness * -1)
    // console.log(g.population)
  }, 10)
}

doTheAiMagic()
