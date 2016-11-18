(function () {
  'use strict';

  myCrmApp.directive('chooser', ChooserDirective);

  function ChooserDirective() {
    var directive = {
      bindToController: true,
      controller: ['$scope', '$parse', '$attrs', ChooserController],
      controllerAs: 'vm',
      restrict: 'E',
      require: '^ngModel',
      scope: {
        model: '=ngModel',
        items: '=',
        filterEnabled: '@',
        filterTimeout: '@',
        itemTemplate: '@',
        itemTemplateUrl: '@'
      },
      templateUrl: '/js/ng/chooser/chooser.html'
    };
    return directive;
  }

  function ChooserController($scope, $parse, $attrs) {
    var self = this;
    this.$scope = $scope;
    this.$parse = $parse;
    this.candidatesFilter = null;
    this.choicesFilter = null;

    this.sortMap = {};
    this.selectedCandidates = {};
    this.selectedChoices = {};

    this.setDefaults();

    this.initWatches();

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

    initWatches: function () {
      this.$scope.$watchCollection('vm.items', function (newVal) {
        self.sortMap = {};
        if (newVal && newVal.length) {
          for (var index in newVal) {
            self.sortMap[newVal[index].id] = index;
          }
        }
      });
    },

    setDefaults: function () {
      this.filterEnabled = (angular.isDefined(this.filterEnabled)) ? this.filterEnabled : true;
      this.filterTimeout = (angular.isDefined(this.filterTimeout)) ? this.filterTimeout : 200;
      this.itemTemplate = (angular.isDefined(this.itemTemplate)) ? this.itemTemplate : 'item.text';

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

    renderItem: function(item){
      var ctx = {
        item: item
      };    
      return this.$parse(this.itemTemplate)(ctx);
      
    }
  });


})();