<!-- THIS PAGE IS GENERATED. DO NOT EDIT MANUALLY! -->

# Moleculer Database benchmark - Transformation benchmark
This is a transformation benchmark. It tests all service methods with and without transformation.
## Entity creation

### Result


| Adapter config | Time | Diff | ops/sec |
| -------------- | ----:| ----:| -------:|
| Without transform | 55μs | 0% | 18,168.9 |
| With transform | 52μs | 4.99% | 19,076.02 |

![chart](https://image-charts.com/chart?chs=800x450&chtt=Entity%20creation%7C%28ops%2Fsec%29&chf=b0%2Clg%2C90%2C03a9f4%2C0%2C3f51b5%2C1&chg=0%2C50&chma=0%2C0%2C10%2C10&cht=bvs&chxt=x%2Cy&chxl=0%3A%7CWithout%20transform%7CWith%20transform&chd=a%3A18168.900293367842%2C19076.019228229965)

## Entity listing

### Result


| Adapter config | Time | Diff | ops/sec |
| -------------- | ----:| ----:| -------:|
| Without transform | 131μs | 0% | 7,591.59 |
| With transform | 148μs | -11.38% | 6,727.93 |

![chart](https://image-charts.com/chart?chs=800x450&chtt=Entity%20listing%7C%28ops%2Fsec%29&chf=b0%2Clg%2C90%2C03a9f4%2C0%2C3f51b5%2C1&chg=0%2C50&chma=0%2C0%2C10%2C10&cht=bvs&chxt=x%2Cy&chxl=0%3A%7CWithout%20transform%7CWith%20transform&chd=a%3A7591.591553195681%2C6727.932672707071)

## Entity counting

### Result


| Adapter config | Time | Diff | ops/sec |
| -------------- | ----:| ----:| -------:|
| Without transform | 726μs | 0% | 1,376.87 |

![chart](https://image-charts.com/chart?chs=800x450&chtt=Entity%20counting%7C%28ops%2Fsec%29&chf=b0%2Clg%2C90%2C03a9f4%2C0%2C3f51b5%2C1&chg=0%2C50&chma=0%2C0%2C10%2C10&cht=bvs&chxt=x%2Cy&chxl=0%3A%7CWithout%20transform&chd=a%3A1376.8735905731837)

## Entity getting

### Result


| Adapter config | Time | Diff | ops/sec |
| -------------- | ----:| ----:| -------:|
| Without transform | 21μs | 0% | 46,501.41 |
| With transform | 28μs | -25.63% | 34,581.01 |
| Direct adapter access | 20μs | 7.33% | 49,908.36 |

![chart](https://image-charts.com/chart?chs=800x450&chtt=Entity%20getting%7C%28ops%2Fsec%29&chf=b0%2Clg%2C90%2C03a9f4%2C0%2C3f51b5%2C1&chg=0%2C50&chma=0%2C0%2C10%2C10&cht=bvs&chxt=x%2Cy&chxl=0%3A%7CWithout%20transform%7CWith%20transform%7CDirect%20adapter%20access&chd=a%3A46501.41142760411%2C34581.00678348184%2C49908.36425056682)

## Entity updating

### Result


| Adapter config | Time | Diff | ops/sec |
| -------------- | ----:| ----:| -------:|
| Without transform | 93μs | 0% | 10,694.34 |
| With transform | 99μs | -6.38% | 10,011.73 |

![chart](https://image-charts.com/chart?chs=800x450&chtt=Entity%20updating%7C%28ops%2Fsec%29&chf=b0%2Clg%2C90%2C03a9f4%2C0%2C3f51b5%2C1&chg=0%2C50&chma=0%2C0%2C10%2C10&cht=bvs&chxt=x%2Cy&chxl=0%3A%7CWithout%20transform%7CWith%20transform&chd=a%3A10694.336321073446%2C10011.729428104494)

## Entity replacing

### Result


| Adapter config | Time | Diff | ops/sec |
| -------------- | ----:| ----:| -------:|
| Without transform | 93μs | 0% | 10,662.15 |
| With transform | 100μs | -7.11% | 9,904.25 |

![chart](https://image-charts.com/chart?chs=800x450&chtt=Entity%20replacing%7C%28ops%2Fsec%29&chf=b0%2Clg%2C90%2C03a9f4%2C0%2C3f51b5%2C1&chg=0%2C50&chma=0%2C0%2C10%2C10&cht=bvs&chxt=x%2Cy&chxl=0%3A%7CWithout%20transform%7CWith%20transform&chd=a%3A10662.152232432549%2C9904.24653682173)

## Entity deleting

### Result


| Adapter config | Time | Diff | ops/sec |
| -------------- | ----:| ----:| -------:|
| Without transform | 51μs | 0% | 19,603.08 |
| With transform | 183μs | -72.15% | 5,459.5 |

![chart](https://image-charts.com/chart?chs=800x450&chtt=Entity%20deleting%7C%28ops%2Fsec%29&chf=b0%2Clg%2C90%2C03a9f4%2C0%2C3f51b5%2C1&chg=0%2C50&chma=0%2C0%2C10%2C10&cht=bvs&chxt=x%2Cy&chxl=0%3A%7CWithout%20transform%7CWith%20transform&chd=a%3A19603.075297822932%2C5459.497019815262)

--------------------
_Generated at 2021-05-10T16:10:04.759Z_