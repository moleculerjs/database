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
| NeDB (memory) | 99μs | 512.68% | 10,049.54 |
| NeDB (file) | 272μs | 123.49% | 3,665.81 |
| MongoDB | 609μs | 0% | 1,640.27 |
| Knex SQLite (memory) | 483μs | 26.14% | 2,069.01 |
| Knex SQLite (file) | 2ms | -75.88% | 395.58 |
| Knex-Postgresql | 1ms | -62.35% | 617.52 |
| Knex-MySQL | 2ms | -76.07% | 392.53 |
| Knex-MySQL2 | 2ms | -74.43% | 419.47 |
| Knex-MSSQL | 4ms | -85.56% | 236.86 |

![chart](https://image-charts.com/chart?chs=800x450&chtt=Entity%20creation%7C%28ops%2Fsec%29&chf=b0%2Clg%2C90%2C03a9f4%2C0%2C3f51b5%2C1&chg=0%2C50&chma=0%2C0%2C10%2C10&cht=bvs&chxt=x%2Cy&chxl=0%3A%7CNeDB%20%28memory%29%7CNeDB%20%28file%29%7CMongoDB%7CKnex%20SQLite%20%28memory%29%7CKnex%20SQLite%20%28file%29%7CKnex-Postgresql%7CKnex-MySQL%7CKnex-MySQL2%7CKnex-MSSQL&chd=a%3A10049.543952168371%2C3665.806791037236%2C1640.2701296505031%2C2069.005300775781%2C395.5795618498034%2C617.5170231739847%2C392.5337011786536%2C419.47253810771434%2C236.85696336903388)

## Entity finding

### Result


| Adapter config | Time | Diff | ops/sec |
| -------------- | ----:| ----:| -------:|
| NeDB (memory) | 324μs | 194.94% | 3,081.3 |
| NeDB (file) | 324μs | 195.17% | 3,083.71 |
| MongoDB | 957μs | 0% | 1,044.72 |
| Knex SQLite (memory) | 501μs | 90.84% | 1,993.77 |
| Knex SQLite (file) | 493μs | 94.07% | 2,027.45 |
| Knex-Postgresql | 696μs | 37.36% | 1,435.06 |
| Knex-MySQL | 949μs | 0.83% | 1,053.35 |
| Knex-MySQL2 | 869μs | 10.13% | 1,150.59 |
| Knex-MSSQL | 1ms | -35.64% | 672.35 |

![chart](https://image-charts.com/chart?chs=800x450&chtt=Entity%20finding%7C%28ops%2Fsec%29&chf=b0%2Clg%2C90%2C03a9f4%2C0%2C3f51b5%2C1&chg=0%2C50&chma=0%2C0%2C10%2C10&cht=bvs&chxt=x%2Cy&chxl=0%3A%7CNeDB%20%28memory%29%7CNeDB%20%28file%29%7CMongoDB%7CKnex%20SQLite%20%28memory%29%7CKnex%20SQLite%20%28file%29%7CKnex-Postgresql%7CKnex-MySQL%7CKnex-MySQL2%7CKnex-MSSQL&chd=a%3A3081.295058930725%2C3083.710197941274%2C1044.7175073204087%2C1993.7688721501004%2C2027.4508820727153%2C1435.057820988268%2C1053.3491129712008%2C1150.5901329042174%2C672.3536500000657)

## Entity listing

### Result


| Adapter config | Time | Diff | ops/sec |
| -------------- | ----:| ----:| -------:|
| NeDB (memory) | 1ms | 18.64% | 608.94 |
| NeDB (file) | 1ms | 24.09% | 636.91 |
| MongoDB | 1ms | 0% | 513.27 |
| Knex SQLite (memory) | 697μs | 179.25% | 1,433.32 |
| Knex SQLite (file) | 702μs | 177.31% | 1,423.37 |
| Knex-Postgresql | 1ms | 60.66% | 824.64 |
| Knex-MySQL | 2ms | -22.47% | 397.92 |
| Knex-MySQL2 | 2ms | -17.57% | 423.07 |
| Knex-MSSQL | 2ms | -22.58% | 397.36 |

![chart](https://image-charts.com/chart?chs=800x450&chtt=Entity%20listing%7C%28ops%2Fsec%29&chf=b0%2Clg%2C90%2C03a9f4%2C0%2C3f51b5%2C1&chg=0%2C50&chma=0%2C0%2C10%2C10&cht=bvs&chxt=x%2Cy&chxl=0%3A%7CNeDB%20%28memory%29%7CNeDB%20%28file%29%7CMongoDB%7CKnex%20SQLite%20%28memory%29%7CKnex%20SQLite%20%28file%29%7CKnex-Postgresql%7CKnex-MySQL%7CKnex-MySQL2%7CKnex-MSSQL&chd=a%3A608.9367306756712%2C636.9106416979439%2C513.2682109736655%2C1433.324029543447%2C1423.3692989659141%2C824.6385688400541%2C397.92375584542214%2C423.0688999928796%2C397.357380305283)

## Entity counting

### Result


| Adapter config | Time | Diff | ops/sec |
| -------------- | ----:| ----:| -------:|
| NeDB (memory) | 1ms | -21.41% | 822.85 |
| NeDB (file) | 1ms | -23.64% | 799.48 |
| MongoDB | 955μs | 0% | 1,046.98 |
| Knex SQLite (memory) | 160μs | 493.37% | 6,212.41 |
| Knex SQLite (file) | 177μs | 438.24% | 5,635.22 |
| Knex-Postgresql | 452μs | 111.28% | 2,212.05 |
| Knex-MySQL | 1ms | -44.87% | 577.19 |
| Knex-MySQL2 | 1ms | -44.69% | 579.08 |
| Knex-MSSQL | 950μs | 0.48% | 1,052.04 |

![chart](https://image-charts.com/chart?chs=800x450&chtt=Entity%20counting%7C%28ops%2Fsec%29&chf=b0%2Clg%2C90%2C03a9f4%2C0%2C3f51b5%2C1&chg=0%2C50&chma=0%2C0%2C10%2C10&cht=bvs&chxt=x%2Cy&chxl=0%3A%7CNeDB%20%28memory%29%7CNeDB%20%28file%29%7CMongoDB%7CKnex%20SQLite%20%28memory%29%7CKnex%20SQLite%20%28file%29%7CKnex-Postgresql%7CKnex-MySQL%7CKnex-MySQL2%7CKnex-MSSQL&chd=a%3A822.8498526369061%2C799.4751066014591%2C1046.9751144160493%2C6212.412687641028%2C5635.224034087177%2C2212.053484042995%2C577.1904486326007%2C579.0793462424655%2C1052.0394464813544)

## Entity getting

### Result


| Adapter config | Time | Diff | ops/sec |
| -------------- | ----:| ----:| -------:|
| NeDB (memory) | 46μs | 950.2% | 21,420.64 |
| NeDB (file) | 45μs | 980.66% | 22,041.94 |
| MongoDB | 490μs | 0% | 2,039.67 |
| Knex SQLite (memory) | 208μs | 135.15% | 4,796.32 |
| Knex SQLite (file) | 221μs | 121.31% | 4,513.93 |
| Knex-Postgresql | 549μs | -10.73% | 1,820.88 |
| Knex-MySQL | 555μs | -11.75% | 1,800.1 |
| Knex-MySQL2 | 453μs | 8.15% | 2,205.88 |
| Knex-MSSQL | 1ms | -51.01% | 999.18 |

![chart](https://image-charts.com/chart?chs=800x450&chtt=Entity%20getting%7C%28ops%2Fsec%29&chf=b0%2Clg%2C90%2C03a9f4%2C0%2C3f51b5%2C1&chg=0%2C50&chma=0%2C0%2C10%2C10&cht=bvs&chxt=x%2Cy&chxl=0%3A%7CNeDB%20%28memory%29%7CNeDB%20%28file%29%7CMongoDB%7CKnex%20SQLite%20%28memory%29%7CKnex%20SQLite%20%28file%29%7CKnex-Postgresql%7CKnex-MySQL%7CKnex-MySQL2%7CKnex-MSSQL&chd=a%3A21420.635223475292%2C22041.93663318725%2C2039.6745182489697%2C4796.322228078731%2C4513.932846921677%2C1820.879874822637%2C1800.0977186646774%2C2205.882417009085%2C999.1828910130994)

## Entity resolving

### Result


| Adapter config | Time | Diff | ops/sec |
| -------------- | ----:| ----:| -------:|
| NeDB (memory) | 47μs | 1,016.14% | 20,948.51 |
| NeDB (file) | 51μs | 937.3% | 19,468.71 |
| MongoDB | 532μs | 0% | 1,876.87 |
| Knex SQLite (memory) | 229μs | 132.17% | 4,357.57 |
| Knex SQLite (file) | 228μs | 133.52% | 4,382.83 |
| Knex-Postgresql | 603μs | -11.74% | 1,656.56 |
| Knex-MySQL | 616μs | -13.54% | 1,622.65 |
| Knex-MySQL2 | 474μs | 12.29% | 2,107.53 |
| Knex-MSSQL | 1ms | -51.25% | 915.04 |

![chart](https://image-charts.com/chart?chs=800x450&chtt=Entity%20resolving%7C%28ops%2Fsec%29&chf=b0%2Clg%2C90%2C03a9f4%2C0%2C3f51b5%2C1&chg=0%2C50&chma=0%2C0%2C10%2C10&cht=bvs&chxt=x%2Cy&chxl=0%3A%7CNeDB%20%28memory%29%7CNeDB%20%28file%29%7CMongoDB%7CKnex%20SQLite%20%28memory%29%7CKnex%20SQLite%20%28file%29%7CKnex-Postgresql%7CKnex-MySQL%7CKnex-MySQL2%7CKnex-MSSQL&chd=a%3A20948.50797664548%2C19468.714835807164%2C1876.8697125044646%2C4357.571083349707%2C4382.828515283406%2C1656.5561916171168%2C1622.648285517953%2C2107.5257560008954%2C915.0354200603233)

## Entity updating

### Result


| Adapter config | Time | Diff | ops/sec |
| -------------- | ----:| ----:| -------:|
| NeDB (memory) | 172μs | 570.74% | 5,804.16 |
| NeDB (file) | 358μs | 222.66% | 2,792.09 |
| MongoDB | 1ms | 0% | 865.33 |
| Knex SQLite (memory) | 640μs | 80.33% | 1,560.45 |
| Knex SQLite (file) | 1ms | -33.51% | 575.4 |
| Knex-Postgresql | 2ms | -42.56% | 497.04 |
| Knex-MySQL | 2ms | -53.09% | 405.9 |
| Knex-MySQL2 | 2ms | -47.29% | 456.13 |
| Knex-MSSQL | 3ms | -70.58% | 254.54 |

![chart](https://image-charts.com/chart?chs=800x450&chtt=Entity%20updating%7C%28ops%2Fsec%29&chf=b0%2Clg%2C90%2C03a9f4%2C0%2C3f51b5%2C1&chg=0%2C50&chma=0%2C0%2C10%2C10&cht=bvs&chxt=x%2Cy&chxl=0%3A%7CNeDB%20%28memory%29%7CNeDB%20%28file%29%7CMongoDB%7CKnex%20SQLite%20%28memory%29%7CKnex%20SQLite%20%28file%29%7CKnex-Postgresql%7CKnex-MySQL%7CKnex-MySQL2%7CKnex-MSSQL&chd=a%3A5804.1642232376735%2C2792.0932152956143%2C865.3321192128352%2C1560.4513793883339%2C575.3981172188761%2C497.0362938565888%2C405.896210880087%2C456.1299336910749%2C254.54127236755724)

## Entity replacing

### Result


| Adapter config | Time | Diff | ops/sec |
| -------------- | ----:| ----:| -------:|
| NeDB (memory) | 155μs | 627.91% | 6,414.07 |
| NeDB (file) | 347μs | 226.74% | 2,879.11 |
| MongoDB | 1ms | 0% | 881.16 |
| Knex SQLite (memory) | 677μs | 67.5% | 1,475.92 |
| Knex SQLite (file) | 1ms | -31.97% | 599.44 |
| Knex-Postgresql | 2ms | -44.99% | 484.75 |
| Knex-MySQL | 2ms | -53.79% | 407.22 |
| Knex-MySQL2 | 2ms | -48.66% | 452.37 |
| Knex-MSSQL | 4ms | -75.21% | 218.44 |

![chart](https://image-charts.com/chart?chs=800x450&chtt=Entity%20replacing%7C%28ops%2Fsec%29&chf=b0%2Clg%2C90%2C03a9f4%2C0%2C3f51b5%2C1&chg=0%2C50&chma=0%2C0%2C10%2C10&cht=bvs&chxt=x%2Cy&chxl=0%3A%7CNeDB%20%28memory%29%7CNeDB%20%28file%29%7CMongoDB%7CKnex%20SQLite%20%28memory%29%7CKnex%20SQLite%20%28file%29%7CKnex-Postgresql%7CKnex-MySQL%7CKnex-MySQL2%7CKnex-MSSQL&chd=a%3A6414.07051087189%2C2879.1099483574353%2C881.1597573066443%2C1475.9193705528292%2C599.4419441271373%2C484.75247259972036%2C407.216405443168%2C452.37026761782613%2C218.43930731218475)

## Entity deleting

### Result


| Adapter config | Time | Diff | ops/sec |
| -------------- | ----:| ----:| -------:|
| NeDB (memory) | 160μs | 33.88% | 6,225.31 |
| NeDB (file) | 262μs | -18.1% | 3,808.26 |
| MongoDB | 215μs | 0% | 4,649.93 |
| Knex SQLite (memory) | 409μs | -47.51% | 2,440.9 |
| Knex SQLite (file) | 1ms | -82.64% | 807.01 |
| Knex-Postgresql | 277μs | -22.46% | 3,605.39 |
| Knex-MySQL | 593μs | -63.74% | 1,686.06 |
| Knex-MySQL2 | 369μs | -41.84% | 2,704.26 |
| Knex-MSSQL | 1ms | -82.51% | 813.43 |

![chart](https://image-charts.com/chart?chs=800x450&chtt=Entity%20deleting%7C%28ops%2Fsec%29&chf=b0%2Clg%2C90%2C03a9f4%2C0%2C3f51b5%2C1&chg=0%2C50&chma=0%2C0%2C10%2C10&cht=bvs&chxt=x%2Cy&chxl=0%3A%7CNeDB%20%28memory%29%7CNeDB%20%28file%29%7CMongoDB%7CKnex%20SQLite%20%28memory%29%7CKnex%20SQLite%20%28file%29%7CKnex-Postgresql%7CKnex-MySQL%7CKnex-MySQL2%7CKnex-MSSQL&chd=a%3A6225.314334729921%2C3808.2615177230828%2C4649.927653045727%2C2440.902955528496%2C807.0109642486245%2C3605.3884910804477%2C1686.0631259948852%2C2704.2617482334535%2C813.4297978164504)

--------------------
_Generated at 2021-05-16T19:48:42.460Z_