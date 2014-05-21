/**
 * Copyright 2014 Cor Bosman (cor@roundcu.be)
 *
 * keyboard shortcuts javascript
 *
 * @author Cor Bosman <cor@roundcu.be>
 * @licence GNU GPL
 * @version 1.0
 */

// init when the DOM is ready
$(document).ready(function() {

    /**
     * event listeners for ajax
     */
    rcmail.addEventListener('plugin.ks_receive_row',  ks_receive_row);
    rcmail.addEventListener('plugin.ks_receive_help', ks_receive_help);

    if(rcmail.env.action == 'edit-prefs') {
        // if you click on a form input, start recording a key
        $('form').on('focus', '.key', function(e) {
            Shortcuts.record($(this),e);
        }).select(function(e) {
           // roundcube auto selects, which looks ugly and causes problems
           return false;
        });

        // click on remove icon
        $('form').on('click', 'a.button.ks_del', function(e) {
            $(this).closest('tr').remove();
            $('.footerleft .button').css('color', 'orange');
        });

        // click on add icon
        $('.ks_content').on('click', 'a.button.ks_add', function(e) {
            ks_add_input($(this));
        });
    }

    Shortcuts.init();
});

/**
 * receive a row of data for the key recorder
 * @param  {array} data
 */
function ks_receive_row(data)
{
    $('.button[data-section="'+data.section+'"]').closest('tr').before(data.row);
}

/**
 * receive help content
 * @param  {array} data
 */
function ks_receive_help(data)
{
    $('body').append(data.help);

    $('.keyboard_shortcuts_help').dialog({
        height: 500,
        position: [$(window).width()-400,150],
        autoOpen: false,
        draggable: true,
        modal: false,
        resizable: true,
        title: rcmail.gettext('keyboard_shortcuts', 'keyboard_shortcuts')
    });

    $('.keyboard_shortcuts_help').dialog('open');
}

/**
 * add a row to the settings screen
 */
function ks_add_input (e) {

    // get current section
    var selected_section = e.attr('data-section');

    // load new row
    lock = rcmail.set_busy(true, 'loading');
    rcmail.http_request('plugin.ks_add_row', '_ks_section='+selected_section, lock);
}