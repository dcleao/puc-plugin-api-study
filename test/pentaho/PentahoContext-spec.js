define([
    'pentaho/PentahoContext'
], function(PentahoContext) {

    // TODO: test #type, #apply, #bind

    describe('pentaho/PentahoContext', function() {

        it('should be a function', function() {
            expect(typeof PentahoContext).toBe('function');
        });

        describe('construction', function() {
            it('should not throw when called with no arguments', function() {
                expect(function() {
                    new PentahoContext();
                }).not.toThrow();
            });

            it('should not throw when called with a parent context', function() {
                var root = new PentahoContext();
                expect(function() {
                    new PentahoContext(root);
                }).not.toThrow();
            });
        });

        describe('factory', function() {
            it('should throw when a name is not specified', function() {
                var ctx = new PentahoContext();
                expect(function() {
                    ctx.factory(null, [], function(){});
                }).toThrow();
                expect(function() {
                    ctx.factory(undefined, [], function(){});
                }).toThrow();
                expect(function() {
                    ctx.factory('', [], function(){});
                }).toThrow();
            });

            it('should throw when only the name is specified ', function() {
                var ctx = new PentahoContext();
                expect(function() {
                    ctx.factory('foo');
                }).toThrow();
            });

            it('should throw when only the factory argument is not a function', function() {
                var ctx = new PentahoContext();
                expect(function() {
                    ctx.factory('foo', [], 'bar');
                }).toThrow();
                expect(function() {
                    ctx.factory('foo', 'bar');
                }).toThrow();
            });

            it('should not throw when name and function are specified', function() {
                var ctx = new PentahoContext();
                expect(function() {
                    ctx.factory('foo1', null, function() {});
                }).not.toThrow();

                expect(function() {
                    ctx.factory('foo2', function() {});
                }).not.toThrow();
            });
        });

        describe('resolve', function() {
            it('should throw when the dependencies argument is not specified', function() {
                var ctx = new PentahoContext();
                expect(function() {
                    ctx.resolve();
                }).toThrow();
                expect(function() {
                    ctx.resolve(null);
                }).toThrow();
            });

            it('should not throw when an empty dependencies argument is specified', function() {
                var ctx = new PentahoContext();
                expect(function() {
                    ctx.resolve([]);
                }).not.toThrow();
            });

            it('should not throw when the `locals` argument is specified', function() {
                var ctx = new PentahoContext();
                expect(function() {
                    ctx.resolve([], {});
                }).not.toThrow();
            });

            it('should return a promise', function() {
                var ctx = new PentahoContext();
                var p = ctx.resolve([]);
                expect(p).not.toBeNull();
                expect(typeof p.then).toBe('function');
            });
        });

        describe('value and resolve', function() {

            it('should resolve to a fulfilled promise', function() {
                var ctx = new PentahoContext();
                var foo = {};
                ctx.value('foo', foo);

                var p;
                runs(function() {
                    p = ctx.resolve(['foo']);
                });

                waitsFor(function() {
                    return p.isFulfilled();
                }, "Promise did not get fulfilled.", 100);
            });

            it('should resolve to a fulfilled promise with the value', function() {
                var ctx = new PentahoContext();
                var foo = {};
                ctx.value('foo', foo);

                var p;
                runs(function() { p = ctx.resolve(['foo']); });

                waitsFor(
                    function() { return p.isFulfilled(); },
                    "Promise did not get fulfilled.",
                    100);

                runs(function() {
                    var _vals;
                    p.then(function(vals) { _vals = vals; });
                    expect(_vals.length).toBe(1);
                    expect(_vals[0]).toBe(foo);
                });
            });

        });

        describe('factory and resolve', function() {
            it('should resolve a registered factory', function() {
                var ctx = new PentahoContext();
                var foo = {};
                ctx.factory('foo', function() { return foo; });

                var p;
                runs(function() { p = ctx.resolve(['foo']); });

                // Factory may have already been called!

                waitsFor(
                    function() { return p.isFulfilled(); },
                    "Promise did not get fulfilled.",
                    100);

                runs(function() {
                    var _vals;
                    p.then(function(vals) { _vals = vals; });
                    expect(_vals.length).toBe(1);
                    expect(_vals[0]).toBe(foo);
                });
            });

            it('should call a factory only once', function() {
                var ctx = new PentahoContext();
                var foo = {};
                var fooSpy = jasmine.createSpy('fooFactory').andReturn(foo);

                ctx.factory('foo', fooSpy);

                var p1;
                runs(function() { p1 = ctx.resolve(['foo']); });

                waitsFor(
                    function() { return p1.isFulfilled(); },
                    "Promise 1 did not get fulfilled.",
                    100);

                runs(function() {
                    var _vals;
                    p1.then(function(vals) { _vals = vals; });

                    expect(fooSpy).toHaveBeenCalled();
                    expect(fooSpy.calls.length).toBe(1);
                });

                // ----------

                var p2;
                runs(function() { p2 = ctx.resolve(['foo']); });

                waitsFor(
                    function() { return p2.isFulfilled(); },
                    "Promise 2 did not get fulfilled.",
                    100);

                runs(function() {
                    var _vals;
                    p2.then(function(vals) { _vals = vals; });

                    expect(fooSpy.calls.length).toBe(1);
                });
            });

            it('should always return the same value', function() {
                var ctx = new PentahoContext();
                var foo = {};
                ctx.factory('foo', function() { return foo; });

                var p;
                runs(function() { p = ctx.resolve(['foo']); });

                waitsFor(
                    function() { return p.isFulfilled(); },
                    "Promise 1 did not get fulfilled.",
                    100);

                var foo1;
                runs(function() {
                    p.then(function(vals) { foo1 = vals[0]; });
                });

                // ----------

                runs(function() { p = ctx.resolve(['foo']); });

                waitsFor(
                    function() { return p.isFulfilled(); },
                    "Promise 2 did not get fulfilled.",
                    100);

                var foo2;
                runs(function() {
                    p.then(function(vals) { foo2 = vals[0]; });
                });

                // ---------

                expect(foo1).toBe(foo2);
            });
        });

        describe('resolve one or many, optional or not', function() {

            it('should reject when <service> is asked for and there is none', function() {
                var ctx = new PentahoContext();

                var p;
                runs(function() { p = ctx.resolve(['foo']); });

                waitsFor(
                    function() { return p.isFulfilled(); },
                    "Promise did not get fulfilled.",
                    100);

                runs(function() {
                    expect(p.isRejected()).toBe(true);
                    var _err;
                    p.otherwise(function(err) { _err = err; });
                    expect(_err instanceof Error).toBe(true);
                });
            });

            it('should resolve to `undefined` when <service?> is asked for and there is none', function() {
                var ctx = new PentahoContext();

                var p;
                runs(function() { p = ctx.resolve(['foo?']); });

                waitsFor(
                    function() { return p.isFulfilled(); },
                    "Promise did not get fulfilled.",
                    100);

                runs(function() {
                    var _vals;
                    p.then(function(vals) { _vals = vals; });
                    expect(_vals.length).toBe(1);
                    expect(_vals[0]).toBeUndefined();
                });
            });

            it('should resolve to the last one, when <service> is asked for and there is more than one', function() {
                var ctx = new PentahoContext();

                var foo1 = {};
                var foo2 = {};
                ctx.factory('foo', function() { return foo1; });
                ctx.factory('foo', function() { return foo2; });

                var p;
                runs(function() { p = ctx.resolve(['foo']); });

                // Factory may have already been called!

                waitsFor(
                    function() { return p.isFulfilled(); },
                    "Promise did not get fulfilled.",
                    100);

                runs(function() {
                    var _vals;
                    p.then(function(vals) { _vals = vals; });
                    expect(_vals.length).toBe(1);
                    expect(_vals[0]).toBe(foo2);
                });
            });

            it('should resolve to an array, when <service*> is asked for and there is more than one', function() {
                var ctx = new PentahoContext();

                var foo1 = {};
                var foo2 = {};
                ctx.factory('foo', function() { return foo1; });
                ctx.factory('foo', function() { return foo2; });

                var p;
                runs(function() { p = ctx.resolve(['foo*']); });

                // Factory may have already been called!

                waitsFor(
                    function() { return p.isFulfilled(); },
                    "Promise did not get fulfilled.",
                    100);

                runs(function() {
                    var _vals;
                    p.then(function(vals) { _vals = vals; });
                    expect(_vals.length).toBe(1);

                    var foos = _vals[0];
                    expect(foos.length).toBe(2);
                    expect(foos[0]).toBe(foo1);
                    expect(foos[1]).toBe(foo2);
                });
            });

            it('should resolve to an array, when <service*> is asked for and there is only one', function() {
                var ctx = new PentahoContext();

                var foo = {};
                ctx.factory('foo', function() { return foo; });

                var p;
                runs(function() { p = ctx.resolve(['foo*']); });

                // Factory may have already been called!

                waitsFor(
                    function() { return p.isFulfilled(); },
                    "Promise did not get fulfilled.",
                    100);

                runs(function() {
                    var _vals;
                    p.then(function(vals) { _vals = vals; });
                    expect(_vals.length).toBe(1);

                    var foos = _vals[0];
                    expect(foos.length).toBe(1);
                    expect(foos[0]).toBe(foo);
                });
            });

            it('should resolve to an empty array, when <service*> is asked for and there is none', function() {
                var ctx = new PentahoContext();

                var p;
                runs(function() { p = ctx.resolve(['foo*']); });

                // Factory may have already been called!

                waitsFor(
                    function() { return p.isFulfilled(); },
                    "Promise did not get fulfilled.",
                    100);

                runs(function() {
                    var _vals;
                    p.then(function(vals) { _vals = vals; });
                    expect(_vals.length).toBe(1);

                    var foos = _vals[0];
                    expect(foos.length).toBe(0);
                });
            });

            it('should be rejected, when <service+> is asked for and there is none', function() {
                var ctx = new PentahoContext();

                var p;
                runs(function() { p = ctx.resolve(['foo+']); });

                // Factory may have already been called!

                waitsFor(
                    function() { return p.isFulfilled(); },
                    "Promise did not get fulfilled.",
                    100);

                runs(function() {
                    expect(p.isRejected()).toBe(true);
                    var _err;
                    p.otherwise(function(err) { _err = err; });
                    expect(_err instanceof Error).toBe(true);
                });
            });
        });

        describe('resolve and locals', function() {

            it('should resolve a specified local, when <service> is asked for and there is none', function() {
                var ctx = new PentahoContext();
                var foo1 = {};
                var locals = {foo: foo1};

                var p;
                runs(function() { p = ctx.resolve(['foo'], locals); });

                waitsFor(
                    function() { return p.isFulfilled(); },
                    "Promise did not get fulfilled.",
                    100);

                runs(function() {
                    expect(p.isResolved()).toBe(true);

                    var _vals;
                    p.then(function(vals) { _vals = vals; });
                    expect(_vals.length).toBe(1);
                    expect(_vals[0]).toBe(foo1);
                });
            });

            it('should resolve a specified local, when <service> is asked for and there is one', function() {
                var ctx = new PentahoContext();
                var foo1 = {};
                var locals = {foo: foo1};

                var foo2 = {};
                ctx.value('foo', foo2);

                var p;
                runs(function() { p = ctx.resolve(['foo'], locals); });

                waitsFor(
                    function() { return p.isFulfilled(); },
                    "Promise did not get fulfilled.",
                    100);

                runs(function() {
                    expect(p.isResolved()).toBe(true);

                    var _vals;
                    p.then(function(vals) { _vals = vals; });
                    expect(_vals.length).toBe(1);
                    expect(_vals[0]).toBe(foo1);
                });
            });

            it('should resolve to an array with the specified local, when <service*> is asked for and there is one', function() {
                var ctx = new PentahoContext();
                var foo1 = {};
                var locals = {foo: foo1};

                var foo2 = {};
                ctx.value('foo', foo2);

                var p;
                runs(function() { p = ctx.resolve(['foo*'], locals); });

                waitsFor(
                    function() { return p.isFulfilled(); },
                    "Promise did not get fulfilled.",
                    100);

                runs(function() {
                    expect(p.isResolved()).toBe(true);

                    var _vals;
                    p.then(function(vals) { _vals = vals; });
                    expect(_vals.length).toBe(1);

                    var foos = _vals[0];
                    expect(foos.length).toBe(1);
                    expect(foos[0]).toBe(foo1);
                });
            });

        });

        describe('resolve and dependencies', function() {
            it('should resolve a service with one <existing> dependency', function() {
                var ctx = new PentahoContext();
                var bar = {};
                ctx.value('bar', bar);
                ctx.factory('foo', ['bar'], function(bar) {
                    return {bar: bar};
                });

                var p;
                runs(function() { p = ctx.resolve(['foo']); });

                waitsFor(
                    function() { return p.isFulfilled(); },
                    "Promise did not get fulfilled.",
                    100);

                runs(function() {
                    expect(p.isResolved()).toBe(true);

                    var _vals;
                    p.then(function(vals) { _vals = vals; });
                    expect(_vals.length).toBe(1);

                    var foo = _vals[0];
                    expect(foo instanceof Object).toBe(true);
                    expect(foo.bar).toBe(bar);
                });
            });

            it('should resolve a service with one <existing> dependency that has another <existing> dependency', function() {
                var ctx = new PentahoContext();
                var bar = {};
                ctx.value('bar', bar);
                ctx.factory('foo', ['bar'], function(bar) {
                    return {bar: bar};
                });
                ctx.factory('guu', ['foo'], function(foo) {
                    return {foo: foo};
                });

                var p;
                runs(function() { p = ctx.resolve(['guu']); });

                waitsFor(
                    function() { return p.isFulfilled(); },
                    "Promise did not get fulfilled.",
                    100);

                runs(function() {
                    expect(p.isResolved()).toBe(true);

                    var _vals;
                    p.then(function(vals) { _vals = vals; });
                    expect(_vals.length).toBe(1);

                    var guu = _vals[0];
                    expect(guu instanceof Object).toBe(true);
                    expect(guu.foo instanceof Object).toBe(true);
                    expect(guu.foo.bar).toBe(bar);
                });
            });

            it('should reject a service with one <missing> dependency', function() {
                var ctx = new PentahoContext();

                ctx.factory('foo', ['bar'], function(bar) {
                    return {bar: bar};
                });

                var p;
                runs(function() { p = ctx.resolve(['foo']); });

                waitsFor(
                    function() { return p.isFulfilled(); },
                    "Promise did not get fulfilled.",
                    100);

                runs(function() {
                    expect(p.isRejected()).toBe(true);
                    var _err;
                    p.otherwise(function(err) { _err = err; });
                    expect(_err instanceof Error).toBe(true);
                });
            });

            it('should reject a service with one <existing> and one <missing> dependency', function() {
                var ctx = new PentahoContext();

                ctx.value('bar', {});
                ctx.factory('foo', ['bar', 'guu'], function(guu, bar) {
                    return {guu: guu, bar: bar};
                });

                var p;
                runs(function() { p = ctx.resolve(['foo']); });

                waitsFor(
                    function() { return p.isFulfilled(); },
                    "Promise did not get fulfilled.",
                    100);

                runs(function() {
                    expect(p.isRejected()).toBe(true);
                    var _err;
                    p.otherwise(function(err) { _err = err; });
                    expect(_err instanceof Error).toBe(true);
                });
            });

            it('should resolve a service with <existing*> dependencies', function() {
                var ctx = new PentahoContext();

                var bar1 = {};
                var bar2 = {};
                ctx.value('bar', bar1);
                ctx.value('bar', bar2);

                ctx.factory('foo', ['bar*'], function(bars) {
                    return {bars: bars};
                });

                var p;
                runs(function() { p = ctx.resolve(['foo']); });

                waitsFor(
                    function() { return p.isFulfilled(); },
                    "Promise did not get fulfilled.",
                    100);

                runs(function() {
                    expect(p.isResolved()).toBe(true);

                    var _vals;
                    p.then(function(vals) { _vals = vals; });
                    expect(_vals.length).toBe(1);

                    var foo = _vals[0];
                    expect(foo instanceof Object).toBe(true);

                    var bars = foo.bars;
                    expect(bars instanceof Array).toBe(true);
                    expect(bars.length).toBe(2);
                    expect(bars[0]).toBe(bar1);
                    expect(bars[1]).toBe(bar2);
                });
            });

            it('should resolve a service with one <missing?> dependency as `undefined`', function() {
                var ctx = new PentahoContext();

                ctx.factory('foo', ['bar?'], function(bar) {
                    return {bar: bar};
                });

                var p;
                runs(function() { p = ctx.resolve(['foo']); });

                waitsFor(
                    function() { return p.isFulfilled(); },
                    "Promise did not get fulfilled.",
                    100);

                runs(function() {
                    expect(p.isResolved()).toBe(true);

                    var _vals;
                    p.then(function(vals) { _vals = vals; });
                    expect(_vals.length).toBe(1);

                    var foo = _vals[0];
                    expect(foo instanceof Object).toBe(true);

                    expect('bar' in foo).toBe(true);
                    expect(foo.bar).toBeUndefined();
                });
            });
        });
    });
});