define([
    'pentaho/angular/hashKey',
], function(hashKey) {

    describe('pentaho/angular/hashKey', function() {
        beforeEach(function() {
            this.addMatchers({
                toStartWith: function(expected) {
                    var actual = this.actual;
                    var notText = this.isNot ? " not" : "";

                    this.message = function () {
                        return "Expected " + actual + notText + " to start with " + expected;
                    }

                    return (actual || '').indexOf(expected) === 0;
                }
            });
        });

        it('should be a function', function() {
            expect(typeof hashKey).toBe('function');
        });

        it('should generate keys that are strings', function() {
            var k = hashKey();
            expect(typeof k).toBe('string');
        });

        it('should generate keys whose prefix is type of the value', function() {
            expect(hashKey('')).toStartWith('string:');
            expect(hashKey(0)).toStartWith('number:');
            expect(hashKey({})).toStartWith('object:');
            expect(hashKey(undefined)).toStartWith('undefined:');
            expect(hashKey(null)).toStartWith('object:');
            expect(hashKey(true)).toStartWith('boolean:');
        });

        it('should generate keys that, after the type prefix, have a non-numeric prefix', function() {
            var k = hashKey();
            var i = k.indexOf(':');

            expect(parseFloat(k.charAt(i+1))).toBeNaN();
        });

        it('should not repeat', function() {
            var K = 100;
            var keys = {};
            for(var i = 0 ; i < K ; i++) {
                var key  = hashKey({});
                var hkey = '\0' + key;
                expect(hkey in keys).toBe(false);
                keys[hkey] = 1;
            }
        });
    });

});