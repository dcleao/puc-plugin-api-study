// Karma configuration

module.exports = function(config) {

  config.set({
    // base path, that will be used to resolve files and exclude
    basePath: '',

    // frameworks to use
    frameworks: ['jasmine', 'requirejs'],

    // list of files / patterns to load in the browser
    files: [
      // Tests `requirejs` bootstrapping
      'test/test-main.js',
      //'test/lib/angular/angular-mocks.js',

      // All bower components should be accessible by `require`.
      {pattern: 'bower_components/**/*.*', included: false},

      // All src files should be accessible by `require`.
      {pattern: 'src/**/*.*', included: false},

      // All specs should be accessible by `require`.
      {pattern: 'test/**/*-spec.js', included: false}
    ],

    // test results reporter to use
    // possible values: 'dots', 'progress', 'junit', 'growl', 'coverage'
    reporters: ['progress', 'html'],

    // the default configuration
    htmlReporter: {
      outputDir:    'build/test/karma_html',
      templatePath: 'node_modules/karma-html-reporter/jasmine_template.html'
    },

    // web server port
    port: 9876,

    // enable / disable colors in the output (reporters and logs)
    colors: true,

    // level of logging
    // possible values: config.LOG_DISABLE || config.LOG_ERROR || config.LOG_WARN || config.LOG_INFO || config.LOG_DEBUG
    logLevel: config.LOG_INFO,

    // enable / disable watching file and executing tests whenever any file changes
    autoWatch: false, // on windows, CPU -> 100%

    // Start these browsers, currently available:
    // - Chrome
    // - ChromeCanary
    // - Firefox
    // - Opera (has to be installed with `npm install karma-opera-launcher`)
    // - Safari (only Mac; has to be installed with `npm install karma-safari-launcher`)
    // - PhantomJS
    // - IE (only Windows; has to be installed with `npm install karma-ie-launcher`)
    browsers: ['Chrome'],//, 'Firefox', 'IE', 'PhantomJS'],

    // If browser does not capture in given timeout [ms], kill it
    captureTimeout: 60000,

    // Continuous Integration mode
    // if true, it capture browsers, run tests and exit
    singleRun: false
  });
};
