; (function ($) {
  "use strict";

  var pluginName = 'chooser';

  var pluginInstance = 'sc-' + pluginName;

  var defaults = {};

  function Plugin(element, options) {
    element = $(element);
    if (!element.is('select')) {
      throw new Error('Element must be a select');
    }
    this.element = element;
    this.options = $.extend(true, {}, defaults, options);

    this.build();
  }


  Plugin.prototype.build = function () {

    this.element.hide();

    var candidates = this.candidates = [];
    var choices = this.choices = [];

    this.element.find('option').each(function () {

      var obj = {
        value: this.value,
        text: $(this).text()
      };

      if (this.selected) {
        choices.push(obj);
      } else {
        candidates.push(obj);
      }

    });

    var $wrapper = this.$wrapper = $('<div/>').addClass(pluginInstance + '-wrapper');
    this.buildCandidatesContainer();
    this.buildControls();
    this.buildChoicesContainer();

    $wrapper.insertAfter(this.element);
    $wrapper.append(this.element);

  };

  Plugin.prototype.buildControls = function () {
    var $controls = $('<div/>').addClass(pluginInstance + '-controls');

    var $moveLeftBtn = $('<button/>').addClass('btn btn-default ')
      .addClass('btn-move-left')
      .html('<span class="glyphicon glyphicon-chevron-left"/>');
    var $moveRightBtn = $('<button/>').addClass('btn btn-default ')
      .addClass('btn-move-right')
      .html('<span class="glyphicon glyphicon-chevron-right"/>');
    var $moveAllRightBtn = $('<button/>').addClass('btn btn-default ')
      .addClass('btn-move-all-right')
      .html('<span class="glyphicon glyphicon-chevron-right"/><span class="glyphicon glyphicon-chevron-right"/>');
    var $moveAllLeftBtn = $('<button/>').addClass('btn btn-default ')
      .addClass('btn-move-all-left')
      .html('<span class="glyphicon glyphicon-chevron-left"/><span class="glyphicon glyphicon-chevron-left"/>');

    $controls.append($moveLeftBtn);
    $controls.append($moveRightBtn);
    $controls.append($moveAllLeftBtn);
    $controls.append($moveAllRightBtn);

    this.$wrapper.append($controls);
  };

  Plugin.prototype.buildCandidatesContainer = function () {
    var $container = this.buildItemsContainer(this.candidates, pluginInstance + '-candidates');
    this.$wrapper.append($container);
  };

  Plugin.prototype.buildChoicesContainer = function () {
    var $container = this.buildItemsContainer(this.choices, pluginInstance + '-choices');
    this.$wrapper.append($container);
  };

  Plugin.prototype.buildItemsContainer = function (items, cssClass) {
    var $container = $('<div/>').addClass(cssClass);

    var $itemsContainer = $('<div class="list-group"/>').appendTo($container);

    var $items;

    $.each(items, function () {
      var $item = $('<a href="#" class="list-group-item"/>').text(this.text);

      $item.click(function (e) {


        if (e.ctrlKey) {
          $item.toggleClass('active');
        }
        else if (e.shiftKey) {
          var thisIndex = $items.index($item);
          var firstActiveIndex = $items.index($items.filter('.active').first());
          var sortedIndexes = [thisIndex, firstActiveIndex].sort();
          $items.removeClass('active');
          $items.slice(sortedIndexes[0], sortedIndexes[1] + 1).addClass('active');
        } else {
          $items.removeClass('active');
          $item.toggleClass('active');
        }

        return false;
      });
      $item.appendTo($itemsContainer);
    });

    this.$candidateItems = $items = $itemsContainer.find('.list-group-item');

    return $container;
  };

  $.fn[pluginName] = function (options) {

    return this.each(function () {
      if (!$.data(this, pluginInstance)) {
        $.data(this, pluginInstance, new Plugin(this, options));
      }

    });
  };

})(jQuery);