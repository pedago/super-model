'use strict';

describe('SuperModel.Callbacks', function() {

    var MyModel, SuperModel, callbacks;

    beforeEach(function() {
        module('SuperModel');

        inject(function(_SuperModel_) {
            SuperModel = _SuperModel_;
            MyModel = SuperModel.subclass(function() {
                this.defineCallbacks('action');
                
                return {
                    action: function() {
                        this.runCallbacks('action', function() {
                            this.internalAction();
                        });
                    },
                    internalAction: function() {
                        expect(this.constructor).toBe(MyModel);
                    }
                };
            });
            
            callbacks = {
                toBeSpiedOn: function() {},
                before: function() {
                    callbacks.toBeSpiedOn('before');
                },
                around: function(func) {
                    callbacks.toBeSpiedOn('around');
                    func();
                },
                after: function() {
                    callbacks.toBeSpiedOn('after');
                }
            };
            spyOn(callbacks, 'toBeSpiedOn');
            spyOn(MyModel.prototype, 'internalAction').andCallThrough();
        });

    });
    
    it('should trigger before callback', function() {
        MyModel.setCallback('before', 'action', callbacks.before);
        var instance = new MyModel();
        instance.action();
        expect(callbacks.toBeSpiedOn).toHaveBeenCalledWith('before');
        expect(instance.internalAction).toHaveBeenCalled();
    });
    
    it('should trigger around callback', function() {
        MyModel.setCallback('around', 'action', callbacks.around);
        var instance = new MyModel();
        instance.action();
        expect(callbacks.toBeSpiedOn).toHaveBeenCalledWith('around');
        expect(instance.internalAction).toHaveBeenCalled();
    });
    
    it('should trigger multiple around callbacks', function() {
        MyModel.setCallback('around', 'action', callbacks.around);
        MyModel.setCallback('around', 'action', callbacks.around);
        var instance = new MyModel();
        instance.action();
        expect(callbacks.toBeSpiedOn.calls.length).toBe(2);
        expect(instance.internalAction.calls.length).toBe(1);
    });
    
    it('should trigger after callback', function() {
        MyModel.setCallback('after', 'action', callbacks.after);
        var instance = new MyModel();
        instance.action();
        expect(callbacks.toBeSpiedOn).toHaveBeenCalledWith('after');
        expect(instance.internalAction).toHaveBeenCalled();
    });
    
    it('should support a method name instead of a function as the callback', function() {
        MyModel.prototype.callback = null;
        spyOn(MyModel.prototype, 'callback');
        MyModel.setCallback('before', 'action', 'callback');
        var instance = new MyModel();
        instance.action();
        expect(instance.callback).toHaveBeenCalled();
        expect(instance.internalAction).toHaveBeenCalled();
    });
    


});