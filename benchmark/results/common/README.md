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
| NeDB (memory) | 88μs | 608.85% | 11,238.84 |
| NeDB (file) | 257μs | 145.22% | 3,887.96 |
| MongoDB | 630μs | 0% | 1,585.5 |
| Knex SQLite (memory) | 491μs | 28.39% | 2,035.56 |
| Knex SQLite (file) | 2ms | -76.32% | 375.43 |
| Knex-Postgresql | 1ms | -63.91% | 572.28 |
| Knex-MySQL | 2ms | -76.91% | 366.06 |
| Knex-MySQL2 | 2ms | -74.1% | 410.69 |
| Knex-MSSQL | 4ms | -85.54% | 229.29 |

![chart](https://image-charts.com/chart?chs=999x500&chtt=Entity%20creation%7C%28ops%2Fsec%29&chf=b0%2Clg%2C90%2C03a9f4%2C0%2C3f51b5%2C1&chg=0%2C50&chma=0%2C0%2C10%2C10&cht=bvs&chxt=x%2Cy&chxs=0%2C333%2C10%7C1%2C333%2C10&chxl=0%3A%7CNeDB%20%28memory%29%7CNeDB%20%28file%29%7CMongoDB%7CKnex%20SQLite%20%28memory%29%7CKnex%20SQLite%20%28file%29%7CKnex-Postgresql%7CKnex-MySQL%7CKnex-MySQL2%7CKnex-MSSQL&chd=a%3A11238.840150410913%2C3887.9614795053208%2C1585.5045047706765%2C2035.5570596438822%2C375.4258757222224%2C572.2816468261207%2C366.0614530748943%2C410.6902366889712%2C229.2866478362913)

## Entity finding

### Result


| Adapter config | Time | Diff | ops/sec |
| -------------- | ----:| ----:| -------:|
| NeDB (memory) | 339μs | 188.62% | 2,942.97 |
| NeDB (file) | 340μs | 187.89% | 2,935.49 |
| MongoDB | 980μs | 0% | 1,019.67 |
| Knex SQLite (memory) | 516μs | 89.81% | 1,935.46 |
| Knex SQLite (file) | 521μs | 87.89% | 1,915.89 |
| Knex-Postgresql | 720μs | 36.06% | 1,387.31 |
| Knex-MySQL | 1ms | -6.61% | 952.29 |
| Knex-MySQL2 | 901μs | 8.79% | 1,109.29 |
| Knex-MSSQL | 1ms | -34.54% | 667.48 |

![chart](https://image-charts.com/chart?chs=999x500&chtt=Entity%20finding%7C%28ops%2Fsec%29&chf=b0%2Clg%2C90%2C03a9f4%2C0%2C3f51b5%2C1&chg=0%2C50&chma=0%2C0%2C10%2C10&cht=bvs&chxt=x%2Cy&chxs=0%2C333%2C10%7C1%2C333%2C10&chxl=0%3A%7CNeDB%20%28memory%29%7CNeDB%20%28file%29%7CMongoDB%7CKnex%20SQLite%20%28memory%29%7CKnex%20SQLite%20%28file%29%7CKnex-Postgresql%7CKnex-MySQL%7CKnex-MySQL2%7CKnex-MSSQL&chd=a%3A2942.9662597552983%2C2935.4856167231333%2C1019.6663015793395%2C1935.4640024932414%2C1915.8900466502598%2C1387.3117381281918%2C952.2935218592373%2C1109.2880098249284%2C667.4806975349571)

## Entity listing

### Result


| Adapter config | Time | Diff | ops/sec |
| -------------- | ----:| ----:| -------:|
| NeDB (memory) | 1ms | 15.92% | 598.56 |
| NeDB (file) | 1ms | 24.8% | 644.42 |
| MongoDB | 1ms | 0% | 516.34 |
| Knex SQLite (memory) | 725μs | 167.07% | 1,379 |
| Knex SQLite (file) | 735μs | 163.46% | 1,360.34 |
| Knex-Postgresql | 1ms | 58.63% | 819.05 |
| Knex-MySQL | 2ms | -23.96% | 392.61 |
| Knex-MySQL2 | 2ms | -16.45% | 431.39 |
| Knex-MSSQL | 2ms | -21.83% | 403.64 |

![chart](https://image-charts.com/chart?chs=999x500&chtt=Entity%20listing%7C%28ops%2Fsec%29&chf=b0%2Clg%2C90%2C03a9f4%2C0%2C3f51b5%2C1&chg=0%2C50&chma=0%2C0%2C10%2C10&cht=bvs&chxt=x%2Cy&chxs=0%2C333%2C10%7C1%2C333%2C10&chxl=0%3A%7CNeDB%20%28memory%29%7CNeDB%20%28file%29%7CMongoDB%7CKnex%20SQLite%20%28memory%29%7CKnex%20SQLite%20%28file%29%7CKnex-Postgresql%7CKnex-MySQL%7CKnex-MySQL2%7CKnex-MSSQL&chd=a%3A598.5610804713214%2C644.4181396325141%2C516.3413277383102%2C1379.003163245712%2C1360.3412796218154%2C819.0499709878331%2C392.6100465942399%2C431.3930462457245%2C403.63802319336213)

## Entity counting

### Result


| Adapter config | Time | Diff | ops/sec |
| -------------- | ----:| ----:| -------:|
| NeDB (memory) | 1ms | -18.76% | 827.73 |
| NeDB (file) | 1ms | -17.69% | 838.61 |
| MongoDB | 981μs | 0% | 1,018.83 |
| Knex SQLite (memory) | 170μs | 474.45% | 5,852.62 |
| Knex SQLite (file) | 187μs | 423.88% | 5,337.46 |
| Knex-Postgresql | 487μs | 101.35% | 2,051.45 |
| Knex-MySQL | 1ms | -36.77% | 644.24 |
| Knex-MySQL2 | 1ms | -27.63% | 737.35 |
| Knex-MSSQL | 984μs | -0.32% | 1,015.54 |

![chart](https://image-charts.com/chart?chs=999x500&chtt=Entity%20counting%7C%28ops%2Fsec%29&chf=b0%2Clg%2C90%2C03a9f4%2C0%2C3f51b5%2C1&chg=0%2C50&chma=0%2C0%2C10%2C10&cht=bvs&chxt=x%2Cy&chxs=0%2C333%2C10%7C1%2C333%2C10&chxl=0%3A%7CNeDB%20%28memory%29%7CNeDB%20%28file%29%7CMongoDB%7CKnex%20SQLite%20%28memory%29%7CKnex%20SQLite%20%28file%29%7CKnex-Postgresql%7CKnex-MySQL%7CKnex-MySQL2%7CKnex-MSSQL&chd=a%3A827.7295777426242%2C838.609486428367%2C1018.8269627056053%2C5852.622782229436%2C5337.460870634512%2C2051.447090917805%2C644.2377877151907%2C737.3494242726385%2C1015.5351549569084)

## Entity getting

### Result


| Adapter config | Time | Diff | ops/sec |
| -------------- | ----:| ----:| -------:|
| NeDB (memory) | 46μs | 1,048.83% | 21,599.35 |
| NeDB (file) | 49μs | 966.03% | 20,042.69 |
| MongoDB | 531μs | 0% | 1,880.12 |
| Knex SQLite (memory) | 222μs | 138.99% | 4,493.3 |
| Knex SQLite (file) | 219μs | 142% | 4,549.93 |
| Knex-Postgresql | 579μs | -8.2% | 1,725.88 |
| Knex-MySQL | 589μs | -9.84% | 1,695.12 |
| Knex-MySQL2 | 465μs | 14.3% | 2,149.04 |
| Knex-MSSQL | 1ms | -48.42% | 969.71 |

![chart](https://image-charts.com/chart?chs=999x500&chtt=Entity%20getting%7C%28ops%2Fsec%29&chf=b0%2Clg%2C90%2C03a9f4%2C0%2C3f51b5%2C1&chg=0%2C50&chma=0%2C0%2C10%2C10&cht=bvs&chxt=x%2Cy&chxs=0%2C333%2C10%7C1%2C333%2C10&chxl=0%3A%7CNeDB%20%28memory%29%7CNeDB%20%28file%29%7CMongoDB%7CKnex%20SQLite%20%28memory%29%7CKnex%20SQLite%20%28file%29%7CKnex-Postgresql%7CKnex-MySQL%7CKnex-MySQL2%7CKnex-MSSQL&chd=a%3A21599.346930785938%2C20042.68560207525%2C1880.11959479849%2C4493.302624501237%2C4549.930251596929%2C1725.881035172123%2C1695.121735068522%2C2149.035093773168%2C969.7084779385968)

## Entity resolving

### Result


| Adapter config | Time | Diff | ops/sec |
| -------------- | ----:| ----:| -------:|
| NeDB (memory) | 49μs | 998.05% | 20,038.41 |
| NeDB (file) | 52μs | 951.47% | 19,188.52 |
| MongoDB | 547μs | 0% | 1,824.91 |
| Knex SQLite (memory) | 225μs | 143.37% | 4,441.3 |
| Knex SQLite (file) | 251μs | 118.29% | 3,983.61 |
| Knex-Postgresql | 669μs | -18.19% | 1,492.89 |
| Knex-MySQL | 600μs | -8.76% | 1,664.99 |
| Knex-MySQL2 | 495μs | 10.6% | 2,018.34 |
| Knex-MSSQL | 1ms | -58.96% | 749.01 |

![chart](https://image-charts.com/chart?chs=999x500&chtt=Entity%20resolving%7C%28ops%2Fsec%29&chf=b0%2Clg%2C90%2C03a9f4%2C0%2C3f51b5%2C1&chg=0%2C50&chma=0%2C0%2C10%2C10&cht=bvs&chxt=x%2Cy&chxs=0%2C333%2C10%7C1%2C333%2C10&chxl=0%3A%7CNeDB%20%28memory%29%7CNeDB%20%28file%29%7CMongoDB%7CKnex%20SQLite%20%28memory%29%7CKnex%20SQLite%20%28file%29%7CKnex-Postgresql%7CKnex-MySQL%7CKnex-MySQL2%7CKnex-MSSQL&chd=a%3A20038.40745685249%2C19188.517169178587%2C1824.9148821193276%2C4441.295723689086%2C3983.6119058233726%2C1492.8931514786118%2C1664.9945998480896%2C2018.3422458917141%2C749.0071510897868)

## Entity updating

### Result


| Adapter config | Time | Diff | ops/sec |
| -------------- | ----:| ----:| -------:|
| NeDB (memory) | 182μs | 562.98% | 5,489.59 |
| NeDB (file) | 357μs | 237.52% | 2,794.75 |
| MongoDB | 1ms | 0% | 828.02 |
| Knex SQLite (memory) | 684μs | 76.42% | 1,460.77 |
| Knex SQLite (file) | 1ms | -32.58% | 558.28 |
| Knex-Postgresql | 2ms | -41.64% | 483.25 |
| Knex-MySQL | 2ms | -53.18% | 387.7 |
| Knex-MySQL2 | 2ms | -46.6% | 442.17 |
| Knex-MSSQL | 4ms | -70.79% | 241.87 |

![chart](https://image-charts.com/chart?chs=999x500&chtt=Entity%20updating%7C%28ops%2Fsec%29&chf=b0%2Clg%2C90%2C03a9f4%2C0%2C3f51b5%2C1&chg=0%2C50&chma=0%2C0%2C10%2C10&cht=bvs&chxt=x%2Cy&chxs=0%2C333%2C10%7C1%2C333%2C10&chxl=0%3A%7CNeDB%20%28memory%29%7CNeDB%20%28file%29%7CMongoDB%7CKnex%20SQLite%20%28memory%29%7CKnex%20SQLite%20%28file%29%7CKnex-Postgresql%7CKnex-MySQL%7CKnex-MySQL2%7CKnex-MSSQL&chd=a%3A5489.591948837403%2C2794.747959835387%2C828.0227247160377%2C1460.77149745342%2C558.2777864831687%2C483.2529262991531%2C387.704846247169%2C442.17293095740473%2C241.86580538501687)

## Entity replacing

### Result


| Adapter config | Time | Diff | ops/sec |
| -------------- | ----:| ----:| -------:|
| NeDB (memory) | 168μs | 594.48% | 5,926.15 |
| NeDB (file) | 349μs | 235.31% | 2,861.27 |
| MongoDB | 1ms | 0% | 853.32 |
| Knex SQLite (memory) | 696μs | 68.21% | 1,435.42 |
| Knex SQLite (file) | 1ms | -34.74% | 556.92 |
| Knex-Postgresql | 2ms | -45.18% | 467.77 |
| Knex-MySQL | 2ms | -54.44% | 388.75 |
| Knex-MySQL2 | 2ms | -51.37% | 415.01 |
| Knex-MSSQL | 5ms | -76.65% | 199.25 |

![chart](https://image-charts.com/chart?chs=999x500&chtt=Entity%20replacing%7C%28ops%2Fsec%29&chf=b0%2Clg%2C90%2C03a9f4%2C0%2C3f51b5%2C1&chg=0%2C50&chma=0%2C0%2C10%2C10&cht=bvs&chxt=x%2Cy&chxs=0%2C333%2C10%7C1%2C333%2C10&chxl=0%3A%7CNeDB%20%28memory%29%7CNeDB%20%28file%29%7CMongoDB%7CKnex%20SQLite%20%28memory%29%7CKnex%20SQLite%20%28file%29%7CKnex-Postgresql%7CKnex-MySQL%7CKnex-MySQL2%7CKnex-MSSQL&chd=a%3A5926.146078887291%2C2861.2738487847696%2C853.3249733518046%2C1435.4174163765856%2C556.9164159862582%2C467.77426075254937%2C388.7468002056502%2C415.0082611461462%2C199.25029704657692)

## Entity deleting

### Result


| Adapter config | Time | Diff | ops/sec |
| -------------- | ----:| ----:| -------:|
| NeDB (memory) | 164μs | 60.3% | 6,069.24 |
| NeDB (file) | 265μs | -0.47% | 3,768.4 |
| MongoDB | 264μs | 0% | 3,786.09 |
| Knex SQLite (memory) | 737μs | -64.17% | 1,356.67 |
| Knex SQLite (file) | 1ms | -81.72% | 692.12 |
| Knex-Postgresql | 290μs | -9.12% | 3,440.79 |
| Knex-MySQL | 675μs | -60.92% | 1,479.51 |
| Knex-MySQL2 | 390μs | -32.39% | 2,559.68 |
| Knex-MSSQL | 1ms | -74.19% | 977.01 |

![chart](https://image-charts.com/chart?chs=999x500&chtt=Entity%20deleting%7C%28ops%2Fsec%29&chf=b0%2Clg%2C90%2C03a9f4%2C0%2C3f51b5%2C1&chg=0%2C50&chma=0%2C0%2C10%2C10&cht=bvs&chxt=x%2Cy&chxs=0%2C333%2C10%7C1%2C333%2C10&chxl=0%3A%7CNeDB%20%28memory%29%7CNeDB%20%28file%29%7CMongoDB%7CKnex%20SQLite%20%28memory%29%7CKnex%20SQLite%20%28file%29%7CKnex-Postgresql%7CKnex-MySQL%7CKnex-MySQL2%7CKnex-MSSQL&chd=a%3A6069.242358517202%2C3768.3960384764064%2C3786.0934233606527%2C1356.6658754280197%2C692.1212134541507%2C3440.78962295301%2C1479.5129561587353%2C2559.675085674019%2C977.0065247856913)

--------------------
_Generated at 2021-05-16T20:12:20.812Z_