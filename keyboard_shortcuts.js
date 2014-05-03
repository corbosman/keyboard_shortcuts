var ks_oldkey;
var ks_action;

$(document).ready(function() {

	// initialize a dialog window
	$('#keyboard_shortcuts_help').dialog({
		autoOpen: false,
		draggable: true,
		modal: false,
		resizable: false,
		width: 750,
		title: rcmail.gettext("keyboard_shortcuts")
	});

    if(rcmail.env.action == 'edit-prefs') {
	   $('.key').focus(function(e) {
	       ks_record_key($(this),e);
	   }).select(function(e) {
           // roundcube steals select, which looks ugly and causes problems
           return false;
       });
    } else {
        $(document).keypress(function (e) {
            return ks_key_pressed(e);
        });
    }

    rcmail.register_command('ks_help', 'ks_help', true);

});

function ks_key_pressed (e) {
    var action;
    var commands = {};

    // special case. If we hit ctrl-enter, and we're composing, and we have focus, then send email
    if (rcmail.env.action == 'compose' && (e.which == 13 || e.which == 10) && e.ctrlKey && $("*:focus").is("#composebody")) {
        $('.button.send').click();
        return false;
    }

    // check if some element has focus. If it does, skip this plugin.
    if ( $("*:focus").is("textarea, input") ) return true;

    // we dont support meta keys;
    if (e.ctrlKey || e.metaKey) return true;

    // find the current action
    if (rcmail.env.action === '' || rcmail.env.action == 'preview')
        ks_action = 'mailbox';
    else
        ks_action = rcmail.env.action;

    // check the command arrays for a match
    if(ks_action in ks_commands) {
        if(e.which in ks_commands[ks_action]) {
            rcmail.command(ks_commands[ks_action][e.which]);
        } else if (e.which in ks_commands.global) {
            rcmail.command(ks_commands.global[e.which]);
        }
    }

    e.preventDefault();
}

// record a key
function ks_record_key(input,e) {

    var disallowed_keys = {
        10:'return',
        13:'return',
        32:'space'
    };

    // if we're recording, cancel all previous recordings
    reset_recording();

    // save old key
    ks_oldkey = input.val();

    // set new recording
    input.attr('recording', 'true');

    // empty input
    input.val('');

    // ask for new key
    input.keypress(function(i) {
        var keycode, char;

        // dont allow these keys
        if(i.which in disallowed_keys) {
            reset_recording();
            i.preventDefault();
            return true;
        }

        if (i.which === null) {
           char = String.fromCharCode(i.keyCode);       // old IE
           keycode = i.keyCode;
        } else if (i.which !==0 && i.charCode !== 0) {
           char = String.fromCharCode(i.which);      // All others
           keycode = i.which;
        } else return;

        i.preventDefault();

        input.val(char);
        input.parent().find('.keycode').val(keycode);

        $('.key').unbind('keypress')
                     .unbind('blur')
                     .removeAttr("recording")
                     .blur();

    });

    input.blur(function(i) {
        reset_recording();
    });
}

// reset the recording data
function reset_recording() {
    $(".key[recording='true']").val(ks_oldkey)
                                   .removeAttr('recording').blur();
}

/**
 * all keyboard functions
 */


// support functions for each function we support

// show help
function ks_help() {
  keyboard_shortcuts_show_help();
}

// mark all visible messages as read
function ks_markallvisiblemessagesasread() {
	rcmail.command('select-all', 'page');
	rcmail.command('mark', 'read');
	rcmail.command('select-none');
}

// select all visible messages
function ks_selectallvisiblemessages() {
	rcmail.command('select-all', 'page');
}

// reply-all
function ks_replyall() {
	if (rcmail.message_list.selection.length == 1)
	rcmail.command('reply-all');
}

// reply
function ks_reply() {
	if (rcmail.message_list.selection.length == 1)
	rcmail.command('reply');
}

// select all on current page
function ks_select_all_on_page() {
	rcmail.command('select-all', 'page');
}

// forward a message
function ks_forward() {
	if (rcmail.message_list.selection.length == 1)
	rcmail.command('forward');
}

// print a message
function ks_print() {
	if (rcmail.message_list.selection.length == 1)
	rcmail.command('print');
}

// search
function ks_search() {
	$('#quicksearchbox').focus();
	$('#quicksearchbox').select();
}

function keyboard_shortcuts_show_help() {
  $('#keyboard_shortcuts_help').dialog('open');
}


