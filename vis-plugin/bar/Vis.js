define([
  'pentaho/context!',
  'dojo/_base/declare',
  'pentaho/visualization/AbstractVisualization'
],
function(context, declare, AbstractVisualization) {

  var Bar = declare([AbstractVisualization], {
    constructor: function(type, controller, element) {
      // Base class does:

      // this.type = type;
      // this.controller = controller;
      // this.element = element;
    }
  });

  return Bar;
});
