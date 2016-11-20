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