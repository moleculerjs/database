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
| NeDB (memory) | 65μs | 623.49% | 15,235.18 |
| NeDB (file) | 194μs | 143.91% | 5,136.26 |
| MongoDB | 474μs | 0% | 2,105.79 |
| Knex SQLite (memory) | 360μs | 31.68% | 2,772.87 |
| Knex SQLite (file) | 1ms | -70.68% | 617.47 |
| Knex-Postgresql | 1ms | -62.89% | 781.54 |
| Knex-MySQL | 1ms | -74.19% | 543.6 |
| Knex-MySQL2 | 1ms | -72.28% | 583.82 |
| Knex-MSSQL | 3ms | -84.45% | 327.53 |

![chart](https://image-charts.com/chart?chs=999x500&chtt=Entity%20creation%7C%28ops%2Fsec%29&chf=b0%2Clg%2C90%2C03a9f4%2C0%2C3f51b5%2C1&chg=0%2C50&chma=0%2C0%2C10%2C10&cht=bvs&chxt=x%2Cy&chxs=0%2C333%2C10%7C1%2C333%2C10&chxl=0%3A%7CNeDB%20%28memory%29%7CNeDB%20%28file%29%7CMongoDB%7CKnex%20SQLite%20%28memory%29%7CKnex%20SQLite%20%28file%29%7CKnex-Postgresql%7CKnex-MySQL%7CKnex-MySQL2%7CKnex-MSSQL&chd=a%3A15235.176099210858%2C5136.261845234967%2C2105.785510786609%2C2772.8749184405638%2C617.4694833309603%2C781.5405896133685%2C543.6042734610633%2C583.8169670818239%2C327.53386231517266)

## Entity finding

### Result


| Adapter config | Time | Diff | ops/sec |
| -------------- | ----:| ----:| -------:|
| NeDB (memory) | 259μs | 223.13% | 3,846.48 |
| NeDB (file) | 257μs | 226.22% | 3,883.25 |
| MongoDB | 840μs | 0% | 1,190.38 |
| Knex SQLite (memory) | 319μs | 163.2% | 3,133.08 |
| Knex SQLite (file) | 320μs | 162.01% | 3,118.88 |
| Knex-Postgresql | 596μs | 40.78% | 1,675.87 |
| Knex-MySQL | 800μs | 4.88% | 1,248.5 |
| Knex-MySQL2 | 708μs | 18.55% | 1,411.22 |
| Knex-MSSQL | 1ms | -24.87% | 894.28 |

![chart](https://image-charts.com/chart?chs=999x500&chtt=Entity%20finding%7C%28ops%2Fsec%29&chf=b0%2Clg%2C90%2C03a9f4%2C0%2C3f51b5%2C1&chg=0%2C50&chma=0%2C0%2C10%2C10&cht=bvs&chxt=x%2Cy&chxs=0%2C333%2C10%7C1%2C333%2C10&chxl=0%3A%7CNeDB%20%28memory%29%7CNeDB%20%28file%29%7CMongoDB%7CKnex%20SQLite%20%28memory%29%7CKnex%20SQLite%20%28file%29%7CKnex-Postgresql%7CKnex-MySQL%7CKnex-MySQL2%7CKnex-MSSQL&chd=a%3A3846.4778046513334%2C3883.2502791789007%2C1190.3751755694514%2C3133.0778954115303%2C3118.8761627987824%2C1675.8651366077556%2C1248.5035612443107%2C1411.2193369320923%2C894.2822734835652)

## Entity listing

### Result


| Adapter config | Time | Diff | ops/sec |
| -------------- | ----:| ----:| -------:|
| NeDB (memory) | 1ms | 15.69% | 707.71 |
| NeDB (file) | 1ms | 15.41% | 706 |
| MongoDB | 1ms | 0% | 611.75 |
| Knex SQLite (memory) | 448μs | 264.66% | 2,230.8 |
| Knex SQLite (file) | 457μs | 257.2% | 2,185.18 |
| Knex-Postgresql | 1ms | 63.07% | 997.55 |
| Knex-MySQL | 2ms | -22.67% | 473.09 |
| Knex-MySQL2 | 1ms | -17.68% | 503.56 |
| Knex-MSSQL | 1ms | -7.83% | 563.86 |

![chart](https://image-charts.com/chart?chs=999x500&chtt=Entity%20listing%7C%28ops%2Fsec%29&chf=b0%2Clg%2C90%2C03a9f4%2C0%2C3f51b5%2C1&chg=0%2C50&chma=0%2C0%2C10%2C10&cht=bvs&chxt=x%2Cy&chxs=0%2C333%2C10%7C1%2C333%2C10&chxl=0%3A%7CNeDB%20%28memory%29%7CNeDB%20%28file%29%7CMongoDB%7CKnex%20SQLite%20%28memory%29%7CKnex%20SQLite%20%28file%29%7CKnex-Postgresql%7CKnex-MySQL%7CKnex-MySQL2%7CKnex-MSSQL&chd=a%3A707.7084758096091%2C706.0015726442721%2C611.7481315095415%2C2230.8014914763994%2C2185.1845076014074%2C997.5549676691096%2C473.0895277522357%2C503.56404164662626%2C563.8593703898417)

## Entity counting

### Result


| Adapter config | Time | Diff | ops/sec |
| -------------- | ----:| ----:| -------:|
| NeDB (memory) | 1ms | -33.75% | 851.29 |
| NeDB (file) | 1ms | -32.64% | 865.67 |
| MongoDB | 778μs | 0% | 1,285.05 |
| Knex SQLite (memory) | 115μs | 574.38% | 8,666.21 |
| Knex SQLite (file) | 121μs | 542.12% | 8,251.59 |
| Knex-Postgresql | 363μs | 114.19% | 2,752.42 |
| Knex-MySQL | 1ms | -32.48% | 867.64 |
| Knex-MySQL2 | 1ms | -28.26% | 921.87 |
| Knex-MSSQL | 718μs | 8.27% | 1,391.32 |

![chart](https://image-charts.com/chart?chs=999x500&chtt=Entity%20counting%7C%28ops%2Fsec%29&chf=b0%2Clg%2C90%2C03a9f4%2C0%2C3f51b5%2C1&chg=0%2C50&chma=0%2C0%2C10%2C10&cht=bvs&chxt=x%2Cy&chxs=0%2C333%2C10%7C1%2C333%2C10&chxl=0%3A%7CNeDB%20%28memory%29%7CNeDB%20%28file%29%7CMongoDB%7CKnex%20SQLite%20%28memory%29%7CKnex%20SQLite%20%28file%29%7CKnex-Postgresql%7CKnex-MySQL%7CKnex-MySQL2%7CKnex-MSSQL&chd=a%3A851.286728095921%2C865.6748917413166%2C1285.0541924517609%2C8666.212017225695%2C8251.585549825586%2C2752.4213191898007%2C867.64354974382%2C921.873241921468%2C1391.3152433972339)

## Entity getting

### Result


| Adapter config | Time | Diff | ops/sec |
| -------------- | ----:| ----:| -------:|
| NeDB (memory) | 32μs | 1,371.12% | 30,687.15 |
| NeDB (file) | 32μs | 1,361.27% | 30,481.73 |
| MongoDB | 479μs | 0% | 2,085.98 |
| Knex SQLite (memory) | 147μs | 225.36% | 6,787.03 |
| Knex SQLite (file) | 154μs | 209.9% | 6,464.44 |
| Knex-Postgresql | 463μs | 3.51% | 2,159.21 |
| Knex-MySQL | 480μs | -0.33% | 2,079.16 |
| Knex-MySQL2 | 413μs | 15.88% | 2,417.15 |
| Knex-MSSQL | 699μs | -31.43% | 1,430.26 |

![chart](https://image-charts.com/chart?chs=999x500&chtt=Entity%20getting%7C%28ops%2Fsec%29&chf=b0%2Clg%2C90%2C03a9f4%2C0%2C3f51b5%2C1&chg=0%2C50&chma=0%2C0%2C10%2C10&cht=bvs&chxt=x%2Cy&chxs=0%2C333%2C10%7C1%2C333%2C10&chxl=0%3A%7CNeDB%20%28memory%29%7CNeDB%20%28file%29%7CMongoDB%7CKnex%20SQLite%20%28memory%29%7CKnex%20SQLite%20%28file%29%7CKnex-Postgresql%7CKnex-MySQL%7CKnex-MySQL2%7CKnex-MSSQL&chd=a%3A30687.152795066835%2C30481.726760749796%2C2085.9787957414687%2C6787.028989907026%2C6464.444965502652%2C2159.2086562930995%2C2079.1583935174303%2C2417.1519414968434%2C1430.2616008860816)

## Entity resolving

### Result


| Adapter config | Time | Diff | ops/sec |
| -------------- | ----:| ----:| -------:|
| NeDB (memory) | 33μs | 1,392.03% | 30,042.18 |
| NeDB (file) | 33μs | 1,374.72% | 29,693.67 |
| MongoDB | 496μs | 0% | 2,013.51 |
| Knex SQLite (memory) | 161μs | 206.81% | 6,177.7 |
| Knex SQLite (file) | 166μs | 198.44% | 6,009.17 |
| Knex-Postgresql | 474μs | 4.77% | 2,109.49 |
| Knex-MySQL | 503μs | -1.35% | 1,986.25 |
| Knex-MySQL2 | 455μs | 8.92% | 2,193.2 |
| Knex-MSSQL | 867μs | -42.76% | 1,152.46 |

![chart](https://image-charts.com/chart?chs=999x500&chtt=Entity%20resolving%7C%28ops%2Fsec%29&chf=b0%2Clg%2C90%2C03a9f4%2C0%2C3f51b5%2C1&chg=0%2C50&chma=0%2C0%2C10%2C10&cht=bvs&chxt=x%2Cy&chxs=0%2C333%2C10%7C1%2C333%2C10&chxl=0%3A%7CNeDB%20%28memory%29%7CNeDB%20%28file%29%7CMongoDB%7CKnex%20SQLite%20%28memory%29%7CKnex%20SQLite%20%28file%29%7CKnex-Postgresql%7CKnex-MySQL%7CKnex-MySQL2%7CKnex-MSSQL&chd=a%3A30042.17533056635%2C29693.67134569695%2C2013.5141048138398%2C6177.7021942866995%2C6009.168301282243%2C2109.494188354346%2C1986.254717324415%2C2193.20050906704%2C1152.4622832153907)

## Entity updating

### Result


| Adapter config | Time | Diff | ops/sec |
| -------------- | ----:| ----:| -------:|
| NeDB (memory) | 121μs | 716.19% | 8,260.19 |
| NeDB (file) | 268μs | 267.95% | 3,723.8 |
| MongoDB | 988μs | 0% | 1,012.04 |
| Knex SQLite (memory) | 470μs | 110.18% | 2,127.07 |
| Knex SQLite (file) | 1ms | -14.33% | 867.02 |
| Knex-Postgresql | 1ms | -41.46% | 592.45 |
| Knex-MySQL | 1ms | -48.98% | 516.39 |
| Knex-MySQL2 | 1ms | -44.48% | 561.89 |
| Knex-MSSQL | 2ms | -64.96% | 354.58 |

![chart](https://image-charts.com/chart?chs=999x500&chtt=Entity%20updating%7C%28ops%2Fsec%29&chf=b0%2Clg%2C90%2C03a9f4%2C0%2C3f51b5%2C1&chg=0%2C50&chma=0%2C0%2C10%2C10&cht=bvs&chxt=x%2Cy&chxs=0%2C333%2C10%7C1%2C333%2C10&chxl=0%3A%7CNeDB%20%28memory%29%7CNeDB%20%28file%29%7CMongoDB%7CKnex%20SQLite%20%28memory%29%7CKnex%20SQLite%20%28file%29%7CKnex-Postgresql%7CKnex-MySQL%7CKnex-MySQL2%7CKnex-MSSQL&chd=a%3A8260.187874999549%2C3723.798768550997%2C1012.036641433632%2C2127.069661525807%2C867.016155966045%2C592.4517641458793%2C516.3886571053538%2C561.890296982685%2C354.5840247031854)

## Entity replacing

### Result


| Adapter config | Time | Diff | ops/sec |
| -------------- | ----:| ----:| -------:|
| NeDB (memory) | 110μs | 837.83% | 9,009.55 |
| NeDB (file) | 258μs | 302.53% | 3,867.02 |
| MongoDB | 1ms | 0% | 960.68 |
| Knex SQLite (memory) | 494μs | 110.45% | 2,021.74 |
| Knex SQLite (file) | 1ms | -8.09% | 882.93 |
| Knex-Postgresql | 1ms | -40.21% | 574.36 |
| Knex-MySQL | 1ms | -47.01% | 509.02 |
| Knex-MySQL2 | 1ms | -42.88% | 548.77 |
| Knex-MSSQL | 3ms | -69.33% | 294.64 |

![chart](https://image-charts.com/chart?chs=999x500&chtt=Entity%20replacing%7C%28ops%2Fsec%29&chf=b0%2Clg%2C90%2C03a9f4%2C0%2C3f51b5%2C1&chg=0%2C50&chma=0%2C0%2C10%2C10&cht=bvs&chxt=x%2Cy&chxs=0%2C333%2C10%7C1%2C333%2C10&chxl=0%3A%7CNeDB%20%28memory%29%7CNeDB%20%28file%29%7CMongoDB%7CKnex%20SQLite%20%28memory%29%7CKnex%20SQLite%20%28file%29%7CKnex-Postgresql%7CKnex-MySQL%7CKnex-MySQL2%7CKnex-MSSQL&chd=a%3A9009.546620972105%2C3867.015660911488%2C960.6792772878351%2C2021.7428370165912%2C882.9282891389659%2C574.3568718475913%2C509.0175623872692%2C548.7654314883487%2C294.64313885063603)

## Entity deleting

### Result


| Adapter config | Time | Diff | ops/sec |
| -------------- | ----:| ----:| -------:|
| NeDB (memory) | 121μs | 260.39% | 8,250.58 |
| NeDB (file) | 197μs | 120.64% | 5,051.19 |
| MongoDB | 436μs | 0% | 2,289.33 |
| Knex SQLite (memory) | 532μs | -17.98% | 1,877.8 |
| Knex SQLite (file) | 2ms | -82.24% | 406.66 |
| Knex-Postgresql | 276μs | 58.08% | 3,618.92 |
| Knex-MySQL | 375μs | 16.21% | 2,660.39 |
| Knex-MySQL2 | 296μs | 47.13% | 3,368.36 |
| Knex-MSSQL | 663μs | -34.14% | 1,507.66 |

![chart](https://image-charts.com/chart?chs=999x500&chtt=Entity%20deleting%7C%28ops%2Fsec%29&chf=b0%2Clg%2C90%2C03a9f4%2C0%2C3f51b5%2C1&chg=0%2C50&chma=0%2C0%2C10%2C10&cht=bvs&chxt=x%2Cy&chxs=0%2C333%2C10%7C1%2C333%2C10&chxl=0%3A%7CNeDB%20%28memory%29%7CNeDB%20%28file%29%7CMongoDB%7CKnex%20SQLite%20%28memory%29%7CKnex%20SQLite%20%28file%29%7CKnex-Postgresql%7CKnex-MySQL%7CKnex-MySQL2%7CKnex-MSSQL&chd=a%3A8250.58181312016%2C5051.193714817109%2C2289.3286373670912%2C1877.8013606392412%2C406.65670456990205%2C3618.9222634124653%2C2660.3850547020875%2C3368.36217193332%2C1507.6594063492773)

--------------------
_Generated at 2022-01-30T14:18:18.063Z_