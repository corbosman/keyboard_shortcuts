/**
 * Copyright 2014 Cor Bosman (cor@roundcu.be)
 *
 * roundcube shortcuts
 *
 * @author Cor Bosman <cor@roundcu.be>
 * @licence GNU GPL
 * @version 1.0
 */


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
     * all modifier keys
     * @type {Object}
     */
    var _MODIFIERS = {
        16: 'shift',
        17: 'ctrl',
        18: 'alt',
    };

    /**
     * forbidden keys, mostly because used in RC itself
     * @type {Object}
     */
    var _FORBIDDEN = {
        8: 'backspace',
        9: 'tab',
        10: 'enter',
        12: 'numlock',
        13: 'enter',
        20: 'capslock',
        27: 'esc',
        32: 'space',
        37: 'left',
        38: 'up',
        39: 'right',
        40: 'down',
        46: 'del',
    };

    /**
     * we resort to using an allowed keys object because cross-browser keycode detection is a huge mess
     * @type {Object}
     */
    var _ALLOWED = {
        33: 'PageUp',
        34: 'PageDown',
        35: 'End',
        36: 'Home',
        45: 'Insert',
        46: 'Delete',
        48: '0',
        49: '1',
        50: '2',
        51: '3',
        52: '4',
        53: '5',
        54: '6',
        55: '7',
        56: '8',
        57: '9',
        65: 'a',
        66: 'b',
        67: 'c',
        68: 'd',
        69: 'e',
        70: 'f',
        71: 'g',
        72: 'h',
        73: 'i',
        74: 'j',
        75: 'k',
        76: 'l',
        77: 'm',
        78: 'n',
        79: 'o',
        80: 'p',
        81: 'q',
        82: 'r',
        83: 's',
        84: 't',
        85: 'u',
        86: 'v',
        87: 'w',
        88: 'x',
        89: 'y',
        90: 'z',
        96: 'Num0',
        97: 'Num1',
        98: 'Num2',
        99: 'Num3',
        100: 'Num4',
        101: 'Num5',
        102: 'Num6',
        103: 'Num7',
        104: 'Num8',
        105: 'Num9',
        112: 'F1',
        113: 'F2',
        114: 'F3',
        115: 'F4',
        116: 'F5',
        117: 'F6',
        118: 'F7',
        119: 'F8',
        120: 'F9',
        121: 'F10',
        122: 'F11',
        123: 'F12',

    };

    /**
     * initialise
     */
    function _init() {
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

        // pressed keycode
        var keycode = _get_keycode(e);

        // skip if we're only hitting a modifier
        if(_is_modifier(keycode)) return true;

        // get the modifier
        var modifiers = _get_modifiers(e);

        // translate key to something readable
        var sequence = _translate(keycode, modifiers, e);

        // check the command arrays for a match
        if(typeof _config === 'object' && _config.shortcuts) {
            if(_action in _config.shortcuts && sequence in _config.shortcuts[_action]) {
                _run(_config.shortcuts[_action][sequence],_action);
                e.preventDefault();
                return false;
            } else if(sequence in _config.shortcuts.all) {
                _run(_config.shortcuts.all[sequence], 'all');
                e.preventDefault();
                return false;
            }
        }

        // we did not find a key, just pass the event along
        return true;
    }

    /**
     * find the keycode
     * @param  {Objecy} e
     * @return {int}
     */
    function _get_keycode(e)
    {
        e = e || window.event;
        return e && e.keyCode ? e.keyCode : (e && e.which ? e.which : 0);
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
                if(typeof _config.commands[action].commands[command].parameters == 'object') {
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
     * record a key press in settings
     * @param  {object} input jquery input object
     * @param  {object} k     keypress event
     * @return {boolean}
     */
    function _record_key(input,k) {

        // if we're recording, cancel all previous recordings
        _reset_recording();

        // save old key
        _oldkey = input.val();

        // set new recording
        input.attr('recording', 'true');

        // empty input
        input.val('');

        // ask for new key
        input.keydown(function(e) {

            // pressed keycode
            var keycode = _get_keycode(e);

            // skip if we're only hitting a modifier
            if(_is_modifier(keycode)) return false;

            // get the modifier
            var modifiers = _get_modifiers(e);

            // check if this is a valid key
            if((message = _validate_key(keycode, input, modifiers)) !== true) {
               return _record_fail(message,e);
            }

            // translate key to something readable
            var sequence = _translate(keycode, modifiers, e);

            // check if this sequence exists
            if(_key_exists(sequence, input)) {
                return _record_fail('keyexists',e);
            }

            // set the input field to this key sequence
            input.val(sequence);
            input.attr('value', sequence);

            // visually show we need to save
            $('.footerleft .button').css('color', 'orange');

            // unbind the keydown event
            $('.key').unbind('keydown')
                    .unbind('blur')
                    .removeAttr("recording")
                    .blur();


            // dont do anything else with this keypress
            e.preventDefault();

            return false;

        });

        // if we click someplace else, reset the recording.
        input.blur(function(i) {
            _reset_recording();
        });
    }

    /**
     * record failed
     * @param  {object} message
     * @param  {object} e
     * @return false
     */
    function _record_fail(message,e) {
        rcmail.display_message(rcmail.gettext(message, 'keyboard_shortcuts'), 'warning', 1500);
        _reset_recording();
        e.preventDefault();
        return false;
    }

    /**
     * capitalize a word
     * @param  {string} str
     * @return {string}
     */
    function capitalize(str) {
        return str.substr(0,1).toUpperCase() + str.substr(1).toLowerCase();
    }

    /**
     * check to see if a key is a modifier
     * @param  {string}  keycode
     * @return {Boolean}
     */
    function _is_modifier(keycode) {
        return _MODIFIERS[keycode] ? true : false;
    }

    /**
     * get all modifiers
     * @param  {object} e
     * @return {array}
     */
    function _get_modifiers(e) {
        var modifiers = [];

        if (e.shiftKey) {
            modifiers.push('shift');
        }

        if (e.altKey) {
            modifiers.push('alt');
        }

        if (e.ctrlKey) {
            modifiers.push('ctrl');
        }

        if (e.metaKey) {
            modifiers.push('meta');
        }

        return modifiers;
    }

    /**
     * translate a keycode to a readable string
     * @param  {string} keycode
     * @param  {array} modifiers
     * @param  {object} e
     * @return {string}
     */
    function _translate(keycode, modifiers, e) {

        // get character from keycode
        // var char = String.fromCharCode(keycode);
        var char = _ALLOWED[keycode];

        // if we pressed a letter, then return lowercase
        //if(keycode >= 65 || keycode <= 90) {
        //    char = char.toLowerCase();
        //}

        // do we have a modifier?
        var modifier = modifiers.length > 0 ? capitalize(modifiers[0])+'+' : '';

        return modifier+char;
    }

    /**
     * validate a recorded key
     * @param  {object} i
     * @return true|String
     */
    function _validate_key(keycode, input, modifiers) {

        if(keycode === false) {
            return 'invalidkey';
        }

        // skip keys that roundcube itself uses
        if(_FORBIDDEN[keycode]) {
            return 'invalidkey';
        }

        if(!_ALLOWED[keycode]) {
            return 'invalidkey';
        }

        // we dont allow multiple modifiers
        if(modifiers.length > 1) {
            return 'multiple_modifiers';
        }

        return true;
    }

    /**
     * check if the key exists
     * @param  {string} keycode
     * @param  {object} input Jquery object
     * @return {boolean}
     */
    function _key_exists(sequence, input) {
        var found = false;

        // current section
        var section = input.attr('data-section');

        // which row did we record on
        var row = input.closest('tr');

        // see if we have the same key in this section or in all
        input.closest('form').find("input.key[value='"+sequence+"']").each(function(e) {
            // section that has a match
            var cur_section = $(this).attr('data-section');

            // row that has a match
            var cur_row = $(this).closest('tr');

            // is this key allowed?
            if(!row.is(cur_row)) {
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
        },

        /**
         * record key in settings
         * @param  {object} input
         * @param  {object} e
         */
        record: function(input,e) {
            _record_key(input,e);
        }
    };

    // expose shortcuts object to the outside
    window.Shortcuts = Shortcuts;


}) (window, document);


