


$(function () {

  var membersControl = $('[name=projectMembers]');
  var ownerControl = $('[name=projectOwner]');

  var project = {};

  var members = [];

  initModel().then(initView);

  function initModel() {

    return $.when(
      $.get('/assets/data/project.json').then(function (data) {
        project = data;
      }),

      $.get('/assets/data/members.json').then(function (data) {
        members = data;
      })
    );
  }

  function initView() {
    for (var key in project) {
      var name = key.substr(0, 1).toUpperCase() + key.substr(1);
      var value = project[key];
      if (!($.isArray(value) || $.isPlainObject(value))) {
        $('[name=project' + name + ']').val(project[key]);
      }
    }

    members.forEach(function (member) {
      var option = buildMemberOption(member);
      membersControl.append(option.clone(true));
      ownerControl.append(option.clone(true));
    });
    
    membersControl.chooser({
      itemFormat: function(item, data){
        return '<img class="img-circle member-avatar" src="' + data.$option.data('avatar') + '"> ' + data.text; 
      }
    });
    
  }

  function initSelect2() {
    $.fn.select2.defaults.set("theme", "bootstrap");
    var select2Config = {
      allowClear: true,
      templateResult: function formatState(state) {

        if (!state.id) { return state.text; }

        return formatMemberItem(state);
      },
      templateSelection: formatMemberItem
    };

    ownerControl.select2($.extend({}, select2Config, {
      ajax: {
        url: "/assets/data/members.json",
        dataType: 'json',
        delay: 250,
        processResults: function (data, params) {
          var query = params.term || '';
          return {
            results: data.map(function (item) {
              item.text = item.firstName + ' ' + item.lastName
              return item;
            }).filter(function (member) {
              return memberFilter(member, query, membersControl.val());
            })
          };
        }
      }
    }))

      ;

    membersControl.select2($.extend({}, select2Config, {
      ajax: {
        url: "/assets/data/members.json",
        dataType: 'json',
        delay: 250,
        processResults: function (data, params) {
          var query = params.term || '';
          return {
            results: data.map(function (item) {
              item.text = item.firstName + ' ' + item.lastName
              return item;
            }).filter(function (member) {
              return memberFilter(member, query, ownerControl.val());
            })
          };
        }
      }
    })
      //.on('change', onMemberChange(ownerControl)
    )
      ;
  }

  function formatMemberItem(data) {
    var avatarSrc = $(data.element).data('avatar') || data.avatar;
    var avatar = $('<img class="img-circle member-avatar">').attr('src', avatarSrc);
    return $('<span/>').append(avatar).append(' ' + data.text);
  }

  function buildMemberOption(member) {
    return $('<option/>').attr('value', member.id)
      .text(member.firstName + ' ' + member.lastName)
      .data('avatar', member.avatar);
  }

  function onMemberChange(dependentControl) {

    return function () {
      var memberIds = $(this).val() || [];

      if (memberIds && !$.isArray(memberIds)) {
        memberIds = [memberIds];
      }

      var dependentAvailableMembers = members.filter(function (member) {
        return memberIds.indexOf(member.id + '') == -1;
      });

      var dependentSelectedMembers = dependentControl.val();

      dependentControl.find('option[value!=""]').remove();

      dependentAvailableMembers.forEach(function (member) {
        dependentControl.append(buildMemberOption(member));
      });

      dependentControl.val(dependentSelectedMembers);
    }
  }

  function memberFilter(member, query, excludedIds) {
    excludedIds = excludedIds || [];
    return member.text.toLowerCase().indexOf(query.toLowerCase()) >= 0 && excludedIds.indexOf(member.id + '') == -1;
  }

});