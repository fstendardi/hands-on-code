; (function ($) {
  "use strict";

  var pluginName = 'chooser'
  var classPrefix = 'sf-' + pluginName;
  var pluginInstance = 'sf-' + pluginName;
  var dataPrefix = "sf" + pluginName;

  var defaults = {
    filterEnabled: true,
    filterTimeout: 200,
    itemTemplate: function ($item, data) {
      return data.text;
    }
  };

  function Chooser(select, options) {
    this.select = $(select);
    if (!this.select.is('select') || !this.select.attr('multiple')) {
      throw new Error('Element must be a select[multiple]');
    }
    this.options = $.extend(true, {}, defaults, options);
    this.build();
  }

  $.extend(Chooser.prototype, {

    build: function () {
      this.select.hide();
      this.$container = $('<div/>').addClass(classPrefix + '-container')
                                   .insertAfter(this.select)
                                   .append(this.select);

      this.buildCandidatesfontainer();
      this.buildControls();
      this.buildChoicesfontainer();

      this.setOption('filterEnabled', this.options.filterEnabled);
      
      this.refresh();
    },

    buildCandidatesfontainer: function () {
      this.$candidatesfontainer = $('<div/>').addClass(classPrefix + '-candidates')
                                            .appendTo(this.$container);      
      this.$candidatesFilter = this.buildFilterControl(this.$candidatesfontainer)
                                   .appendTo(this.$candidatesfontainer);      
    },

    buildChoicesfontainer: function () {
      this.$choicesfontainer = $('<div/>').addClass(classPrefix + '-choices')
                                          .appendTo(this.$container);
      this.$choicesFilter = this.buildFilterControl(this.$choicesfontainer)
                                .appendTo(this.$choicesfontainer);    
    },

    buildControls: function () {
      var me = this;
      this.$controls = $('<div/>').addClass(classPrefix + '-controls');

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
      var $options = this.select.find('option');
      var $unselected = $options.filter(':not(:selected)');
      var $selected = $options.filter(':selected');
      this.refreshItems($unselected, this.$candidatesfontainer, this.$candidatesFilter);
      this.refreshItems($selected, this.$choicesfontainer, this.$choicesFilter);
      this.refreshControls();
    },

    buildFilterControl: function ($itemsfontainer) {
      var self = this;
      var searchTimeout;
      var $filterContainer =
        $('<div class="input-group ' + classPrefix + '-filter">'
          + '<input type="text" class="form-control">'
          + '<div class="input-group-addon">'
          + '<span class="glyphicon glyphicon-search"></span>'
          + '</div>'
          + '</div>');
      var $filterInput = $filterContainer.find('input');

      $filterInput.keyup(function () {
        var query = $(this).val();
        if (searchTimeout) {
          clearTimeout(searchTimeout);
        }
        searchTimeout = setTimeout(function () {
          self.filterItems(self.getItems($itemsfontainer), query);
        }, self.options.filterTimeout);

      });

      return $filterContainer;
    },

    filterItems: function ($items, query) {
      query = query || '';
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
    },

    buildMoveBtn: function (icon, direction, moveAll) {
      var me = this;
      var $icon = $('<span class="glyphicon glyphicon-' + icon + '"/>');
      var customClass = 'btn-move-' + direction + ((moveAll) ? '-all' : '');
      return $('<button type="button"/>').addClass('btn btn-default ')
        .addClass(customClass)
        .append($icon)
        .click(function () {
          me.moveItems(direction, moveAll);
        });
    },

    refreshItems: function ($options, $container, $filterControl) {
      var me = this;
      var activeIds = {}

      this.getItems($container, true).each(function (index, item) {
        activeIds[$(item).data(dataPrefix + 'Data').id] = true;
      });

      $container.find('>.' + classPrefix + '-items').remove();

      var $itemsfontainer = $('<div class="list-group"/>').appendTo($container)
        .addClass(classPrefix + '-items');

      var $items = $();

      $options.each(function () {
        var $option = $(this);
        var data = {
          id: this.value,
          text: $option.text(),
          $option: $option
        };

        var $item = $('<a href="#" class="list-group-item"/>').addClass(classPrefix + '-item')
          .data(dataPrefix + 'Data', data);

        if (data.id in activeIds) {
          $item.addClass('active');
        }

        $item.html(me.options.itemTemplate($item, data));

        $item.click(function (e) {
          me.handleItemClick(e, $items);
        });

        $items = $items.add($item);
      });

      $itemsfontainer.append($items);

      if ($filterControl) {
        this.filterItems($items, $filterControl.find('input').val());
      }

    },

    handleItemClick: function (e, $items) {
      e.preventDefault();
      var $item = $(e.currentTarget);
      if (e.ctrlKey) {
        $item.toggleClass('active');
      }
      else if (e.shiftKey) {
        var thisIndex = $items.index($item);
        var activeItems = $items.filter('.active');
        var lastActiveIndex = $items.index(activeItems.last());
        var interval;
        if (lastActiveIndex < thisIndex) {
          interval = [lastActiveIndex, thisIndex];
        } else {
          var firstActiveIndex = $items.index(activeItems.first())
          interval = [thisIndex, firstActiveIndex];
        }
        $items.removeClass('active')
          .slice(interval[0], interval[1] + 1)
          .addClass('active');
      } else {
        $items.removeClass('active');
        $item.addClass('active');
      }
    },

    refreshControls: function () {
      var $candidates = this.getItems(this.$candidatesfontainer);
      var $choices = this.getItems(this.$choicesfontainer);

      this.$moveAllRightBtn.attr('disabled', $candidates.size() === 0);
      this.$moveRightBtn.attr('disabled', $candidates.size() === 0);
      this.$moveAllLeftBtn.attr('disabled', $choices.size() === 0);
      this.$moveLeftBtn.attr('disabled', $choices.size() === 0);
    },

    getItems: function ($container, active) {
      return $container.find('.' + classPrefix + '-item' + ((active === true) ? '.active' : ''));
    },

    moveItems: function (direction, all) {
      var $container;
      if (direction == 'right') {
        $container = this.$candidatesfontainer;
      } else {
        $container = this.$choicesfontainer;
      }
      var selectedIds = this.getItems($container, !all)
        .toArray()
        .map(function (em) {
          return $(em).data(dataPrefix + 'Data').id;
        });
      if (selectedIds.length) {
        if (direction == 'right') {
          this.select.val((this.select.val() || []).concat(selectedIds));
        } else {
          this.select.find('option[value=' + selectedIds.join('],[value=') + ']')
            .removeAttr('selected')
        }
        this.select.change();
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
      this.select.insertAfter(this.$container).show();
      this.$container.remove();
    }
  });

  $.fn[pluginName] = function () {
    //option getter
    if (typeof arguments[0] === 'string') {      
      var instance = $(this).data(pluginInstance);
      var method = arguments[0];
      var returnValue = $(this);
      switch(method){
        case 'option':{
          var name = arguments[1];
          if (arguments.length === 2){
            returnValue = instance.options[name];
          }else{
            instance.setOption(name, arguments[2]);
            returnValue = undefined;
          }
          break;
        }
        case 'destroy':{
          instance.destroy();
          break;          
        }
      }
      return returnValue;
    }     
    //plugin initialization
    else {
      var options = arguments[0];
      return this.each(function () {
        var instance = $(this).data(pluginInstance);
        if (instance) {
          instance.destroy();
        } 

        $(this).data(pluginInstance, new Chooser(this, options));       
      });
    }

  };

  $.fn[pluginName].defaults = defaults;

})(jQuery);