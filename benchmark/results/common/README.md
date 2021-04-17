# Benchmark results

## Entity creation (1000)

### Result

| Adapter config | Time | ops/sec |
| -------------- | ----:| -------:|
| NeDB-memory | 50μs | 19940.81 |
| MongoDB | 364μs | 2742.52 |
| Knex-SQLite-Memory | 306μs | 3266.13 |

![chart](https://image-charts.com/chart?chs=800x450&chtt=Entity%20creation%20%281000%29%7C%28ops%2Fsec%29&chf=b0%2Clg%2C90%2C03a9f4%2C0%2C3f51b5%2C1&chg=0%2C50&chl=%7C%7C%7C%7C%2033%25%20%21%7Cx2%20&chma=0%2C0%2C10%2C10&cht=bvs&chxt=x%2Cy&chxl=0%3A%7CNeDB-memory%7CMongoDB%7CKnex-SQLite-Memory&chd=a%3A19940.80611586119%2C2742.5229720076013%2C3266.1293281929325)

## Entity finding (1000)

### Result

| Adapter config | Time | ops/sec |
| -------------- | ----:| -------:|
| NeDB-memory | 155μs | 6443.75 |
| MongoDB | 433μs | 2309.07 |
| Knex-SQLite-Memory | 300μs | 3330.49 |

![chart](https://image-charts.com/chart?chs=800x450&chtt=Entity%20finding%20%281000%29%7C%28ops%2Fsec%29&chf=b0%2Clg%2C90%2C03a9f4%2C0%2C3f51b5%2C1&chg=0%2C50&chl=%7C%7C%7C%7C%2033%25%20%21%7Cx2%20&chma=0%2C0%2C10%2C10&cht=bvs&chxt=x%2Cy&chxl=0%3A%7CNeDB-memory%7CMongoDB%7CKnex-SQLite-Memory&chd=a%3A6443.7486324119845%2C2309.0690457056357%2C3330.485180771095)

## Entity listing (1000)

### Result

| Adapter config | Time | ops/sec |
| -------------- | ----:| -------:|
| NeDB-memory | 1ms | 993.20 |
| MongoDB | 1ms | 847.82 |
| Knex-SQLite-Memory | 422μs | 2366.00 |

![chart](https://image-charts.com/chart?chs=800x450&chtt=Entity%20listing%20%281000%29%7C%28ops%2Fsec%29&chf=b0%2Clg%2C90%2C03a9f4%2C0%2C3f51b5%2C1&chg=0%2C50&chl=%7C%7C%7C%7C%2033%25%20%21%7Cx2%20&chma=0%2C0%2C10%2C10&cht=bvs&chxt=x%2Cy&chxl=0%3A%7CNeDB-memory%7CMongoDB%7CKnex-SQLite-Memory&chd=a%3A993.204257899787%2C847.8229812003185%2C2365.9978661065247)

## Entity counting (1000)

### Result

| Adapter config | Time | ops/sec |
| -------------- | ----:| -------:|
| NeDB-memory | 790μs | 1264.54 |
| MongoDB | 583μs | 1714.09 |
| Knex-SQLite-Memory | 120μs | 8271.44 |

![chart](https://image-charts.com/chart?chs=800x450&chtt=Entity%20counting%20%281000%29%7C%28ops%2Fsec%29&chf=b0%2Clg%2C90%2C03a9f4%2C0%2C3f51b5%2C1&chg=0%2C50&chl=%7C%7C%7C%7C%2033%25%20%21%7Cx2%20&chma=0%2C0%2C10%2C10&cht=bvs&chxt=x%2Cy&chxl=0%3A%7CNeDB-memory%7CMongoDB%7CKnex-SQLite-Memory&chd=a%3A1264.5425100649531%2C1714.08710872605%2C8271.444384235769)

## Entity getting (1000)

### Result

| Adapter config | Time | ops/sec |
| -------------- | ----:| -------:|
| NeDB-memory | 27μs | 36452.56 |
| MongoDB | 241μs | 4147.93 |
| Knex-SQLite-Memory | 148μs | 6718.50 |

![chart](https://image-charts.com/chart?chs=800x450&chtt=Entity%20getting%20%281000%29%7C%28ops%2Fsec%29&chf=b0%2Clg%2C90%2C03a9f4%2C0%2C3f51b5%2C1&chg=0%2C50&chl=%7C%7C%7C%7C%2033%25%20%21%7Cx2%20&chma=0%2C0%2C10%2C10&cht=bvs&chxt=x%2Cy&chxl=0%3A%7CNeDB-memory%7CMongoDB%7CKnex-SQLite-Memory&chd=a%3A36452.56395980816%2C4147.926188009021%2C6718.501220939395)

## Entity resolving (1000)

### Result

| Adapter config | Time | ops/sec |
| -------------- | ----:| -------:|
| NeDB-memory | 26μs | 37229.11 |
| MongoDB | 239μs | 4166.71 |
| Knex-SQLite-Memory | 144μs | 6907.65 |

![chart](https://image-charts.com/chart?chs=800x450&chtt=Entity%20resolving%20%281000%29%7C%28ops%2Fsec%29&chf=b0%2Clg%2C90%2C03a9f4%2C0%2C3f51b5%2C1&chg=0%2C50&chl=%7C%7C%7C%7C%2033%25%20%21%7Cx2%20&chma=0%2C0%2C10%2C10&cht=bvs&chxt=x%2Cy&chxl=0%3A%7CNeDB-memory%7CMongoDB%7CKnex-SQLite-Memory&chd=a%3A37229.11166875449%2C4166.7146169539255%2C6907.648468721833)

## Entity updating (1000)

### Result

| Adapter config | Time | ops/sec |
| -------------- | ----:| -------:|
| NeDB-memory | 83μs | 11926.06 |
| MongoDB | 541μs | 1846.82 |
| Knex-SQLite-Memory | 437μs | 2287.50 |

![chart](https://image-charts.com/chart?chs=800x450&chtt=Entity%20updating%20%281000%29%7C%28ops%2Fsec%29&chf=b0%2Clg%2C90%2C03a9f4%2C0%2C3f51b5%2C1&chg=0%2C50&chl=%7C%7C%7C%7C%2033%25%20%21%7Cx2%20&chma=0%2C0%2C10%2C10&cht=bvs&chxt=x%2Cy&chxl=0%3A%7CNeDB-memory%7CMongoDB%7CKnex-SQLite-Memory&chd=a%3A11926.060334098243%2C1846.8228847358687%2C2287.495438591127)

## Entity replacing (1000)

### Result

| Adapter config | Time | ops/sec |
| -------------- | ----:| -------:|
| NeDB-memory | 87μs | 11376.07 |
| MongoDB | 566μs | 1765.07 |
| Knex-SQLite-Memory | 455μs | 2197.41 |

![chart](https://image-charts.com/chart?chs=800x450&chtt=Entity%20replacing%20%281000%29%7C%28ops%2Fsec%29&chf=b0%2Clg%2C90%2C03a9f4%2C0%2C3f51b5%2C1&chg=0%2C50&chl=%7C%7C%7C%7C%2033%25%20%21%7Cx2%20&chma=0%2C0%2C10%2C10&cht=bvs&chxt=x%2Cy&chxl=0%3A%7CNeDB-memory%7CMongoDB%7CKnex-SQLite-Memory&chd=a%3A11376.068392444184%2C1765.0670977970399%2C2197.410703072142)

## Entity deleting (1000)

### Result

| Adapter config | Time | ops/sec |
| -------------- | ----:| -------:|
| NeDB-memory | 60μs | 16469.23 |
| MongoDB | 125μs | 7992.09 |
| Knex-SQLite-Memory | 72μs | 13824.77 |

![chart](https://image-charts.com/chart?chs=800x450&chtt=Entity%20deleting%20%281000%29%7C%28ops%2Fsec%29&chf=b0%2Clg%2C90%2C03a9f4%2C0%2C3f51b5%2C1&chg=0%2C50&chl=%7C%7C%7C%7C%2033%25%20%21%7Cx2%20&chma=0%2C0%2C10%2C10&cht=bvs&chxt=x%2Cy&chxl=0%3A%7CNeDB-memory%7CMongoDB%7CKnex-SQLite-Memory&chd=a%3A16469.225798541243%2C7992.087497837812%2C13824.77283421028)

--------------------
_Generated at 2021-04-17T11:04:29.014Z_