<?php

/**
 *  register shortcut commands
 *
 *  Commands can exist in certain sections only.
 *
 *  global      Command is always available
 *  mailbox     Mailbox View
 *  message     Message View
 *  compose     Compose View
 *  addressbook Addressbook
 *
 *  All commands need to be registered so users can pick them as commands for specific keys.
 *
 *  command   => commandname
 *  label     => optional label, else use command name as label
 *  function  => optional function name to use for command, else use internal command name (see app.js)
 *
 */

$rcmail_config['keyboard_shortcuts_commands'] = array(
    'global' => array(
        'addressbook' => array(),
        'ks_help' => array(),
        'logout' => array(),
        'mail' => array(),
        'settings' => array(),
    ),
    'mailbox' => array(
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
    ),
    'compose' => array(
    ),
    'addressbook' => array(
    ),
);

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

