;(function ($) {
    'use strict';

    $.widget('formula.calendar', {
        options: {
        },

        _create: function () {
            this.$calendarLinks = this.element.find('.calendar__link._howto');
            
            this._initPlugins();
            this._initEvents();
        },

        _initEvents: function () {
            this._on({
                'click .calendar__link._howto': function(e) {
                    var $el = $(e.currentTarget);
                    
                    e.preventDefault();
                }
            });
        },

        _initPlugins: function () {
            var that = this;
            
            this.$calendarLinks.each(function(i, el) {
                var $el = $(el);
                var popupId = $el.data('popup');
                
                var $popup = $('[data-popup-id="' + popupId + '"]')
                
                $el.magnificPopup({
                    items: {
                        type:'inline',
                        src: $popup
                    }
                }); 
            });
        }
    });
})(jQuery);
