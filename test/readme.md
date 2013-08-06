# Tests

This folder contains the tests.  The first time the tests are run they must be downloaded and extracted, which takes ages as they're huge.  Once extracted though, the tests run reasonably quickly.

To just check for regressions, ignoring any tests that have always failed, run:

```
node compliance
```

To debug a failing test run:

```
node compliance debug
```

This will cause the test runner to stop at the first error.

If you want to see why a test is failing, it has to first be removed from `failures.txt`.  Once you have fixed something and checked there are no regressions, you can run:

```
node compliance save
```

To update `failures.txt` with the new list of failing tests.