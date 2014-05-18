<?php

/**
 *  register shortcut commands
 *
 */

/**
 * user configurable?
 */
$rcmail_config['keyboard_shortcuts_userconfigurable'] = true;


/**
 * we dont allow these key codes
 */
$rcmail_config['keyboard_shortcuts_disallowed_keys'] = array(
    '10' => 'return',
    '13' => 'return',
    '32' => 'space'
);

// default key bindings
$rcmail_config['keyboard_shortcuts_default'] = array(
    'all' => array(
        '63' => 'help',
        '65' => 'addressbook',
        '77' => 'mail',
        '83' => 'settings'
    ),
    'mail' => array(
        '67' => 'collapse-all',
        '69' => 'expand-all',
        '82' => 'replyall',
        '85' => 'expand-unread',
        '97' => 'select-page',
        '99' => 'compose',
        '100' => 'delete',
        '102' => 'forward',
        '106' => 'previouspage',
        '107' => 'nextpage',
        '109' => 'markallvisiblemessagesasread',
        '112' => 'print',
        '114' => 'reply',
        '115' => 'search',
        '107' => 'nextmessage',
        '106' => 'previousmessage',
    ),
    'addressbook' => array(
    ),
    'compose' => array(
    )
);





