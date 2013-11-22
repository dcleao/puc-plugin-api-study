/**
 * The "pentaho/context" AMD loader plugin module.
 *
 * Include "pentaho/context" as a loader plugin by
 * appending "!" to the the module path when requiring it:
 * <pre>
 * define(['pentaho/context!'], function(context) {
 *
 * });
 * </pre>
 */
define([
    'pentaho/PentahoContext'
],
function(PentahoContext) {
    /**
     * The root pentaho context.
     * @type pentaho/PentahoContext
     */
    var _rootContext = new PentahoContext(/*parent*/null);

    // It would be possible to return the root pentaho context
    //  here, but that would impose having an unrelated,
    //  "load" method on it, that could/would raise confusion.
    // This way, if the "!" is not used when loading this module,
    //  and the methods of pentaho context are called,
    //  it will fail, and hopefully, the error will become apparent.

    // Return the object implementing the "loader plugin interface".
    return {
        /**
         * Creates a contextualized pentaho context object.
         *
         * The returned context will resolve "require" dependencies
         * relative to the module that is requiring this context.
         *
         * @param {string}   id the string to the right of the "!".
         * @param {function} require AMD require; usually a context-sensitive require bound to the module making the plugin request.
         * @param {function} callback the function the plugin should call with the return value once it is done.
         *
         * @return {*} the "require-context sensitive" pentaho context.
         *
         * @see http://livedocs.dojotoolkit.org/loader/amd#plugins
         * @see http://requirejs.org/docs/plugins.html
         */
        load: function(id, require, callback) {
            // id is ignored
            callback(new PentahoContext(/*parent*/_rootContext, require));
        }
    };
});