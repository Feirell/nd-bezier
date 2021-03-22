### `97bd59ceb1fe7d52645093a79cc3ba05ad5ff564`

```text
Creation speed
                   name     ops/sec     MoE samples
ProducedBezier Generic    9,974,613 ± 0.78%      90
ProducedBezier Specific     259,425 ± 0.47%      93
                 Bezier 687,557,324 ± 0.53%      87
              ND Bezier 676,423,784  ± 0.9%      90
           Cubic Bezier 678,533,852 ± 1.37%      90
At speed
                   name     ops/sec     MoE samples
ProducedBezier Generic   56,898,368 ± 0.33%      87
ProducedBezier Specific 694,696,764 ± 0.34%      91
                 Bezier   8,920,163 ± 0.34%      89
              ND Bezier   2,546,229 ± 0.57%      89
           Cubic Bezier  19,353,505 ± 0.63%      91
```

```text
Creation speed
            name ops/sec     MoE samples
 produce-generic 401,126 ± 0.59%      92
produce-specific 150,801 ± 0.42%      96
     nd-iterativ 377,414 ± 0.68%      91
        nd-cubic 418,826 ± 0.44%      92
     2d-iterativ 400,586 ± 0.43%      94
At speed
            name    ops/sec     MoE samples
 produce-generic  3,522,472 ± 0.44%      95
produce-specific 30,702,477 ± 0.39%      95
     nd-iterativ  1,936,785 ± 0.58%      92
        nd-cubic  3,526,484 ± 0.52%      93
     2d-iterativ  3,239,002 ± 0.54%      98
```

```
create-at
             name ops/sec     MoE samples
 produced-generic 430,469 ± 0.47%      90
produced-specific 143,194 ± 0.49%      89
      nd-iterativ 402,654  ± 1.4%      93
         nd-cubic 449,023  ± 0.3%      93
      2d-iterativ 439,093 ± 0.39%      91

at
             name    ops/sec     MoE samples
 produced-generic  3,621,272 ± 0.39%      92
produced-specific 34,888,106 ± 0.34%      90
      nd-iterativ  2,026,051  ± 0.4%      91
         nd-cubic  3,620,254 ± 0.28%      92
      2d-iterativ  3,279,738 ± 0.26%      91
```

### v0.1.0

```text
create-at
             name ops/sec     MoE samples
 produced-generic 401,281 ± 0.36%      89
produced-specific 140,400 ± 0.17%      94
      nd-iterativ 368,200 ± 0.37%      92
         nd-cubic 394,002 ± 1.14%      93
      2d-iterativ 388,142 ± 1.12%      92

at
             name    ops/sec     MoE samples
 produced-generic  2,461,096 ± 0.16%      94
produced-specific 33,330,328 ± 0.21%      92
      nd-iterativ  1,630,860 ± 0.15%      93
         nd-cubic  2,457,887 ± 0.16%      94
      2d-iterativ  2,496,713 ± 0.17%      92

t-search
         name ops/sec     MoE samples
binary-search 150,140 ± 0.22%      92
deterministic 686,417 ± 0.37%      89
```

### 5eb0b4c71c1be98093d191c86c6f78854bd88428

```text
t-search
         name   ops/sec     MoE samples relative
BINARY_SEARCH    46,854 2.11%      87        1
DETERMENISTIC   737,776 2.19%      87    15.75
 StaticBezier 5,887,353 0.97%      87   125.65
create-at
             name ops/sec     MoE samples relative
         ND_CUBIC 310,642 0.99%      88     2.51
      ND_ITERATIV 273,720  3.7%      85     2.21
 PRODUCED_GENERIC 296,904 1.26%      89      2.4
PRODUCED_SPECIFIC 123,638 1.25%      82        1
     StaticBezier 222,810 1.12%      86      1.8

at
             name     ops/sec     MoE samples relative
         ND_CUBIC   2,086,300 5.44%      90     2.93
      ND_ITERATIV     711,596 3.59%      82        1
 PRODUCED_GENERIC   1,116,198 4.04%      87     1.57
PRODUCED_SPECIFIC  29,393,698 0.83%      87    41.31
     StaticBezier 683,538,754 0.95%      87   960.57

t-search
         name   ops/sec     MoE samples relative
BINARY_SEARCH    46,854 2.11%      87        1
DETERMENISTIC   737,776 2.19%      87    15.75
 StaticBezier 5,533,541 0.96%      88    118.1
```

```text
                        ops/sec  MoE samples relative
create at
  ND_CUBIC              317,121 2.40      85     2.37
  ND_ITERATIV           309,222 0.70      89     2.31
  PRODUCED_GENERIC      307,770 1.07      87     2.30
  PRODUCED_SPECIFIC     133,996 1.15      92     1.00
  StaticBezier          237,678 1.44      92     1.77
at
  ND_CUBIC            2,345,753 0.92      87     2.88
  ND_ITERATIV           813,642 1.85      93     1.00
  PRODUCED_GENERIC    1,248,760 0.85      92     1.53
  PRODUCED_SPECIFIC  31,032,972 2.11      84    38.14
  StaticBezier      725,993,015 0.71      90   892.28
t-search
  BINARY_SEARCH          48,225 1.00      93     1.00
  DETERMENISTIC         806,258 0.95      90    16.72
  StaticBezier        2,904,049 1.48      90    60.22
```

With the new runner on the laptop (node 12)

```text
                        ops/sec  MoE samples relative
create at
  ND_CUBIC              318,236 5.55      81     1.78
  ND_ITERATIV           307,839 1.13      88     1.72
  PRODUCED_GENERIC      320,982 1.08      88     1.80
  PRODUCED_SPECIFIC     178,495 1.05      92     1.00
  StaticBezier          324,084 1.13      91     1.82
at
  ND_CUBIC            2,960,096 1.61      88     2.91
  ND_ITERATIV         1,018,199 0.92      93     1.00
  PRODUCED_GENERIC  468,023,171 1.44      92   459.66
  PRODUCED_SPECIFIC 539,029,293 0.67      95   529.39
  bezier            218,055,964 5.09      83   214.16
  StaticBezier      539,438,031 0.75      94   529.80
t-search
  BINARY_SEARCH          61,225 1.24      90     1.00
  DETERMENISTIC         952,550 1.01      88    15.56
  StaticBezier        3,694,882 1.34      89    60.35
```

Release 1.0.0 on laptop with node 12

```text
                   ops/sec  MoE samples relative
create
  StaticBezier     374,601 1.74      79     1.00
at
  bezier       242,542,915 1.49      90     1.00
  StaticBezier 511,091,959 3.28      92     2.11
tSearch
  StaticBezier  10,902,462 4.24      83     1.00
```

```text
                            ops/sec  MoE samples relative
create
  bezier
    just prepare        102,606,329 0.54      95     1.82
    with at call         56,440,504 0.69      93     1.00
  StaticBezier
    just prepare        674,961,397 0.64      84 4,198.16
    with at call            160,775 0.96      90     1.00
  new StaticBezier
    just prepare        569,116,279 0.44      95 2,319.18
    with at call            245,395 1.24      84     1.00
  new DynamicBezier
    one time generation   7,442,498 0.66      92     1.00
    just prepare        718,223,924 0.22      97    96.50
    with at call         29,816,670 1.87      89     4.01
at
  bezier
    different values     91,475,989 3.81      89     1.00
    same value          712,090,482 0.56      97     7.78
  StaticBezier
    different values    356,510,694 0.50      96     1.00
    same value          726,582,836 0.43      97     2.04
  new StaticBezier
    different values    356,688,823 0.66      95     1.00
    same value          734,018,611 0.30      98     2.06
  new DynamicBezier
    different values     25,565,441 0.68      95     1.00
    same value           38,408,268 0.46      94     1.50
tSearch
  StaticBezier
    different values     10,099,626 0.40      95     1.00
    same value           12,232,872 0.96      89     1.21
  new StaticBezier
    different values      8,964,652 0.32      96     1.00
    same value           10,303,002 0.35      96     1.15
  new DynamicBezier
    different values      7,735,209 1.03      92     1.00
    same value            9,743,949 0.26      97     1.26
direction
  StaticBezier
    different values    437,773,110 0.35      97     1.00
    same value          719,520,578 0.63      96     1.64
  new StaticBezier
    different values    441,247,094 0.21      97     1.00
    same value          734,906,792 0.20      96     1.67
  new DynamicBezier
    different values     26,990,343 0.73      91     1.00
    same value           37,433,240 1.18      88     1.39
offset point
  StaticBezier
    different values    416,500,679 0.53      96     1.00
    same value          712,094,411 0.63      96     1.71
  new StaticBezier
    different values    409,007,704 1.00      93     1.00
    same value          713,123,229 0.64      89     1.74
  new DynamicBezier
    different values     13,061,666 0.47      96     1.00
    same value           14,332,017 0.74      95     1.10
```