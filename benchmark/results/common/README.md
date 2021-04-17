<!-- THIS PAGE IS GENERATED. DO NOT EDIT MANUALLY! -->

# Moleculer Database benchmark - Common
This is a common benchmark which create, list, get, update, replace and delete entities via service actions.
## Test configurations

| Name | Adapter | Options |
| ---- | ------- | ------- |
| NeDB (memory) | NeDB | - |
| MongoDB | MongoDB | `{"dbName":"bench-test","collection":"users"}` |
| Knex SQLite (memory) | Knex | `{"knex":{"client":"sqlite3","connection":{"filename":":memory:"},"useNullAsDefault":true,"log":{}}}` |
## Entity creation

### Result


| Adapter config | Time | Diff | ops/sec |
| -------------- | ----:| ----:| -------:|
| NeDB (memory) | 64μs | 425.91% | 15,520.55 |
| MongoDB | 338μs | 0% | 2,951.17 |
| Knex SQLite (memory) | 317μs | 6.7% | 3,148.86 |

![chart](https://image-charts.com/chart?chs=800x450&chtt=Entity%20creation%7C%28ops%2Fsec%29&chf=b0%2Clg%2C90%2C03a9f4%2C0%2C3f51b5%2C1&chg=0%2C50&chl=%7C%7C%7C%7C%2033%25%20%21%7Cx2%20&chma=0%2C0%2C10%2C10&cht=bvs&chxt=x%2Cy&chxl=0%3A%7CNeDB%20%28memory%29%7CMongoDB%7CKnex%20SQLite%20%28memory%29&chd=a%3A15520.550306087249%2C2951.1729033377355%2C3148.8573298599076)

## Entity finding

### Result


| Adapter config | Time | Diff | ops/sec |
| -------------- | ----:| ----:| -------:|
| NeDB (memory) | 230μs | 159.83% | 4,332.09 |
| MongoDB | 599μs | 0% | 1,667.25 |
| Knex SQLite (memory) | 172μs | 248.5% | 5,810.35 |

![chart](https://image-charts.com/chart?chs=800x450&chtt=Entity%20finding%7C%28ops%2Fsec%29&chf=b0%2Clg%2C90%2C03a9f4%2C0%2C3f51b5%2C1&chg=0%2C50&chl=%7C%7C%7C%7C%2033%25%20%21%7Cx2%20&chma=0%2C0%2C10%2C10&cht=bvs&chxt=x%2Cy&chxl=0%3A%7CNeDB%20%28memory%29%7CMongoDB%7CKnex%20SQLite%20%28memory%29&chd=a%3A4332.086400483569%2C1667.251594409789%2C5810.354334194111)

## Entity listing

### Result


| Adapter config | Time | Diff | ops/sec |
| -------------- | ----:| ----:| -------:|
| NeDB (memory) | 1ms | 11.69% | 882.11 |
| MongoDB | 1ms | 0% | 789.75 |
| Knex SQLite (memory) | 578μs | 118.75% | 1,727.55 |

![chart](https://image-charts.com/chart?chs=800x450&chtt=Entity%20listing%7C%28ops%2Fsec%29&chf=b0%2Clg%2C90%2C03a9f4%2C0%2C3f51b5%2C1&chg=0%2C50&chl=%7C%7C%7C%7C%2033%25%20%21%7Cx2%20&chma=0%2C0%2C10%2C10&cht=bvs&chxt=x%2Cy&chxl=0%3A%7CNeDB%20%28memory%29%7CMongoDB%7CKnex%20SQLite%20%28memory%29&chd=a%3A882.1061121640429%2C789.7534231862128%2C1727.554981836679)

## Entity counting

### Result


| Adapter config | Time | Diff | ops/sec |
| -------------- | ----:| ----:| -------:|
| NeDB (memory) | 1ms | -35.65% | 744.91 |
| MongoDB | 863μs | 0% | 1,157.55 |
| Knex SQLite (memory) | 145μs | 493.39% | 6,868.76 |

![chart](https://image-charts.com/chart?chs=800x450&chtt=Entity%20counting%7C%28ops%2Fsec%29&chf=b0%2Clg%2C90%2C03a9f4%2C0%2C3f51b5%2C1&chg=0%2C50&chl=%7C%7C%7C%7C%2033%25%20%21%7Cx2%20&chma=0%2C0%2C10%2C10&cht=bvs&chxt=x%2Cy&chxl=0%3A%7CNeDB%20%28memory%29%7CMongoDB%7CKnex%20SQLite%20%28memory%29&chd=a%3A744.9083928418921%2C1157.5458931255625%2C6868.75566194105)

## Entity getting

### Result


| Adapter config | Time | Diff | ops/sec |
| -------------- | ----:| ----:| -------:|
| NeDB (memory) | 42μs | 548.17% | 23,614.31 |
| MongoDB | 274μs | 0% | 3,643.24 |
| Knex SQLite (memory) | 147μs | 86.5% | 6,794.62 |

![chart](https://image-charts.com/chart?chs=800x450&chtt=Entity%20getting%7C%28ops%2Fsec%29&chf=b0%2Clg%2C90%2C03a9f4%2C0%2C3f51b5%2C1&chg=0%2C50&chl=%7C%7C%7C%7C%2033%25%20%21%7Cx2%20&chma=0%2C0%2C10%2C10&cht=bvs&chxt=x%2Cy&chxl=0%3A%7CNeDB%20%28memory%29%7CMongoDB%7CKnex%20SQLite%20%28memory%29&chd=a%3A23614.314041407346%2C3643.2353709526915%2C6794.6160807510105)

## Entity resolving

### Result


| Adapter config | Time | Diff | ops/sec |
| -------------- | ----:| ----:| -------:|
| NeDB (memory) | 29μs | 859.91% | 34,345.73 |
| MongoDB | 279μs | 0% | 3,578.02 |
| Knex SQLite (memory) | 147μs | 89.24% | 6,771 |

![chart](https://image-charts.com/chart?chs=800x450&chtt=Entity%20resolving%7C%28ops%2Fsec%29&chf=b0%2Clg%2C90%2C03a9f4%2C0%2C3f51b5%2C1&chg=0%2C50&chl=%7C%7C%7C%7C%2033%25%20%21%7Cx2%20&chma=0%2C0%2C10%2C10&cht=bvs&chxt=x%2Cy&chxl=0%3A%7CNeDB%20%28memory%29%7CMongoDB%7CKnex%20SQLite%20%28memory%29&chd=a%3A34345.730311534746%2C3578.02093301269%2C6770.997110974851)

## Entity updating

### Result


| Adapter config | Time | Diff | ops/sec |
| -------------- | ----:| ----:| -------:|
| NeDB (memory) | 109μs | 406.39% | 9,112.3 |
| MongoDB | 555μs | 0% | 1,799.46 |
| Knex SQLite (memory) | 442μs | 25.72% | 2,262.27 |

![chart](https://image-charts.com/chart?chs=800x450&chtt=Entity%20updating%7C%28ops%2Fsec%29&chf=b0%2Clg%2C90%2C03a9f4%2C0%2C3f51b5%2C1&chg=0%2C50&chl=%7C%7C%7C%7C%2033%25%20%21%7Cx2%20&chma=0%2C0%2C10%2C10&cht=bvs&chxt=x%2Cy&chxl=0%3A%7CNeDB%20%28memory%29%7CMongoDB%7CKnex%20SQLite%20%28memory%29&chd=a%3A9112.300486428467%2C1799.461996852181%2C2262.2660920100316)

## Entity replacing

### Result


| Adapter config | Time | Diff | ops/sec |
| -------------- | ----:| ----:| -------:|
| NeDB (memory) | 105μs | 441.04% | 9,480.95 |
| MongoDB | 570μs | 0% | 1,752.37 |
| Knex SQLite (memory) | 461μs | 23.77% | 2,168.99 |

![chart](https://image-charts.com/chart?chs=800x450&chtt=Entity%20replacing%7C%28ops%2Fsec%29&chf=b0%2Clg%2C90%2C03a9f4%2C0%2C3f51b5%2C1&chg=0%2C50&chl=%7C%7C%7C%7C%2033%25%20%21%7Cx2%20&chma=0%2C0%2C10%2C10&cht=bvs&chxt=x%2Cy&chxl=0%3A%7CNeDB%20%28memory%29%7CMongoDB%7CKnex%20SQLite%20%28memory%29&chd=a%3A9480.946242971793%2C1752.367667765109%2C2168.991276066865)

## Entity deleting

### Result


| Adapter config | Time | Diff | ops/sec |
| -------------- | ----:| ----:| -------:|
| NeDB (memory) | 171μs | -0.3% | 5,847.85 |
| MongoDB | 170μs | 0% | 5,865.48 |
| Knex SQLite (memory) | 1ms | -87.44% | 736.72 |

![chart](https://image-charts.com/chart?chs=800x450&chtt=Entity%20deleting%7C%28ops%2Fsec%29&chf=b0%2Clg%2C90%2C03a9f4%2C0%2C3f51b5%2C1&chg=0%2C50&chl=%7C%7C%7C%7C%2033%25%20%21%7Cx2%20&chma=0%2C0%2C10%2C10&cht=bvs&chxt=x%2Cy&chxl=0%3A%7CNeDB%20%28memory%29%7CMongoDB%7CKnex%20SQLite%20%28memory%29&chd=a%3A5847.848453652166%2C5865.476575255393%2C736.7163512064737)

--------------------
_Generated at 2021-04-17T13:37:46.513Z_