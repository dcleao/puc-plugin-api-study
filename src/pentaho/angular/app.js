define(['./PentahoAngularApp'], function(PentahoAngularApp) {

    /**
     * Creates and bootstraps an angular application,
     * given its root element and modules.
     *
     * Installs the "$app" service in the application.
     * Returns the application instance.
     *
     * @name pentaho/angular/app
     * @param {Element} element the root element of the application.
     * @param {Array<String|Function|Array>} [modules] the root modules of the application.
     * @return {pentaho/angular/PentahoAngularApp} the created application instance.
     */
    var app = function(element, modules) {
        var app = new PentahoAngularApp(modules);
        app.bootstrap(element);
        return app;
    };

    return app;
});