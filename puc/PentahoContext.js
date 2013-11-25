define([
    'dojo/_base/declare',
    'dojo/Evented',
    'dojo/Deferred',
    'dojo/when',
    'dojo/promise/all'
],
function(declare, Evented, Deferred, when, all) {

    var PentahoContext = declare([Evented], {
        constructor: function(parent, contextualRequire) {
            this.parent = parent || null;
            this.root   = parent ? parent.root : this;

            /*global require:true */
            this.require = contextualRequire || require;

            // path -> registrations object
            this._registrationsByPath  = {};
        },

        /**
         * Resolves the specified service and/or resource dependencies
         * and returns a promise for the array of resolved values.
         *
         * Dependencies are specified as an array of dependency path strings.
         * These can represent a service or a resource,
         * depending on the path prefix `service::` or `resource::`
         * being specified, respectively.
         * When a path prefix is not present, `service::` is assumed.
         *
         * By convention, _service dependency paths_ use `:` to separate its components,
         * like, for example, `pentaho:visualization:IVisualizationType`.
         *
         * _Resource dependency paths_ are composed by the `resource::` prefix
         * followed by any valid AMD path.
         * For relative AMD paths, like, for example, `resource::./bar/foo`,
         * the current directory is that of the script that initially requested
         * the "pentaho/context!" plugin.
         *
         * @param {Array.<*>} deps an array of dependency paths.
         * @param {object} [locals] a map of service dependency names to instances,
         *   to be used instead of the context-resolved values.
         *
         * @returns {Promise.<Array<*>>} a promise for an array with the
         * values of the requested dependencies.
         */
        resolve: function(deps, locals) {
            if(!deps) throw new Error("Argument 'deps' is required.");
            var resolve = new Resolve(this, locals);
            return deps.map ? resolve.paths(deps) : resolve.path(deps);
        },

        /**
         * Creates a function that, *whenever* called,
         * resolves the specified dependencies and
         * then calls `f`, with these as first arguments,
         * followed by any other per-call specified ones.
         * The wrapped function returns a Promise for
         * `f`'s return value.
         *
         * @param {Array.<*>} deps an array of dependency paths.
         * @param {object} [locals] a map of service dependency names to instances,
         *   to be used instead of the context-resolved values.
         * @param {function} f the function to call with the resolved dependencies.
         * The function is evaluated with the JS global object as `this`.
         *
         * @return {function} the created function.
         *
         * @see #resolve
         * @see #apply
         */
        bind: function(deps, locals, f) {
            // Although this could be implemented by using #apply,
            // it's actually more efficient to do it this way.
            if(arguments.length === 2) f = locals, locals = null;
            if(!f) throw new Error("Argument 'f' is required.");
            var ctx = this;
            return function() {
                var args = A_slice.call(arguments); // really need to copy?
                return ctx
                    .resolve(deps, locals)
                    .then(args.length
                        ? function(vals) { return f.apply(null, vals); } // call -> apply
                        : function(vals) { return f.apply(null, vals.concat(args)); });
            };
        },

        /**
         * Resolves the specified dependencies and
         * calls the specified function with them.
         * Returns a promise of the function's return value.
         *
         * @param {Array.<*>} deps a non-empty array of dependency paths.
         * @param {object} [locals] a map of service dependency names to instances,
         *   to be used instead of the context-resolved values.
         * @param {function} f the function to call with the resolved dependencies.
         * The function is evaluated with the JS global object as `this`.
         *
         * @return {Promise} a promise to `f`'s returned value.
         */
        apply: function(deps, locals, f) {
            if(arguments.length === 2) f = locals, locals = null;
            if(!f) throw new Error("Argument 'f' is required.");
            return this
                .resolve(deps, locals)
                .then(function(vals) { return f.apply(null, vals); });
        },

        // In the spirit of angular's $provider service's methods.

        /**
         * Registers a service by specifying its name,
         * dependencies and factory function.
         *
         * @param {string} name the name of the service.
         * @param {Array.<*>} [deps] an array of dependency paths.
         * @param {function} factory the factory function.
         * The factory function is evaluated with the JS global object as `this`.
         * @return {PentahoContext} the PentahoContext instance.
         */
        factory: function(name, deps, factory) {
            if(!name) throw new Error("Argument 'name' is required.");
            if(arguments.length === 2) factory = deps, deps = null;

            if(!factory) throw new Error("Argument 'factory' is required.");

            var reg = {
                promise: null,
                factory: factory,
                deps:    deps && deps.length ? deps : null,
                next:    null
            };

            var key = '\0' + name;
            var registrations = this._registrationsByPath[key];
            if(!registrations) {
                this._registrationsByPath[key] = {allPromise: null, first: reg, last: reg};
            } else {
                registrations.last.next = reg;
                registrations.last = reg;
            }

            return this;
        },

        /**
         * Registers a service by specifying its name,
         * dependencies and the corresponding type's constructor function.
         *
         * @param {string} name the name of the service.
         * @param {Array.<*>} [deps] an array of dependency paths.
         * @param {function} ctor the type's constructor function.
         * @return {PentahoContext} the PentahoContext instance.
         */
        type: function(name, deps, ctor) {
            // TODO: make the heart of it
            if(arguments.length === 2) ctor = deps, deps = null;
            if(!ctor) throw new Error("Argument 'ctor' is required.");

            var factory = function() {
                var instance = Object.create(ctor.prototype);
                var result = ctor.apply(instance, arguments);
                return result !== undefined ? result : instance;
            };

            return this.factory(name, deps, factory);
        },

        /**
         * Registers a service by specifying its name and value.
         *
         * @param {string} name the name of the service.
         * @param {*} value the service value.
         * @return {PentahoContext} the PentahoContext instance.
         */
        value: function(name, value) {
            return this.factory(name, null, function() { return value; });
        }
    });

    // --------------

    var Resolve = function(context, locals) {
        this.context = context;
        this.locals  = locals;
        this.resolvingPaths = {};
    };

    Resolve.prototype.paths = function(deps) {
        return all(deps.map(this.path, this));
    };

    Resolve.prototype.path = function(path) {
        if(!path) throw new Error("Empty service path.");

        // Parse the path
        var isAll = path.charAt(path.length - 1) === '*';
        if(isAll) { path = path.substr(0, path.length - 1); }

        var key = '\0' + path;

        if(this.resolvingPaths[key])
            throw new Error("Recursive dependency found which includes '" + path + "'.");

        this.resolvingPaths[key] = 1;

        // TODO: detect resource:: and service::
        var defer;
        var locals = this.locals;
        if(locals && O_hasOwn.call(locals, path)) {
            // Care about isAll?
            defer = new Deferred();
            defer.resolve(locals[path]);
            return defer.promise;
        }

        var registrations = this.context._registrationsByPath[key];
        if(!registrations)
            throw new Error("There are no services registered with name '" + path + "'.");

        /*
          registrations =
          {
            first: {promise:, factory:, deps:, next: },
            last:  idem
          }
        */

        // assert registrations.first && registrations.last;

        if(isAll) {
            var allPromise = registrations.allPromise;
            if(!allPromise) {
                var defer = new Deferred();
                registrations.allPromise = allPromise = defer.promise;
                chainPromiseToDeferred(this.registrations(registrations), defer);
            }

            return allPromise;
        }

        return this.registration(registrations.last);
    };

    Resolve.prototype.registration = function(reg) {
        var promise = reg.promise;
        if(!promise) {
            var defer = new Deferred();
            reg.promise = promise = defer.promise;

            var factory = reg.factory;
            if(!factory) {
                promise.resolve(undefined);
            } else {
                // Release memory
                reg.factory = null;

                var waitOn;

                // Evaluate dependencies
                var paths = reg.deps;
                if(paths) {
                    // assert paths.length

                    // Release memory
                    reg.deps = null;

                    waitOn = this.paths(paths)
                        .then(function(deps) { return factory.apply(null, deps); });
                } else {
                    waitOn = factory();
                }

                chainPromiseToDeferred(waitOn, defer);
            }
        }

        return promise;
    };

    Resolve.prototype.registrations = functions(regs) {
        var promises = [];
        var reg = regs.first;
        do { promises.push(this.registration(reg)); } while((reg = reg.next));
        return all(promises);
    };

    var chainPromiseToDeferred = function(promiseOrValue, defer) {
        when(promiseOrValue,
            function(value) { defer.resolve(value); },
            function(err  ) { defer.reject(err);    });
    };

    // --------------

    // UTIL
    var O_hasOwn = Object.prototype.hasOwnProperty;
    var A_slice  = Array.prototype.slice;

    return PentahoContext;
});