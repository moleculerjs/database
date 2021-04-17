<!-- THIS PAGE IS GENERATED. DO NOT EDIT MANUALLY! -->

# Moleculer Database benchmark - Transformation benchmark
This is a tranformation benchmark. It tests all service methods with and without transformation.
## Entity creation

### Result


| Adapter config | Time | Diff | ops/sec |
| -------------- | ----:| ----:| -------:|
| Without transform | 41μs | 0% | 24,036.38 |
| With transform | 50μs | -17.25% | 19,889.77 |

![chart](https://image-charts.com/chart?chs=800x450&chtt=Entity%20creation%7C%28ops%2Fsec%29&chf=b0%2Clg%2C90%2C03a9f4%2C0%2C3f51b5%2C1&chg=0%2C50&chl=%7C%7C%7C%7C%2033%25%20%21%7Cx2%20&chma=0%2C0%2C10%2C10&cht=bvs&chxt=x%2Cy&chxl=0%3A%7CWithout%20transform%7CWith%20transform&chd=a%3A24036.377651944746%2C19889.767333258915)

## Entity listing

### Result


| Adapter config | Time | Diff | ops/sec |
| -------------- | ----:| ----:| -------:|
| Without transform | 109μs | 0% | 9,137.29 |
| With transform | 138μs | -20.82% | 7,235.03 |

![chart](https://image-charts.com/chart?chs=800x450&chtt=Entity%20listing%7C%28ops%2Fsec%29&chf=b0%2Clg%2C90%2C03a9f4%2C0%2C3f51b5%2C1&chg=0%2C50&chl=%7C%7C%7C%7C%2033%25%20%21%7Cx2%20&chma=0%2C0%2C10%2C10&cht=bvs&chxt=x%2Cy&chxl=0%3A%7CWithout%20transform%7CWith%20transform&chd=a%3A9137.28805092012%2C7235.028613951545)

## Entity counting

### Result


| Adapter config | Time | Diff | ops/sec |
| -------------- | ----:| ----:| -------:|
| Without transform | 520μs | 0% | 1,922.24 |

![chart](https://image-charts.com/chart?chs=800x450&chtt=Entity%20counting%7C%28ops%2Fsec%29&chf=b0%2Clg%2C90%2C03a9f4%2C0%2C3f51b5%2C1&chg=0%2C50&chl=%7C%7C%7C%7C%2033%25%20%21%7Cx2%20&chma=0%2C0%2C10%2C10&cht=bvs&chxt=x%2Cy&chxl=0%3A%7CWithout%20transform&chd=a%3A1922.2377184483805)

## Entity getting

### Result


| Adapter config | Time | Diff | ops/sec |
| -------------- | ----:| ----:| -------:|
| Without transform | 11μs | 0% | 84,762.82 |
| With transform | 18μs | -36.45% | 53,868.41 |
| Direct adapter access | 11μs | 5.91% | 89,775.6 |

![chart](https://image-charts.com/chart?chs=800x450&chtt=Entity%20getting%7C%28ops%2Fsec%29&chf=b0%2Clg%2C90%2C03a9f4%2C0%2C3f51b5%2C1&chg=0%2C50&chl=%7C%7C%7C%7C%2033%25%20%21%7Cx2%20&chma=0%2C0%2C10%2C10&cht=bvs&chxt=x%2Cy&chxl=0%3A%7CWithout%20transform%7CWith%20transform%7CDirect%20adapter%20access&chd=a%3A84762.82174102102%2C53868.4102367001%2C89775.60078721806)

## Entity updating

### Result


| Adapter config | Time | Diff | ops/sec |
| -------------- | ----:| ----:| -------:|
| Without transform | 59μs | 0% | 16,887.58 |
| With transform | 67μs | -12.81% | 14,724.68 |

![chart](https://image-charts.com/chart?chs=800x450&chtt=Entity%20updating%7C%28ops%2Fsec%29&chf=b0%2Clg%2C90%2C03a9f4%2C0%2C3f51b5%2C1&chg=0%2C50&chl=%7C%7C%7C%7C%2033%25%20%21%7Cx2%20&chma=0%2C0%2C10%2C10&cht=bvs&chxt=x%2Cy&chxl=0%3A%7CWithout%20transform%7CWith%20transform&chd=a%3A16887.576367733764%2C14724.682952205807)

## Entity replacing

### Result


| Adapter config | Time | Diff | ops/sec |
| -------------- | ----:| ----:| -------:|
| Without transform | 60μs | 0% | 16,468.36 |
| With transform | 68μs | -11.77% | 14,530.44 |

![chart](https://image-charts.com/chart?chs=800x450&chtt=Entity%20replacing%7C%28ops%2Fsec%29&chf=b0%2Clg%2C90%2C03a9f4%2C0%2C3f51b5%2C1&chg=0%2C50&chl=%7C%7C%7C%7C%2033%25%20%21%7Cx2%20&chma=0%2C0%2C10%2C10&cht=bvs&chxt=x%2Cy&chxl=0%3A%7CWithout%20transform%7CWith%20transform&chd=a%3A16468.36049305961%2C14530.441610668313)

## Entity deleting

### Result


| Adapter config | Time | Diff | ops/sec |
| -------------- | ----:| ----:| -------:|
| Without transform | 47μs | 0% | 20,937.85 |
| With transform | 111μs | -56.97% | 9,008.74 |

![chart](https://image-charts.com/chart?chs=800x450&chtt=Entity%20deleting%7C%28ops%2Fsec%29&chf=b0%2Clg%2C90%2C03a9f4%2C0%2C3f51b5%2C1&chg=0%2C50&chl=%7C%7C%7C%7C%2033%25%20%21%7Cx2%20&chma=0%2C0%2C10%2C10&cht=bvs&chxt=x%2Cy&chxl=0%3A%7CWithout%20transform%7CWith%20transform&chd=a%3A20937.852336436918%2C9008.743135358583)

--------------------
_Generated at 2021-04-17T13:38:35.595Z_