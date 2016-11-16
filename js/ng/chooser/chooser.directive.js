(function () {
  'use strict';

  myCrmApp.directive('chooser', ChooserDirective);

  function ChooserDirective() {
    var directive = {
      bindToController: true,
      controller: ['$scope', ChooserController],
      controllerAs: 'vm',
      restrict: 'E',
      require: '^ngModel',
      scope: {
        model: '=ngModel',
        items: '=',
        filterEnabled: '='
      },
      templateUrl: '/js/ng/chooser/chooser.html'
    };
    return directive;
  }

  function ChooserController($scope) {
    var self = this;
    this.candidatesFilter = null;
    this.choicesFilter = null;

    this.selectedCandidates = {};
    this.selectedChoices = {};

    this.sortMap = {};

    $scope.$watchCollection('vm.items', function(newVal){
      self.sortMap = {};
      if (newVal && newVal.length){
        for(var index in newVal){
          self.sortMap[newVal[index].id] = index;
        }
      }
    });

    this.isCandidate = function (item) {
      return !self.isChosen(item);
    }

    this.isChosen = function (item) {
      return !!(self.model || []).find(function (em) {
        return em.id == item.id;
      });
    }

    this.candidateClick = function (item, e) {
      this.itemClick(item, e, this.selectedCandidates);
    }

    this.choiceClick = function (item, e) {
      this.itemClick(item, e, this.selectedChoices);
    }

    this.itemClick = function(item, e, selectedMap){
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
        .filter(function(index){
          return index >= 0;
        })
        .sort()[0];

        var sortedIndexes = [index, firstActiveIndex].sort();

        this.items.slice(sortedIndexes[0], sortedIndexes[1] + 1).forEach(function (item) {
          selectedMap[item.id] = true;
        });

      } else {
        for (var id in selectedMap) delete selectedMap[id];
        selectedMap[item.id] = true;
      }
    }

    this.getItemById = function (id) {
      return this.items.find(function (em) {
        return em.id == id;
      });
    }

    this.getItemIndexById = function (id) {
      return this.items.findIndex(function (em) {
        return em.id == id;
      });
    }

    this.chooseSelectedItems = function(){
      for (var id in this.selectedCandidates){
        var item = this.getItemById(id);
        this.model.push(item);
      }
    }

    this.chooseAllItems = function(){
      this.model = this.items;
    }

    this.unchooseSelectedItems = function(){
      for (var id in this.selectedChoices){
        
        var index = this.model.findIndex(function(item){
          return item.id == id;
        });

        this.model.splice(index, 1);
      }
    }

    this.unchooseAllItems = function(){
      this.model = [];
    }

    // this.chooseItem = function(item){
    //     this.model.push(item);
    // }

    // this.unselectItem = function(item){
    //   var index = this.model.findIndex(function(em){
    //     return em.id == item.id;
    //   });

    //   this.model.splice(index, 1);
    // }

  }
})();