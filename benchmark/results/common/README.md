<!-- THIS PAGE IS GENERATED. DO NOT EDIT MANUALLY! -->

# Moleculer Database benchmark - Common
This is a common benchmark which create, list, get, update, replace and delete entities via service actions.
## Test configurations

| Name | Adapter | Options |
| ---- | ------- | ------- |
| NeDB (memory) | NeDB | - |
| NeDB (file) | NeDB | `"D:\\Work\\moleculer\\database\\benchmark\\suites\\tmp\\common.db"` |
| MongoDB | MongoDB | `{"dbName":"bench_test","collection":"users"}` |
| Knex SQLite (memory) | Knex | `{"knex":{"client":"sqlite3","connection":{"filename":":memory:"},"useNullAsDefault":true,"log":{}}}` |
| Knex SQLite (file) | Knex | `{"knex":{"client":"sqlite3","connection":{"filename":"D:\\Work\\moleculer\\database\\benchmark\\suites\\tmp\\common.sqlite3"},"useNullAsDefault":true,"pool":{"min":1,"max":1},"log":{}}}` |
## Entity creation

### Result


| Adapter config | Time | Diff | ops/sec |
| -------------- | ----:| ----:| -------:|
| NeDB (memory) | 57μs | 385.11% | 17,281.37 |
| NeDB (file) | 458μs | -38.74% | 2,182.17 |
| MongoDB | 280μs | 0% | 3,562.39 |
| Knex SQLite (memory) | 313μs | -10.39% | 3,192.43 |
| Knex SQLite (file) | 157ms | -99.82% | 6.36 |

![chart](https://image-charts.com/chart?chs=800x450&chtt=Entity%20creation%7C%28ops%2Fsec%29&chf=b0%2Clg%2C90%2C03a9f4%2C0%2C3f51b5%2C1&chg=0%2C50&chma=0%2C0%2C10%2C10&cht=bvs&chxt=x%2Cy&chxl=0%3A%7CNeDB%20%28memory%29%7CNeDB%20%28file%29%7CMongoDB%7CKnex%20SQLite%20%28memory%29%7CKnex%20SQLite%20%28file%29&chd=a%3A17281.371335214568%2C2182.1744713955113%2C3562.3868942161084%2C3192.4313836755823%2C6.357279428079308)

## Entity finding

### Result


| Adapter config | Time | Diff | ops/sec |
| -------------- | ----:| ----:| -------:|
| NeDB (memory) | 253μs | 101.58% | 3,950 |
| NeDB (file) | 259μs | 96.47% | 3,850.05 |
| MongoDB | 510μs | 0% | 1,959.56 |
| Knex SQLite (memory) | 311μs | 63.73% | 3,208.48 |
| Knex SQLite (file) | 347μs | 46.66% | 2,873.97 |

![chart](https://image-charts.com/chart?chs=800x450&chtt=Entity%20finding%7C%28ops%2Fsec%29&chf=b0%2Clg%2C90%2C03a9f4%2C0%2C3f51b5%2C1&chg=0%2C50&chma=0%2C0%2C10%2C10&cht=bvs&chxt=x%2Cy&chxl=0%3A%7CNeDB%20%28memory%29%7CNeDB%20%28file%29%7CMongoDB%7CKnex%20SQLite%20%28memory%29%7CKnex%20SQLite%20%28file%29&chd=a%3A3950.002214963742%2C3850.0457241055306%2C1959.5644656342167%2C3208.4794449708024%2C2873.9705293865213)

## Entity listing

### Result


| Adapter config | Time | Diff | ops/sec |
| -------------- | ----:| ----:| -------:|
| NeDB (memory) | 1ms | 5.2% | 922.76 |
| NeDB (file) | 1ms | -1.46% | 864.4 |
| MongoDB | 1ms | 0% | 877.19 |
| Knex SQLite (memory) | 446μs | 155.22% | 2,238.81 |
| Knex SQLite (file) | 523μs | 117.96% | 1,911.88 |

![chart](https://image-charts.com/chart?chs=800x450&chtt=Entity%20listing%7C%28ops%2Fsec%29&chf=b0%2Clg%2C90%2C03a9f4%2C0%2C3f51b5%2C1&chg=0%2C50&chma=0%2C0%2C10%2C10&cht=bvs&chxt=x%2Cy&chxl=0%3A%7CNeDB%20%28memory%29%7CNeDB%20%28file%29%7CMongoDB%7CKnex%20SQLite%20%28memory%29%7CKnex%20SQLite%20%28file%29&chd=a%3A922.7611967843618%2C864.3969504421348%2C877.1890889677279%2C2238.8053018491637%2C1911.8793399183046)

## Entity counting

### Result


| Adapter config | Time | Diff | ops/sec |
| -------------- | ----:| ----:| -------:|
| NeDB (memory) | 883μs | -32.36% | 1,131.96 |
| NeDB (file) | 880μs | -32.16% | 1,135.21 |
| MongoDB | 597μs | 0% | 1,673.39 |
| Knex SQLite (memory) | 128μs | 365.16% | 7,783.88 |
| Knex SQLite (file) | 169μs | 252.17% | 5,893.16 |

![chart](https://image-charts.com/chart?chs=800x450&chtt=Entity%20counting%7C%28ops%2Fsec%29&chf=b0%2Clg%2C90%2C03a9f4%2C0%2C3f51b5%2C1&chg=0%2C50&chma=0%2C0%2C10%2C10&cht=bvs&chxt=x%2Cy&chxl=0%3A%7CNeDB%20%28memory%29%7CNeDB%20%28file%29%7CMongoDB%7CKnex%20SQLite%20%28memory%29%7CKnex%20SQLite%20%28file%29&chd=a%3A1131.9622541149233%2C1135.2130506362728%2C1673.3923403700844%2C7783.883158564865%2C5893.164471384325)

## Entity getting

### Result


| Adapter config | Time | Diff | ops/sec |
| -------------- | ----:| ----:| -------:|
| NeDB (memory) | 31μs | 689.36% | 31,975.13 |
| NeDB (file) | 31μs | 695.59% | 32,227.46 |
| MongoDB | 246μs | 0% | 4,050.75 |
| Knex SQLite (memory) | 149μs | 64.62% | 6,668.48 |
| Knex SQLite (file) | 192μs | 27.91% | 5,181.43 |

![chart](https://image-charts.com/chart?chs=800x450&chtt=Entity%20getting%7C%28ops%2Fsec%29&chf=b0%2Clg%2C90%2C03a9f4%2C0%2C3f51b5%2C1&chg=0%2C50&chma=0%2C0%2C10%2C10&cht=bvs&chxt=x%2Cy&chxl=0%3A%7CNeDB%20%28memory%29%7CNeDB%20%28file%29%7CMongoDB%7CKnex%20SQLite%20%28memory%29%7CKnex%20SQLite%20%28file%29&chd=a%3A31975.129105079486%2C32227.45549239195%2C4050.749252622296%2C6668.476308080468%2C5181.434608910198)

## Entity resolving

### Result


| Adapter config | Time | Diff | ops/sec |
| -------------- | ----:| ----:| -------:|
| NeDB (memory) | 30μs | 715.37% | 32,326.78 |
| NeDB (file) | 30μs | 724.54% | 32,690.32 |
| MongoDB | 252μs | 0% | 3,964.67 |
| Knex SQLite (memory) | 149μs | 69.19% | 6,707.99 |
| Knex SQLite (file) | 187μs | 34.63% | 5,337.59 |

![chart](https://image-charts.com/chart?chs=800x450&chtt=Entity%20resolving%7C%28ops%2Fsec%29&chf=b0%2Clg%2C90%2C03a9f4%2C0%2C3f51b5%2C1&chg=0%2C50&chma=0%2C0%2C10%2C10&cht=bvs&chxt=x%2Cy&chxl=0%3A%7CNeDB%20%28memory%29%7CNeDB%20%28file%29%7CMongoDB%7CKnex%20SQLite%20%28memory%29%7CKnex%20SQLite%20%28file%29&chd=a%3A32326.782423952343%2C32690.31549204217%2C3964.667910396206%2C6707.987474924704%2C5337.590648351404)

## Entity updating

### Result


| Adapter config | Time | Diff | ops/sec |
| -------------- | ----:| ----:| -------:|
| NeDB (memory) | 107μs | 432.07% | 9,324.45 |
| NeDB (file) | 477μs | 19.39% | 2,092.23 |
| MongoDB | 570μs | 0% | 1,752.48 |
| Knex SQLite (memory) | 442μs | 29.09% | 2,262.36 |
| Knex SQLite (file) | 71ms | -99.2% | 13.95 |

![chart](https://image-charts.com/chart?chs=800x450&chtt=Entity%20updating%7C%28ops%2Fsec%29&chf=b0%2Clg%2C90%2C03a9f4%2C0%2C3f51b5%2C1&chg=0%2C50&chma=0%2C0%2C10%2C10&cht=bvs&chxt=x%2Cy&chxl=0%3A%7CNeDB%20%28memory%29%7CNeDB%20%28file%29%7CMongoDB%7CKnex%20SQLite%20%28memory%29%7CKnex%20SQLite%20%28file%29&chd=a%3A9324.452724558463%2C2092.230026388156%2C1752.478837503678%2C2262.3583872054282%2C13.947722454990572)

## Entity replacing

### Result


| Adapter config | Time | Diff | ops/sec |
| -------------- | ----:| ----:| -------:|
| NeDB (memory) | 104μs | 461.72% | 9,584.25 |
| NeDB (file) | 469μs | 24.78% | 2,129.09 |
| MongoDB | 586μs | 0% | 1,706.24 |
| Knex SQLite (memory) | 458μs | 27.84% | 2,181.18 |
| Knex SQLite (file) | 76ms | -99.23% | 13.11 |

![chart](https://image-charts.com/chart?chs=800x450&chtt=Entity%20replacing%7C%28ops%2Fsec%29&chf=b0%2Clg%2C90%2C03a9f4%2C0%2C3f51b5%2C1&chg=0%2C50&chma=0%2C0%2C10%2C10&cht=bvs&chxt=x%2Cy&chxl=0%3A%7CNeDB%20%28memory%29%7CNeDB%20%28file%29%7CMongoDB%7CKnex%20SQLite%20%28memory%29%7CKnex%20SQLite%20%28file%29&chd=a%3A9584.250584384705%2C2129.0945512502576%2C1706.2384761364253%2C2181.180685795727%2C13.112114479249096)

## Entity deleting

### Result


| Adapter config | Time | Diff | ops/sec |
| -------------- | ----:| ----:| -------:|
| NeDB (memory) | 142μs | -2.06% | 7,031.71 |
| NeDB (file) | 261μs | -46.69% | 3,827.01 |
| MongoDB | 139μs | 0% | 7,179.36 |
| Knex SQLite (memory) | 1ms | -87.79% | 876.55 |
| Knex SQLite (file) | 73ms | -99.81% | 13.62 |

![chart](https://image-charts.com/chart?chs=800x450&chtt=Entity%20deleting%7C%28ops%2Fsec%29&chf=b0%2Clg%2C90%2C03a9f4%2C0%2C3f51b5%2C1&chg=0%2C50&chma=0%2C0%2C10%2C10&cht=bvs&chxt=x%2Cy&chxl=0%3A%7CNeDB%20%28memory%29%7CNeDB%20%28file%29%7CMongoDB%7CKnex%20SQLite%20%28memory%29%7CKnex%20SQLite%20%28file%29&chd=a%3A7031.712702117739%2C3827.0079135949436%2C7179.360199809275%2C876.5497548603104%2C13.623537371662577)

--------------------
_Generated at 2021-05-10T12:43:18.213Z_