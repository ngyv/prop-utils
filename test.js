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

test('Gets correct type name', t => {
	const { getTypeName, types } = utils;
	t.is(getTypeName(types.string), 'string');
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
	};
	Object.keys(properties).forEach((key) => {
		t.is(compareValue(properties[key][0], properties[key][1]), true, `Compares "${key}"`);
	});
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
