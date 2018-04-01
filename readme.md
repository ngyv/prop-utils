# prop-utils [![Build Status](https://travis-ci.org/ngyv/prop-utils.svg?branch=master)](https://travis-ci.org/ngyv/prop-utils)

> Utility functions for properties management


## Install

```
$ npm i @ngyv/prop-utils --save
```


## Usage

```js
import { types, identify, compareType, isEqual } from '@ngyv/prop-utils'
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

compareType(propertyA, propertyB);
//=> true

isEqual(propertyA, propertyB);
//=> false
```


## License

MIT © [Yvonne Ng](http://github.com/ngyv)
