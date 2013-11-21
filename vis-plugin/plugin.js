define([
    'pentaho/context!',

    // Require all of the visualization types' modules
    // provided by this plugin:
    './bar/type'
    // './column/type', './stacked-area/type', './line/type', ...
],
function(context) {
    // Example use:

    context
    .on('user-logon', function(userInfo) {
        console.log("Welcome " + userInfo.name + "!");
    })
    .on('user-logoff', function(userInfo) {
        console.log("See you " + userInfo.name + " ;-)");
    })
    .on('task-begin', function(taskExec) {
        console.log("Executing " + taskExec.task.name + "...");
    })
    .on('task-end', function(taskExec) {
        console.log("Finished execution of " + taskExec.task.name + "!");
    });
});

/**
 * NOTE: All of the plugins' `plugin.js`
 *       must be `require`d upon PUC initialization.
 */