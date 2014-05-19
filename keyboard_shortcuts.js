/**
 * Copyright 2014 Cor Bosman (cor@roundcu.be)
 *
 * keyboard shortcuts javascript
 * @version 1.0
 */

// init when the DOM is ready
$(document).ready(function() {
    Shortcuts.init();
});

(function(window, document, undefined)
{
    /**
     * registered shortcuts
     * @type {Object}
     */
    var _config = {};

    /**
     * all available commands
     * @type {Object}
     */
    var _all_commands = {};

    /**
     * current action
     * @type String
     */
    var _action = _get_action();

    /**
     * in settings keep track of the original key once you click on an input
     */
    var _oldkey;

    /**
     * row id
     */
    var _rowid = 0;

    var _MODIFIERS_MAP = {
            16: 'shift',
            17: 'ctrl',
            18: 'alt',
            //91: 'meta',
            93: 'meta',
            224: 'meta'
        };



    /**
     * initialise
     */
    function _init() {
        /**
         * event listeners for ajax
         */
        rcmail.addEventListener('plugin.ks_receive_row',  _receive_row);
        rcmail.addEventListener('plugin.ks_receive_help', _receive_help);

        if(_action == 'edit-prefs') {
            // if you click on a form input, start recording a key
            $('form').on('focus', '.key', function(e) {
                _record_key($(this),e);
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
                _add_input($(this));
            });
        }

       /**
        * keypress listener
        */
       $(document).keydown(function (e) {
           return _handle_keypress(e);
       });
    }

    /**
     * handle keypress
     * @param  {Object} e
     * @return Boolean
     */
    function _handle_keypress(e)
    {

        // special case. If we hit ctrl-enter, and we're composing, and we have focus, then send email
        if (_action == 'compose' && (e.which == 13 || e.which == 10) && e.ctrlKey && $("*:focus").is("#composebody")) {
            $('.button.send').click();
            return false;
        }

        // check if some element has focus. If it does, skip this plugin.
        if ( $("*:focus").is("textarea, input") ) return true;

        // we dont support meta keys;
        if (e.ctrlKey || e.metaKey) return true;

        // check the key we pressed
        var keycode = _get_key(e);

        console.log(keycode);

        // check the command arrays for a match
        if(typeof _config === 'object' && _config.shortcuts) {
            if(_action in _config.shortcuts && keycode in _config.shortcuts[_action]) {
                _run(_config.shortcuts[_action][keycode],_action);
            } else if(keycode in _config.shortcuts.all) {
                _run(_config.shortcuts.all[keycode], 'all');
            }
        }

        e.preventDefault();
        return false;
    }

    /**
     * find the keycode
     * @param  {Objecy} e
     * @return {int}
     */
    function _get_key(e)
    {
        return e.keyCode;
        if (e.which === null) {
           keycode = e.keyCode;
        } else if (e.which !== 0 && e.charCode !== 0) {
           keycode = e.which;
        } else keycode = false;

        return keycode;
    }

    /**
     * fire off the command
     * @param  {string} command
     */
    function _run(command, action)
    {
        var parameters;

        if(typeof Commands[command] === 'function') {
            Commands[command]();
        } else if(_config.commands[action].commands[command]) {

            // find parameters
            if(_config.commands[action].commands[command].parameters) {
                if(typeof _config.commands[action][command].parameters == 'object') {
                    parameters = _config.commands[action].commands[command].parameters.join();
                } else {
                    parameters = _config.commands[action].commands[command].parameters;
                }
            }

            // do we have a different function to call?
            if(_config.commands[action].commands[command].function) {
                command = _config.commands[action].commands[command].function;
            }

            // execute
            rcmail.command(command, parameters);

        } else if(rcmail.commands[command]) {
            rcmail.command(command);
        } else {
            // we cant find a function that matches this
        }
    }

    /**
     * find the current action
     * @return {String}
     */
    function _get_action()
    {
        return rcmail.env.action === '' || rcmail.env.action == 'preview' || rcmail.env.action == 'show' ? 'mail' : rcmail.env.action;
    }

    /**
     * receive a row of data for the key recorder
     * @param  {array} data
     */
    function _receive_row(data)
    {
        $('.button[data-section="'+data.section+'"]').closest('tr').before(data.row);
    }

    /**
     * receive help content
     * @param  {array} data
     */
    function _receive_help(data)
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
     * record a key press in settings
     * @param  {object} input jquery input object
     * @param  {object} e     keypress event
     * @return {boolean}
     */
    function _record_key(input,e) {

        // if we're recording, cancel all previous recordings
        _reset_recording();

        // save old key
        _oldkey = input.val();

        // set new recording
        input.attr('recording', 'true');

        // empty input
        input.val('');

        // ask for new key
        input.keydown(function(i) {

            //var keycode = _get_key(i);
            var keycode = KeyCode.translate_event(i);
            console.log(keycode.code + ' shift=' + keycode.shift + ' alt='+keycode.alt + ' ctrl=' + keycode.ctrl );

            if(_is_modifier(keycode)) return false;
            console.log(i.keyCode);
            console.log(String.fromCharCode(i.keyCode));
            var hotkey = KeyCode.hot_key(keycode);

            if((message = _validate_key(keycode, input)) !== true) {
               rcmail.display_message(rcmail.gettext(message, 'keyboard_shortcuts'), 'warning', 1500);
               _reset_recording();
               i.preventDefault();
               return false;
            }

            var char = String.fromCharCode(keycode);

            i.preventDefault();

            input.val(char);
            input.parent().find('.keycode').val(keycode);
            $('.footerleft .button').css('color', 'orange');

            $('.key').unbind('keypress')
                    .unbind('blur')
                    .removeAttr("recording")
                    .blur();

        });

        // if we click someplace else, reset the recording.
        input.blur(function(i) {
            _reset_recording();
        });
    }

    function _is_modifier(keycode) {
        if(_MODIFIERS_MAP[keycode.code]) return true;
        return false;
        //if (e.ctrlKey || e.metaKey || e.shiftKey || e.altKey) return true;
    }

    /**
     * validate a recorded key
     * @param  {object} i
     * @return true|String
     */
    function _validate_key(keycode, input) {

        if(keycode === false) {
            return 'invalidkey';
        }

        // dont allow these keys
        if(typeof _config === 'object' && _config.disallowed_keys && keycode in _config.disallowed_keys) {
            return 'invalidkey';
        }

        // check if the key exists
        if(_key_exists(keycode, input)) {
            return 'keyexists';
        }

        return true;
    }

    /**
     * check if the key exists
     * @param  {string} keycode
     * @param  {object} input Jquery object
     * @return {boolean}
     */
    function _key_exists(keycode, input) {
        var found = false;

        // current section
        var section = input.attr('data-section');

        // current id
        var id = input.attr('data-id');

        // see if we have the same key in this section or in all
        input.closest('form').find("input.keycode[value='"+keycode+"']").each(function(e) {

            var cur_section = $(this).attr('data-section');
            var cur_id      = $(this).attr('data-id');

            if(id != cur_id) {
                if(section == cur_section || cur_section == 'all' || section == 'all') {
                    found = true;
                }
            }
        });
        return found;
    }

    /**
     * reset the recording
     * @return {}
     */
    function _reset_recording() {
        $(".key[recording='true']").val(_oldkey)
                                       .removeAttr('recording').blur();
    }

    /**
     * add a row to the settings screen
     */
    function _add_input (e) {

        // get current section
        var selected_section = e.attr('data-section');

        // load new row
        lock = rcmail.set_busy(true, 'loading');
        rcmail.http_request('plugin.ks_add_row', '_ks_section='+selected_section+'&_ks_id='+_rowid++, lock);
    }


    /**
     * functions for commands where we cant use internal roundcube commands
     */
    var Commands = {

        /**
         * show help
         */
        help: function() {
            if($('.keyboard_shortcuts_help').length) {
                $('.keyboard_shortcuts_help').dialog('open');
            } else {
                rcmail.http_request('plugin.ks_get_help', false);
            }
        },

        // search
        search: function() {
            $('#quicksearchbox').focus();
            $('#quicksearchbox').select();
        },

    };

    /**
     * initialize
     */


    /**
     * shortcuts object for outside access
     * @type {Object}
     */
    var Shortcuts = {
        /**
         * set the user shortcuts
         * @param  {Object} shortcuts
         */
        config: function(config) {
            $.extend(_config, config);
        },

        /**
         * allow access to help function for icon click event
         */
        help: function() {
            Commands.help();
        },

        /**
         * initialise the settings screen
         */
        init: function() {
            _init();
        }
    };

    // expose shortcuts object to the outside
    window.Shortcuts = Shortcuts;


}) (window, document);


