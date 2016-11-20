(function () {
  'use strict';

  var chooserConfig = {
    filterEnabled: true,
    filterTimeout: 200,
    filterMinLength: 3,
    itemTemplate: 'item.text'
  }

  //component definition
  var chooserComponent = {
    controller: ['$scope', '$parse', '$attrs', 'scChooserConfig', ChooserController],
    restrict: 'E',
    require: '^ngModel',
    bindings: {
      model: '=ngModel',
      items: '<',
      filterEnabled: '@',
      filterTimeout: '@',
      filterMinLength: '@',
      itemTemplate: '@',
      itemTemplateUrl: '@'
    },
    templateUrl: '/js/ng/sf-chooser/sf-chooser.html'
  };

  //controller constructor
  function ChooserController($scope, $parse, $attrs, chooserConfig) {
    var self = this;
    this.$scope = $scope;
    this.$parse = $parse;
    this.$attrs = $attrs;
    this.chooserConfig = chooserConfig;
    this.candidatesFilter = '';
    this.choicesFilter = '';
    this.itemIndexMap = {};   //id=>index map used to ensure correct sorting on choices
    this.itemMap = {};
    this.selectedCandidates = {};
    this.selectedChoices = {};

    this.itemOrderBy = function(item){
      return self.itemIndexMap[item.id];
    }

  }

  angular.extend(ChooserController.prototype, {
    
    $onInit: function () {
      this.setDefaults();
    },

    $postLink: function () {
      //needed because of limitations of ng-model-options
      this.$scope.filterTimeout = parseInt(this.$attrs.filterTimeout);
    },

    $onChanges: function(changesObj){
      if (changesObj.items.currentValue){
        this.itemMap = {};
        this.itemIndexMap = {};
        var curVal = changesObj.items.currentValue;
        if (curVal && curVal.length) {
          //update sort map with new indexes and item map by id
          for (var index in curVal) {
            this.itemIndexMap[curVal[index].id] = index;
            this.itemMap[curVal[index].id] = curVal[index];
          }
          if (this.model){
            //remove no more existing items from model
            for(var i = this.model.length -1; i >= 0 ; i--){
                if(!this.itemIndexMap[this.model[i].id]){
                    this.model.splice(i, 1);
                }
            }
          }
        }
      }
    },

    setDefaults: function () {
      this.filterEnabled = this.getDefaultConfig('filterEnabled');
      this.filterTimeout = this.getDefaultConfig('filterTimeout');
      this.filterMinLength = this.getDefaultConfig('filterMinLength');
      this.itemTemplate = this.getDefaultConfig('itemTemplate');
    },

    getDefaultConfig: function(name){
      return (angular.isDefined(this[name])) ? this[name] : this.chooserConfig[name];
    },

    isCandidate: function (item) {
      return !this.isChosen(item);
    },

    isChosen: function (item) {
      return !!(this.model || []).find(function (em) {
        return em.id == item.id;
      });
    },

    candidateClick: function (item, e) {
      this.handleItemClick(item, e, this.selectedCandidates, this.getCandidates());
    },

    choiceClick: function (item, e) {
      this.handleItemClick(item, e, this.selectedChoices, this.model);
    },

    handleItemClick: function (item, e, selectedItems, items) {
      if (e.ctrlKey) {
        selectedItems[item.id] = !selectedItems[item.id];
      }
      else if (e.shiftKey) {
        var index = items.findIndex(function(i){ return i === item});
        var selectedIndexes = items.map(function (item, index) {
          if (selectedItems[item.id]) {
            return index;
          }
          return -1;
        })
        .filter(function (i) {
          return i >= 0 && i !== index;
        })
        .sort();

        var lastSelectedIndex = selectedIndexes[selectedIndexes.length - 1];

        var interval;
        if (lastSelectedIndex < index){
          interval = [lastSelectedIndex, index];
        }else{
          interval = [index, selectedIndexes[0]];
        }
        for (var id in selectedItems) delete selectedItems[id];
        items.slice(interval[0], interval[1] + 1).forEach(function (item) {
          selectedItems[item.id] = true;
        });

      } else {
        for (var id in selectedItems) delete selectedItems[id];
        selectedItems[item.id] = true;
      }
    },

    getItemById: function (id) {
      return this.itemMap[id];
    },

    getItemIndexById: function (id) {
      return this.itemIndexMap[id];
    },

    getCandidates: function(){
      var self = this;
      return this.items.filter(function(item){
        return self.isCandidate(item);  
      });
    },

    chooseSelectedItems: function () {
      for (var id in this.selectedCandidates) {
        var item = this.getItemById(id);
        this.model.push(item);
      }
    },

    chooseAllItems: function () {
      this.model = this.items;
    },

    unchooseSelectedItems: function () {
      for (var id in this.selectedChoices) {

        var index = this.model.findIndex(function (item) {
          return item.id == id;
        });

        this.model.splice(index, 1);
      }
    },

    unchooseAllItems: function () {
      this.model = [];
    },

    renderItem: function (item) {
      var ctx = {
        item: item
      };
      return this.$parse(this.itemTemplate)(ctx);

    }
  });

  myCrmApp.value('scChooserConfig', chooserConfig);

  myCrmApp.component('sfChooser', chooserComponent);

})();