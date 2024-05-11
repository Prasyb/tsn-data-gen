import range from 'fill-range'
import * as csv from 'csv'
import * as d3 from 'd3'
import dijkstrajs from 'dijkstrajs'
import * as fs from 'fs'

class DataGenerator {
  numStreamSpec = range(40, 161, 30)
  periodSpec = [0, 1, 2, 3, 4, 5]
  sizeSpec = [0, 1, 2, 3, 4]
  ddlSpec = [0, 1, 2, 3, 4]
  #seed
  #randomInt

  constructor(seed = 0) {
    this.#seed = seed
  }

  #randomChoice(target) {
    return target ? target[this.#randomInt(0, target.length - 1)] : null
  }

  #periodSpec(opt) {
    switch (opt) {
      case 0:
        return 2_000_000
      case 1:
        return 400_000
      case 2:
        return this.#randomChoice([500_000, 1_000_000, 2_000_000, 4_000_000])
      case 3:
        return this.#randomChoice([100_000, 200_000, 400_000, 800_000])
      case 4:
        return this.#randomChoice([250_000, 500_000, 1_250_000, 2_500_000, 4_000_000])
      case 5:
        return this.#randomChoice([50_000, 100_000, 250_000, 500_000, 800_000])
    }
    throw RangeError
  }

  #dataSpec(opt) {
    switch (opt) {
      case 0:
        return 50
      case 1:
        return this.#randomChoice(range(100, 501, 100))
      case 2:
        return this.#randomChoice(range(200, 1501, 100))
      case 3:
        return this.#randomChoice(range(500, 4501, 100))
      case 4:
        return this.#randomChoice(range(1500, 4501, 100))
    }
    throw RangeError
  }

  #ddlSpec(opt) {
    switch (opt) {
      case 0:
        throw RangeError
      case 1:
        return this.#randomChoice([100_000, 200_000, 400_000, 800_000, 1_600_000])
      case 2:
        return this.#randomChoice([10_000, 25_000, 50_000, 100_000, 200_000, 400_000])
      case 3:
        return this.#randomChoice([0, 10_000, 20_000, 25_000, 50_000])
      case 4:
        return 0
    }
    throw RangeError
  }

  #mesh(numSw, numQueue, dataRate, header) {
    const numNode = numSw * 2
    const net = new Array(numNode).fill(0).map(() => new Array(numNode))
    for (let i of range(0, numSw - 2, 1)) {
      net[i][i + 1] = 1
      net[i + 1][i] = 1
    }

    for (let i of range(0, numSw - 1, 1)) {
      net[i + numSw][i] = 1
      net[i][i + numSw] = 1
    }
    net[0][numSw - 1] = 1
    net[numSw - 1][0] = 1

    for (let i of range(0, numSw - 1, 1)) {
      net[i][numSw - i - 1] = 1
      net[numSw - i - 1][i] = 1
    }

    let result = []
    for (let i of range(0, numNode - 1, 1)) {
      for (let j of range(0, numNode - 1, 1)) {
        if (net[i][j]) {
          const link = []
          link.push(`(${[i, j]})`)
          link.push(numQueue)
          link.push(dataRate)
          link.push(2000)
          link.push(0)
          result.push(link)
        }
      }
    }

    let stringifier = csv.stringify({
      header: true,
      columns: ['link', 'q_num', 'rate', 't_proc', 't_prop']
    })
    result.map((link) => stringifier.write(link))
    let writeStream = fs.createWriteStream(`${header}.csv`)
    stringifier.pipe(writeStream)
    return net
  }

  #convertNetToObject(net) {
    let netObj = {}
    range(0, net.length - 1, 1).forEach((i) => (netObj[i] = {}))
    for (let i in range(0, net.length - 1, 1)) {
      for (let j in range(0, net.length - 1, 1)) {
        netObj[i][j] = 1
      }
    }
    return netObj
  }

  #generateFlowset(graph, sizeParam, periodParam, ddlParam, numThresParam, numSw, numEs, header) {
    let result = []
    let i = 0
    let uti = 0
    let utiPorts = new Array(numEs).fill(0)
    while (true) {
      if (i >= numThresParam) {
        let stringifier = csv.stringify({
          header: true,
          columns: ['id', 'src', 'dst', 'size', 'period', 'deadline', 'jitter']
        })
        result.forEach((link) => stringifier.write(link))
        let writeStream = fs.createWriteStream(`${header}.csv`)
        stringifier.pipe(writeStream)
        return
      }
      let availableEs = []
      utiPorts.forEach((ele, index) => {
        if (ele <= 0.75) {
          availableEs.push(index)
        }
      })
      if (availableEs.length === 0) {
        availableEs = range(0, numEs - 1, 1)
      }

      let start = this.#randomChoice(availableEs) + numSw
      let end = this.#randomChoice(range(numSw, numSw + numEs - 1, 1).filter((x) => x !== start))
      let path = dijkstrajs.find_path(graph, start, end)

      let period = this.#periodSpec(periodParam)
      let size = this.#dataSpec(sizeParam)
      let deadline =
        ddlParam > 1 ? (path.length - 1) * (2000 + size * 8) + this.#ddlSpec(ddlParam) : period
      if (deadline <= period) {
        result.push([i, start, [end], size, period, deadline, deadline])
        uti += (size * 8) / period
        utiPorts[start - numSw] += (size * 8) / period
        i += 1
      }
    }
  }

  gridGenerator(ins, maxIns = 100) {
    try {
      fs.accessSync(`grid/${ins}`, fs.constants.F_OK)
    } catch {
      fs.mkdirSync(`grid/${ins}`, { recursive: true })
    }

    let total = Math.min(
      maxIns,
      this.sizeSpec.length *
        this.periodSpec.length *
        this.ddlSpec.length *
        this.numStreamSpec.length *
        4 *
        4
    )
    let count = 0
    let datasetLogs = []
    this.#randomInt = d3.randomInt.source(d3.randomLcg(this.#seed))(0, 1)
    d3.shuffler(d3.randomLcg(this.#seed))(this.sizeSpec)
    d3.shuffler(d3.randomLcg(this.#seed))(this.periodSpec)
    d3.shuffler(d3.randomLcg(this.#seed))(this.ddlSpec)
    d3.shuffler(d3.randomLcg(this.#seed))(this.numStreamSpec)
    let numSwSpec = range(18, 38, 10)
    d3.shuffler(d3.randomLcg(this.#seed))(numSwSpec)
    let topoSpec = [3]
    d3.shuffler(d3.randomLcg(this.#seed))(topoSpec)
    let profiles = []
    for (let size of this.sizeSpec) {
      for (let period of this.periodSpec) {
        for (let ddl of this.ddlSpec) {
          for (let numStream of this.numStreamSpec) {
            for (let numSw of numSwSpec) {
              for (let topo of topoSpec) {
                profiles.push({ size, period, ddl, numStream, numSw, topo })
              }
            }
          }
        }
      }
    }
    d3.shuffler(d3.randomLcg(this.#seed))(profiles)
    for (let { size, period, ddl, numStream, numSw, topo } of profiles) {
      let header = `grid/${ins}/${count}`
      let net = this.#mesh(numSw, 8, 1, header + '_topo')
      this.#generateFlowset(
        this.#convertNetToObject(net),
        size,
        period,
        ddl,
        numStream,
        numSw,
        numSw,
        header + '_task'
      )

      let expInfo = [count, ins, size, period, ddl, topo, numStream, numSw]
      datasetLogs.push(expInfo)
      count += 1
      if (count >= maxIns) {
        break
      }
    }
    let stringifier = csv.stringify({
      header: true,
      columns: ['id', 'ins', 'size', 'period', 'deadline', 'topo', 'num_thres', 'num_sw']
    })
    datasetLogs.forEach((i) => stringifier.write(i))
    let writeStream = fs.createWriteStream(`grid/${ins}/dataset_logs.csv`)
    stringifier.pipe(writeStream)
  }
}

export default DataGenerator
