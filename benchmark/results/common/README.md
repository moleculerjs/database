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
| NeDB (memory) | 137μs | 607.84% | 7,291.41 |
| MongoDB | 970μs | 0% | 1,030.09 |
| Knex SQLite (memory) | 911μs | 6.55% | 1,097.57 |
| Knex-Postgresql | 2ms | -66.71% | 342.93 |
| Knex-MySQL | 3ms | -74.41% | 263.62 |
| Knex-MySQL2 | 5ms | -83.08% | 174.34 |
| Knex-MSSQL | 11ms | -91.78% | 84.64 |

![chart](https://image-charts.com/chart?chs=800x450&chtt=Entity%20creation%7C%28ops%2Fsec%29&chf=b0%2Clg%2C90%2C03a9f4%2C0%2C3f51b5%2C1&chg=0%2C50&chl=%7C%7C%7C%7C%2033%25%20%21%7Cx2%20&chma=0%2C0%2C10%2C10&cht=bvs&chxt=x%2Cy&chxl=0%3A%7CNeDB%20%28memory%29%7CMongoDB%7CKnex%20SQLite%20%28memory%29%7CKnex-Postgresql%7CKnex-MySQL%7CKnex-MySQL2%7CKnex-MSSQL&chd=a%3A7291.410249199037%2C1030.0939290599829%2C1097.5685437464147%2C342.93064623953313%2C263.6188892508786%2C174.34260362693857%2C84.64338431485346)

## Entity finding

### Result


| Adapter config | Time | Diff | ops/sec |
| -------------- | ----:| ----:| -------:|
| NeDB (memory) | 557μs | 159.76% | 1,795.16 |
| MongoDB | 1ms | 0% | 691.09 |
| Knex SQLite (memory) | 728μs | 98.57% | 1,372.29 |
| Knex-Postgresql | 989μs | 46.28% | 1,010.93 |
| Knex-MySQL | 1ms | 1.98% | 704.77 |
| Knex-MySQL2 | 1ms | 14.54% | 791.55 |
| Knex-MSSQL | 2ms | -40.72% | 409.65 |

![chart](https://image-charts.com/chart?chs=800x450&chtt=Entity%20finding%7C%28ops%2Fsec%29&chf=b0%2Clg%2C90%2C03a9f4%2C0%2C3f51b5%2C1&chg=0%2C50&chl=%7C%7C%7C%7C%2033%25%20%21%7Cx2%20&chma=0%2C0%2C10%2C10&cht=bvs&chxt=x%2Cy&chxl=0%3A%7CNeDB%20%28memory%29%7CMongoDB%7CKnex%20SQLite%20%28memory%29%7CKnex-Postgresql%7CKnex-MySQL%7CKnex-MySQL2%7CKnex-MSSQL&chd=a%3A1795.1636080756875%2C691.092031507959%2C1372.2925160722782%2C1010.9258968708236%2C704.7732155128617%2C791.5469441689463%2C409.6485014597167)

## Entity listing

### Result


| Adapter config | Time | Diff | ops/sec |
| -------------- | ----:| ----:| -------:|
| NeDB (memory) | 2ms | 15.02% | 373.66 |
| MongoDB | 3ms | 0% | 324.85 |
| Knex SQLite (memory) | 1ms | 184.66% | 924.74 |
| Knex-Postgresql | 1ms | 66.39% | 540.52 |
| Knex-MySQL | 3ms | -19.74% | 260.74 |
| Knex-MySQL2 | 3ms | -4.74% | 309.46 |
| Knex-MSSQL | 3ms | -20.34% | 258.77 |

![chart](https://image-charts.com/chart?chs=800x450&chtt=Entity%20listing%7C%28ops%2Fsec%29&chf=b0%2Clg%2C90%2C03a9f4%2C0%2C3f51b5%2C1&chg=0%2C50&chl=%7C%7C%7C%7C%2033%25%20%21%7Cx2%20&chma=0%2C0%2C10%2C10&cht=bvs&chxt=x%2Cy&chxl=0%3A%7CNeDB%20%28memory%29%7CMongoDB%7CKnex%20SQLite%20%28memory%29%7CKnex-Postgresql%7CKnex-MySQL%7CKnex-MySQL2%7CKnex-MSSQL&chd=a%3A373.6583057055442%2C324.85367730730036%2C924.7430769525216%2C540.5183728594673%2C260.74055702487567%2C309.4593718855936%2C258.7693692659015)

## Entity counting

### Result


| Adapter config | Time | Diff | ops/sec |
| -------------- | ----:| ----:| -------:|
| NeDB (memory) | 1ms | -25.82% | 527.26 |
| MongoDB | 1ms | 0% | 710.79 |
| Knex SQLite (memory) | 289μs | 386.02% | 3,454.58 |
| Knex-Postgresql | 787μs | 78.66% | 1,269.86 |
| Knex-MySQL | 2ms | -40.53% | 422.69 |
| Knex-MySQL2 | 2ms | -34.31% | 466.9 |
| Knex-MSSQL | 1ms | -10.39% | 636.91 |

![chart](https://image-charts.com/chart?chs=800x450&chtt=Entity%20counting%7C%28ops%2Fsec%29&chf=b0%2Clg%2C90%2C03a9f4%2C0%2C3f51b5%2C1&chg=0%2C50&chl=%7C%7C%7C%7C%2033%25%20%21%7Cx2%20&chma=0%2C0%2C10%2C10&cht=bvs&chxt=x%2Cy&chxl=0%3A%7CNeDB%20%28memory%29%7CMongoDB%7CKnex%20SQLite%20%28memory%29%7CKnex-Postgresql%7CKnex-MySQL%7CKnex-MySQL2%7CKnex-MSSQL&chd=a%3A527.2596198062872%2C710.7870945493382%2C3454.575623528848%2C1269.8643563784003%2C422.68793175122397%2C466.8965944390584%2C636.9145050797608)

## Entity getting

### Result


| Adapter config | Time | Diff | ops/sec |
| -------------- | ----:| ----:| -------:|
| NeDB (memory) | 72μs | 1,060.37% | 13,821.87 |
| MongoDB | 839μs | 0% | 1,191.16 |
| Knex SQLite (memory) | 399μs | 109.89% | 2,500.15 |
| Knex-Postgresql | 815μs | 2.98% | 1,226.64 |
| Knex-MySQL | 868μs | -3.33% | 1,151.44 |
| Knex-MySQL2 | 766μs | 9.51% | 1,304.45 |
| Knex-MSSQL | 1ms | -53.11% | 558.57 |

![chart](https://image-charts.com/chart?chs=800x450&chtt=Entity%20getting%7C%28ops%2Fsec%29&chf=b0%2Clg%2C90%2C03a9f4%2C0%2C3f51b5%2C1&chg=0%2C50&chl=%7C%7C%7C%7C%2033%25%20%21%7Cx2%20&chma=0%2C0%2C10%2C10&cht=bvs&chxt=x%2Cy&chxl=0%3A%7CNeDB%20%28memory%29%7CMongoDB%7CKnex%20SQLite%20%28memory%29%7CKnex-Postgresql%7CKnex-MySQL%7CKnex-MySQL2%7CKnex-MSSQL&chd=a%3A13821.874498462794%2C1191.1558597556389%2C2500.146633600061%2C1226.6391005767207%2C1151.4388541410647%2C1304.4486206698325%2C558.5685386955386)

## Entity resolving

### Result


| Adapter config | Time | Diff | ops/sec |
| -------------- | ----:| ----:| -------:|
| NeDB (memory) | 68μs | 1,066.86% | 14,625.29 |
| MongoDB | 797μs | 0% | 1,253.38 |
| Knex SQLite (memory) | 395μs | 101.87% | 2,530.21 |
| Knex-Postgresql | 791μs | 0.83% | 1,263.79 |
| Knex-MySQL | 840μs | -5.06% | 1,190 |
| Knex-MySQL2 | 763μs | 4.54% | 1,310.27 |
| Knex-MSSQL | 1ms | -52.42% | 596.3 |

![chart](https://image-charts.com/chart?chs=800x450&chtt=Entity%20resolving%7C%28ops%2Fsec%29&chf=b0%2Clg%2C90%2C03a9f4%2C0%2C3f51b5%2C1&chg=0%2C50&chl=%7C%7C%7C%7C%2033%25%20%21%7Cx2%20&chma=0%2C0%2C10%2C10&cht=bvs&chxt=x%2Cy&chxl=0%3A%7CNeDB%20%28memory%29%7CMongoDB%7CKnex%20SQLite%20%28memory%29%7CKnex-Postgresql%7CKnex-MySQL%7CKnex-MySQL2%7CKnex-MSSQL&chd=a%3A14625.287127293204%2C1253.384449793825%2C2530.2114955111724%2C1263.7861664360491%2C1189.9993976203216%2C1310.268876695409%2C596.3037672109854)

## Entity updating

### Result


| Adapter config | Time | Diff | ops/sec |
| -------------- | ----:| ----:| -------:|
| NeDB (memory) | 252μs | 567.25% | 3,965.39 |
| MongoDB | 1ms | 0% | 594.29 |
| Knex SQLite (memory) | 1ms | 43.8% | 854.59 |
| Knex-Postgresql | 3ms | -48.59% | 305.52 |
| Knex-MySQL | 3ms | -54.06% | 273.03 |
| Knex-MySQL2 | 3ms | -53.22% | 277.99 |
| Knex-MSSQL | 6ms | -73.7% | 156.33 |

![chart](https://image-charts.com/chart?chs=800x450&chtt=Entity%20updating%7C%28ops%2Fsec%29&chf=b0%2Clg%2C90%2C03a9f4%2C0%2C3f51b5%2C1&chg=0%2C50&chl=%7C%7C%7C%7C%2033%25%20%21%7Cx2%20&chma=0%2C0%2C10%2C10&cht=bvs&chxt=x%2Cy&chxl=0%3A%7CNeDB%20%28memory%29%7CMongoDB%7CKnex%20SQLite%20%28memory%29%7CKnex-Postgresql%7CKnex-MySQL%7CKnex-MySQL2%7CKnex-MSSQL&chd=a%3A3965.386305519955%2C594.2920768197041%2C854.5890136870901%2C305.5169221090699%2C273.0288641088674%2C277.9917270835145%2C156.32630030244925)

## Entity replacing

### Result


| Adapter config | Time | Diff | ops/sec |
| -------------- | ----:| ----:| -------:|
| NeDB (memory) | 231μs | 700.36% | 4,313.85 |
| MongoDB | 1ms | 0% | 538.99 |
| Knex SQLite (memory) | 1ms | 45.98% | 786.83 |
| Knex-Postgresql | 3ms | -43.34% | 305.37 |
| Knex-MySQL | 4ms | -55.71% | 238.72 |
| Knex-MySQL2 | 5ms | -68.76% | 168.39 |
| Knex-MSSQL | 9ms | -81.43% | 100.06 |

![chart](https://image-charts.com/chart?chs=800x450&chtt=Entity%20replacing%7C%28ops%2Fsec%29&chf=b0%2Clg%2C90%2C03a9f4%2C0%2C3f51b5%2C1&chg=0%2C50&chl=%7C%7C%7C%7C%2033%25%20%21%7Cx2%20&chma=0%2C0%2C10%2C10&cht=bvs&chxt=x%2Cy&chxl=0%3A%7CNeDB%20%28memory%29%7CMongoDB%7CKnex%20SQLite%20%28memory%29%7CKnex-Postgresql%7CKnex-MySQL%7CKnex-MySQL2%7CKnex-MSSQL&chd=a%3A4313.846887768467%2C538.9885417776968%2C786.8265922873824%2C305.36674799506903%2C238.71929349684441%2C168.39210487304968%2C100.06332042939567)

## Entity deleting

### Result


| Adapter config | Time | Diff | ops/sec |
| -------------- | ----:| ----:| -------:|
| NeDB (memory) | 477μs | -47.61% | 2,093.14 |
| MongoDB | 250μs | 0% | 3,995.6 |
| Knex SQLite (memory) | 1ms | -81.62% | 734.26 |
| Knex-Postgresql | 357μs | -30% | 2,796.74 |
| Knex-MySQL | 923μs | -72.9% | 1,082.78 |
| Knex-MySQL2 | 415μs | -39.8% | 2,405.45 |
| Knex-MSSQL | 1ms | -85.27% | 588.6 |

![chart](https://image-charts.com/chart?chs=800x450&chtt=Entity%20deleting%7C%28ops%2Fsec%29&chf=b0%2Clg%2C90%2C03a9f4%2C0%2C3f51b5%2C1&chg=0%2C50&chl=%7C%7C%7C%7C%2033%25%20%21%7Cx2%20&chma=0%2C0%2C10%2C10&cht=bvs&chxt=x%2Cy&chxl=0%3A%7CNeDB%20%28memory%29%7CMongoDB%7CKnex%20SQLite%20%28memory%29%7CKnex-Postgresql%7CKnex-MySQL%7CKnex-MySQL2%7CKnex-MSSQL&chd=a%3A2093.1353676744625%2C3995.603735854542%2C734.2623712923605%2C2796.737437655174%2C1082.7759180780363%2C2405.449272542232%2C588.5965168337846)

--------------------
_Generated at 2021-04-17T20:10:53.398Z_