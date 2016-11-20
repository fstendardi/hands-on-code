if (arguments.length === 0 || typeof arguments[0] !== 'string'){
  //plugin intialization
  //...
}else{
  //handling method invokation on already initialized plugin
  //Examples: 
  //$(em).myplugin('method')
  //$(em).myplugin('method2', 'param1', 'param2')
  var instance = $(this).data(pluginInstance);
  var method = arguments[0];
  var returnValue = $(this);
  switch(method){    
    //handling option set/get
    case 'option':{
      var name = arguments[1];
      if (arguments.length === 2){
        returnValue = instance.options[name];
      }else{
        instance.setOption(name, arguments[2]);
      }
      break;
    }
    //handling plugin destroy
    case 'destroy':{
      instance.destroy();
      break;          
    }
    //... other case statements to manage other methods
  }
  return returnValue;
}  