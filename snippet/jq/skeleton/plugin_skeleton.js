;(function ($) {
  "use strict";

  var pluginNamespace = 'my',
      pluginName = pluginNamespace + 'plugin',
      pluginInstance = pluginName,
      cssClassPrefix = pluginName,
      dataPrefix = pluginName;

  //default configurations
  var defaults = {};

  //plugin constructor
  function Plugin(element, options) {
    //save DOM element
    this.element = element;
    //save jQuery element
    this.$element = $(element);
    //save options with fallback on defaults
    this.options = $.extend(true, {}, defaults, options);
    //build widget
    this.build();
  }

  //plugin methods
  $.extend(Plugin.prototype, {

    //build the widget (DOM, event handlers,...)
    build: function(){},

    //refresh the widget (update UI, handlers, ...)
    refresh: function(){},

    //option setter, useful to change option values at runtime
    setOption: function(name, value){
      this.options[name] = value;
      //logic to update the widget based on the option changed
      switch(name){
        case 'option1':{
          //custom logic
        }
        //...
      } 
    },

    //destroy the widget, cleaning up DOM and so on
    destroy: function(){},

    //other methods...
  });

  //plugin registration
  //use: $(selector).myplugin(options)
  $.fn[pluginName] = function (options) {
    options = options || {};
    if (typeof options === 'object'){
      //plugin intialization
      //'this' refers to the jQuery object
      return this.each(function (index, element) {
        var instance = $(element).data(pluginInstance);
        //destroy already existing plugin instance
        if (instance) {
          instance.destroy();
        } 
        instance = new Plugin(element, options);        
        $(element).data(pluginInstance, instance);       
      });
    }
    else if (typeof options === 'string') {
      //handling method invokation on already initialized plugin
      //Examples: 
      //$(em).myplugin('method')
      //$(em).myplugin('method2', 'param1', 'param2')
      var args = Array.prototype.slice.call(arguments, 1);
      var ret = this;
      this.each(function () {
        var instance = $(this).data(pluginInstance);
        if (!instance){
          throw new Error(pluginName + 'instance not initialized');
        }
        switch(options){          
          //handling option set/get
          case 'option':{
            var name = args[0];
            if (args.length === 1){ //get
              ret = instance.options[name];
            }else{ //set
              var value = args[1];
              instance.setOption(name, value);
            }
            break;
          }
          default:{
            //invoke method
            instance[options].apply(instance, args);
          }
        }
      });
      return ret;
    }else{
      throw new Error('Invalid arguments for ' + pluginName + ': ' + options);
    }
  };

  //expose the defaults, they can be changed as needed
  $.fn[pluginName].defaults = defaults;

})(jQuery);