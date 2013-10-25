'use strict';

describe('SuperModel', function() {

    var SuperModel;

    beforeEach(function() {
        module('SuperModel');

        inject(function(_SuperModel_) {
            SuperModel = _SuperModel_;
        });

    });

});
