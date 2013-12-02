define([
    'pentaho/angular/app',
    'pentaho/angular/PentahoAngularApp'
], function(angularApp, PentahoAngularApp) {

    describe('pentaho/angular/app', function() {
         // Modules are global definitions.
        beforeEach(function(){
            // Resets test modules' definitions, in case a test redefines them.

            angular.module('test1', [])
                .value('foo1', 1)
                .factory('bar1', function() { return {}; });

        });

        it('should be a function', function() {
            expect(typeof angularApp).toBe('function');
        });

        it('should create a PentahoAngularApp when called with proper arguments', function() {
            var elem = angular.element('<div></div>');
            var modules = ['test1'];
            expect(function() {
                var app = angularApp(elem, modules);
                expect(app instanceof PentahoAngularApp).toBe(true);
            }).not.toThrow();
        });
    });

});