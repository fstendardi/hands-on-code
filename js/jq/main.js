; (function ($) {
  "use strict";

  $(function () {

    var membersControl = $('[name=projectMembers]');

    membersControl.chooser({
      filterTimeout: 500,
      itemFormat: function (item, data) {
        return '<img class="img-circle member-avatar" src="'
          + data.$option.data('avatar') + '"> ' + data.text;
      }
    });
  });
})(jQuery);