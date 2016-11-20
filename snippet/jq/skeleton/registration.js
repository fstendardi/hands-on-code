//plugin registration
//example: $('<div>').pluginName(opts)
$.fn[pluginName] = function () {
  if (arguments.length === 0 || typeof arguments[0] !== 'string') {
    //plugin intialization
    var options = arguments[0];
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
  } else {
    //handle method invokation
    //...
  }
};

//expose the defaults, they can be changed as needed
$.fn[pluginName].defaults = defaults;