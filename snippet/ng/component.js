; (function (app) {
  "use strict";

  var widgetConfig = {};

  var widgetComponent = {
    controller: ['dep1', 'dep2', WidgetController],
    require: null, //required directives
    bindings: {
      oneWay: '<',
      twoWay: '=',
      primitives: '@',
      functions: '&'
    },
    templateUrl: '/app/widgets/mywidget/template.html'
  }


  function WidgetController(dep1, dep2) {
    //save dependency references
    this.dep1 = dep1;
    this.dep2 = dep2;
  }

  angular.extend(WidgetController.prototype, {

    //called when bindings are initialized
    $onInit: function () {
      this.setDefaults();
    },

    $postLink: function(){
      //called after element is fully linked
      //here you can (shouldn't) manipulate DOM elements
    },

    //notify changes of oneWay bindings
    $onChanges: function(changesObj){},

    //set default values 
    setDefaults: function () {},

    $onDestroy: function(){
      //cleanup resources like $timeout, $interval,...
    },

    //custom methods
  });

  //register default config
  //we can edit them using 
  //app.config(function(scChooserConfig){
  //
  //})
  app.value('myWidgetConfig', widgetConfig);

  app.component('myWidget', chooserComponent);
})(app);