
// @see http://karma-runner.github.io/0.10/plus/requirejs.html

(function() {
    var karma = window.__karma__;

    var tests = [];
    for(var file in karma.files)
        if(/\-spec\.js$/.test(file)) tests.push(file);

    requirejs.config({
        // Karma serves files from '/base'
        baseUrl: '/base/',
        packages: [
            {name: 'dojo',    location: 'bower_components/dojo'},
            {name: 'pentaho', location: 'src/pentaho'}
        ],
        paths: {
            'common-ui/angular':       'bower_components/angular/angular',
            'common-ui/angular/route': 'bower_components/angular/angular-route'
        },
        shim: {
            'common-ui/angular':        {exports: 'angular'},
            'common-ui/angular/route':  {deps: ['angular']}
        }
    });

    // Ask Require.js to load all test files and start test run
    require(tests, karma.start);
} ());