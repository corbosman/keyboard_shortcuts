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
 * checking if the server supports threads is expensive. Just tell me.
 */
$rcmail_config['keyboard_shortcuts_threads'] = true;

/**
 * default key bindings
 */
$rcmail_config['keyboard_shortcuts_default'] = array(
    'all' => array(
        'F1' => 'mail',
        'F2' => 'addressbook',
        'F3' => 'settings',
        'F8' => 'help',
        's' => 'search',
    ),

    'mail' => array(
        'a' => 'select-page',
        'c' => 'compose',
        'd' => 'delete',
        'f' => 'forward',
        'i' => 'select-invert',
        'j' => 'previouspage',
        'k' => 'nextpage',
        'p' => 'print',
        'r' => 'reply',
        'Shift+r' => 'replyall',
        'Ctrl+r' => 'mark-read',
        'Ctrl+u' => 'mark-unread',
        'x' => 'select-none',
    ),
    'addressbook' => array(
    ),
    'compose' => array(
    )
);

/**
 * if we support threads, add some extra default keys
 */
if($rcmail_config['keyboard_shortcuts_threads'] === true) {
    $rcmail_config['keyboard_shortcuts_default']['mail']['Shift+c'] = 'collapse-all';
    $rcmail_config['keyboard_shortcuts_default']['mail']['Shift+e'] = 'expand-all';
    $rcmail_config['keyboard_shortcuts_default']['mail']['Shift+u'] = 'expand-unread';
}