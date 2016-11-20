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
      case 'option1':{ /* custom logic*/ }
      //...
    } 
  },

  //destroy the widget, cleaning up DOM and so on
  destroy: function(){},

  //other methods...
});