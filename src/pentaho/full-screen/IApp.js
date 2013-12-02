define([
  'pentaho/context!',
  'pentaho/full-screen/PentahoFullScreenAngularApp'
],
function(context, PentahoFullScreenApp) {
    /**
     * The PUC full-screen application service.
     *
     * The default registration is
     * provided by {@link pentaho/full-screen/PentahoFullScreenAngularApp}.
     *
     * @name pentaho:full-screen:IApp
     * @type pentaho/full-screen/PentahoAngularApp
     */
    context
    .factory('pentaho:full-screen:IApp', function() {
        return new PentahoFullScreenApp();
    });
});