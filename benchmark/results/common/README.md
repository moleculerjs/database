<!-- THIS PAGE IS GENERATED. DO NOT EDIT MANUALLY! -->

# Moleculer Database benchmark - Common
This is a common benchmark which create, list, get, update, replace and delete entities via service actions.
## Test configurations

| Name | Adapter | Options |
| ---- | ------- | ------- |
| NeDB (memory) | NeDB | - |
| MongoDB | MongoDB | `{"dbName":"bench_test","collection":"users"}` |
| Knex SQLite (memory) | Knex | `{"knex":{"client":"sqlite3","connection":{"filename":":memory:"},"useNullAsDefault":true,"log":{}}}` |
| Knex-Postgresql | Knex | `{"knex":{"client":"pg","connection":{"host":"127.0.0.1","port":5432,"user":"postgres","password":"moleculer","database":"bench_test"}}}` |
| Knex-MySQL | Knex | `{"knex":{"client":"mysql","connection":{"host":"127.0.0.1","user":"root","password":"moleculer","database":"bench_test"},"log":{}}}` |
| Knex-MySQL2 | Knex | `{"knex":{"client":"mysql2","connection":{"host":"127.0.0.1","user":"root","password":"moleculer","database":"bench_test"},"log":{}}}` |
| Knex-MSSQL | Knex | `{"knex":{"client":"mssql","connection":{"host":"127.0.0.1","port":1433,"user":"sa","password":"Moleculer@Pass1234","database":"bench_test","encrypt":false}}}` |
## Entity creation

### Result


| Adapter config | Time | Diff | ops/sec |
| -------------- | ----:| ----:| -------:|
| NeDB (memory) | 73μs | 787.79% | 13,562.02 |
| MongoDB | 654μs | 0% | 1,527.62 |
| Knex SQLite (memory) | 846μs | -22.63% | 1,181.85 |
| Knex-Postgresql | 1ms | -61.1% | 594.26 |
| Knex-MySQL | 3ms | -82.04% | 274.31 |
| Knex-MySQL2 | 3ms | -81.83% | 277.51 |
| Knex-MSSQL | 5ms | -87.93% | 184.39 |

![chart](https://image-charts.com/chart?chs=800x450&chtt=Entity%20creation%7C%28ops%2Fsec%29&chf=b0%2Clg%2C90%2C03a9f4%2C0%2C3f51b5%2C1&chg=0%2C50&chma=0%2C0%2C10%2C10&cht=bvs&chxt=x%2Cy&chxl=0%3A%7CNeDB%20%28memory%29%7CMongoDB%7CKnex%20SQLite%20%28memory%29%7CKnex-Postgresql%7CKnex-MySQL%7CKnex-MySQL2%7CKnex-MSSQL&chd=a%3A13562.02232854627%2C1527.619847955817%2C1181.8543051412978%2C594.2577396377104%2C274.3067955560913%2C277.5075995008642%2C184.39459404615525)

## Entity finding

### Result


| Adapter config | Time | Diff | ops/sec |
| -------------- | ----:| ----:| -------:|
| NeDB (memory) | 270μs | 252.46% | 3,702.33 |
| MongoDB | 951μs | 0% | 1,050.42 |
| Knex SQLite (memory) | 556μs | 71.22% | 1,798.55 |
| Knex-Postgresql | 689μs | 38.12% | 1,450.86 |
| Knex-MySQL | 951μs | 0.09% | 1,051.33 |
| Knex-MySQL2 | 900μs | 5.66% | 1,109.9 |
| Knex-MSSQL | 1ms | -38.15% | 649.72 |

![chart](https://image-charts.com/chart?chs=800x450&chtt=Entity%20finding%7C%28ops%2Fsec%29&chf=b0%2Clg%2C90%2C03a9f4%2C0%2C3f51b5%2C1&chg=0%2C50&chma=0%2C0%2C10%2C10&cht=bvs&chxt=x%2Cy&chxl=0%3A%7CNeDB%20%28memory%29%7CMongoDB%7CKnex%20SQLite%20%28memory%29%7CKnex-Postgresql%7CKnex-MySQL%7CKnex-MySQL2%7CKnex-MSSQL&chd=a%3A3702.3258676155%2C1050.4226096745429%2C1798.551629250647%2C1450.8596208595684%2C1051.3345815963157%2C1109.9014796395559%2C649.7205701831879)

## Entity listing

### Result


| Adapter config | Time | Diff | ops/sec |
| -------------- | ----:| ----:| -------:|
| NeDB (memory) | 1ms | 58.73% | 696.01 |
| MongoDB | 2ms | 0% | 438.48 |
| Knex SQLite (memory) | 1ms | 114.27% | 939.52 |
| Knex-Postgresql | 1ms | 46.67% | 643.11 |
| Knex-MySQL | 2ms | -17.25% | 362.83 |
| Knex-MySQL2 | 2ms | -9.24% | 397.95 |
| Knex-MSSQL | 3ms | -24.64% | 330.45 |

![chart](https://image-charts.com/chart?chs=800x450&chtt=Entity%20listing%7C%28ops%2Fsec%29&chf=b0%2Clg%2C90%2C03a9f4%2C0%2C3f51b5%2C1&chg=0%2C50&chma=0%2C0%2C10%2C10&cht=bvs&chxt=x%2Cy&chxl=0%3A%7CNeDB%20%28memory%29%7CMongoDB%7CKnex%20SQLite%20%28memory%29%7CKnex-Postgresql%7CKnex-MySQL%7CKnex-MySQL2%7CKnex-MSSQL&chd=a%3A696.0051051501179%2C438.4759737348162%2C939.5187486916273%2C643.1110882703776%2C362.831695951596%2C397.95475224832575%2C330.4457861430425)

## Entity counting

### Result


| Adapter config | Time | Diff | ops/sec |
| -------------- | ----:| ----:| -------:|
| NeDB (memory) | 886μs | 10.87% | 1,128.16 |
| MongoDB | 982μs | 0% | 1,017.53 |
| Knex SQLite (memory) | 393μs | 149.76% | 2,541.42 |
| Knex-Postgresql | 579μs | 69.58% | 1,725.49 |
| Knex-MySQL | 1ms | -31.63% | 695.71 |
| Knex-MySQL2 | 1ms | -39.62% | 614.4 |
| Knex-MSSQL | 1ms | -12.23% | 893.05 |

![chart](https://image-charts.com/chart?chs=800x450&chtt=Entity%20counting%7C%28ops%2Fsec%29&chf=b0%2Clg%2C90%2C03a9f4%2C0%2C3f51b5%2C1&chg=0%2C50&chma=0%2C0%2C10%2C10&cht=bvs&chxt=x%2Cy&chxl=0%3A%7CNeDB%20%28memory%29%7CMongoDB%7CKnex%20SQLite%20%28memory%29%7CKnex-Postgresql%7CKnex-MySQL%7CKnex-MySQL2%7CKnex-MSSQL&chd=a%3A1128.158425821132%2C1017.5347436148596%2C2541.422357584998%2C1725.4928782838053%2C695.7061242895851%2C614.3961127226761%2C893.045036183837)

## Entity getting

### Result


| Adapter config | Time | Diff | ops/sec |
| -------------- | ----:| ----:| -------:|
| NeDB (memory) | 35μs | 1,623.66% | 28,452.39 |
| MongoDB | 605μs | 0% | 1,650.7 |
| Knex SQLite (memory) | 404μs | 49.8% | 2,472.7 |
| Knex-Postgresql | 586μs | 3.36% | 1,706.18 |
| Knex-MySQL | 668μs | -9.44% | 1,494.84 |
| Knex-MySQL2 | 587μs | 3.16% | 1,702.8 |
| Knex-MSSQL | 1ms | -50.95% | 809.74 |

![chart](https://image-charts.com/chart?chs=800x450&chtt=Entity%20getting%7C%28ops%2Fsec%29&chf=b0%2Clg%2C90%2C03a9f4%2C0%2C3f51b5%2C1&chg=0%2C50&chma=0%2C0%2C10%2C10&cht=bvs&chxt=x%2Cy&chxl=0%3A%7CNeDB%20%28memory%29%7CMongoDB%7CKnex%20SQLite%20%28memory%29%7CKnex-Postgresql%7CKnex-MySQL%7CKnex-MySQL2%7CKnex-MSSQL&chd=a%3A28452.393268652657%2C1650.6963779053667%2C2472.69655783821%2C1706.1835587951273%2C1494.8416399886032%2C1702.7970344829266%2C809.7382334289052)

## Entity resolving

### Result


| Adapter config | Time | Diff | ops/sec |
| -------------- | ----:| ----:| -------:|
| NeDB (memory) | 37μs | 1,667.54% | 26,319.79 |
| MongoDB | 671μs | 0% | 1,489.06 |
| Knex SQLite (memory) | 452μs | 48.27% | 2,207.81 |
| Knex-Postgresql | 649μs | 3.41% | 1,539.88 |
| Knex-MySQL | 671μs | 0.05% | 1,489.82 |
| Knex-MySQL2 | 577μs | 16.32% | 1,732.01 |
| Knex-MSSQL | 1ms | -41.99% | 863.78 |

![chart](https://image-charts.com/chart?chs=800x450&chtt=Entity%20resolving%7C%28ops%2Fsec%29&chf=b0%2Clg%2C90%2C03a9f4%2C0%2C3f51b5%2C1&chg=0%2C50&chma=0%2C0%2C10%2C10&cht=bvs&chxt=x%2Cy&chxl=0%3A%7CNeDB%20%28memory%29%7CMongoDB%7CKnex%20SQLite%20%28memory%29%7CKnex-Postgresql%7CKnex-MySQL%7CKnex-MySQL2%7CKnex-MSSQL&chd=a%3A26319.788056062396%2C1489.0592735159635%2C2207.807095628025%2C1539.88371939205%2C1489.8181210241896%2C1732.0137762628353%2C863.7778569276622)

## Entity updating

### Result


| Adapter config | Time | Diff | ops/sec |
| -------------- | ----:| ----:| -------:|
| NeDB (memory) | 134μs | 917.55% | 7,452.79 |
| MongoDB | 1ms | 0% | 732.43 |
| Knex SQLite (memory) | 1ms | 4.63% | 766.36 |
| Knex-Postgresql | 2ms | -39.89% | 440.28 |
| Knex-MySQL | 3ms | -61.93% | 278.81 |
| Knex-MySQL2 | 3ms | -59.2% | 298.82 |
| Knex-MSSQL | 5ms | -74.28% | 188.35 |

![chart](https://image-charts.com/chart?chs=800x450&chtt=Entity%20updating%7C%28ops%2Fsec%29&chf=b0%2Clg%2C90%2C03a9f4%2C0%2C3f51b5%2C1&chg=0%2C50&chma=0%2C0%2C10%2C10&cht=bvs&chxt=x%2Cy&chxl=0%3A%7CNeDB%20%28memory%29%7CMongoDB%7CKnex%20SQLite%20%28memory%29%7CKnex-Postgresql%7CKnex-MySQL%7CKnex-MySQL2%7CKnex-MSSQL&chd=a%3A7452.793898032057%2C732.4267178051006%2C766.3614767859076%2C440.2804398078956%2C278.813636267509%2C298.82176212256%2C188.3478714751576)

## Entity replacing

### Result


| Adapter config | Time | Diff | ops/sec |
| -------------- | ----:| ----:| -------:|
| NeDB (memory) | 132μs | 928.62% | 7,567.13 |
| MongoDB | 1ms | 0% | 735.66 |
| Knex SQLite (memory) | 1ms | 11.09% | 817.23 |
| Knex-Postgresql | 2ms | -37.58% | 459.2 |
| Knex-MySQL | 3ms | -60.52% | 290.41 |
| Knex-MySQL2 | 3ms | -55.73% | 325.7 |
| Knex-MSSQL | 6ms | -78.31% | 159.58 |

![chart](https://image-charts.com/chart?chs=800x450&chtt=Entity%20replacing%7C%28ops%2Fsec%29&chf=b0%2Clg%2C90%2C03a9f4%2C0%2C3f51b5%2C1&chg=0%2C50&chma=0%2C0%2C10%2C10&cht=bvs&chxt=x%2Cy&chxl=0%3A%7CNeDB%20%28memory%29%7CMongoDB%7CKnex%20SQLite%20%28memory%29%7CKnex-Postgresql%7CKnex-MySQL%7CKnex-MySQL2%7CKnex-MSSQL&chd=a%3A7567.127071215128%2C735.6587048271474%2C817.2345848434236%2C459.2044837497257%2C290.40694422781013%2C325.70313712947745%2C159.57923587128485)

## Entity deleting

### Result


| Adapter config | Time | Diff | ops/sec |
| -------------- | ----:| ----:| -------:|
| NeDB (memory) | 361μs | -53.08% | 2,765.95 |
| MongoDB | 169μs | 0% | 5,895.05 |
| Knex SQLite (memory) | 1ms | -90.34% | 569.23 |
| Knex-Postgresql | 264μs | -35.97% | 3,774.85 |
| Knex-MySQL | 643μs | -73.65% | 1,553.47 |
| Knex-MySQL2 | 355μs | -52.26% | 2,814.23 |
| Knex-MSSQL | 1ms | -83.32% | 983.39 |

![chart](https://image-charts.com/chart?chs=800x450&chtt=Entity%20deleting%7C%28ops%2Fsec%29&chf=b0%2Clg%2C90%2C03a9f4%2C0%2C3f51b5%2C1&chg=0%2C50&chma=0%2C0%2C10%2C10&cht=bvs&chxt=x%2Cy&chxl=0%3A%7CNeDB%20%28memory%29%7CMongoDB%7CKnex%20SQLite%20%28memory%29%7CKnex-Postgresql%7CKnex-MySQL%7CKnex-MySQL2%7CKnex-MSSQL&chd=a%3A2765.952991369056%2C5895.04550997676%2C569.2280916281668%2C3774.845174978153%2C1553.4732248621617%2C2814.225458291527%2C983.3923054737555)

--------------------
_Generated at 2021-04-23T14:45:32.458Z_