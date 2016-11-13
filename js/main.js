$.fn.select2.defaults.set("theme", "bootstrap");


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

    var select2Config = {
      allowClear: true,
      templateResult: function formatState(state) {

        if (!state.id) { return state.text; }

        return formatMemberItem(state);
      },
      templateSelection: formatMemberItem
    };

    // {
    //       ajax: {
    //         url: "/assets/data/members.json",
    //         dataType: 'json',
    //         delay: 250,
    //         processResults: function (data, params) {
    //           return {
    //             results: data.map(function(item){
    //               return {
    //                 id: item.id,
    //                 text: item.firstName
    //               }
    //             })
    //           };
    //         }
    //       }
    //     }
    ownerControl.select2(select2Config)
      .on('select2:selecting select2:unselecting', function (e) {
        $(this).data('oldValue', $(this).val());
      })
      .on('change', function (e) {
        var current = $(this).val();
        var oldValue = $(this).data('oldValue');
        if (current) {
          membersControl.find('option[value=' + current + ']').remove().trigger('change');
        }
        if (oldValue) {
          var index = members.findIndex(function (item) {
            return item.id == oldValue;
          });
          var option = buildMemberOption(members[index]);
          membersControl.find('option').eq(index).before(option);
        }
      });

    membersControl.select2(select2Config)
      .on('select2:selecting select2:unselecting', function (e) {
        $(this).data('oldValue', $(this).val());
      })
      .on('change', function (e) {
        var current = $(this).val();
        var oldValue = $(this).data('oldValue');
        if (current) {
          current.forEach(function (id) {
            ownerControl.find('option[value=' + id + ']').remove().trigger('change');
          });
        }
        if (oldValue) {
          oldValue.forEach(function (id) {
            var index = members.findIndex(function (item) {
              return item.id == id;
            });
            var option = buildMemberOption(members[index]);
            ownerControl.find('option').eq(index).before(option);
          });
          
        }
      });
    ;
  }

  function formatMemberItem(data) {
    var avatar = $('<img class="img-circle member-avatar">').attr('src', $(data.element).data('avatar'));
    return $('<span/>').append(avatar).append(' ' + data.text);
  }

  function buildMemberOption(member) {
    return $('<option/>').attr('value', member.id)
      .text(member.firstName + ' ' + member.lastName)
      .data('avatar', member.avatar);
  }
});