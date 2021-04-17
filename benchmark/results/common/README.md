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
## Entity creation

### Result


| Adapter config | Time | Diff | ops/sec |
| -------------- | ----:| ----:| -------:|
| NeDB (memory) | 133μs | 616% | 7,509.97 |
| MongoDB | 953μs | 0% | 1,048.88 |
| Knex SQLite (memory) | 835μs | 14.04% | 1,196.19 |
| Knex-Postgresql | 2ms | -59.06% | 429.44 |

![chart](https://image-charts.com/chart?chs=800x450&chtt=Entity%20creation%7C%28ops%2Fsec%29&chf=b0%2Clg%2C90%2C03a9f4%2C0%2C3f51b5%2C1&chg=0%2C50&chl=%7C%7C%7C%7C%2033%25%20%21%7Cx2%20&chma=0%2C0%2C10%2C10&cht=bvs&chxt=x%2Cy&chxl=0%3A%7CNeDB%20%28memory%29%7CMongoDB%7CKnex%20SQLite%20%28memory%29%7CKnex-Postgresql&chd=a%3A7509.968502939131%2C1048.8813362999538%2C1196.193338627212%2C429.4365509567277)

## Entity finding

### Result


| Adapter config | Time | Diff | ops/sec |
| -------------- | ----:| ----:| -------:|
| NeDB (memory) | 550μs | 161.13% | 1,815.33 |
| MongoDB | 1ms | 0% | 695.18 |
| Knex SQLite (memory) | 761μs | 88.89% | 1,313.09 |
| Knex-Postgresql | 1ms | 42.45% | 990.25 |

![chart](https://image-charts.com/chart?chs=800x450&chtt=Entity%20finding%7C%28ops%2Fsec%29&chf=b0%2Clg%2C90%2C03a9f4%2C0%2C3f51b5%2C1&chg=0%2C50&chl=%7C%7C%7C%7C%2033%25%20%21%7Cx2%20&chma=0%2C0%2C10%2C10&cht=bvs&chxt=x%2Cy&chxl=0%3A%7CNeDB%20%28memory%29%7CMongoDB%7CKnex%20SQLite%20%28memory%29%7CKnex-Postgresql&chd=a%3A1815.3338412567227%2C695.176792798978%2C1313.0939965347168%2C990.2536308481683)

## Entity listing

### Result


| Adapter config | Time | Diff | ops/sec |
| -------------- | ----:| ----:| -------:|
| NeDB (memory) | 2ms | 27.39% | 440.88 |
| MongoDB | 2ms | 0% | 346.09 |
| Knex SQLite (memory) | 1ms | 172.68% | 943.73 |
| Knex-Postgresql | 1ms | 64.58% | 569.59 |

![chart](https://image-charts.com/chart?chs=800x450&chtt=Entity%20listing%7C%28ops%2Fsec%29&chf=b0%2Clg%2C90%2C03a9f4%2C0%2C3f51b5%2C1&chg=0%2C50&chl=%7C%7C%7C%7C%2033%25%20%21%7Cx2%20&chma=0%2C0%2C10%2C10&cht=bvs&chxt=x%2Cy&chxl=0%3A%7CNeDB%20%28memory%29%7CMongoDB%7CKnex%20SQLite%20%28memory%29%7CKnex-Postgresql&chd=a%3A440.8824042290265%2C346.0938734566868%2C943.7286496681418%2C569.5909821723836)

## Entity counting

### Result


| Adapter config | Time | Diff | ops/sec |
| -------------- | ----:| ----:| -------:|
| NeDB (memory) | 1ms | -19.12% | 568.27 |
| MongoDB | 1ms | 0% | 702.57 |
| Knex SQLite (memory) | 303μs | 368.37% | 3,290.68 |
| Knex-Postgresql | 759μs | 87.38% | 1,316.49 |

![chart](https://image-charts.com/chart?chs=800x450&chtt=Entity%20counting%7C%28ops%2Fsec%29&chf=b0%2Clg%2C90%2C03a9f4%2C0%2C3f51b5%2C1&chg=0%2C50&chl=%7C%7C%7C%7C%2033%25%20%21%7Cx2%20&chma=0%2C0%2C10%2C10&cht=bvs&chxt=x%2Cy&chxl=0%3A%7CNeDB%20%28memory%29%7CMongoDB%7CKnex%20SQLite%20%28memory%29%7CKnex-Postgresql&chd=a%3A568.2729648602835%2C702.5746965267197%2C3290.6820611225803%2C1316.4920639696516)

## Entity getting

### Result


| Adapter config | Time | Diff | ops/sec |
| -------------- | ----:| ----:| -------:|
| NeDB (memory) | 68μs | 1,046.68% | 14,669.26 |
| MongoDB | 781μs | 0% | 1,279.29 |
| Knex SQLite (memory) | 409μs | 90.68% | 2,439.35 |
| Knex-Postgresql | 784μs | -0.36% | 1,274.72 |

![chart](https://image-charts.com/chart?chs=800x450&chtt=Entity%20getting%7C%28ops%2Fsec%29&chf=b0%2Clg%2C90%2C03a9f4%2C0%2C3f51b5%2C1&chg=0%2C50&chl=%7C%7C%7C%7C%2033%25%20%21%7Cx2%20&chma=0%2C0%2C10%2C10&cht=bvs&chxt=x%2Cy&chxl=0%3A%7CNeDB%20%28memory%29%7CMongoDB%7CKnex%20SQLite%20%28memory%29%7CKnex-Postgresql&chd=a%3A14669.259267409656%2C1279.286247049302%2C2439.3484180933215%2C1274.72016142048)

## Entity resolving

### Result


| Adapter config | Time | Diff | ops/sec |
| -------------- | ----:| ----:| -------:|
| NeDB (memory) | 67μs | 1,072.1% | 14,786.3 |
| MongoDB | 792μs | 0% | 1,261.52 |
| Knex SQLite (memory) | 349μs | 127.1% | 2,864.95 |
| Knex-Postgresql | 755μs | 4.86% | 1,322.79 |

![chart](https://image-charts.com/chart?chs=800x450&chtt=Entity%20resolving%7C%28ops%2Fsec%29&chf=b0%2Clg%2C90%2C03a9f4%2C0%2C3f51b5%2C1&chg=0%2C50&chl=%7C%7C%7C%7C%2033%25%20%21%7Cx2%20&chma=0%2C0%2C10%2C10&cht=bvs&chxt=x%2Cy&chxl=0%3A%7CNeDB%20%28memory%29%7CMongoDB%7CKnex%20SQLite%20%28memory%29%7CKnex-Postgresql&chd=a%3A14786.301219406241%2C1261.5241435721416%2C2864.946312232579%2C1322.7911259662353)

## Entity updating

### Result


| Adapter config | Time | Diff | ops/sec |
| -------------- | ----:| ----:| -------:|
| NeDB (memory) | 218μs | 643% | 4,577.23 |
| MongoDB | 1ms | 0% | 616.05 |
| Knex SQLite (memory) | 1ms | 47.83% | 910.7 |
| Knex-Postgresql | 2ms | -43.92% | 345.47 |

![chart](https://image-charts.com/chart?chs=800x450&chtt=Entity%20updating%7C%28ops%2Fsec%29&chf=b0%2Clg%2C90%2C03a9f4%2C0%2C3f51b5%2C1&chg=0%2C50&chl=%7C%7C%7C%7C%2033%25%20%21%7Cx2%20&chma=0%2C0%2C10%2C10&cht=bvs&chxt=x%2Cy&chxl=0%3A%7CNeDB%20%28memory%29%7CMongoDB%7CKnex%20SQLite%20%28memory%29%7CKnex-Postgresql&chd=a%3A4577.230110178461%2C616.0483041257492%2C910.7005648881625%2C345.4652494785996)

## Entity replacing

### Result


| Adapter config | Time | Diff | ops/sec |
| -------------- | ----:| ----:| -------:|
| NeDB (memory) | 211μs | 725.13% | 4,729.44 |
| MongoDB | 1ms | 0% | 573.18 |
| Knex SQLite (memory) | 1ms | 46.21% | 838.05 |
| Knex-Postgresql | 3ms | -45.76% | 310.87 |

![chart](https://image-charts.com/chart?chs=800x450&chtt=Entity%20replacing%7C%28ops%2Fsec%29&chf=b0%2Clg%2C90%2C03a9f4%2C0%2C3f51b5%2C1&chg=0%2C50&chl=%7C%7C%7C%7C%2033%25%20%21%7Cx2%20&chma=0%2C0%2C10%2C10&cht=bvs&chxt=x%2Cy&chxl=0%3A%7CNeDB%20%28memory%29%7CMongoDB%7CKnex%20SQLite%20%28memory%29%7CKnex-Postgresql&chd=a%3A4729.43668174304%2C573.1761262639386%2C838.0454056487049%2C310.8743228991901)

--------------------
_Generated at 2021-04-17T17:14:37.684Z_