; (function ($) {
  "use strict";

  var pluginName = 'chooser'
  var classPrefix = 'sc-' + pluginName;
  var pluginInstance = 'sc.' + pluginName;
  var dataPrefix = "sc" + pluginName;

  var defaults = {
    filterEnabled: true,
    filterTimeout: 200,
    itemFormat: function (item, data) {
      return data.text;
    }
  };

  function Chooser(select, options) {
    this.select = $(select);
    if (!this.select.is('select')) {
      throw new Error('Element must be a select');
    }
    this.options = $.extend(true, {}, defaults, options);
    this.build();
  }

  $.extend(Chooser.prototype, {

    build: function () {
      this.select.hide();
      this.$container = $('<div/>');

      this.buildCandidatesContainer();
      this.buildChoicesContainer();
      this.buildControls();

      this.$container.append(this.$candidatesContainer);
      this.$container.append(this.$controls);
      this.$container.append(this.$choicesContainer);

      this.$container.addClass(classPrefix + '-container')
                     .insertAfter(this.select)
                     .append(this.select);

      this.refresh();
    },

    buildCandidatesContainer: function () {
      this.$candidatesContainer = $('<div/>').addClass(classPrefix + '-candidates');
      if (this.options.filterEnabled) {
        this.$candidatesFilter = this.buildFilterControl(this.$candidatesContainer)
          .appendTo(this.$candidatesContainer);
      }
    },

    buildChoicesContainer: function () {
      this.$choicesContainer = $('<div/>').addClass(classPrefix + '-choices');
      if (this.options.filterEnabled) {
        this.$choicesFilter = this.buildFilterControl(this.$choicesContainer)
                                  .appendTo(this.$choicesContainer);
      }
    },

    buildControls: function () {
      var me = this;
      this.$controls = $('<div/>').addClass(classPrefix + '-controls');

      this.$moveLeftBtn = this.buildMoveBtn('chevron-left', 'left', false);
      this.$moveRightBtn = this.buildMoveBtn('chevron-right', 'right', false);
      this.$moveAllRightBtn = this.buildMoveBtn('fast-forward', 'right', true);
      this.$moveAllLeftBtn = this.buildMoveBtn('fast-backward', 'left', true);

      this.$controls.append(this.$moveRightBtn);
      this.$controls.append(this.$moveLeftBtn);
      this.$controls.append(this.$moveAllRightBtn);
      this.$controls.append(this.$moveAllLeftBtn);

    },

    refresh: function () {
      var $options = this.select.find('option');
      var $unselected = $options.filter(':not(:selected)');
      var $selected = $options.filter(':selected');
      this.refreshItems($unselected, this.$candidatesContainer, this.$candidatesFilter);
      this.refreshItems($selected, this.$choicesContainer, this.$choicesFilter);

      this.refreshControls();
    },

    buildFilterControl: function ($itemsContainer) {
      var self = this;
      var searchTimeout;
      var $filterContainer =
        $( '<div class="input-group ' + classPrefix + '-filter">'
          +   '<input type="text" class="form-control" name="search">'
          +   '<div class="input-group-addon">'
          +     '<span class="glyphicon glyphicon-search" aria-hidden="true"></span>'
          +   '</div>'
          + '</div>');
      var $filterInput = $filterContainer.find('input');

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
      var cssClass = 'btn-move-' + direction + ((moveAll) ? '-all' : '');
      return $('<button type="button"/>').addClass('btn btn-default ' + cssClass)
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

      var $itemsContainer = $('<div class="list-group"/>')
                                                      .addClass(classPrefix + '-items')
                                                      .appendTo($container);

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

        $item.html(me.options.itemFormat($item, data));

        $item.click(function (e) {
          if (e.ctrlKey) {
            $item.toggleClass('active');
          }
          else if (e.shiftKey) {
            var thisIndex = $items.index($item);
            var activeItems = $items.filter('.active');
            var lastActiveIndex = $items.index(activeItems.last());
            var interval;
            if (lastActiveIndex < thisIndex){
              interval = [lastActiveIndex, thisIndex];
            }else{
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

          return false;
        });
        
        $items = $items.add($item);
      });

      $itemsContainer.append($items);

      if ($filterControl){
        this.filterItems($items, $filterControl.find('input').val());
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
      return $container.find('.' + classPrefix + '-item' + ((active === true) ? '.active' : ''));
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
          this.select.val((this.select.val() || []).concat(selectedIds));
        } else {
          this.select.find('option[value=' + selectedIds.join('],[value=') + ']')
            .removeAttr('selected')
        }
        this.select.change();
        this.refresh();
      }
    }
  });

  $.fn[pluginName] = function (options) {
    return this.each(function () {
      if (!$.data(this, pluginInstance)) {
        $.data(this, pluginInstance, new Chooser(this, options));
      }
    });
  };

  $.fn[pluginName].defaults = defaults;

})(jQuery);