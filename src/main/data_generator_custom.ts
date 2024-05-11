import range from 'fill-range'
import * as csv from 'csv'
import * as d3 from 'd3'
import dijkstrajs from 'dijkstrajs'
import * as fs from 'fs'

class DataGenerator {
  numStreamSpec = range(40, 161, 30)
  periodSpec = [100_000, 200_000, 400_000, 800_000]
  sizeSpec = range(200, 1501, 100)
  ddlSpec = [10_000, 25_000, 50_000, 100_000, 200_000, 400_000]
  #seed
  #randomInt

  constructor(seed = 0) {
    this.#seed = seed
  }

  #randomChoice<T>(target: T[]): T | null {
    return target ? target[this.#randomInt(target.length)()] : null
  }

  #convertTopoToMap(topo: TopoData) {
    const netObj = {}
    topo.nodes.forEach((node) => (netObj[node.id] = {}))
    for (const link of topo.links) {
      netObj[link.to][link.from] = 1
      netObj[link.from][link.to] = 1
    }
    return netObj
  }

  #outputTopo(topo: TopoData, header: string) {
    const result: Array<unknown> = []
    for (const link of topo.links) {
      result.push([`(${link.from}, ${link.to})`, 8, 1, 2000, 0])
      result.push([`(${link.to}, ${link.from})`, 8, 1, 2000, 0])
    }
    const stringifier = csv.stringify({
      header: true,
      columns: ['link', 'q_num', 'rate', 't_proc', 't_prop']
    })
    result.forEach((link) => stringifier.write(link))
    const writeStream = fs.createWriteStream(`${header}.csv`)
    stringifier.pipe(writeStream)
  }

  #generateFlowset(numThresParam: number, topo: TopoData, header: string) {
    const graph = this.#convertTopoToMap(topo)
    const result: Array<unknown> = []
    let i = 0
    const utiPorts = new Map()
    topo.nodes
      .filter((node) => node.isES)
      .forEach((es) => {
        utiPorts.set(es.id, 0)
      })
    // eslint-disable-next-line no-constant-condition
    while (true) {
      if (i >= numThresParam) {
        break
      }
      const availableEs: string[] = []
      for (const [id, e] of utiPorts) {
        if (e <= 0.75) {
          availableEs.push(id)
        }
      }
      if (availableEs.length === 0) {
        for (const id of utiPorts.keys()) {
          availableEs.push(id)
        }
      }
      const start = this.#randomChoice(availableEs)!
      const end = this.#randomChoice(availableEs.filter((e) => e !== start))!
      const path = dijkstrajs.find_path(graph, start, end)
      const period = this.#randomChoice(this.periodSpec)!
      const size = this.#randomChoice(this.sizeSpec)!
      const ddl = this.ddlSpec
        ? (path.length - 1) * (2000 + size * 8) + this.#randomChoice(this.ddlSpec)!
        : period
      result.push([i, start, [end], size, period, ddl])
      utiPorts[start] += (size * 8) / period
      i += 1
    }
    const stringifier = csv.stringify({
      header: true,
      columns: ['id', 'src', 'dst', 'size', 'period', 'ddl']
    })
    result.forEach((link) => stringifier.write(link))
    const writeStream = fs.createWriteStream(`${header}.csv`)
    stringifier.pipe(writeStream)
    return
  }

  gridGenerator(options: DataGenOptions) {
    try {
      fs.accessSync(`grid/${options.insName}`, fs.constants.F_OK)
    } catch {
      fs.mkdirSync(`grid/${options.insName}`, { recursive: true })
    }

    let count = 0
    const datasetLogs: unknown[][] = []
    this.#randomInt = d3.randomInt.source(d3.randomLcg(this.#seed))
    const numSwSpec = options.topo.nodes.reduce((count, node) => (node.isES ? count : count + 1), 0)
    const numEsSpec = options.topo.nodes.length - numSwSpec
    const topo = options.topo
    const profiles: DataGenProfile[] = []
    this.numStreamSpec = range(options.flowMin, options.flowMax, 1)
    this.periodSpec = options.period.split(',').map(parseInt)
    this.sizeSpec = range(options.sizeMin, options.sizeMax, 8)
    this.ddlSpec = options.ddl.split(',').map(parseInt)
    for (const size of this.sizeSpec) {
      for (const period of this.periodSpec) {
        for (const ddl of this.ddlSpec) {
          for (const numStream of this.numStreamSpec) {
            profiles.push({ size, period, ddl, numStream, numSwSpec, numEsSpec, topo })
          }
        }
      }
    }
    d3.shuffler(d3.randomLcg(this.#seed))(profiles)
    // eslint-disable-next-line no-constant-condition
    batchLoop: while (true) {
      for (const { size, period, ddl, numStream, numSwSpec, numEsSpec } of profiles) {
        const header = `grid/${options.insName}/${count}`
        this.#outputTopo(topo, header + '_topo')
        this.#generateFlowset(numStream, topo, header + '_task')
        const dataInfo = [
          count,
          options.insName,
          size,
          period,
          ddl,
          numStream,
          numSwSpec,
          numEsSpec
        ]
        datasetLogs.push(dataInfo)
        count += 1
        if (count >= options.batchSize!) {
          break batchLoop
        }
      }
    }
    const stringifier = csv.stringify({
      header: true,
      columns: ['id', 'ins_name', 'size', 'period', 'ddl', 'num_flow', 'num_sw', 'num_es']
    })
    datasetLogs.forEach((i) => stringifier.write(i))
    const writeStream = fs.createWriteStream(`grid/${options.insName}/dataset_logs.csv`)
    stringifier.pipe(writeStream)
  }
}

declare type DataGenProfile = {
  size: number
  period: number
  ddl: number
  numStream: number
  numSwSpec: number
  numEsSpec: number
  topo: TopoData
}

export type DataGenOptions = {
  insName: string
  batchSize: number
  flowMin: number
  flowMax: number
  sizeMin: number
  sizeMax: number
  period: string
  ddl: string
  topo: TopoData
}

export type TopoData = {
  nodes: Array<NodeData>
  links: Array<LinkData>
}
export type NodeData = {
  id: string
  isES: boolean
}
export type LinkData = {
  from: string
  to: string
}

export default DataGenerator
