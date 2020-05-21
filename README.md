# action-s3-cache

Cache artifacts using S3.

## Usage

```
on: push

jobs:
  build:
    runs-on: ubuntu-latest

    steps:
    - uses: actions/checkout@v2

    - uses: papix/action-cache-s3@v0.0.1
      env:
        AWS_ACCESS_KEY_ID: ${{ secrets.AWS_ACCESS_KEY_ID }}
        AWS_SECRET_ACCESS_KEY: ${{ secrets.AWS_SECRET_ACCESS_KEY }}
        AWS_DEFAULT_REGION: ap-northeast-1
      with:
        bucket: cache-s3-test-bucket
        key: node_modules-${{ hashFiles('package.json') }}
        path: node_modules
```
