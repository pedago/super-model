'use strict';

/**
# SuperModel.Callbacks
Callbacks are code hooks that are run at key points in an object's lifecycle. 
The typical use case is to have a base class define a set of callbacks relevant to the other 
functionality it supplies, so that subclasses can install callbacks that enhance or modify 
the base functionality without needing to override or redefine methods of the base class.  
 

SuperModel allows you to define the events in the object’s lifecycle that will support callbacks 
(via the class method define_callbacks), set the instance methods or functions to be called 
(via the class method set_callback), and run the installed callbacks at the appropriate times (via run_callbacks).  
  

Three kinds of callbacks are supported:   

**before** callbacks, run before a certain event;  
**after** callbacks, run after the event;  
**around** callbacks, blocks that surround the event, triggering the event within the callback.  
  

Callback code can be contained in instance methods or functions.

 [link text](#abcd)
 */
 
 



describe('SuperModel.Callbacks', function() {

    var MyModel, SuperModel, callbacks, calledCount;

    beforeEach(function() {
        module('SuperModel');
        calledCount = 0;

        inject(function(_SuperModel_) {
            SuperModel = _SuperModel_;
            
            // ### Defining callbacks
            // use the class method _defineCallbacks_ to define an event that supports callbacks,
            // and then use the classMethod _runCallbacks_ to trigger the callbacks when that
            // event occurs.
            MyModel = SuperModel.subclass(function() {
                // ... 
                //define the callback
                this.defineCallbacks('action');
                
                return {
                    action: function() {
                        //trigger the callback
                        this.runCallbacks('action', function() {
                            this.internalAction();
                        });
                    },
                    internalAction: function() {
                        expect(this.constructor).toBe(MyModel);
                    }
                };
            });
            
            spyOn(MyModel.prototype, 'internalAction').andCallThrough();
        });

    });
    
    // ### Setting a before callback
    // <a id="setting-a-before-callback"></a>
    it('should trigger before callback', function() {
        MyModel.setCallback('before', 'action', function() {
            calledCount = calledCount + 1;
        });
        var instance = new MyModel();
        instance.action();
        expect(calledCount).toBe(1);
        expect(instance.internalAction).toHaveBeenCalled();
    });
    
    // ### Setting an around callback
    // The event will be passed to the around callback.  The around callback
    // must call the event.
    // <a id="setting-an-around-callback"></a>
    it('should trigger around callback', function() {
        // ...
        MyModel.setCallback('around', 'action', function(event) {
            calledCount = calledCount + 1;
            
            //calling the event inside of the callback
            event();
        });
        var instance = new MyModel();
        instance.action();
        expect(calledCount).toBe(1);
        expect(instance.internalAction).toHaveBeenCalled();
    });
    
    // If there are multiple around callbacks, each one will be passed
    // along to the next callback in the list, so the event itself
    // will only be called once.  (If this doesn't make sense, just don't
    // think about it.  The main point is that multiple around callbacks work
    // as you would expect.)
    it('should trigger multiple around callbacks', function() {
        var callback = function(event) {
            calledCount = calledCount + 1;
            event();
        }
        MyModel.setCallback('around', 'action', callback);
        MyModel.setCallback('around', 'action', callback);
        var instance = new MyModel();
        instance.action();
        expect(calledCount).toBe(2);
        expect(instance.internalAction.calls.length).toBe(1);
    });
    
    // ### Setting an after callback
    // <a id="setting-an-after-callback"></a>
    it('should trigger after callback', function() {
        MyModel.setCallback('after', 'action', function() {
            calledCount = calledCount + 1;
        });
        var instance = new MyModel();
        instance.action();
        expect(calledCount).toBe(1);
        expect(instance.internalAction).toHaveBeenCalled();
    });
    
    // ### 'this' inside a callback
    // Callbacks are called in the context of the instance, so
    // inside of a callback 'this' refers to the 
    // <a id="this-inside-a-callback"></a>
    it('should call callbacks in the context of the instance', function() {
        // ...
        var instance = new MyModel();
        
        MyModel.setCallback('before', 'action', function() {
            calledCount = calledCount + 1;
            expect(this).toBe(instance);
        });
        
        instance.action();
        expect(calledCount).toBe(1);
    });
    
    // ### calling setCallback with the name of an instance method
    // Instead of passing a function to setCallback, you can pass
    // the name of an instance method.
    // <a id="setCallback-with-instance-method"></a>
    it('should support a method name instead of a function as the callback', function() {
        // ...
        MyModel.prototype.callback = function() {
            calledCount = calledCount + 1;
        };
        
        //'callback' is the name of an instance method on MyModel
        MyModel.setCallback('before', 'action', 'callback');
        var instance = new MyModel();
        instance.action();
        expect(calledCount).toBe(1);
        expect(instance.internalAction).toHaveBeenCalled();
    });   


});