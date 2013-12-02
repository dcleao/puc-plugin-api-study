# PUC API study

A study on a possible set of technologies and interfaces for a new PUC API

The following main choices were taken:

## Use AMD modules
* use them anonymously, to favor portability.
* for every unit of functionality, like a JavaScript class and an utilities object.
* for more or less static configuration-like objects (like Visualization Types in the sample).
* for accessing i18n localized dictionaries (like in `vis-plugin/bar/type.js`: `'dojo/i18n!./nls/resources'`).
* use modules instead of JavaScript namespaces.
* no globally published stuff.
* easy to test stuff decoupled by design.
* drop `pen.define` and `pen.require` and embrace `define` and `require`
  (@codeoncoffee clarified that the reason for this is that
   dojo 1.6 already defines `define` and `require` with different meaning).

## Use DOJO 1.9
* AMD loader
  (@codeoncoffee clarified that some loader plugins currently
   used by/with `requirejs` are not compatible with the dolo loader,
   as the `AMD Loader Plugin` api, although similar, is not standardized).
* Use as needed, as all of it is implemented as a big collection of separate AMD modules.
* Fine OOP type system.
* `dojo/Deferred` and Promises for asynchronous programming.
* `dojo/Evented` for deriving classes that expose events.
* `dojo/on`, a single façade for consuming DOM or Evented objects' events.
* `dojo/i18n!` AMD loader plugin for localization.
* Works on Node and Rhino (which is nice in what CGG is concerned, cause it uses Rhino).
* Has a very nice documentation, for its core parts.
* Not a very strong loop/iteration library...
  (@codeoncoffee said that _underscore.js_ is chosen as a functional library,
   filling in this gap)
* Can still prefer using _jQuery_ for all DOM-related stuff.
* Would make it easier to integrate with or upgrade existing DOJO code.

## Each pentaho plugin
* (much like in the existing system)
* would contain a `plugin.js` file with an AMD module.
* would be automatically "required".
* would register for desired notifications from within the module construction.

## The special `pentaho/context!` AMD loader plugin
* gives access to "the whole of pentaho/PUC".
* resolves to a context-aware `PentahoContext` object (aware of the location where it was "required" from).
* has methods to obtain and register `services` (a la `angular` services) and/or AMD resources.
* has methods to register for PUC notifications.
* the only service-like thing provided through the AMD loader.
* everything-else that "looks like a service" would be registered in the pentaho context.

## Example use of pentaho context object
```javascript
define([
   'pentaho/context!'
], function(context) {

    context
    // Listen to `user-logon` events
    .on('user-logon', function(userInfo) {
        console.log("Welcome " + userInfo.name + "!");
    })
    // React to a document having been saved
    .on('document-saved', function(docInfo) {

    })
    // Register service factories (possibly with dependencies on *other services* and/or AMD resources).
    .factory('pentaho:puc:IPerspective', function() {
        return { /* ... */};
    });

    // Require a service type and execute something with registered instances:
    context
    .apply(['pentaho:puc:IPerspective*'], function(perspectives) {
        // ...
    });
})
```

# Installing

Execute:
```
$ npm install
$ bower install
```

To run the unit tests:
```
$ karma start
```

Then, in another prompt execute:
```
$ karma run
```
