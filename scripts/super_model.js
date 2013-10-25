angular.module('SuperModel', ['AClassAbove'])
.provider('SuperModel', function(){
        
        this.$get = ['AClassAbove', 'SuperModel.Callbacks', function(Class, Callbacks) {
            var plugins = Array.prototype.slice.call(arguments, 1);
            var SuperModel = Class.subclass(function(){
            
                angular.forEach(plugins, function(mixins){
                    this.extend(mixins.classMixin || {});
                    this.include(mixins.instanceMixin || {});
                    if (mixins.included) {
                        mixins.included(this);
                    }
                }.bind(this));
            
                return {};
            
            });
            
            return SuperModel;
        }];
        
    });