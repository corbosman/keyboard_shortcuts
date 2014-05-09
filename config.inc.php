<?php

/**
 *  register shortcut commands
 *
 */

// can users edit keys?
$rcmail_config['keyboard_shortcuts_userconfigurable'] = true;

// array of keycodes we dont allow. For quick use in JS, register as keycode=>description.
$rcmail_config['keyboard_shortcuts_disallowed_keys'] = array(
    '10' => 'return',
    '13' => 'return',
    '32' => 'space'
);

// default key bindings
$rcmail_config['keyboard_shortcuts_default'] = array(
    'global' => array(
        '63' => 'ks_help',
        '65' => 'addressbook',
        '77' => 'mail',
        '83' => 'settings'
    ),
    'mailbox' => array(
        '67' => 'collapse-all',
        '69' => 'expand-all',
        '82' => 'ks_replyall',
        '85' => 'expand-unread',
        '97' => 'ks_selectallvisiblemessages',
        '99' => 'compose',
        '100' => 'delete',
        '102' => 'ks_forward',
        '106' => 'previouspage',
        '107' => 'nextpage',
        '109' => 'ks_markallvisiblemessagesasread',
        '112' => 'ks_print',
        '114' => 'ks_reply',
        '115' => 'ks_search'
    ),
    'show' => array(
        '82' => 'ks_replyall',
        '99' => 'compose',
        '100' => 'delete',
        '102' => 'ks_forward',
        '106' => 'previousmessage',
        '107' => 'nextmessage',
        '112' => 'ks_print',
        '114' => 'ks_reply',
    ),
);

/**
 * DONT EDIT BELOW HERE
 */

// supported commands
$rcmail_config['keyboard_shortcuts_commands'] = array(
    'global' => array(
        'addressbook' => array(),
        'logout' => array(),
        'mail' => array(),
        'settings' => array(),
    ),
    'mailbox' => array(
        'ks_help' => array(),
        'collapse-all' => array(),
        'compose' => array(),
        'delete' => array(),
        'expand-all' => array(),
        'expand-unread' => array(),
        'ks_forward' => array('label' => 'forward'),
        'ks_markallvisiblemessagesasread' => array(),
        'ks_print' => array('label' => 'print'),
        'ks_reply' => array('label' => 'reply'),
        'ks_replyall' => array('label' => 'replyall'),
        'ks_search' => array('label' => 'search'),
        'ks_selectallvisiblemessages' => array(),
        'nextpage' => array(),
        'previouspage' => array(),
        'ks_download' => array('label' => 'download'),
        'ks_viewsource' => array('label' => 'viewsource'),
    ),
    'show' => array(
        'compose' => array(),
        'delete' => array(),
        'ks_replyall' => array('label' => 'replyall'),
        'ks_forward' => array('label' => 'forward'),
        'previousmessage' => array(),
        'nextmessage' => array(),
        'ks_print' => array('label' => 'print'),
        'ks_reply' => array('label' => 'reply'),
        'ks_download' => array('label' => 'download'),
        'ks_viewsource' => array('label' => 'viewsource'),
    ),
    'compose' => array(
    ),
    'addressbook' => array(
    ),
);


