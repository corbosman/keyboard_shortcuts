function keyboard_shortcuts_show_help() {
  $('#keyboard_shortcuts_help').dialog('open');
}

$(function() {
  rcmail.env.keyboard_shortcuts = true;

  // initialize a dialog window
  $('#keyboard_shortcuts_help').dialog({
    autoOpen: false,
    draggable: true,
    modal: false,
    resizable: false,
    width: 750,
    title: rcmail.gettext("keyboard_shortcuts.keyboard_shortcuts")
  });

  // if we're in an input or textarea form, skip this plugin
  $('input,textarea').focus(function (e) {
    rcmail.env.keyboard_shortcuts = false;
  });

  // if we move out of an input or textarea form, enable this plugin
  $('input,textarea').blur(function (e) {
    rcmail.env.keyboard_shortcuts = true;
  });

  // fire up the keypress event listener
  $(document).keypress(function (e) { 
    key_pressed(e);
  });


  function key_pressed (e) {
    if (!rcmail.env.keyboard_shortcuts || rcmail.env.action == 'compose' || rcmail.env.task == 'login' || e.ctrlKey || e.metaKey)
    return true;

    if (rcmail.env.action == '') {	// list mailbox

      if(rcmail.env.ks_functions[e.which]) {
        this[rcmail.env.ks_functions[e.which]]();
        return false;
      }

      switch (e.which) {
          case 63:		// ? = help
          //keyboard_shortcuts_show_help();
          var ks_function = rcmail.env.ks_functions[e.which];
          this[ks_function]();

          return false;
        case 65:		// A = mark all as read
          rcmail.command('select-all');
          rcmail.command('mark', 'read');
          return false;
        case 67:                // C = collapse-all
          rcmail.command('collapse-all');
          return false;
        case 69:                // E = expand-all
          rcmail.command('expand-all');
          return false;
        case 82:		// R = reply-all
          if (rcmail.message_list.selection.length == 1)
          rcmail.command('reply-all');
          return false;
        case 85:                // U = expand-unread
          rcmail.command('expand-unread');
          return false;
        case 97:		// a = select all
          rcmail.command('select-all');
          return false;
        case 99:		// c = compose
          rcmail.command('compose');
          return false;
        case 100:		// d = delete
          rcmail.command('delete', '', rcmail);
          return false;
        case 102:		// f = forward
          if (rcmail.message_list.selection.length == 1)
          rcmail.command('forward');
          return false;
        case 106:		// j = previous page (similar to Gmail)
          rcmail.command('previouspage');
          return false;
        case 107:		// k = next page (similar to Gmail)
          rcmail.command('nextpage');
          return false;
        case 112:		// p = print
          if (rcmail.message_list.selection.length == 1)
          rcmail.command('print');
          return false;
        case 114:		// r = reply
          if (rcmail.message_list.selection.length == 1)
          rcmail.command('reply');
          return false;
        case 115:		// s = search
          $('#quicksearchbox').focus();
          $('#quicksearchbox').select();
          return false;
        case 117:		// u = update (check for mail)
          rcmail.command('checkmail');
          return false;
      }
    } else if (rcmail.env.action == 'show' || rcmail.env.action == 'preview') {
      switch (e.which) {
        case 82:		// R = reply-all
          rcmail.command('reply-all');
          return false;
        case 99:		// c = compose
          rcmail.command('compose');
          return false;
        case 100:		// d = delete
          rcmail.command('delete');
          return false;
        case 102:		// f = forward
          rcmail.command('forward');
          return false;
        case 106:		// j = previous message (similar to Gmail)
          rcmail.command('previousmessage');
          return false;
        case 107:		// k = next message (similar to Gmail)
          rcmail.command('nextmessage');
          return false;
        case 112:		// p = print
          rcmail.command('print');
          return false;
        case 114:		// r = reply
          rcmail.command('reply');
          return false;

      }
    }
  }
});

// support functions for each function we support
function ks_help() {
  keyboard_shortcuts_show_help();
}
