define([], function() {

    // Replacement for angular's hashKeys.

    var nextIdPrefix = 'a';
    var nextId  = 1;
    var MAX_INT = Math.pow(2, 53); // 2^53 = 9007199254740992;

    function angular_nextUid() {
        if(nextId === MAX_INT) {
            nextIdPrefix += 'a';
            nextId = 1;
        }

        return nextIdPrefix + (nextId++);
    }

    /**
     * Obtains the hash key of the provided value.
     * If the value is an object and its hash key is not yet set,
     * one is built and set on the object.
     *
     * Generated hash keys
     * contain at least one non-numeric prefix,
     * do not overflow, and
     * do not overlap with angular's generated keys.
     *
     * @param {*} t the value for which the hash key is to be determined.
     * @return {string} the hash key.
     */
    function angular_hashKey(t) {
        var type = typeof t, key;
        if(t && type === 'object') {
            key = t.$$hashKey;
            if(typeof key === 'function') {
                key = key.call(t);
            } else if(key === undefined) {
                obj.$$hashKey = key = angular_nextUid();
            }
        } else {
            key = t;
        }

        return type + ':' + key;
    }

    return angular_hashKey;
});