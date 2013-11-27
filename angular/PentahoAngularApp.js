define(['dojo/_base/declare', 'common-ui/angular', './hashKey'], function(declare, angular, angular_hashKey) {

    var O_hasOwn = Object.prototype.hasOwnProperty;
    var $pentahoAppMinErr = angular.minErr('$pentahoApp');

    var PentahoAngularApp = declare([], {
        /**
         * @name pentaho/angular/PentahoAngularApp
         *
         * @class The angular "$app" service class.
         * Provides functionality to load modules
         * during the whole lifetime of the application.
         *
         * @constructor
         * @param {Array<String|Function|Array>} rootModules the application's root modules.
         */
        constructor: function(rootModules) {
            this.rootModules = rootModules ? rootModules : [];

            this.$providerInjector = null;
            this.$injector = null;
            this.loadedModules = {};
            this.bootstrapped  = false;
            this.bootstrapping = false;
        },

        /**
         * Bootstraps the application on the provided root element.
         * @param {Element} element the application's root element.
         * @return {pentaho/angular/PentahoAngularApp} the application.
         */
        bootstrap: function(element) {
            if(this.bootstrapped || this.bootstrapping)
                throw new Error("Invalid operation.");

            this.bootstrapping = true;
            // ------

            var rootModules = this.rootModules.slice();

            // Add the appModule to the beginning of the list.
            // ~ Only angular 'ng' module will be loaded first.
            // This ensures that `this` is *configured* and *run*
            //  before other user modules.
            rootModules.unshift(pentahoAngularApp_createAppModule.call(this));

            // Returns the app's instance-injector.
            // this.$injector already is set to it.
            angular.bootstrap(element, rootModules);

            // Post angular boot.

            // Determine all loaded modules.
            pentahoAngularApp_collectModules(rootModules, this.loadedModules);

            // ------
            this.bootstrapping = false;
            this.bootstrapped  = true;

            return this;
        },

        /**
         * Loads a list of modules into
         * the already bootstrapped angular application.
         *
         * @param {Array<String|Function|Array>} modules the modules to load.
         * @return {pentaho/angular/PentahoAngularApp} the application.
         */
        load: function(modules) {
            if(!this.bootstrapped) throw new Error("Invalid operation.");

            var runBlocks = pentahoAngularApp_loadModules.call(this, modules);

            var $injector = this.$injector;
            runBlocks.forEach(function(rb) {
                if(rb) $injector.invoke(rb);
            });

            return this;
        }
    });

    /**
     * Creates a pentaho app's module. It's an adhoc/anonymous module.
     * It's loaded into every application that is bootstrapped with
     * the {@link #bootstrap} method.
     *
     * @name _createAppModule
     * @methodOf pentaho/angular/PentahoAngularApp#
     * @private
     */
    var pentahoAngularApp_createAppModule = function() {
        var $app = this;

        function moduleFn($provide, $providerInjector) {

            $app.$providerInjector = providerInjector;

            // Register `$app` as the "$app" service.
            // Will only be available in the run/instance phase.
            $provide.factory('$app', ['$injector', function($instanceInjector) {
                $app.$injector = $instanceInjector;
            }]);

            /* Return a run block to further initialize
             *  the $app service, before other modules.
             *
             * This run-block forces running the above registered factory
             *  of the "$app" service, thus ending its initialization,
             *  by providing it with the instance-injector.
             */
            return ['$injector', '$app', function(instanceInjector, $app) {
                $app.instanceInjector(instanceInjector);
            }];
        }

        return ['$provide', '$injector', moduleFn];
    };

    /**
     * Collects all modules that are reachable from a given list of modules.
     * Results are accumulated in the provided module set object.
     * Only modules specified by the module name are considered (each module's `requires` included).
     *
     * @name _collectModules
     * @methodOf pentaho/angular/PentahoAngularApp
     * @param {Array<String|Function|Array>} moduleList a list of modules from which to start exploring.
     * @param {object} moduleSet an object that contains the names of traversed modules.
     * This object can already contain module keys (as given by angular_hashKey),
     * preventing the exploration of the corresponding path.
     * @static
     * @private
     */
    var pentahoAngularApp_collectModules = function(moduleList, moduleSet) {

        traverseModules(moduleList);

        function traverseModules(modules) {
            modules.forEach(function(module) {
                if(angular.isString(module)) {
                    var moduleKey = angular_hashKey(module);

                    if(O_hasOwn.call(moduleSet, moduleKey)) return;

                    // Avoid infinite loop
                    moduleSet[moduleKey] = 1;

                    // Get the module - must have been (globally) defined before.
                    var moduleInst = angular.module(module);

                    if(moduleInst.requires) traverseModules(moduleInst.requires);
                }
            });
        }
    };

    /**
     * Loads modules into an angular application that has already been bootstrapped.
     *
     * ATTENTION: the implementation of this function *mimics* the `loadModules` function
     * present in angular's injector.js (in version v1.2.3).
     * Whenever angular gets updated, this code must be checked to still being applicable.
     *
     * @name _loadModules
     * @methodOf pentaho/angular/PentahoAngularApp#
     * @param {Array<String|Function|Array>} modules the modules to load.
     * @return {Array.<Function|Array>} an array of run blocks to be executed.
     * @private
     */
    function pentahoAngularApp_loadModules(modules) {
        var app = this;
        var runBlocks = [];

        angular.forEach(modules, function(module) {
            var moduleKey = angular_hashKey(module);
            if(O_hasOwn.call(app.loadedModules, moduleKey)) return;

            app.loadedModules[moduleKey] = 1;

            try {
                if(angular.isString(module)) {
                    // Get the module - must have been (globally) defined before.
                    var moduleInst = angularModule(module);

                    // Accumulate "run" blocks to be run after all "config" blocks, at root.
                    runBlocks = runBlocks
                        .concat(pentahoAngularApp_loadModules.call(app, moduleInst.requires))
                        .concat(moduleInst._runBlocks);

                    // On the other hand,
                    // create Providers, and
                    // configure existing ones,
                    // along the way.
                    for(var invokeQueue = moduleInst._invokeQueue, i = 0, ii = invokeQueue.length; i < ii; i++) {
                        var invokeArgs = invokeQueue[i];
                        var provider   = app.$providerInjector.get(invokeArgs[0]);

                        provider[invokeArgs[1]].apply(provider, invokeArgs[2]);
                    }
                } else if(angular.isFunction(module)) {
                    runBlocks.push(app.$providerInjector.invoke(module));
                } else if(angular.isArray(module)) {
                    runBlocks.push(app.$providerInjector.invoke(module));
                } else {
                    throw $pentahoAppMinErr(
                        'areq',
                        "Argument 'module' is not a function, got '{0}'",
                        (module && typeof module == 'object' ? module.constructor.name || 'Object' : typeof module));
                }
            } catch(e) {
                if(angular.isArray(module)) module = module[module.length - 1];

                if(e.message && e.stack && e.stack.indexOf(e.message) == -1) {
                  // Safari & FF's stack traces don't contain error.message content
                  // unlike those of Chrome and IE
                  // So if stack doesn't contain message, we create a new string that contains both.
                  // Since error.stack is read-only in Safari, I'm overriding e and not e.stack here.
                  /* jshint -W022 */
                  e = e.message + '\n' + e.stack;
                }

                throw $pentahoAppMinErr('modulerr', "Failed to instantiate module {0} due to:\n{1}",
                      module, e.stack || e.message || e);
            }
        });

        return runBlocks;
    }

    return PentahoAngularApp;
});