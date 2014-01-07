angular.module('SuperModel')
.factory('SuperModel.Callbacks', [function(){
        
        return {
            
            included: function(SuperModel) {
                SuperModel.extendableArray('definedCallbacks');
            },
            
            classMixin: {
                defineCallbacks: function() {
                    angular.forEach(arguments, function(arg){
                        var callbackLists = {};
                        
                        // create 3 extendable arrays for the before, after, and around callback lists
                        angular.forEach(['before', 'after', 'around'], function(type) {
                            // create an extendable array with a name like "___after_action_callbacks" 
                            this.extendableArray(this._callbackListProp(arg, type));
                        }.bind(this));
                        this.definedCallbacks().push(arg);
                    }.bind(this));
                },
                
                setCallback: function(type, name, callback) {
                    this._callbackList(name, type).push(callback);                    
                },
                
                _callbackListProp: function(name, type) {
                    // i.e. "after_action_callbacks"
                    return ['__', type, name, 'callbacks'].join('_');
                },
                
                _callbackList: function(name, type) {
                    var callbackList =[name];
                    if (this.definedCallbacks().indexOf(name) === -1) {
                        throw new Error('Callbacks on '+name+' are not supported.  If you want to support them, you need to call defineCallbacks('+name+')');
                    }
                    // something like "___after_action_callbacks"  
                    var prop = this._callbackListProp(name, type);
                    return this[prop]();
                }
            },
            
            instanceMixin: {
                runCallbacks: function(name, block) {
                    this._runSimpleCallbacks('before', name, block);
                    this._runAroundCallbacks(name, block);
                    this._runSimpleCallbacks('after', name, block);                    
                },

                _runSimpleCallbacks: function(type, name, block) {
                    angular.forEach(this._callbackList(name, type), function(callback) {
                        if (typeof callback === "string") {
                            callback = this[callback];
                        }
                        callback.apply(this);
                    }.bind(this));
                },
                
                _runAroundCallbacks: function(name, block) {
                    var aroundCallbacks = this._callbackList(name, 'around');
                    if (aroundCallbacks.length == 0) { 
                        block.apply(this); 
                    } else {
                        
                        //Loop backwards through the callbacks, passing each callback
                        //into the previous one, creating the callback chain.
                        
                        //The trigger is the callback that will start off the chain. As
                        //we move back through the list of callbacks, eventually the first
                        //one will become the trigger we actually use
                        var trigger = block.bind(this);;
                        for (var i = aroundCallbacks.length - 1; i >=0; i--) {
                            var callback = aroundCallbacks[i];
                            if ( trigger ) {
                                trigger = callback.bind(this, trigger);
                            }
                        }
                        trigger();
                    }
                },
                
                _callbackList: function()  {
                    return this.constructor._callbackList.apply(this.constructor, arguments);
                }        
                
            }
            
        };
        
    }]);