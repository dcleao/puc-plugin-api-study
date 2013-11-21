define([
  'dojo/_base/declare'
],
function(declare) {

    /**
     * Helper class to base visualization implementations on.
     */
    var AbstractVisualization = declare(null, {
        constructor: function(visType, visController, element) {
            this.type = visType;
            this.controller = visController;
            this.element = element;
        },

        render: function(data, options) {
            // TODO
        }

        // ...
    });

    return AbstractVisualization;
});