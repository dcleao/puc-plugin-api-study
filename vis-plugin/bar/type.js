define([
  'pentaho/context!',
  'dojo/i18n!./nls/resources'
],
function(context, res) {
    /**
     * Register the "bar" visualization type,
     * by providing a definition object directly.
     *
     * The name of the service uses `:` to separate names
     * to avoid possible confusion with JavaScript global names,
     * if `.` were used, or with AMD names, if `/` were used.
     */
    context
    .value('pentaho:visualization:IVisualizationType', {
        name: 'bar',
        label: res.name,
        description: res.description,
        category: 'basic',

        // How to create a visualization instance?
        // Dependencies are passed *before* normal arguments.
        // Vis. file is loaded asynchronously, and with a relative path!
        // AsyncFactory: a function that returns a Promise for the created instance.
        factory: context.bind([
                'resource::./Vis'
            ],
            function(BarVis, visController, element) {
                return new BarVis(/*visType*/this, visController, element);
            }),

        visualRoles: [
            {name: 'category', kind: 'discrete', label: res.visualRoleCategory},
            {name: 'series',   kind: 'discrete', label: res.visualRoleSeries  },
            {name: 'value',    kind: 'numeric',  label: res.visualRoleValue, required: true},
            {name: 'multi',    kind: 'discrete', label: res.visualRoleMulti   }
        ],
        options: [
            {
                name:  'interpolation',
                label: res.optionInterpolation,
                valueType: 'string',
                values: ['none', 'linear', 'zero'],
                valueLabels: [/*...*/]
            }
        ]
    });
});