# Express Locator

![GitHub last commit](https://img.shields.io/github/last-commit/rabidpug/express-locator.svg)
[![Build Status](https://ci.jcuneo.com/job/express-locator/job/master/badge/icon)](https://ci.jcuneo.com/job/express-locator/job/master/)
[![Coverage Status](https://coveralls.io/repos/github/rabidpug/express-locator/badge.svg)](https://coveralls.io/github/rabidpug/express-locator)

[![GitHub package version](https://img.shields.io/github/package-json/v/rabidpug/express-locator.svg)](https://github.com/rabidpug/express-locator/blob/master/CHANGELOG.md)
[![license](https://img.shields.io/github/license/mashape/apistatus.svg)](https://github.com/rabidpug/express-locator/blob/master/LICENSE)

[![npm](https://img.shields.io/npm/v/express-locator/latest.svg)](https://www.npmjs.com/package/express-locator)
[![npm downloads](https://img.shields.io/npm/dw/express-locator.svg)](https://www.npmjs.com/package/express-locator)

![GitHub repo size in bytes](https://img.shields.io/github/repo-size/badges/shields.svg)
[![npm bundle size (minified)](https://img.shields.io/bundlephobia/min/express-locator.svg)](https://www.npmjs.com/package/express-locator)

- [Usage](#usage)
- [Explanation](#explanation)
- [TODO](#todo)

**A service locator/Dependency injector for Node apps.**

```bash
npm install express-locator
```

OR

```bash
yarn add express-locator
```

## Usage

- [Initialising Locator](#initialising-locator)
- [Dependency Registration Object](#dependency-registration-object)
- [Configuration Object](#configuration-object)
- [Retrieving a Dependency](#retrieving-a-dependency)

### Initialising locator

You can either import expressLocator as a default import and access its methods, eg expressLocator.config(), or use named imports to import the method directly.

```javascript
import { config } from 'express-locator';

//OR

const { config } = require('express-locator');

config(configurations, ...dependencies);
```

### Dependency Registration Object

Each dependency registration should be either a string or an object. Multiple dependencies can be passed as either an array or additional arguments.

```javascript
type toRegisterType =
  | {
      name?: string,
      // the name of your dependency
      dependencies?: Array<string>,
      // an array of dependency names. Will be automatically assigned to 'this'
      // when extending the Instance class, otherwise passed as the second
      // paramater
      config?: boolean,
      // receive the entire config object in your construct function
      construct?: Function | Class<any> | string,
      // the function or class to be called to construct your dependency, or the
      // name of the node_module dependency to require()
      invoke?: boolean,
      // if true, caches the dependency immediately after registering all passed
      // dependencies
      instance?: boolean,
      // if true, will call the construct with new
      [key: string]: Function | Class<any> | string,
      // rather than using the props 'name' and 'construct', you can use
      // { dependencyName : construct }, where the key will be used as the
      // dependency name and the value as the construct function | class | string
    }
  | string
  // the name of the node_module dependency to require(). Will be registered
  // under that name
  | Array<toRegisterType>;
// an array of either of the above
```

If the provided construct is a Function or Class (Class must either extend the provided Instance class or the registration object must include instance = true), it will be called with the following arguments

```javascript
/**
 * @description configures and returns a dependency or class
 * @param {Class} expressLocator
 * @param {{}} config the relevant config (or entire config object if
 * config = true was included in the registration object)
 * @param {Class} ControlledError an Error object which includes an
 * isControlled = true property
 * @param {Array<string>} dependencies the array of dependency names you provided in
 * your registration object
 */

function dependencyConfigurator(expressLocator, config, ControlledError, dependencies) {
  //do stuff and return dependency
}

// or

class Dependency {
  constructor(expressLocator, config, ControlledError, dependencies) {
    // do stuff to initiate class
  }
}

// or

import { get } from 'express-locator';

const Instance = get('instance');

class Dependency extends Instance {
  someMethod() {
    this.expressLocator;
    // locator instance available
    this.ControlledError;
    // custom error constructor available
    this.config;
    // relevant config available
    this.someDependency;
    // dependencies specified in registration object available
  }
}
```

Dependencies can be registered in two ways.

```javascript
// passed as additional arguments to the config function
expressLocator.config(config, ...dependencies);

// OR calling expressLocator.register directly

expressLocator.register(...dependencies);
```

### Configuration Object

your config is simply an object with keys that match the dependency you want to recieve that config in their construct function.

for example

```javascript
const config = {
  server: {
    port: process.env.PORT || 8080,
  },
};

// elsewhere in your serverConstruct function

const serverConstruct = ({ get }, { port }) => {
  const server = get('http').createServer(expressLocator.get('app'));

  server.listen(port);

  return server;
};
```

### Retrieving a Dependency

_Be careful to not create a circular dependency in your construct functions. Having two contruct functions retrieve each other will never resolve, as the dependency will only be cached once the construct function returns a value._

```javascript
import { get } from 'express-locator'; //if not within a construct

const dependencyName = get('dependencyName');

// OR if the dependency is an object you can retrieve a nested property

const property = get('dependencyName.nested.property');
```

## Explanation

Express Locator is a simple Dependency Injector and Manager. By registering your dependencies, it will store a single intance and return that same instance every time it is retrieved.

While not exactly necessary in Node, it is a syntactical abstraction of dependency management which can clean up the need for the first view of your code to be a list of require()'s or imports
.

In future there will also be statistical logging added so you can check dependencies which are being underutilised.

## TODO

- Add option to log dependency usage statistics to determine unused/underutilised dependencies
- Add option to automatically register all dependencies in package.json
- config function to return a promise
- Add option to use asyncronous get function and support import() syntax in addition to require()
- finish JSDocs for Locator
