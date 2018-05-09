import test from 'ava';
import utils from '.';

test('Property types is immutable', t => {
  const { types } = utils;
  t.is(types.null, 2);
  const error = t.throws(() => {
    types.null = 0;
  }, TypeError);

  t.is(error.message, 'Cannot assign to read only property \'null\' of object \'#<Object>\'');
});

test('Gets correct name from identified type', t => {
  const { getTypeName, types } = utils;
  t.is(getTypeName(types.string), 'string');
});

test('Gets correct type name from property', t => {
  const { getPropertyTypeName } = utils;
  t.is(getPropertyTypeName(1), 'number');
});

test('Identifies properties accurately', t => {
  const { identify, types } = utils;
  class Custom {}
  const properties = {
    'undefined': undefined,
    'null': null,
    'emptyString': '',
    'boolean': true,
    'string': 'Not empty',
    'number': 0,
    'array': new Array(),
    'date': new Date(),
    'object': { name: 'Simple object' },
    'class': new Custom(),
    'function': function func() {},
  };
  Object.keys(properties).forEach((key) => {
    t.is(identify(properties[key]), types[key], `Identifies "${key}"`);
  });
});

test('Compares types correctly in happy path', t => {
  const { compareType, types } = utils;
  class Custom {
    constructor(name) {
      this.name = name;
    }
  }
  const properties = {
    'undefined': [undefined, undefined],
    'null': [null, null],
    'emptyString': ['',''],
    'boolean': [true, false],
    'string': ['Not empty', 'String'],
    'number': [1, 2],
    'array': [[1],  ['s']],
    'date': [new Date(), new Date()],
    'object': [{ name: 'Simple object' }, { type: 'Complex'}],
    'class': [new Custom('Kenya'), new Custom('Atom')],
    'function': [function fun() {}, function stuff() {}],
  };
  Object.keys(properties).forEach((key) => {
    t.is(compareType(properties[key][0], properties[key][1]), true, `Identifies "${key}"`);
  });
});

test('Compares custom classes properly', t => {
  const { compareType, types } = utils;
  class B1 {}
  class B2 {}
  const b1 = new B1();
  const b2 = new B2();
  t.is(compareType(b1, b2), false);
});

test('Compares similar types using sameTypes option', t => {
  const { compareType, types } = utils;
  const similar = { nil: [types.undefined, types.emptyString] };
  t.is(compareType(undefined, '', similar), true);
});

test('Compares values negation', t => {
  const { compareValue } = utils;
  class B1 {}
  class B2 {}
  const properties = {
    'undefined': [undefined, null],
    'null': [null, ''],
    'emptyString': ['', 'No'],
    'boolean': [true, false],
    'string': ['Not empty', 'String'],
    'number': [1, 2],
    'array': [[1], ['s']],
    'date': [new Date(), new Date(0)],
    'object': [{ name: 'Simple object' }, { type: 'Complex' }],
    'class': [new B1(), new B2()],
    'function': [function a(){}, function b(){}],
  };
  Object.keys(properties).forEach((key) => {
    t.is(compareValue(properties[key][0], properties[key][1]), false, `Compares "${properties[key][0]}" and "${properties[key][1]}"`);
  });
});

test('Compares values happy path', t => {
  const { compareValue } = utils;
  class Custom {
    constructor(name) {
      this.name = name;
    }
  }
  const now = new Date();
  const func = function() { return 'tion'; }
  const properties = {
    'undefined': [undefined, undefined],
    'null': [null, null],
    'emptyString': ['',''],
    'boolean': [true, true],
    'string': ['String', 'String'],
    'number': [1, 1],
    'array': [[2],  [2]],
    'date': [new Date(now.valueOf()), new Date(now.valueOf())],
    'object': [{ type: 'Simple' }, { type: 'Simple' }],
    'class': [new Custom('Atom'), new Custom('Atom')],
    'function': [func, func],
  };
  Object.keys(properties).forEach((key) => {
    t.is(compareValue(properties[key][0], properties[key][1]), true, `Compares "${key}"`);
  });
});

test('Compares class values correctly', t => {
  const { compareValue, types } = utils;
  class Banana {
    shout() {
      return 'HELLO!';
    }
  }
  class B1 extends Banana {}
  class B2 extends Banana {}
  const b1 = new B1();
  const b2 = new B2();
  t.is(compareValue(b1, b2), false, 'Different classes when no classComparator provided');
  const options = {
    classComparator: function(b1, b2) {
      return b1.shout() === b2.shout();
    }
  };
  t.is(compareValue(b1, b2, options), true, 'Same custom class when classComparator provided');
});

test('Compares object keys correctly', t => {
  t.plan(4);

  const { compareObjectWithKeys } = utils;
  const x = { name: 'Najib', occupation: 'robber', 'negara': 'Malaysia' }
  const y = { name: 'Mahathir', occupation: 'thief', 'negara': 'Malaysia' }
  const z = { name: 'Najib', occupation: 'thief', 'negara': 'Malaysia' }

  t.is(compareObjectWithKeys(x, x), true)
  t.is(compareObjectWithKeys(x, y), false)
  t.is(compareObjectWithKeys(x, y, ['negara']), true)
  t.is(compareObjectWithKeys(x, z), false)
});

test('Compares property to type provided correctly', t => {
  const { comparePropertyToType, types } = utils;
  const similar = { nil: [types.undefined, types.null, types.string] };
  t.is(comparePropertyToType('str', types.undefined), false, 'Comparing `str` to `type.undefined` returns false without sameTypes');
  t.is(comparePropertyToType('str', types.undefined, similar), true, 'Comparing `str` to `type.undefined` returns true with sameTypes');
});

test('Equates null and empty string properties', t => {
  const { isEqual } = utils;
  t.is(isEqual(null, ''), true);
});

test('Equates object properties', t => {
  const { isEqual } = utils;
  const propertyA = {
    name: 'Siti Nurhaliza',
  };
  const propertyB = {
    name: 'Siti Nurhaliza',
    age: 21,
  };
  t.is(isEqual(propertyA, propertyB), false);
});

test('Parses value to expected type', t => {
  t.plan(2);

  const { types, parseValueToType } = utils;

  t.is(parseValueToType('random', types.number), 'random', 'Returns original value if NaN for expected type number');
  t.is(parseValueToType('also random', types.date), 'also random', 'Returns original value if Invalid Date for expected type date');
});

test('Parses values to json type', t => {
  const { types, parseJson } = utils;
  const json = {
    'account_id': '1.1',
    'likes': '["to","be","tested"]',
    'is_happy': 'false',
    'updated_at': '2018-04-02T09:12:20.221Z',
    'name': 'Nina Nesbitt',
    'gender': undefined,
  }
  const expectedTypes = {
    account_id: types.number,
    likes: types.array,
    is_happy: types.boolean,
    updated_at: types.date,
    name: types.string,
    gender: types.string,
  }

  t.deepEqual(parseJson(json, expectedTypes), {
    account_id: 1.1,
    likes: ["to","be","tested"],
    is_happy: false,
    updated_at: new Date(json.updated_at),
    name: json.name,
    gender: undefined
  }, 'Parses json attributes based on described types');
});
