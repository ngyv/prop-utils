'use strict';

const types = Object.freeze({
  'undefined': 1,
  'null': 2,
  'emptyString': 3,
  'boolean': 4,
  'string': 5,
  'number': 6,
  'array': 7,
  'date': 8,
  'object': 9,
  'class': 10,
  'function': 11,
});

const getTypeName = function(type) {
  return Object.keys(types)[type - 1];
};

const identify = function(property) {
  if (typeof property === 'object') { // null, array, object
    if (property === null) {
      return types.null;
    } else {
      const primitiveType = types[property.constructor.name.toLowerCase()];
      if (primitiveType) {
        return primitiveType;
      } else {
        return types.class; // custom class
      }
    }
  } else if (typeof property === 'string' && property.length === 0) {
    return types.emptyString;
  } else {
    return types[typeof property];
  }
};

const compareObjectWithKeys = function(propertyA, propertyB, relevantKeys = []) {
  const keysA = Object.keys(propertyA);
  const keysB = Object.keys(propertyB);
  const moreKeys = keysA.length > keysB.length ? keysA : keysB;
  const iteratorKeys = relevantKeys.length ? relevantKeys : moreKeys
  return !iteratorKeys.some((key) => {
    return !isEqual(propertyA[key], propertyB[key])
  });
}

// Assumes the type is same / similar
// opts = { classComparator: function(propertyA, propertyB) {}}
// opts = { sameTypes: {} }
const compareValue = function(propertyA, propertyB, opts = {}) {
  const typeA = identify(propertyA);
  const typeB = identify(propertyB);

  // Simple value comparison
  if (typeA === types.string || typeA === types.number || typeA === types.boolean || typeA === types.function) {
    return propertyA === propertyB;
  }
  else if (typeA === types.array) {
    return propertyA.sort().toString() === propertyB.sort().toString();
  }
  else if (typeA === types.date) {
    return propertyA.valueOf() === propertyB.valueOf();
  }
  else if (typeA === types.object) {
    return compareObjectWithKeys(propertyA, propertyB)
  }
  else if (typeA === types.class) {
    if (opts.classComparator) {
      opts.classComparator(propertyA, propertyB);
    } else if (propertyA.constructor.name !== propertyB.constructor.name) {
      return false;
    }
    return compareObjectWithKeys(propertyA, propertyB)
  }
  return typeA === typeB;
};

const compareType = function(propertyA, propertyB, sameTypes = {}) {
  const typeA = identify(propertyA);
  const typeB = identify(propertyB);
  if (typeA === typeB) {
    if (typeA === types.class) {
      return propertyA.constructor.name === propertyB.constructor.name;
    }
    return true;
  }

  if (Object.keys(sameTypes).length === 0) {
    return false;
  }
  let typeKeyA;
  let typeKeyB;
  Object.keys(sameTypes).some((key) => {
    const similar = sameTypes[key];
    if (!typeKeyA && similar.indexOf(typeKeyA) > -1) {
      typeKeyA = key;
    }
    if (!typeKeyB && similar.indexOf(typeKeyB) > -1) {
      typeKeyB = key;
    }
    return typeKeyA && typeKeyB;
  });
  return typeKeyA === typeKeyB;
};

const isEqual = function(propertyA, propertyB) {
  const typeA = identify(propertyA);
  const typeB = identify(propertyB);

  // Treats `undefined`, `null`, and `emptyString` the same
  if ((typeA === types.undefined || typeA === types.null || typeA === types.emptyString) &&
      (typeB === types.undefined || typeB === types.null || typeB === types.emptyString)) {
    return true;
  }
  if (typeA === typeB) {
    return compareValue(propertyA, propertyB);
  }
  return false;
};

module.exports = {
  types,
  getTypeName,
  identify,
  compareObjectWithKeys,
  compareValue,
  compareType,
  isEqual,
}
