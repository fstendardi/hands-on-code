(function() {
  'use strict';

  myCrmApp.directive('project', ProjectDirective);

  function ProjectDirective() {
    var directive = {
        bindToController: true,
        controller: ['$http',ProjectController],
        templateUrl: '/js/ng/project/project.html',
        controllerAs: 'vm',
        scope: {
        }
    };
    return directive;
  }
  
  function ProjectController ($http) {
    
    var self = this;
    this.project = null;

    this.members = [];
    
    $http.get('/assets/data/project.json').then(function(response){
      self.project = response.data;
    });

    $http.get('/assets/data/members.json').then(function(response){
      self.members = response.data.map(function(member){
        member.text = member.firstName + ' ' + member.lastName;
        return member;
      });
    });
  }
})();