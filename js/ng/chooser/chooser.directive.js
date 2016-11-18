(function () {
  'use strict';

 
  var chooserConfig = {
    filterEnabled: true,
    filterTimeout: 200,
    itemTemplate: 'item.text'
  }

  //component definition
  var chooserComponent = {
    controller: ['$scope', '$parse', '$attrs', 'chooserConfig', ChooserController],
    restrict: 'E',
    require: '^ngModel',
    bindings: {
      model: '=ngModel',
      items: '=',
      filterEnabled: '@',
      filterTimeout: '@',
      itemTemplate: '@',
      itemTemplateUrl: '@'
    },
    templateUrl: '/js/ng/chooser/chooser.html'
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
    this.sortMap = {};   //id=>index map used to ensure correct sorting on choices
    this.selectedCandidates = {};
    this.selectedChoices = {};

    this.isCandidate = function (item) {
      return !self.isChosen(item);
    }

    this.isChosen = function (item) {
      return !!(self.model || []).find(function (em) {
        return em.id == item.id;
      });
    }

  }

  angular.extend(ChooserController.prototype, {
    
    $onInit: function () {
      this.setDefaults();
      this.initWatches();
    },

    $postLink: function () {
      this.$scope.filterTimeout = parseInt(this.$attrs.filterTimeout);
    },

    initWatches: function () {
      var self = this;

      //watch items to keep sortMap updated
      //I didn't set the deepWatch flag because I only need to
      //know when items count changes
      this.$scope.$watchCollection('$ctrl.items', function (newVal) {
        self.sortMap = {};
        if (newVal && newVal.length) {
          for (var index in newVal) {
            self.sortMap[newVal[index].id] = index;
          }
        }
      });
    },

    setDefaults: function () {
      this.filterEnabled = this.getDefaultConfig('filterEnabled');
      this.filterTimeout = this.getDefaultConfig('filterTimeout');
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
      this.itemClick(item, e, this.selectedCandidates);
    },

    choiceClick: function (item, e) {
      this.itemClick(item, e, this.selectedChoices);
    },

    itemClick: function (item, e, selectedMap) {
      if (e.ctrlKey) {
        selectedMap[item.id] = !selectedMap[item.id];
      }
      else if (e.shiftKey) {
        var index = this.getItemIndexById(item.id);
        var firstSelectedIndex = this.items.map(function (item, index) {
          if (selectedMap[item.id]) {
            return index;
          }
          return -1;
        })
          .filter(function (index) {
            return index >= 0;
          })
          .sort()[0];

        var sortedIndexes = [index, firstSelectedIndex].sort();

        this.items.slice(sortedIndexes[0], sortedIndexes[1] + 1).forEach(function (item) {
          selectedMap[item.id] = true;
        });

      } else {
        for (var id in selectedMap) delete selectedMap[id];
        selectedMap[item.id] = true;
      }
    },

    getItemById: function (id) {
      return this.items.find(function (em) {
        return em.id == id;
      });
    },

    getItemIndexById: function (id) {
      return this.items.findIndex(function (em) {
        return em.id == id;
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

  myCrmApp.value('chooserConfig', chooserConfig);

  myCrmApp.component('chooser', chooserComponent);

})();