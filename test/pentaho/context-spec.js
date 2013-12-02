define([
    'pentaho/context!',
    'pentaho/PentahoContext'
], function(context, PentahoContext) {

    describe('pentaho/context', function() {
        it('should be a PentahoContext', function() {
            expect(context instanceof PentahoContext).toBe(true);
        });
    });
});