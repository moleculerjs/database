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
| NeDB (memory) | 73μs | 728.68% | 13,586.12 |
| NeDB (file) | 229μs | 165.51% | 4,353.07 |
| MongoDB | 609μs | 0% | 1,639.5 |
| Knex SQLite (memory) | 476μs | 27.9% | 2,096.89 |
| Knex SQLite (file) | 2ms | -71.43% | 468.47 |
| Knex-Postgresql | 1ms | -61% | 639.48 |
| Knex-MySQL | 2ms | -73.05% | 441.89 |
| Knex-MySQL2 | 2ms | -71.85% | 461.47 |
| Knex-MSSQL | 3ms | -82.74% | 282.95 |

![chart](https://image-charts.com/chart?chs=999x500&chtt=Entity%20creation%7C%28ops%2Fsec%29&chf=b0%2Clg%2C90%2C03a9f4%2C0%2C3f51b5%2C1&chg=0%2C50&chma=0%2C0%2C10%2C10&cht=bvs&chxt=x%2Cy&chxs=0%2C333%2C10%7C1%2C333%2C10&chxl=0%3A%7CNeDB%20%28memory%29%7CNeDB%20%28file%29%7CMongoDB%7CKnex%20SQLite%20%28memory%29%7CKnex%20SQLite%20%28file%29%7CKnex-Postgresql%7CKnex-MySQL%7CKnex-MySQL2%7CKnex-MSSQL&chd=a%3A13586.116635435921%2C4353.0703478040405%2C1639.4984632475391%2C2096.8892025713135%2C468.4705145169576%2C639.4804870754687%2C441.8904653751201%2C461.4701662257132%2C282.94751100467715)

## Entity finding

### Result


| Adapter config | Time | Diff | ops/sec |
| -------------- | ----:| ----:| -------:|
| NeDB (memory) | 290μs | 248.58% | 3,438.72 |
| NeDB (file) | 286μs | 253.88% | 3,491.05 |
| MongoDB | 1ms | 0% | 986.5 |
| Knex SQLite (memory) | 412μs | 145.77% | 2,424.54 |
| Knex SQLite (file) | 404μs | 150.31% | 2,469.34 |
| Knex-Postgresql | 717μs | 41.2% | 1,392.97 |
| Knex-MySQL | 989μs | 2.4% | 1,010.17 |
| Knex-MySQL2 | 914μs | 10.85% | 1,093.54 |
| Knex-MSSQL | 1ms | -23.76% | 752.09 |

![chart](https://image-charts.com/chart?chs=999x500&chtt=Entity%20finding%7C%28ops%2Fsec%29&chf=b0%2Clg%2C90%2C03a9f4%2C0%2C3f51b5%2C1&chg=0%2C50&chma=0%2C0%2C10%2C10&cht=bvs&chxt=x%2Cy&chxs=0%2C333%2C10%7C1%2C333%2C10&chxl=0%3A%7CNeDB%20%28memory%29%7CNeDB%20%28file%29%7CMongoDB%7CKnex%20SQLite%20%28memory%29%7CKnex%20SQLite%20%28file%29%7CKnex-Postgresql%7CKnex-MySQL%7CKnex-MySQL2%7CKnex-MSSQL&chd=a%3A3438.720435314497%2C3491.04772807352%2C986.5041158429495%2C2424.5355020939173%2C2469.3384265781087%2C1392.9730000461293%2C1010.1657141060454%2C1093.5356900715144%2C752.0861968126092)

## Entity listing

### Result


| Adapter config | Time | Diff | ops/sec |
| -------------- | ----:| ----:| -------:|
| NeDB (memory) | 1ms | 30.07% | 646.22 |
| NeDB (file) | 1ms | 26.12% | 626.57 |
| MongoDB | 2ms | 0% | 496.82 |
| Knex SQLite (memory) | 581μs | 246.1% | 1,719.49 |
| Knex SQLite (file) | 572μs | 251.74% | 1,747.53 |
| Knex-Postgresql | 1ms | 70.99% | 849.53 |
| Knex-MySQL | 2ms | -10.87% | 442.81 |
| Knex-MySQL2 | 1ms | 4.68% | 520.05 |
| Knex-MSSQL | 2ms | -1.95% | 487.15 |

![chart](https://image-charts.com/chart?chs=999x500&chtt=Entity%20listing%7C%28ops%2Fsec%29&chf=b0%2Clg%2C90%2C03a9f4%2C0%2C3f51b5%2C1&chg=0%2C50&chma=0%2C0%2C10%2C10&cht=bvs&chxt=x%2Cy&chxs=0%2C333%2C10%7C1%2C333%2C10&chxl=0%3A%7CNeDB%20%28memory%29%7CNeDB%20%28file%29%7CMongoDB%7CKnex%20SQLite%20%28memory%29%7CKnex%20SQLite%20%28file%29%7CKnex-Postgresql%7CKnex-MySQL%7CKnex-MySQL2%7CKnex-MSSQL&chd=a%3A646.2219685225141%2C626.5683437388533%2C496.8209454464171%2C1719.4931774295515%2C1747.534639197647%2C849.5332460543152%2C442.8133769268087%2C520.0481264809382%2C487.146704275622)

## Entity counting

### Result


| Adapter config | Time | Diff | ops/sec |
| -------------- | ----:| ----:| -------:|
| NeDB (memory) | 1ms | -13.77% | 831.2 |
| NeDB (file) | 1ms | -15.89% | 810.78 |
| MongoDB | 1ms | 0% | 963.92 |
| Knex SQLite (memory) | 143μs | 625.02% | 6,988.64 |
| Knex SQLite (file) | 151μs | 583.66% | 6,589.99 |
| Knex-Postgresql | 440μs | 135.65% | 2,271.52 |
| Knex-MySQL | 1ms | -5.48% | 911.13 |
| Knex-MySQL2 | 1ms | -4.57% | 919.91 |
| Knex-MSSQL | 855μs | 21.28% | 1,169.05 |

![chart](https://image-charts.com/chart?chs=999x500&chtt=Entity%20counting%7C%28ops%2Fsec%29&chf=b0%2Clg%2C90%2C03a9f4%2C0%2C3f51b5%2C1&chg=0%2C50&chma=0%2C0%2C10%2C10&cht=bvs&chxt=x%2Cy&chxs=0%2C333%2C10%7C1%2C333%2C10&chxl=0%3A%7CNeDB%20%28memory%29%7CNeDB%20%28file%29%7CMongoDB%7CKnex%20SQLite%20%28memory%29%7CKnex%20SQLite%20%28file%29%7CKnex-Postgresql%7CKnex-MySQL%7CKnex-MySQL2%7CKnex-MSSQL&chd=a%3A831.1995554133015%2C810.7785171080417%2C963.9249192333431%2C6988.642646414758%2C6589.992957304481%2C2271.5158991109574%2C911.1336865539267%2C919.9055488670326%2C1169.0504833850632)

## Entity getting

### Result


| Adapter config | Time | Diff | ops/sec |
| -------------- | ----:| ----:| -------:|
| NeDB (memory) | 38μs | 1,551.67% | 26,201.46 |
| NeDB (file) | 39μs | 1,484.88% | 25,141.91 |
| MongoDB | 630μs | 0% | 1,586.36 |
| Knex SQLite (memory) | 222μs | 183.11% | 4,491.16 |
| Knex SQLite (file) | 218μs | 189.08% | 4,585.79 |
| Knex-Postgresql | 531μs | 18.59% | 1,881.31 |
| Knex-MySQL | 559μs | 12.65% | 1,786.96 |
| Knex-MySQL2 | 518μs | 21.46% | 1,926.84 |
| Knex-MSSQL | 839μs | -24.91% | 1,191.25 |

![chart](https://image-charts.com/chart?chs=999x500&chtt=Entity%20getting%7C%28ops%2Fsec%29&chf=b0%2Clg%2C90%2C03a9f4%2C0%2C3f51b5%2C1&chg=0%2C50&chma=0%2C0%2C10%2C10&cht=bvs&chxt=x%2Cy&chxs=0%2C333%2C10%7C1%2C333%2C10&chxl=0%3A%7CNeDB%20%28memory%29%7CNeDB%20%28file%29%7CMongoDB%7CKnex%20SQLite%20%28memory%29%7CKnex%20SQLite%20%28file%29%7CKnex-Postgresql%7CKnex-MySQL%7CKnex-MySQL2%7CKnex-MSSQL&chd=a%3A26201.46181357678%2C25141.906667955463%2C1586.3606189299776%2C4491.160647871473%2C4585.79176799256%2C1881.3127107019675%2C1786.9627983294185%2C1926.838708444168%2C1191.2543005310188)

## Entity resolving

### Result


| Adapter config | Time | Diff | ops/sec |
| -------------- | ----:| ----:| -------:|
| NeDB (memory) | 38μs | 1,534.53% | 25,873.6 |
| NeDB (file) | 39μs | 1,519.21% | 25,631.06 |
| MongoDB | 631μs | 0% | 1,582.93 |
| Knex SQLite (memory) | 200μs | 214.6% | 4,979.87 |
| Knex SQLite (file) | 210μs | 200.73% | 4,760.43 |
| Knex-Postgresql | 572μs | 10.38% | 1,747.2 |
| Knex-MySQL | 627μs | 0.65% | 1,593.23 |
| Knex-MySQL2 | 506μs | 24.77% | 1,974.99 |
| Knex-MSSQL | 895μs | -29.47% | 1,116.44 |

![chart](https://image-charts.com/chart?chs=999x500&chtt=Entity%20resolving%7C%28ops%2Fsec%29&chf=b0%2Clg%2C90%2C03a9f4%2C0%2C3f51b5%2C1&chg=0%2C50&chma=0%2C0%2C10%2C10&cht=bvs&chxt=x%2Cy&chxs=0%2C333%2C10%7C1%2C333%2C10&chxl=0%3A%7CNeDB%20%28memory%29%7CNeDB%20%28file%29%7CMongoDB%7CKnex%20SQLite%20%28memory%29%7CKnex%20SQLite%20%28file%29%7CKnex-Postgresql%7CKnex-MySQL%7CKnex-MySQL2%7CKnex-MSSQL&chd=a%3A25873.59519750248%2C25631.06390463975%2C1582.93382344257%2C4979.869273862033%2C4760.433769923776%2C1747.1995132963764%2C1593.2297847968807%2C1974.98603010419%2C1116.442491607565)

## Entity updating

### Result


| Adapter config | Time | Diff | ops/sec |
| -------------- | ----:| ----:| -------:|
| NeDB (memory) | 147μs | 750.83% | 6,798.18 |
| NeDB (file) | 326μs | 282.97% | 3,060 |
| MongoDB | 1ms | 0% | 799.01 |
| Knex SQLite (memory) | 610μs | 104.98% | 1,637.85 |
| Knex SQLite (file) | 1ms | -21.92% | 623.89 |
| Knex-Postgresql | 1ms | -34.87% | 520.37 |
| Knex-MySQL | 2ms | -50.09% | 398.78 |
| Knex-MySQL2 | 2ms | -43.65% | 450.23 |
| Knex-MSSQL | 3ms | -64.19% | 286.15 |

![chart](https://image-charts.com/chart?chs=999x500&chtt=Entity%20updating%7C%28ops%2Fsec%29&chf=b0%2Clg%2C90%2C03a9f4%2C0%2C3f51b5%2C1&chg=0%2C50&chma=0%2C0%2C10%2C10&cht=bvs&chxt=x%2Cy&chxs=0%2C333%2C10%7C1%2C333%2C10&chxl=0%3A%7CNeDB%20%28memory%29%7CNeDB%20%28file%29%7CMongoDB%7CKnex%20SQLite%20%28memory%29%7CKnex%20SQLite%20%28file%29%7CKnex-Postgresql%7CKnex-MySQL%7CKnex-MySQL2%7CKnex-MSSQL&chd=a%3A6798.181357321471%2C3059.9955171448173%2C799.0084019686561%2C1637.8467101331457%2C623.8871108540351%2C520.3684293126131%2C398.783891932143%2C450.23084575848014%2C286.1541599676672)

## Entity replacing

### Result


| Adapter config | Time | Diff | ops/sec |
| -------------- | ----:| ----:| -------:|
| NeDB (memory) | 126μs | 901.68% | 7,925.66 |
| NeDB (file) | 310μs | 307.32% | 3,222.89 |
| MongoDB | 1ms | 0% | 791.24 |
| Knex SQLite (memory) | 605μs | 108.63% | 1,650.73 |
| Knex SQLite (file) | 1ms | -22.23% | 615.35 |
| Knex-Postgresql | 1ms | -36.42% | 503.1 |
| Knex-MySQL | 2ms | -46.99% | 419.45 |
| Knex-MySQL2 | 2ms | -40.83% | 468.15 |
| Knex-MSSQL | 3ms | -68.36% | 250.36 |

![chart](https://image-charts.com/chart?chs=999x500&chtt=Entity%20replacing%7C%28ops%2Fsec%29&chf=b0%2Clg%2C90%2C03a9f4%2C0%2C3f51b5%2C1&chg=0%2C50&chma=0%2C0%2C10%2C10&cht=bvs&chxt=x%2Cy&chxs=0%2C333%2C10%7C1%2C333%2C10&chxl=0%3A%7CNeDB%20%28memory%29%7CNeDB%20%28file%29%7CMongoDB%7CKnex%20SQLite%20%28memory%29%7CKnex%20SQLite%20%28file%29%7CKnex-Postgresql%7CKnex-MySQL%7CKnex-MySQL2%7CKnex-MSSQL&chd=a%3A7925.656731171178%2C3222.8905239820365%2C791.2356158525378%2C1650.732763547692%2C615.3450897814607%2C503.1007612572573%2C419.4450694082768%2C468.1509126900255%2C250.35920750461258)

## Entity deleting

### Result


| Adapter config | Time | Diff | ops/sec |
| -------------- | ----:| ----:| -------:|
| NeDB (memory) | 136μs | 148.38% | 7,309.39 |
| NeDB (file) | 219μs | 54.97% | 4,560.63 |
| MongoDB | 339μs | 0% | 2,942.84 |
| Knex SQLite (memory) | 567μs | -40.12% | 1,762.03 |
| Knex SQLite (file) | 1ms | -68.58% | 924.67 |
| Knex-Postgresql | 263μs | 29.09% | 3,798.79 |
| Knex-MySQL | 505μs | -32.83% | 1,976.77 |
| Knex-MySQL2 | 307μs | 10.42% | 3,249.56 |
| Knex-MSSQL | 1ms | -67.57% | 954.26 |

![chart](https://image-charts.com/chart?chs=999x500&chtt=Entity%20deleting%7C%28ops%2Fsec%29&chf=b0%2Clg%2C90%2C03a9f4%2C0%2C3f51b5%2C1&chg=0%2C50&chma=0%2C0%2C10%2C10&cht=bvs&chxt=x%2Cy&chxs=0%2C333%2C10%7C1%2C333%2C10&chxl=0%3A%7CNeDB%20%28memory%29%7CNeDB%20%28file%29%7CMongoDB%7CKnex%20SQLite%20%28memory%29%7CKnex%20SQLite%20%28file%29%7CKnex-Postgresql%7CKnex-MySQL%7CKnex-MySQL2%7CKnex-MSSQL&chd=a%3A7309.38964344987%2C4560.627308555684%2C2942.8383925432877%2C1762.0286745255794%2C924.6729043520112%2C3798.7895411313184%2C1976.7681481197972%2C3249.555422672661%2C954.25962063556)

--------------------
_Generated at 2022-09-02T19:29:11.443Z_