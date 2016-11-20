; (function ($) {
  "use strict";

  $(function () {
    $('[name=projectMembers]').sfchooser({
      filterTimeout: 500,
      itemTemplate: function ($item, data) {
        return '<img class="img-circle member-avatar" '
               +'src="'+ data.$option.data('avatar') + '"> ' 
               + data.text;
      }
    }).sfchooser('option', 'filterMinLength', 4);    
  });
})(jQuery);