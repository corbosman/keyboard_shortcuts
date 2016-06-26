function keyboard_shortcuts_show_help() {
  $('#keyboard_shortcuts_help').dialog('open');
}

$(function() {
  rcmail.env.keyboard_shortcuts_mark_pending = false;

  // initialize a dialog window
  $('#keyboard_shortcuts_help').dialog({
    autoOpen: false,
    draggable: true,
    modal: false,
    resizable: false,
    width: 750,
    title: rcmail.gettext("keyboard_shortcuts.keyboard_shortcuts")
  });

  // fire up the keypress event listener
  $(document).keypress(function (e) {
    return key_pressed(e);
  });


  function key_pressed (e) {
    // special case. If we hit ctrl-enter, and we're composing, and we have focus, then send email
    if (rcmail.env.action == 'compose' && e.which == 13 && e.ctrlKey && $("*:focus").is("#composebody")) {
      $('.button.send').click();
      return false;
    }

    // check if some element has focus. If it does, skip this plugin.
    if ( $("*:focus").is("textarea, input") ) return true;

    if (rcmail.env.action == 'compose' || rcmail.env.task == 'login' || e.ctrlKey || e.metaKey) return true;

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
          rcmail.command('select-all', 'page');
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
          rcmail.command('select-all', 'page');
          return false;
        case 99:		// c = compose
          rcmail.command('compose');
          return false;
        case 100:		// d = delete
          rcmail.command('delete', '', rcmail);
          return false;
        case 70:		// F = (m)ark un(F)lagged
	  if (rcmail.env.keyboard_shortcuts_mark_pending) {
	      rcmail.command('mark', 'unflagged');
	      clearTimeout(rcmail.env.keyboard_shortcuts_mark_pending);
	      rcmail.env.keyboard_shortcuts_mark_pending = false;
	      return false;
	  }
        case 102:		// f = forward // or (m)ark (f)lagged
	  if (rcmail.env.keyboard_shortcuts_mark_pending) {
	      rcmail.command('mark', 'flagged');
	      clearTimeout(rcmail.env.keyboard_shortcuts_mark_pending);
	      rcmail.env.keyboard_shortcuts_mark_pending = false;
	      return false;
	  }
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
        case 114:		// r = reply // or (m)ark (r)ead
	  if (rcmail.env.keyboard_shortcuts_mark_pending) {
	      rcmail.command('mark', 'read');
	      clearTimeout(rcmail.env.keyboard_shortcuts_mark_pending);
	      rcmail.env.keyboard_shortcuts_mark_pending = false;
	      return false;
	  }
          if (rcmail.message_list.selection.length == 1)
          rcmail.command('reply');
          return false;
        case 115:		// s = search
          $('#quicksearchbox').focus();
          $('#quicksearchbox').select();
          return false;
        case 117:		// u = update (check for mail) // or (m)ark (u)nread
	  if (rcmail.env.keyboard_shortcuts_mark_pending) {
	      rcmail.command('mark', 'unread');
	      clearTimeout(rcmail.env.keyboard_shortcuts_mark_pending);
	      rcmail.env.keyboard_shortcuts_mark_pending = false;
	      return false;
	  }
          rcmail.command('checkmail');
          return false;
        case 118:		// v = Toggle preview
	  $('#prevpaneswitch,#mailpreviewtoggle').click();
	  return false;
        case 109:		// m = Mark as... (read/unread/flagged/unflagged)
	  if (rcmail.env.keyboard_shortcuts_mark_pending != false) {
	      clearTimeout(rcmail.env.keyboard_shortcuts_mark_pending);
	  }
	  var that = rcmail;
	  rcmail.env.keyboard_shortcuts_mark_pending = setTimeout(function() {
	      console.log('resetting that.env.keyboard_shortcuts_mark_pending after 3s');
	      that.env.keyboard_shortcuts_mark_pending = false;
	  }, 3000);
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
