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

const getPropertyTypeName = function(property) {
  const type = identify(property);
  return getTypeName(type);
}

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

/* * * * * * *
 *   Helpers
 * * * * * * */
function _compareTypes(typeA, typeB, sameTypes = {}, propertyA, propertyB) {
  if (typeA === typeB) {
    if (typeA === types.class && propertyA && propertyB) {
      return propertyA.constructor.name === propertyB.constructor.name;
    }
    return true;
  }

  if (Object.keys(sameTypes).length === 0) {
    return false;
  }
  let typeKeyA;
  let typeKeyB;
  let foundMatch = false
  Object.keys(sameTypes).forEach((key) => {
    if (foundMatch) { return }
    const similar = sameTypes[key];
    if (similar.indexOf(typeA) > -1) {
      typeKeyA = key;
    }
    if (similar.indexOf(typeB) > -1) {
      typeKeyB = key;
    }
    if (typeKeyA && typeKeyB) { foundMatch = true }
  });
  return foundMatch && typeKeyA === typeKeyB;
}


const compareObjectWithKeys = function(propertyA, propertyB, relevantKeys = []) {
  const keysA = Object.keys(propertyA);
  const keysB = Object.keys(propertyB);
  const moreKeys = keysA.length > keysB.length ? keysA : keysB;
  const iteratorKeys = relevantKeys.length ? relevantKeys : moreKeys
  let allSame = true
  iteratorKeys.forEach((key) => {
    if (!allSame) { return }
    allSame = isEqual(propertyA[key], propertyB[key])
  });
  return allSame
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
  return _compareTypes(typeA, typeB, sameTypes, propertyA, propertyB);
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

const comparePropertyToType = function(property, type, sameTypes = {}) {
  const propertyType = identify(property);
  return _compareTypes(propertyType, type, sameTypes);
};

const parseValueToType = function(value, type) {
  const valueType = identify(value);
  const isUnparsable = !comparePropertyToType(type, types.number);
  if (!isUnparsable && valueType !== type && valueType !== types.undefined && valueType !== types.null) {
    const strValue = value.toString();
    switch(type) {
      case types.number:
        let tryNumber = new Number(strValue).valueOf();
        return isNaN(tryNumber) ? value : tryNumber;
      case types.object:
      case types.array:
      case types.boolean:
        return JSON.parse(strValue);
      case types.date:
        return new Date(strValue);
    }
  }
  return value;
};

const parseJson = function(modelJson, attributeTypes) {
  Object.keys(modelJson).forEach((key) => {
    let value = modelJson[key];
    modelJson[key] = parseValueToType(value, attributeTypes[key]);
  });
  return modelJson;
};

module.exports = {
  types,
  getTypeName,
  getPropertyTypeName,
  identify,
  compareObjectWithKeys,
  compareValue,
  compareType,
  isEqual,
  comparePropertyToType,
  parseValueToType,
  parseJson,
}
