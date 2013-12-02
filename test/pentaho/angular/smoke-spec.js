define([
    'common-ui/angular'
], function(angular) {

    // Modules are global definitions.
    angular.module('test1', [])
        .value('foo', 1)
        .factory('bar', function() { return {}; });

    describe('Smoking pentaho/angular', function() {

        it('should be a function', function() {
            expect(angular).toBeTruthy();
            expect(typeof angular).toBe('object');
        });

        it('should be possible to obtain an angular module', function() {
            var mod = angular.module('test1');
            expect(mod).not.toBeNull();
            expect(typeof mod).toBe('object');
        });

        it('should be possible to bootstrap an angular application', function() {
            var elem = angular.element('<div></div>');
            var injector = angular.bootstrap(elem, ['test1']);
            expect(injector).toBeTruthy();
            expect(typeof injector).toBe('object');
        });

        it('should be possible to bootstrap a second angular application', function() {
            var elem = angular.element('<div></div>');
            var injector = angular.bootstrap(elem, ['test1']);
            expect(injector).toBeTruthy();
            expect(typeof injector).toBe('object');
        });
    });

});