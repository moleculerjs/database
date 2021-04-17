# Benchmark results

## Entity creation (1000)

### Result

| Adapter config | Time | ops/sec |
| -------------- | ----:| -------:|
| NeDB-memory | 54μs | 18287.38 |
| MongoDB | 114μs | 8767.74 |
| Knex-SQLite-Memory | 104μs | 9561.50 |

![chart](https://image-charts.com/chart?chs=800x450&chtt=Entity%20creation%20%281000%29%7C%28ops%2Fsec%29&chf=b0%2Clg%2C90%2C03a9f4%2C0%2C3f51b5%2C1&chg=0%2C50&chl=%7C%7C%7C%7C%2033%25%20%21%7Cx2%20&chma=0%2C0%2C10%2C10&cht=bvs&chxt=x%2Cy&chxl=0%3A%7CNeDB-memory%7CMongoDB%7CKnex-SQLite-Memory&chd=a%3A18287.378278116914%2C8767.740676374602%2C9561.495854282506)

## Entity finding (1000)

### Result

| Adapter config | Time | ops/sec |
| -------------- | ----:| -------:|
| NeDB-memory | 168μs | 5930.78 |
| MongoDB | 289μs | 3457.78 |
| Knex-SQLite-Memory | 268μs | 3722.24 |

![chart](https://image-charts.com/chart?chs=800x450&chtt=Entity%20finding%20%281000%29%7C%28ops%2Fsec%29&chf=b0%2Clg%2C90%2C03a9f4%2C0%2C3f51b5%2C1&chg=0%2C50&chl=%7C%7C%7C%7C%2033%25%20%21%7Cx2%20&chma=0%2C0%2C10%2C10&cht=bvs&chxt=x%2Cy&chxl=0%3A%7CNeDB-memory%7CMongoDB%7CKnex-SQLite-Memory&chd=a%3A5930.783134805969%2C3457.7764679020424%2C3722.2420647436907)

## Entity listing (1000)

### Result

| Adapter config | Time | ops/sec |
| -------------- | ----:| -------:|
| NeDB-memory | 746μs | 1339.51 |
| MongoDB | 842μs | 1187.63 |
| Knex-SQLite-Memory | 759μs | 1317.46 |

![chart](https://image-charts.com/chart?chs=800x450&chtt=Entity%20listing%20%281000%29%7C%28ops%2Fsec%29&chf=b0%2Clg%2C90%2C03a9f4%2C0%2C3f51b5%2C1&chg=0%2C50&chl=%7C%7C%7C%7C%2033%25%20%21%7Cx2%20&chma=0%2C0%2C10%2C10&cht=bvs&chxt=x%2Cy&chxl=0%3A%7CNeDB-memory%7CMongoDB%7CKnex-SQLite-Memory&chd=a%3A1339.5094670405658%2C1187.628779784468%2C1317.4643123257945)

## Entity counting (1000)

### Result

| Adapter config | Time | ops/sec |
| -------------- | ----:| -------:|
| NeDB-memory | 595μs | 1678.20 |
| MongoDB | 592μs | 1688.25 |
| Knex-SQLite-Memory | 676μs | 1477.31 |

![chart](https://image-charts.com/chart?chs=800x450&chtt=Entity%20counting%20%281000%29%7C%28ops%2Fsec%29&chf=b0%2Clg%2C90%2C03a9f4%2C0%2C3f51b5%2C1&chg=0%2C50&chl=%7C%7C%7C%7C%2033%25%20%21%7Cx2%20&chma=0%2C0%2C10%2C10&cht=bvs&chxt=x%2Cy&chxl=0%3A%7CNeDB-memory%7CMongoDB%7CKnex-SQLite-Memory&chd=a%3A1678.1955061851322%2C1688.2498150522329%2C1477.3137059404114)

## Entity getting (1000)

### Result

| Adapter config | Time | ops/sec |
| -------------- | ----:| -------:|
| NeDB-memory | 28μs | 35227.31 |
| MongoDB | 23μs | 42699.78 |
| Knex-SQLite-Memory | 35μs | 28477.99 |

![chart](https://image-charts.com/chart?chs=800x450&chtt=Entity%20getting%20%281000%29%7C%28ops%2Fsec%29&chf=b0%2Clg%2C90%2C03a9f4%2C0%2C3f51b5%2C1&chg=0%2C50&chl=%7C%7C%7C%7C%2033%25%20%21%7Cx2%20&chma=0%2C0%2C10%2C10&cht=bvs&chxt=x%2Cy&chxl=0%3A%7CNeDB-memory%7CMongoDB%7CKnex-SQLite-Memory&chd=a%3A35227.30938145098%2C42699.78190388031%2C28477.98550155886)

## Entity resolving (1000)

### Result

| Adapter config | Time | ops/sec |
| -------------- | ----:| -------:|
| NeDB-memory | 28μs | 35431.54 |
| MongoDB | 23μs | 42055.81 |
| Knex-SQLite-Memory | 27μs | 35829.56 |

![chart](https://image-charts.com/chart?chs=800x450&chtt=Entity%20resolving%20%281000%29%7C%28ops%2Fsec%29&chf=b0%2Clg%2C90%2C03a9f4%2C0%2C3f51b5%2C1&chg=0%2C50&chl=%7C%7C%7C%7C%2033%25%20%21%7Cx2%20&chma=0%2C0%2C10%2C10&cht=bvs&chxt=x%2Cy&chxl=0%3A%7CNeDB-memory%7CMongoDB%7CKnex-SQLite-Memory&chd=a%3A35431.537206113506%2C42055.81417286833%2C35829.55878884148)

## Entity updating (1000)

### Result

| Adapter config | Time | ops/sec |
| -------------- | ----:| -------:|
| NeDB-memory | 84μs | 11881.95 |
| MongoDB | 82μs | 12103.98 |
| Knex-SQLite-Memory | 83μs | 12011.21 |

![chart](https://image-charts.com/chart?chs=800x450&chtt=Entity%20updating%20%281000%29%7C%28ops%2Fsec%29&chf=b0%2Clg%2C90%2C03a9f4%2C0%2C3f51b5%2C1&chg=0%2C50&chl=%7C%7C%7C%7C%2033%25%20%21%7Cx2%20&chma=0%2C0%2C10%2C10&cht=bvs&chxt=x%2Cy&chxl=0%3A%7CNeDB-memory%7CMongoDB%7CKnex-SQLite-Memory&chd=a%3A11881.952796589494%2C12103.975050572293%2C12011.210436820355)

## Entity replacing (1000)

### Result

| Adapter config | Time | ops/sec |
| -------------- | ----:| -------:|
| NeDB-memory | 84μs | 11812.15 |
| MongoDB | 82μs | 12115.40 |
| Knex-SQLite-Memory | 82μs | 12057.76 |

![chart](https://image-charts.com/chart?chs=800x450&chtt=Entity%20replacing%20%281000%29%7C%28ops%2Fsec%29&chf=b0%2Clg%2C90%2C03a9f4%2C0%2C3f51b5%2C1&chg=0%2C50&chl=%7C%7C%7C%7C%2033%25%20%21%7Cx2%20&chma=0%2C0%2C10%2C10&cht=bvs&chxt=x%2Cy&chxl=0%3A%7CNeDB-memory%7CMongoDB%7CKnex-SQLite-Memory&chd=a%3A11812.152284824195%2C12115.397936325759%2C12057.764914569101)

## Entity deleting (1000)

### Result

| Adapter config | Time | ops/sec |
| -------------- | ----:| -------:|
| NeDB-memory | 60μs | 16620.85 |
| MongoDB | 60μs | 16527.42 |
| Knex-SQLite-Memory | 62μs | 15982.54 |

![chart](https://image-charts.com/chart?chs=800x450&chtt=Entity%20deleting%20%281000%29%7C%28ops%2Fsec%29&chf=b0%2Clg%2C90%2C03a9f4%2C0%2C3f51b5%2C1&chg=0%2C50&chl=%7C%7C%7C%7C%2033%25%20%21%7Cx2%20&chma=0%2C0%2C10%2C10&cht=bvs&chxt=x%2Cy&chxl=0%3A%7CNeDB-memory%7CMongoDB%7CKnex-SQLite-Memory&chd=a%3A16620.85332970673%2C16527.424930809037%2C15982.53968662155)

--------------------
_Generated at 2021-04-17T10:37:52.947Z_