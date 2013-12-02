define([
    'common-ui/angular',
    'pentaho/angular/PentahoAngularApp',
    'pentaho/angular/hashKey'
], function(angular, PentahoAngularApp, angular_hashKey) {

    // Modules are global definitions.
    beforeEach(function(){
        // Resets test modules' definitions, in case a test redefines them.

        angular.module('test1', [])
            .value('foo1', 1)
            .factory('bar1', function() { return {}; });

        angular.module('test2', [])
            .value('foo2', 2)
            .factory('bar2', function() { return {}; });
    });

    describe('pentaho/angular/PentahoAngularApp', function() {

        it('should be a function', function() {
            expect(typeof PentahoAngularApp).toBe('function');
        });

        describe('construction', function() {
            it('should not throw if called with no arguments', function() {
                expect(function() {
                    new PentahoAngularApp();
                }).not.toThrow();
            });

            it('should not throw if called with a modules array', function() {
                expect(function() {
                    new PentahoAngularApp(['test1']);
                }).not.toThrow();
            });

            it('should return an app that is not bootstrapped', function() {
                var app = new PentahoAngularApp(['test1', 'test2']);
                expect(app.bootstrapped).toBe(false);
            });

            it('should return an app with no loaded modules', function() {
                var app = new PentahoAngularApp(['test1', 'test2']);
                var isEmpty = true;
                for(var p in app.loadedModules) {
                    isEmpty = false; break;
                }
                expect(isEmpty).toBe(true);
            });
        });

        describe('bootstrapping', function() {
            it('should not throw on an app without root modules and an element is specified', function() {
                var app = new PentahoAngularApp();
                var elem = angular.element('<div></div>');

                expect(function() {
                    app.bootstrap(elem);
                }).not.toThrow();
            });

            it('should throw when an element is not specified', function() {
                var app = new PentahoAngularApp();
                expect(function() {
                    app.bootstrap();
                }).toThrow();

                app = new PentahoAngularApp();
                expect(function() {
                    app.bootstrap(null);
                }).toThrow();

                app = new PentahoAngularApp(['test1']);
                expect(function() {
                    app.bootstrap();
                }).toThrow();

                app = new PentahoAngularApp(['test1']);
                expect(function() {
                    app.bootstrap(null);
                }).toThrow();
            });

            it('should not throw on an app with root modules and an element is specified', function() {
                var app = new PentahoAngularApp(['test1']);
                var elem = angular.element('<div></div>');

                expect(function() {
                    app.bootstrap(elem);
                }).not.toThrow();
            });

            it('should return the app', function() {
                var app = new PentahoAngularApp(['test1']);
                var elem = angular.element('<div></div>');

                var result = app.bootstrap(elem);
                expect(result).toBe(app);
            });

            it('should capture the instance $injector', function() {
                var app = new PentahoAngularApp(['test1']);
                var elem = angular.element('<div></div>');

                app.bootstrap(elem);
                expect(app.$injector).toBeTruthy();
            });

            it('should capture the $providerInjector', function() {
                var app = new PentahoAngularApp(['test1']);
                var elem = angular.element('<div></div>');

                app.bootstrap(elem);
                expect(app.$providerInjector).toBeTruthy();
            });

            it('should capture different instance and provider injectors', function() {
                var app = new PentahoAngularApp(['test1']);
                var elem = angular.element('<div></div>');

                app.bootstrap(elem);
                expect(app.$providerInjector).not.toBe(app.$injector);
            });

            it('should register the root modules as loaded modules', function() {
                var app = new PentahoAngularApp(['test1', 'test2']);
                var elem = angular.element('<div></div>');
                app.bootstrap(elem);
                expect(angular_hashKey('test1') in app.loadedModules).toBe(true);
                expect(angular_hashKey('test2') in app.loadedModules).toBe(true);
            });

            it('should mark the app as bootstrapped', function() {
                var app = new PentahoAngularApp(['test1', 'test2']);
                var elem = angular.element('<div></div>');
                app.bootstrap(elem);
                expect(app.bootstrapped).toBe(true);
            });

            it('should make the initially loaded module\'s services available', function() {
                var app = new PentahoAngularApp(['test1']);
                var elem = angular.element('<div></div>');
                app.bootstrap(elem);

                app.$injector.invoke(['foo1', 'bar1', function(foo, bar) {
                    expect(foo).toBe(1);
                    expect(bar instanceof Object).toBe(true);
                }]);
            });

            it('should throw if a string module argument is not defined', function() {

                var app = new PentahoAngularApp(['testFOO']);
                var elem = angular.element('<div></div>');

                expect(function() {

                    app.bootstrap(elem);

                }).toThrow();
            });
        });

        describe('load', function() {
            describe('before bootstrap', function() {
                it('should throw', function() {
                    expect(function() {
                        new PentahoAngularApp(['test1'])
                            .load(['test2']);
                    }).toThrow();
                });
            })

            describe('after bootstrap', function() {
                it('should not throw', function() {
                    var app = new PentahoAngularApp(['test1']);
                    var elem = angular.element('<div></div>');
                    app.bootstrap(elem);

                    expect(function() { app.load(['test2']); })
                        .not.toThrow();
                });

                it('should make the module\'s services available', function() {
                    var app = new PentahoAngularApp(['test1']);
                    var elem = angular.element('<div></div>');
                    app.bootstrap(elem);

                    app.load(['test2']);
                    app.$injector.invoke(['foo2', 'bar2', function(foo, bar) {
                        expect(foo).toBe(2);
                        expect(bar instanceof Object).toBe(true);
                    }]);
                });

                it('should add the module to `loadedModules`', function() {
                    var app = new PentahoAngularApp(['test1']);
                    var elem = angular.element('<div></div>');
                    app.bootstrap(elem);
                    app.load(['test2']);

                    expect(angular_hashKey('test1') in app.loadedModules).toBe(true);
                    expect(angular_hashKey('test2') in app.loadedModules).toBe(true);
                });

                it('should not load an already loaded module', function() {
                    var app = new PentahoAngularApp(['test1']);
                    var elem = angular.element('<div></div>');
                    app.bootstrap(elem);
                    app.load(['test2']);

                    // Change the module's 'bar2' definition.
                    angular.module('test2', [])
                        .factory('bar2', function() { return false; });

                    app.$injector.invoke(['bar2', function(bar) {
                        expect(bar instanceof Object).toBe(true);
                    }]);
                });

                it('should throw if a string module argument is not defined', function() {

                    var app = new PentahoAngularApp(['testFOO']);
                    var elem = angular.element('<div></div>');

                    expect(function() {

                        app.bootstrap(elem);

                    }).toThrow();
                });

                it('should throw if a string module argument is not defined', function() {

                    var app = new PentahoAngularApp(['test1']);
                    var elem = angular.element('<div></div>');
                    app.bootstrap(elem);

                    expect(function() {
                        app.load(['testFOO']);
                    }).toThrow();
                });

                it('should support function modules', function() {

                    var app = new PentahoAngularApp(['test1']);
                    var elem = angular.element('<div></div>');
                    app.bootstrap(elem);

                    var modNoopFn = function() {};

                    expect(function() {
                        app.load([modNoopFn]);
                    }).not.toThrow();
                });

                it('should support function modules with provider dependencies', function() {
                    var app = new PentahoAngularApp(['test1']);
                    var elem = angular.element('<div></div>');
                    app.bootstrap(elem);

                    var modNoopFn = ['$provide', function($provide) {
                        $provide.value('GUGU', 'DADA');
                    }];

                    expect(function() {
                        app.load([modNoopFn]);
                    }).not.toThrow();

                    var _gugu;
                    app.$injector.invoke(['GUGU', function(gugu) {
                        _gugu = gugu;
                    }]);

                    expect(_gugu).toBe('DADA');
                });
            });
        });
    });

});