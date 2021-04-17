<!-- THIS PAGE IS GENERATED. DO NOT EDIT MANUALLY! -->
# Benchmark results (common)

## Entity creation (1000)
This test calls the `users.create` service action to create an entity.

### Result

| Adapter config | Time | ops/sec |
| -------------- | ----:| -------:|
| NeDB-memory | 50μs | 19925.73 |
| MongoDB | 350μs | 2849.90 |
| Knex-SQLite-Memory | 304μs | 3279.63 |

![chart](https://image-charts.com/chart?chs=800x450&chtt=Entity%20creation%20%281000%29%7C%28ops%2Fsec%29&chf=b0%2Clg%2C90%2C03a9f4%2C0%2C3f51b5%2C1&chg=0%2C50&chl=%7C%7C%7C%7C%2033%25%20%21%7Cx2%20&chma=0%2C0%2C10%2C10&cht=bvs&chxt=x%2Cy&chxl=0%3A%7CNeDB-memory%7CMongoDB%7CKnex-SQLite-Memory&chd=a%3A19925.728437323007%2C2849.895491482432%2C3279.6288318113293)

## Entity finding (1000)
This test calls the `users.find` service action to get random 20 entities.

### Result

| Adapter config | Time | ops/sec |
| -------------- | ----:| -------:|
| NeDB-memory | 156μs | 6382.59 |
| MongoDB | 446μs | 2240.99 |
| Knex-SQLite-Memory | 298μs | 3348.46 |

![chart](https://image-charts.com/chart?chs=800x450&chtt=Entity%20finding%20%281000%29%7C%28ops%2Fsec%29&chf=b0%2Clg%2C90%2C03a9f4%2C0%2C3f51b5%2C1&chg=0%2C50&chl=%7C%7C%7C%7C%2033%25%20%21%7Cx2%20&chma=0%2C0%2C10%2C10&cht=bvs&chxt=x%2Cy&chxl=0%3A%7CNeDB-memory%7CMongoDB%7CKnex-SQLite-Memory&chd=a%3A6382.5900813832095%2C2240.9916481866076%2C3348.4625406215287)

## Entity listing (1000)
This test calls the `users.list` service action to random 20 entities.

### Result

| Adapter config | Time | ops/sec |
| -------------- | ----:| -------:|
| NeDB-memory | 1ms | 980.24 |
| MongoDB | 1ms | 842.43 |
| Knex-SQLite-Memory | 431μs | 2317.23 |

![chart](https://image-charts.com/chart?chs=800x450&chtt=Entity%20listing%20%281000%29%7C%28ops%2Fsec%29&chf=b0%2Clg%2C90%2C03a9f4%2C0%2C3f51b5%2C1&chg=0%2C50&chl=%7C%7C%7C%7C%2033%25%20%21%7Cx2%20&chma=0%2C0%2C10%2C10&cht=bvs&chxt=x%2Cy&chxl=0%3A%7CNeDB-memory%7CMongoDB%7CKnex-SQLite-Memory&chd=a%3A980.2440245000145%2C842.4315379211848%2C2317.226446783504)

## Entity counting (1000)
This test calls the `users.count` service action to get the number of entities.

### Result

| Adapter config | Time | ops/sec |
| -------------- | ----:| -------:|
| NeDB-memory | 761μs | 1313.73 |
| MongoDB | 581μs | 1720.05 |
| Knex-SQLite-Memory | 121μs | 8230.41 |

![chart](https://image-charts.com/chart?chs=800x450&chtt=Entity%20counting%20%281000%29%7C%28ops%2Fsec%29&chf=b0%2Clg%2C90%2C03a9f4%2C0%2C3f51b5%2C1&chg=0%2C50&chl=%7C%7C%7C%7C%2033%25%20%21%7Cx2%20&chma=0%2C0%2C10%2C10&cht=bvs&chxt=x%2Cy&chxl=0%3A%7CNeDB-memory%7CMongoDB%7CKnex-SQLite-Memory&chd=a%3A1313.731582550854%2C1720.0498141715516%2C8230.41267763982)

## Entity getting (1000)
This test calls the `users.get` service action to get a random entity.

### Result

| Adapter config | Time | ops/sec |
| -------------- | ----:| -------:|
| NeDB-memory | 26μs | 38082.04 |
| MongoDB | 248μs | 4030.68 |
| Knex-SQLite-Memory | 148μs | 6743.62 |

![chart](https://image-charts.com/chart?chs=800x450&chtt=Entity%20getting%20%281000%29%7C%28ops%2Fsec%29&chf=b0%2Clg%2C90%2C03a9f4%2C0%2C3f51b5%2C1&chg=0%2C50&chl=%7C%7C%7C%7C%2033%25%20%21%7Cx2%20&chma=0%2C0%2C10%2C10&cht=bvs&chxt=x%2Cy&chxl=0%3A%7CNeDB-memory%7CMongoDB%7CKnex-SQLite-Memory&chd=a%3A38082.043156246116%2C4030.68309521913%2C6743.622239101553)

## Entity resolving (1000)
This test calls the `users.resolve` service action to resolve a random entity.

### Result

| Adapter config | Time | ops/sec |
| -------------- | ----:| -------:|
| NeDB-memory | 27μs | 36188.79 |
| MongoDB | 246μs | 4061.18 |
| Knex-SQLite-Memory | 147μs | 6790.78 |

![chart](https://image-charts.com/chart?chs=800x450&chtt=Entity%20resolving%20%281000%29%7C%28ops%2Fsec%29&chf=b0%2Clg%2C90%2C03a9f4%2C0%2C3f51b5%2C1&chg=0%2C50&chl=%7C%7C%7C%7C%2033%25%20%21%7Cx2%20&chma=0%2C0%2C10%2C10&cht=bvs&chxt=x%2Cy&chxl=0%3A%7CNeDB-memory%7CMongoDB%7CKnex-SQLite-Memory&chd=a%3A36188.7949548843%2C4061.1824484667854%2C6790.784092411859)

## Entity updating (1000)
This test calls the `users.update` service action to update a entity.

### Result

| Adapter config | Time | ops/sec |
| -------------- | ----:| -------:|
| NeDB-memory | 84μs | 11784.91 |
| MongoDB | 563μs | 1774.83 |
| Knex-SQLite-Memory | 441μs | 2267.00 |

![chart](https://image-charts.com/chart?chs=800x450&chtt=Entity%20updating%20%281000%29%7C%28ops%2Fsec%29&chf=b0%2Clg%2C90%2C03a9f4%2C0%2C3f51b5%2C1&chg=0%2C50&chl=%7C%7C%7C%7C%2033%25%20%21%7Cx2%20&chma=0%2C0%2C10%2C10&cht=bvs&chxt=x%2Cy&chxl=0%3A%7CNeDB-memory%7CMongoDB%7CKnex-SQLite-Memory&chd=a%3A11784.908246499534%2C1774.8280048691026%2C2267.0045032344206)

## Entity replacing (1000)
This test calls the `users.replace` service action to replace a random entity.

### Result

| Adapter config | Time | ops/sec |
| -------------- | ----:| -------:|
| NeDB-memory | 87μs | 11483.88 |
| MongoDB | 571μs | 1751.07 |
| Knex-SQLite-Memory | 458μs | 2182.14 |

![chart](https://image-charts.com/chart?chs=800x450&chtt=Entity%20replacing%20%281000%29%7C%28ops%2Fsec%29&chf=b0%2Clg%2C90%2C03a9f4%2C0%2C3f51b5%2C1&chg=0%2C50&chl=%7C%7C%7C%7C%2033%25%20%21%7Cx2%20&chma=0%2C0%2C10%2C10&cht=bvs&chxt=x%2Cy&chxl=0%3A%7CNeDB-memory%7CMongoDB%7CKnex-SQLite-Memory&chd=a%3A11483.876647087383%2C1751.0659370688304%2C2182.1360306703587)

## Entity deleting (1000)
This test calls the `users.remove` service action to delete a random entity.

### Result

| Adapter config | Time | ops/sec |
| -------------- | ----:| -------:|
| NeDB-memory | 61μs | 16257.57 |
| MongoDB | 123μs | 8101.43 |
| Knex-SQLite-Memory | 72μs | 13736.09 |

![chart](https://image-charts.com/chart?chs=800x450&chtt=Entity%20deleting%20%281000%29%7C%28ops%2Fsec%29&chf=b0%2Clg%2C90%2C03a9f4%2C0%2C3f51b5%2C1&chg=0%2C50&chl=%7C%7C%7C%7C%2033%25%20%21%7Cx2%20&chma=0%2C0%2C10%2C10&cht=bvs&chxt=x%2Cy&chxl=0%3A%7CNeDB-memory%7CMongoDB%7CKnex-SQLite-Memory&chd=a%3A16257.565251593727%2C8101.43256599204%2C13736.086232352603)

--------------------
_Generated at 2021-04-17T11:21:10.370Z_