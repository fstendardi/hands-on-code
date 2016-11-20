;(function ($) {
  "use strict";

  var pluginNamespace = 'sf',
      pluginName = pluginNamespace + 'chooser',
      cssClassPrefix = pluginName,
      pluginInstance = pluginName,
      dataPrefix = pluginName;

  var defaults = {
    filterEnabled: true,
    filterTimeout: 200,
    filterMinLength: 3,
    itemTemplate: function ($item, data) {
      return data.text;
    }
  };

function Chooser(element, options) {
  this.element = element;
  this.$element = $(element);
  if (!this.$element.is('select') || !this.$element.attr('multiple')) {
    throw new Error('Element must be a select[multiple]');
  }
  this.options = $.extend(true, {}, defaults, options);
  this.build();
}

  $.extend(Chooser.prototype, {

    build: function () {
      this.$element.hide();
      this.$container = $('<div/>').addClass(cssClassPrefix + '-container')
                                   .insertAfter(this.$element);

      this.buildCandidates();
      this.buildControls();
      this.buildChoices();
      
      this.setOption('filterEnabled', this.options.filterEnabled);
      
      this.refresh();
    },

    buildCandidates: function () {
      this.$candidatesContainer = $('<div/>').addClass(cssClassPrefix + '-candidates')
                                             .appendTo(this.$container);      
      this.$candidatesFilter = this.buildFilterControl(this.$candidatesContainer)
                                   .appendTo(this.$candidatesContainer);      
    },

    buildChoices: function () {
      this.$choicesContainer = $('<div/>').addClass(cssClassPrefix + '-choices')
                                          .appendTo(this.$container);
      this.$choicesFilter = this.buildFilterControl(this.$choicesContainer)
                                .appendTo(this.$choicesContainer);    
    },

    buildControls: function () {
      var self= this;
      this.$controls = $('<div/>').addClass(cssClassPrefix + '-controls');

      this.$moveLeftBtn = this.buildMoveBtn('chevron-left', 'left', false);
      this.$moveRightBtn = this.buildMoveBtn('chevron-right', 'right', false);
      this.$moveAllRightBtn = this.buildMoveBtn('fast-forward', 'right', true);
      this.$moveAllLeftBtn = this.buildMoveBtn('fast-backward', 'left', true);

      this.$controls.append(this.$moveRightBtn)
                    .append(this.$moveLeftBtn)
                    .append(this.$moveAllRightBtn)
                    .append(this.$moveAllLeftBtn)
                    .appendTo(this.$container);
    },

    refresh: function () {
      var $options = this.$element.find('option');
      var $unselected = $options.filter(':not(:selected)');
      var $selected = $options.filter(':selected');
      this.refreshItems($unselected, this.$candidatesContainer, this.$candidatesFilter);
      this.refreshItems($selected, this.$choicesContainer, this.$choicesFilter);
      this.refreshControls();
    },

    buildFilterControl: function ($itemsContainer) {
      var self = this;
      var $filterContainer =
        $('<div class="input-group ' + cssClassPrefix + '-filter">'
          + '<input type="text" class="form-control">'
          + '<div class="input-group-addon">'
          + '<span class="glyphicon glyphicon-search"></span>'
          + '</div>'
          + '</div>');

      var $filterInput = $filterContainer.find('input');
      var searchTimeout;

      $filterInput.keyup(function () {
        var query = $(this).val();
        if (searchTimeout) {
          clearTimeout(searchTimeout);
        }
        searchTimeout = setTimeout(function () {
          self.filterItems(self.getItems($itemsContainer), query);
        }, self.options.filterTimeout);
      });

      return $filterContainer;
    },

    filterItems: function ($items, query) {
      query = $.trim(query || '');
      if (query.length < this.options.filterMinLength){
        $items.show();
      }else{
        $items.each(function (index, item) {
          var $item = $(item);
          var data = $item.data(dataPrefix + 'Data');
          var text = (data.text || '').toLowerCase();
          if (text.indexOf(query.toLowerCase()) >= 0) {
            $item.show();
          } else {
            $item.hide();
          }
        });
      }
    },

    buildMoveBtn: function (icon, direction, moveAll) {
      var self= this;
      var $icon = $('<span class="glyphicon glyphicon-' + icon + '"/>');
      var customCssClass = 'btn-move-' + direction + ((moveAll) ? '-all' : '');
      return $('<button/>').attr('type','button')
                           .addClass('btn btn-default')
                           .addClass(customCssClass)
                           .append($icon)
                           .click(function () {
                             self.moveItems(direction, moveAll);
                           });
    },

    refreshItems: function ($options, $container, $filterControl) {
      var self= this;
      var activeIds = {}
      //get current active items, to restore them later
      this.getItems($container, true).each(function (index, item) {
        activeIds[$(item).data(dataPrefix + 'Data').id] = true;
      });
      //remove current items container
      $container.find('.' + cssClassPrefix + '-items').remove();

      var $itemsContainer = $('<div class="list-group"/>')
                                          .appendTo($container)
                                          .addClass(cssClassPrefix + '-items');
      var $items = $();

      $options.each(function () {
        var $option = $(this);
        var active = $option.attr('value') in activeIds;
        var $item = self.buildItem($option, active, $items);
        $items = $items.add($item);
      });

      $itemsContainer.append($items);

      if ($filterControl) {
        this.filterItems($items, $filterControl.find('input').val());
      }
    },

    buildItem: function($option, active){
      var self = this;
      var data = {
        id: $option.attr('value'),
        text: $option.text(),
        $option: $option
      };
      var $item = $('<a href="#" class="list-group-item"/>')
                      .addClass(cssClassPrefix + '-item')
                      .addClass((active) ? 'active' : '')
                      .data(dataPrefix + 'Data', data)                      
                      .click(function (e) {
                        self.handleItemClick(e);
                      });
      //apply item template
      return $item.html(this.options.itemTemplate($item, data))
    },

    handleItemClick: function (e) {
      e.preventDefault();
      var $item = $(e.currentTarget);
      if (e.ctrlKey) {
        $item.toggleClass('active');
      }
      else if (e.shiftKey) {
        var $items = this.getItems($item.parent());
        var index = $items.index($item);
        var activeItems = $items.filter('.active');
        var lastActiveIndex = $items.index(activeItems.last());
        var interval;
        if (lastActiveIndex < index) {
          interval = [lastActiveIndex, index];
        } else {
          var firstActiveIndex = $items.index(activeItems.first())
          interval = [index, firstActiveIndex];
        }
        $items.removeClass('active')
              .slice(interval[0], interval[1] + 1)
              .addClass('active');
      } else {
        $item.siblings().removeClass('active');
        $item.addClass('active');
      }
    },

    refreshControls: function () {
      var $candidates = this.getItems(this.$candidatesContainer);
      var $choices = this.getItems(this.$choicesContainer);

      this.$moveAllRightBtn.attr('disabled', $candidates.size() === 0);
      this.$moveRightBtn.attr('disabled', $candidates.size() === 0);
      this.$moveAllLeftBtn.attr('disabled', $choices.size() === 0);
      this.$moveLeftBtn.attr('disabled', $choices.size() === 0);
    },

    getItems: function ($container, active) {
      var selector = '.' + cssClassPrefix + '-item';
      if(active){
        selector += '.active';
      }
      return $container.find(selector);
    },

    moveItems: function (direction, all) {
      var $container;
      if (direction == 'right') {
        $container = this.$candidatesContainer;
      } else {
        $container = this.$choicesContainer;
      }
      var selectedIds = this.getItems($container, !all)
                            .toArray()
                            .map(function (em) {
                              return $(em).data(dataPrefix + 'Data').id;
                            });
      if (selectedIds.length) {
        if (direction == 'right') {
          this.$element.val((this.$element.val() || []).concat(selectedIds));
        } else {
          this.$element.find('option[value=' + selectedIds.join('],[value=') + ']')
                       .removeAttr('selected')
        }
        this.$element.change();
        this.refresh();
      }
    },

    setOption: function(name, value){
      this.options[name] = value;
      switch(name){
        case 'filterEnabled':{
          if (value){
            this.$candidatesFilter.show();
            this.$choicesFilter.show();
          }else{
            this.$candidatesFilter.hide();    
            this.$choicesFilter.hide();
          }
          break;
        }
      }
      
    },

    destroy: function(){
      this.$element.show();
      this.$container.remove();
    }
  });

  $.fn[pluginName] = function (options) {
    options = options || {};
    if (typeof options === 'object'){
      return this.each(function (index, element) {
        var instance = $(element).data(pluginInstance);
        if (instance) {
          instance.destroy();
        } 
        instance = new Chooser(element, options);
        $(element).data(pluginInstance, instance);       
      });      
    }
    else if (typeof options === 'string') {
      var args = Array.prototype.slice.call(arguments, 1);
      var ret = this;
      this.each(function () {
        var instance = $(this).data(pluginInstance);
        switch(options){
          case 'option':{
            var name = args[0];
            if (args.length === 1){
              ret = instance.options[name];
            }else{
              var value = args[1];
              instance.setOption(name, value);
            }
            break;
          }
          default:{
            instance[options].apply(instance, args);
          }
        }
      });
      return ret;
    }else{
      throw new Error('Invalid arguments for ' + pluginName + ': ' + options);
    }
  };

  $.fn[pluginName].defaults = defaults;

})(jQuery);