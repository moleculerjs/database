<!-- THIS PAGE IS GENERATED. DO NOT EDIT MANUALLY! -->

# Moleculer Database benchmark - Common
This is a common benchmark which create, list, get, update, replace and delete entities via service actions.
## Test configurations

| Name | Adapter | Options |
| ---- | ------- | ------- |
| NeDB (memory) | NeDB | - |
| NeDB (file) | NeDB | `"/home/runner/work/database/database/benchmark/suites/tmp/common.db"` |
| MongoDB | MongoDB | `{"dbName":"bench_test","collection":"users"}` |
| Knex SQLite (memory) | Knex | `{"knex":{"client":"sqlite3","connection":{"filename":":memory:"},"useNullAsDefault":true,"log":{}}}` |
| Knex SQLite (file) | Knex | `{"knex":{"client":"sqlite3","connection":{"filename":"/home/runner/work/database/database/benchmark/suites/tmp/common.sqlite3"},"useNullAsDefault":true,"pool":{"min":1,"max":1},"log":{}}}` |
| Knex-Postgresql | Knex | `{"knex":{"client":"pg","connection":{"host":"127.0.0.1","port":5432,"user":"postgres","password":"moleculer","database":"bench_test"}}}` |
| Knex-MySQL | Knex | `{"knex":{"client":"mysql","connection":{"host":"127.0.0.1","user":"root","password":"moleculer","database":"bench_test"},"log":{}}}` |
| Knex-MySQL2 | Knex | `{"knex":{"client":"mysql2","connection":{"host":"127.0.0.1","user":"root","password":"moleculer","database":"bench_test"},"log":{}}}` |
| Knex-MSSQL | Knex | `{"knex":{"client":"mssql","connection":{"host":"127.0.0.1","port":1433,"user":"sa","password":"Moleculer@Pass1234","database":"bench_test","encrypt":false}}}` |
## Entity creation

### Result


| Adapter config | Time | Diff | ops/sec |
| -------------- | ----:| ----:| -------:|
| NeDB (memory) | 65μs | 647.25% | 15,235.96 |
| NeDB (file) | 202μs | 141.94% | 4,932.94 |
| MongoDB | 490μs | 0% | 2,038.93 |
| Knex SQLite (memory) | 374μs | 31.03% | 2,671.71 |
| Knex SQLite (file) | 1ms | -70.94% | 592.5 |
| Knex-Postgresql | 1ms | -65.02% | 713.31 |
| Knex-MySQL | 1ms | -75.31% | 503.35 |
| Knex-MySQL2 | 1ms | -72.65% | 557.69 |
| Knex-MSSQL | 3ms | -86.53% | 274.7 |

![chart](https://image-charts.com/chart?chs=999x500&chtt=Entity%20creation%7C%28ops%2Fsec%29&chf=b0%2Clg%2C90%2C03a9f4%2C0%2C3f51b5%2C1&chg=0%2C50&chma=0%2C0%2C10%2C10&cht=bvs&chxt=x%2Cy&chxs=0%2C333%2C10%7C1%2C333%2C10&chxl=0%3A%7CNeDB%20%28memory%29%7CNeDB%20%28file%29%7CMongoDB%7CKnex%20SQLite%20%28memory%29%7CKnex%20SQLite%20%28file%29%7CKnex-Postgresql%7CKnex-MySQL%7CKnex-MySQL2%7CKnex-MSSQL&chd=a%3A15235.964640799868%2C4932.936510109271%2C2038.9295000364384%2C2671.711059688502%2C592.503531206989%2C713.3052728763712%2C503.3538442312358%2C557.691187483759%2C274.6987939879344)

## Entity finding

### Result


| Adapter config | Time | Diff | ops/sec |
| -------------- | ----:| ----:| -------:|
| NeDB (memory) | 312μs | 171.19% | 3,199.58 |
| NeDB (file) | 294μs | 187.6% | 3,393.1 |
| MongoDB | 847μs | 0% | 1,179.82 |
| Knex SQLite (memory) | 395μs | 114.06% | 2,525.54 |
| Knex SQLite (file) | 401μs | 111.01% | 2,489.5 |
| Knex-Postgresql | 615μs | 37.75% | 1,625.16 |
| Knex-MySQL | 855μs | -0.89% | 1,169.37 |
| Knex-MySQL2 | 740μs | 14.51% | 1,350.98 |
| Knex-MSSQL | 1ms | -33.37% | 786.12 |

![chart](https://image-charts.com/chart?chs=999x500&chtt=Entity%20finding%7C%28ops%2Fsec%29&chf=b0%2Clg%2C90%2C03a9f4%2C0%2C3f51b5%2C1&chg=0%2C50&chma=0%2C0%2C10%2C10&cht=bvs&chxt=x%2Cy&chxs=0%2C333%2C10%7C1%2C333%2C10&chxl=0%3A%7CNeDB%20%28memory%29%7CNeDB%20%28file%29%7CMongoDB%7CKnex%20SQLite%20%28memory%29%7CKnex%20SQLite%20%28file%29%7CKnex-Postgresql%7CKnex-MySQL%7CKnex-MySQL2%7CKnex-MSSQL&chd=a%3A3199.5769090667527%2C3393.102599435842%2C1179.8154513282732%2C2525.539662137815%2C2489.4995827972125%2C1625.1633579898448%2C1169.372243290934%2C1350.9751144318043%2C786.1233265133388)

## Entity listing

### Result


| Adapter config | Time | Diff | ops/sec |
| -------------- | ----:| ----:| -------:|
| NeDB (memory) | 1ms | 13.54% | 652.74 |
| NeDB (file) | 1ms | 17.1% | 673.18 |
| MongoDB | 1ms | 0% | 574.88 |
| Knex SQLite (memory) | 543μs | 220.28% | 1,841.26 |
| Knex SQLite (file) | 559μs | 211.12% | 1,788.58 |
| Knex-Postgresql | 1ms | 68.41% | 968.14 |
| Knex-MySQL | 2ms | -17.94% | 471.74 |
| Knex-MySQL2 | 2ms | -13.75% | 495.85 |
| Knex-MSSQL | 2ms | -16.04% | 482.69 |

![chart](https://image-charts.com/chart?chs=999x500&chtt=Entity%20listing%7C%28ops%2Fsec%29&chf=b0%2Clg%2C90%2C03a9f4%2C0%2C3f51b5%2C1&chg=0%2C50&chma=0%2C0%2C10%2C10&cht=bvs&chxt=x%2Cy&chxs=0%2C333%2C10%7C1%2C333%2C10&chxl=0%3A%7CNeDB%20%28memory%29%7CNeDB%20%28file%29%7CMongoDB%7CKnex%20SQLite%20%28memory%29%7CKnex%20SQLite%20%28file%29%7CKnex-Postgresql%7CKnex-MySQL%7CKnex-MySQL2%7CKnex-MSSQL&chd=a%3A652.7362190803428%2C673.1781593466063%2C574.8820527187748%2C1841.259914856437%2C1788.5755139686169%2C968.1376896218852%2C471.73696564205136%2C495.85136312730526%2C482.6859403595997)

## Entity counting

### Result


| Adapter config | Time | Diff | ops/sec |
| -------------- | ----:| ----:| -------:|
| NeDB (memory) | 1ms | -28.9% | 835.89 |
| NeDB (file) | 1ms | -23.66% | 897.43 |
| MongoDB | 850μs | 0% | 1,175.61 |
| Knex SQLite (memory) | 127μs | 568.37% | 7,857.41 |
| Knex SQLite (file) | 135μs | 527.98% | 7,382.58 |
| Knex-Postgresql | 385μs | 120.53% | 2,592.59 |
| Knex-MySQL | 1ms | -39.68% | 709.16 |
| Knex-MySQL2 | 1ms | -28.81% | 836.89 |
| Knex-MSSQL | 861μs | -1.29% | 1,160.47 |

![chart](https://image-charts.com/chart?chs=999x500&chtt=Entity%20counting%7C%28ops%2Fsec%29&chf=b0%2Clg%2C90%2C03a9f4%2C0%2C3f51b5%2C1&chg=0%2C50&chma=0%2C0%2C10%2C10&cht=bvs&chxt=x%2Cy&chxs=0%2C333%2C10%7C1%2C333%2C10&chxl=0%3A%7CNeDB%20%28memory%29%7CNeDB%20%28file%29%7CMongoDB%7CKnex%20SQLite%20%28memory%29%7CKnex%20SQLite%20%28file%29%7CKnex-Postgresql%7CKnex-MySQL%7CKnex-MySQL2%7CKnex-MSSQL&chd=a%3A835.8877746088025%2C897.4310482707779%2C1175.6127519086695%2C7857.408056591191%2C7382.577184288274%2C2592.5887242434%2C709.1627079404809%2C836.8920170370372%2C1160.4674429780605)

## Entity getting

### Result


| Adapter config | Time | Diff | ops/sec |
| -------------- | ----:| ----:| -------:|
| NeDB (memory) | 33μs | 1,178.96% | 29,876.15 |
| NeDB (file) | 32μs | 1,228.77% | 31,039.7 |
| MongoDB | 428μs | 0% | 2,335.97 |
| Knex SQLite (memory) | 160μs | 166.67% | 6,229.29 |
| Knex SQLite (file) | 166μs | 156.37% | 5,988.63 |
| Knex-Postgresql | 465μs | -8.1% | 2,146.85 |
| Knex-MySQL | 486μs | -11.93% | 2,057.4 |
| Knex-MySQL2 | 393μs | 8.87% | 2,543.15 |
| Knex-MSSQL | 860μs | -50.25% | 1,162.1 |

![chart](https://image-charts.com/chart?chs=999x500&chtt=Entity%20getting%7C%28ops%2Fsec%29&chf=b0%2Clg%2C90%2C03a9f4%2C0%2C3f51b5%2C1&chg=0%2C50&chma=0%2C0%2C10%2C10&cht=bvs&chxt=x%2Cy&chxs=0%2C333%2C10%7C1%2C333%2C10&chxl=0%3A%7CNeDB%20%28memory%29%7CNeDB%20%28file%29%7CMongoDB%7CKnex%20SQLite%20%28memory%29%7CKnex%20SQLite%20%28file%29%7CKnex-Postgresql%7CKnex-MySQL%7CKnex-MySQL2%7CKnex-MSSQL&chd=a%3A29876.147010463526%2C31039.697845700855%2C2335.9701972561757%2C6229.28984019911%2C5988.62583170325%2C2146.8486139863376%2C2057.3966079116326%2C2543.1544917053684%2C1162.104535078608)

## Entity resolving

### Result


| Adapter config | Time | Diff | ops/sec |
| -------------- | ----:| ----:| -------:|
| NeDB (memory) | 33μs | 1,203.95% | 29,781.45 |
| NeDB (file) | 33μs | 1,219.81% | 30,143.7 |
| MongoDB | 437μs | 0% | 2,283.94 |
| Knex SQLite (memory) | 162μs | 169.72% | 6,160.35 |
| Knex SQLite (file) | 181μs | 141.72% | 5,520.68 |
| Knex-Postgresql | 480μs | -8.84% | 2,082.02 |
| Knex-MySQL | 518μs | -15.54% | 1,929.02 |
| Knex-MySQL2 | 423μs | 3.28% | 2,358.88 |
| Knex-MSSQL | 1ms | -68.24% | 725.37 |

![chart](https://image-charts.com/chart?chs=999x500&chtt=Entity%20resolving%7C%28ops%2Fsec%29&chf=b0%2Clg%2C90%2C03a9f4%2C0%2C3f51b5%2C1&chg=0%2C50&chma=0%2C0%2C10%2C10&cht=bvs&chxt=x%2Cy&chxs=0%2C333%2C10%7C1%2C333%2C10&chxl=0%3A%7CNeDB%20%28memory%29%7CNeDB%20%28file%29%7CMongoDB%7CKnex%20SQLite%20%28memory%29%7CKnex%20SQLite%20%28file%29%7CKnex-Postgresql%7CKnex-MySQL%7CKnex-MySQL2%7CKnex-MSSQL&chd=a%3A29781.44892104065%2C30143.697691882193%2C2283.942273222769%2C6160.350712549713%2C5520.680863567685%2C2082.0212360582477%2C1929.019339118337%2C2358.876180632394%2C725.36607103456)

## Entity updating

### Result


| Adapter config | Time | Diff | ops/sec |
| -------------- | ----:| ----:| -------:|
| NeDB (memory) | 131μs | 651.85% | 7,597.49 |
| NeDB (file) | 271μs | 264.51% | 3,683.35 |
| MongoDB | 989μs | 0% | 1,010.5 |
| Knex SQLite (memory) | 497μs | 99.05% | 2,011.45 |
| Knex SQLite (file) | 1ms | -20.86% | 799.74 |
| Knex-Postgresql | 1ms | -43.71% | 568.78 |
| Knex-MySQL | 2ms | -52.66% | 478.4 |
| Knex-MySQL2 | 1ms | -45.27% | 553.06 |
| Knex-MSSQL | 3ms | -71.41% | 288.94 |

![chart](https://image-charts.com/chart?chs=999x500&chtt=Entity%20updating%7C%28ops%2Fsec%29&chf=b0%2Clg%2C90%2C03a9f4%2C0%2C3f51b5%2C1&chg=0%2C50&chma=0%2C0%2C10%2C10&cht=bvs&chxt=x%2Cy&chxs=0%2C333%2C10%7C1%2C333%2C10&chxl=0%3A%7CNeDB%20%28memory%29%7CNeDB%20%28file%29%7CMongoDB%7CKnex%20SQLite%20%28memory%29%7CKnex%20SQLite%20%28file%29%7CKnex-Postgresql%7CKnex-MySQL%7CKnex-MySQL2%7CKnex-MSSQL&chd=a%3A7597.494960039772%2C3683.3499655711853%2C1010.5047695302186%2C2011.4465759673308%2C799.7435016256463%2C568.7753056973221%2C478.4019301183279%2C553.0619087921671%2C288.9433738332764)

## Entity replacing

### Result


| Adapter config | Time | Diff | ops/sec |
| -------------- | ----:| ----:| -------:|
| NeDB (memory) | 119μs | 713.92% | 8,348.3 |
| NeDB (file) | 262μs | 271.78% | 3,813.35 |
| MongoDB | 974μs | 0% | 1,025.69 |
| Knex SQLite (memory) | 519μs | 87.61% | 1,924.32 |
| Knex SQLite (file) | 1ms | -20.17% | 818.78 |
| Knex-Postgresql | 1ms | -45.5% | 559.05 |
| Knex-MySQL | 2ms | -53.28% | 479.23 |
| Knex-MySQL2 | 1ms | -46.78% | 545.92 |
| Knex-MSSQL | 3ms | -75.28% | 253.56 |

![chart](https://image-charts.com/chart?chs=999x500&chtt=Entity%20replacing%7C%28ops%2Fsec%29&chf=b0%2Clg%2C90%2C03a9f4%2C0%2C3f51b5%2C1&chg=0%2C50&chma=0%2C0%2C10%2C10&cht=bvs&chxt=x%2Cy&chxs=0%2C333%2C10%7C1%2C333%2C10&chxl=0%3A%7CNeDB%20%28memory%29%7CNeDB%20%28file%29%7CMongoDB%7CKnex%20SQLite%20%28memory%29%7CKnex%20SQLite%20%28file%29%7CKnex-Postgresql%7CKnex-MySQL%7CKnex-MySQL2%7CKnex-MSSQL&chd=a%3A8348.296108679517%2C3813.345998853623%2C1025.6940373661878%2C1924.3190362290418%2C818.7813795558544%2C559.0525448647387%2C479.22670123922256%2C545.9177574658174%2C253.55959327579214)

## Entity deleting

### Result


| Adapter config | Time | Diff | ops/sec |
| -------------- | ----:| ----:| -------:|
| NeDB (memory) | 136μs | 1% | 7,337.2 |
| NeDB (file) | 214μs | -35.69% | 4,671.79 |
| MongoDB | 137μs | 0% | 7,264.65 |
| Knex SQLite (memory) | 341μs | -59.73% | 2,925.4 |
| Knex SQLite (file) | 886μs | -84.48% | 1,127.64 |
| Knex-Postgresql | 267μs | -48.48% | 3,742.54 |
| Knex-MySQL | 515μs | -73.31% | 1,938.79 |
| Knex-MySQL2 | 330μs | -58.35% | 3,025.95 |
| Knex-MSSQL | 864μs | -84.08% | 1,156.66 |

![chart](https://image-charts.com/chart?chs=999x500&chtt=Entity%20deleting%7C%28ops%2Fsec%29&chf=b0%2Clg%2C90%2C03a9f4%2C0%2C3f51b5%2C1&chg=0%2C50&chma=0%2C0%2C10%2C10&cht=bvs&chxt=x%2Cy&chxs=0%2C333%2C10%7C1%2C333%2C10&chxl=0%3A%7CNeDB%20%28memory%29%7CNeDB%20%28file%29%7CMongoDB%7CKnex%20SQLite%20%28memory%29%7CKnex%20SQLite%20%28file%29%7CKnex-Postgresql%7CKnex-MySQL%7CKnex-MySQL2%7CKnex-MSSQL&chd=a%3A7337.200527421774%2C4671.788448818547%2C7264.649109240327%2C2925.3987780282587%2C1127.638638041463%2C3742.5397471848337%2C1938.7946093874375%2C3025.9527053640018%2C1156.656176649516)

--------------------
_Generated at 2021-05-17T19:23:30.266Z_