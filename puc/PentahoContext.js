define([
    'dojo/_base/declare',
    'dojo/Evented',
    'dojo/Deferred'
],
function(declare, Evented, Deferred) {

    var PentahoContext = declare([Evented], {
        constructor: function(parent, contextualRequire) {
            this.parent = parent || null;
            this.root   = parent ? parent.root : this;

            /*global require:true */
            this.require = contextualRequire || require;
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
         * @param {function} f the function.
         * @param {object} [locals] a map of service dependency names to instances,
         * to be used instead of the context-resolved values.
         *
         * @return {function} the created function.
         *
         * @see #resolve
         * @see #apply
         */
        bind: function(deps, f, locals) {
            // Although this could be implemented by using #apply,
            // it's actually more efficient to do it this way.
            var ctx = this;
            return function() {
                var args = A_slice.call(arguments); // really need to copy?
                var x = this;
                return ctx
                    .resolve(deps, locals)
                    .then(args.length
                        ? function(vals) { return f.apply(x, vals); } // call -> apply
                        : function(vals) { return f.apply(x, A_append(vals, args)));
            };
        },

        /**
         * Resolves the specified dependencies and
         * calls the specified function with them.
         * Returns a promise of the function's return value.
         *
         * @param {Array.<*>} deps a non-empty array of dependency paths.
         * @param {function} f the function to call with the resolved dependencies.
         * @param {object} [locals] a map of service dependency names to instances,
         *   to be used instead of the context-resolved values.
         *
         * @return {Promise} a promise to `f`'s returned value.
         */
        apply: function(deps, f, locals) {
            var x = this;
            return x
                .resolve(deps, locals)
                .then(function(vals) { return f.apply(x, vals); });
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
            // TODO: make the heart of it
        },

        // In the spirit of angular's $provider service's methods.

        /**
         * Registers a service by specifying its name,
         * dependencies and factory function.
         *
         * @param {string} name the name of the service.
         * @param {Array.<*>} [deps] an array of dependency paths.
         * @param {function} factory the factory function.
         */
        factory: function(name, deps, factory) {
            // TODO: make the heart of it
        },

        /**
         * Registers a service by specifying its name,
         * dependencies and the corresponding type's constructor function.
         *
         * @param {string} name the name of the service.
         * @param {Array.<*>} [deps] an array of dependency paths.
         * @param {function} ctor the type's constructor function.
         */
        type: function(name, deps, ctor) {
            // TODO: make the heart of it
        },

        /**
         * Registers a service by specifying its name and value.
         *
         * @param {string} name the name of the service.
         * @param {*} value the service value.
         */
        value: function(name, value) {
            // TODO: make the heart of it
        }
    });

    // UTIL
    var A_slice  = Array.prototype.slice;
    var A_copy   = function(a) { return A_slice.call(a); };
    var A_append = function(a, b) {
        var i = 0, B = b.length;
        while(i < B) a.push(b[i++]);
        return a;
    };

    return PentahoContext;
});