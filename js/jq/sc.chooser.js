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

  function Plugin(select, options) {
    select = $(select);
    if (!select.is('select')) {
      throw new Error('Element must be a select');
    }
    this.select = select;
    this.options = $.extend(true, {}, defaults, options);
    this.build();
    
  }

  Plugin.prototype.build = function () {
    this.select.hide();

    var candidates = this.candidates = [];
    var choices = this.choices = [];

    this.select.find('option').each(function () {

      var obj = {
        id: this.value,
        text: $(this).text()
      };

      if (this.selected) {
        choices.push(obj);
      } else {
        candidates.push(obj);
      }

    });

    var $container = this.$container = $('<div/>').addClass(classPrefix + '-container');
    this.buildCandidatesContainer();
    this.buildControls();
    this.buildChoicesContainer();
    
    this.refresh();

    $container.insertAfter(this.select);
    $container.append(this.select);

  };

  Plugin.prototype.buildControls = function () {    
    var me = this;
    var $controls = $('<div/>').addClass(classPrefix + '-controls');

    this.$moveLeftBtn = this.buildMoveBtn('chevron-left','left',false);
    this.$moveRightBtn = this.buildMoveBtn('chevron-right','right',false);
    this.$moveAllRightBtn = this.buildMoveBtn('fast-forward','right',true);
    this.$moveAllLeftBtn = this.buildMoveBtn('fast-backward','left',true);

    $controls.append(this.$moveRightBtn);
    $controls.append(this.$moveLeftBtn);
    $controls.append(this.$moveAllRightBtn);
    $controls.append(this.$moveAllLeftBtn);

    this.$container.append($controls);
  };
  
  Plugin.prototype.buildMoveBtn = function (icon, direction, moveAll) {
    var me = this;
    var $icon = $('<span class="glyphicon glyphicon-' + icon + '"/>');
    var cssClass = 'btn-move-' + direction + ((moveAll) ? '-all':'');
    return $('<button type="button"/>').addClass('btn btn-default ' + cssClass)
                                        .append($icon)
                                        .click(function () {
                                          me.moveItems(direction, moveAll);  
                                        });
  }

  Plugin.prototype.buildCandidatesContainer = function () {
    var me = this;
    this.$candidatesContainer = $('<div/>').addClass(classPrefix + '-candidates');
    if (this.options.filterEnabled){      
      this.buildSearchControl(this.$candidatesContainer); 
    }
    this.$container.append(this.$candidatesContainer);  
  };

  Plugin.prototype.buildChoicesContainer = function () {
    this.$choicesContainer = $('<div/>').addClass(classPrefix + '-choices');
    if (this.options.filterEnabled){         
      this.buildSearchControl(this.$choicesContainer);
    }
    this.$container.append(this.$choicesContainer);
  };
  
  Plugin.prototype.buildSearchControl = function($itemsContainer){
    var me = this;
    var $searchControl = $('<div class="input-group '+ classPrefix + '-filter">'
                            +'<input type="text" class="form-control" name="search">'
                            +'<div class="input-group-addon">'
                              +'<span class="glyphicon glyphicon-search" aria-hidden="true"></span>'
                            +'</div>'
                          +'</div>').appendTo($itemsContainer).find('input');
    
    var searchTimeout;
    $searchControl.keyup(function () {
      var query = $(this).val() || '';
      if (searchTimeout) {
        clearTimeout(searchTimeout);
      }

      searchTimeout = setTimeout(function () {
        me.getItems($itemsContainer).each(function (index, item) {
          var $item = $(item);
          var data = $item.data(dataPrefix + 'Data');
          var text = (data.text || '').toLowerCase();
          
          if (text.indexOf(query.toLowerCase()) >= 0){
            $item.show();
          }else{
            $item.hide();
          }
          
        });
      }, me.options.filterTimeout);

    });    
  }
  
  Plugin.prototype.refresh = function(){
    var $options = this.select.find('option');    
    var $unselected = $options.filter(':not(:selected)');
    var $selected = $options.filter(':selected');
    this.refreshItems($unselected, this.$candidatesContainer ); 
    this.refreshItems($selected, this.$choicesContainer );
    
    this.refreshControls();
  }

  Plugin.prototype.refreshItems = function ($options, $container) {
    var me = this;
    var activeIds = {}
    
    this.getItems($container, true).each(function (index, item) {                
        activeIds[$(item).data(dataPrefix + 'Data').id] = true;
    });
    
    $container.find('>.list-group').remove();

    var $itemsContainer = $('<div class="list-group"/>').appendTo($container);

    var $items = $();

    $options.each(function () {
      var $option = $(this);
      var data = {
        id: this.value,
        text: $option.text(),
        $option: $option
      };
      
      var $item = $('<a href="#" class="list-group-item"/>')
                  .addClass(classPrefix + '-item')
                  .data(dataPrefix + 'Data', data);                  
      
      if (data.id in activeIds){
        $item.addClass('active');
      }
      
      $item.html(me.options.itemFormat($item, data));

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
      $items = $items.add($item);
    });

    return $container;
  };
  
  Plugin.prototype.refreshControls = function () {
    var $candidates = this.getItems(this.$candidatesContainer);
    var $choices = this.getItems(this.$choicesContainer);
    
    this.$moveAllRightBtn.attr('disabled', $candidates.size() === 0);
    this.$moveRightBtn.attr('disabled', $candidates.size() === 0);
    this.$moveAllLeftBtn.attr('disabled', $choices.size() === 0);
    this.$moveLeftBtn.attr('disabled', $choices.size() === 0);    
  };
  
  Plugin.prototype.getItems = function ($container, active) {  
    return $container.find('.' + classPrefix + '-item' + ((active === true) ? '.active' : ''));
  }
  
  Plugin.prototype.moveItems = function(direction, all) {
      var $container;
      if (direction == 'right'){
        $container = this.$candidatesContainer;
      }else{
        $container = this.$choicesContainer;
      }
      var selectedIds = this.getItems($container, !all)
                                  .toArray()
                                  .map(function(em){
                                    return $(em).data(dataPrefix + 'Data').id;
                                  });
      if (selectedIds.length){
        if (direction == 'right'){
          this.select.val((this.select.val() || []).concat(selectedIds));
        }else{
          this.select.find('option[value=' + selectedIds.join('],[value=') + ']')
                     .removeAttr('selected')
        }
        this.select.change();
        this.refresh();
      }                            
                                  
    }

  $.fn[pluginName] = function (options) {

    return this.each(function () {
      if (!$.data(this, pluginInstance)) {
        $.data(this, pluginInstance, new Plugin(this, options));
      }

    });
  };

})(jQuery);