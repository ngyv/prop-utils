# prop-utils [![Build Status](https://travis-ci.org/ngyv/prop-utils.svg?branch=master)](https://travis-ci.org/ngyv/prop-utils) [![codecov](https://codecov.io/gh/ngyv/prop-utils/branch/master/graph/badge.svg)](https://codecov.io/gh/ngyv/prop-utils) [![npm download](https://img.shields.io/npm/dt/@ngyv/prop-utils.svg)](https://www.npmjs.com/package/@ngyv/prop-utils)  


> Utility functions for properties management


## Install

```
$ npm i @ngyv/prop-utils --save
```


## Usage

```js
import {
  types,
  getPropertyTypeName,
  identify,
  compareType,
  isEqual,
  parseValueToType,
  parseJson,
} from '@ngyv/prop-utils'

const propertyA = {
  name: 'Siti Nurhaliza',
  age: undefined,
};

const propertyB = {
  name: 'Siti Nurhaliza',
  age: 21,
};

identify(propertyA.age) === types.undefined;
//=> true

getPropertyTypeName(propertyA.name);
//=> 'string'

compareType(propertyA, propertyB);
//=> true

const similar = { nil: [types.undefined, types.null] };
compareType(undefined, null, similar);
//=> true

class Banana {
  shout() {
    return 'HELLO!';
  }
}
class B1 extends Banana {}
class B2 extends Banana {}
const b1 = new B1();
const b2 = new B2();
compareValue(b1, b2);
//=> false

compareValue(b1, b2, { classComparator: (b1, b2) => return b1.shout() === b2.shout() });
//=> true

comparePropertyToType('str', types.null);
//=> false

const acceptedTypes = { strings: [types.string, types.null, types.emptyString] };
comparePropertyToType('str', types.null, acceptedTypes);
//=> true

isEqual(propertyA, propertyB);
//=> false

parseValueToType('12.1', types.number);
//=> 12.1

parseValueToType(null, types.number);
//=> null

const json = {
  accountId: 1,
  createdAt: '2018-04-02T09:12:20.221Z',
}
const expectedTypes = {
  accountId: types.number,
  createdAt: types.date,
}

parseJson(json, expectedTypes);
//=> { accountId: 1, createdAt: Date 2018-04-02 09:12:20 221ms Z }
```


## License

MIT © [Yvonne Ng](http://github.com/ngyv)
