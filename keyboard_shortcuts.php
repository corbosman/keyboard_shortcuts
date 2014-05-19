<?php
/**
 * keyboard_shortcuts
 *
 * Enables some common tasks to be executed with keyboard shortcuts
 *
 * @version 3.0
 * @author Cor Bosman <cor@roundcu.be>
 * @licence GNU GPL
 *
 **/


class keyboard_shortcuts extends rcube_plugin
{
    public $task = 'mail|compose|addressbook|settings';
    private $rcmail;
    private $config;
    private $commands = false;

    function init()
    {
        // load rcmail
        $this->rcmail = rcmail::get_instance();

        // require jqueryui
        $this->require_plugin('jqueryui');

        // load config
        $this->load_config();

        // load commands
        $this->load_config('commands.inc.php');

        // set up localization
        $this->add_texts('localization', true);

        // ajax calls we support
        if($this->rcmail->output->ajax_call) {
            $this->register_action('plugin.ks_add_row', array($this, 'add_row'));
            $this->register_action('plugin.ks_get_help', array($this, 'get_help'));
            return;
        }

        // include js
        $this->include_script('keyboard_shortcuts.js');

        // set up hooks
        $this->add_hook('template_container', array($this, 'show_icon'));

        // hooks for settings
        if($this->rcmail->config->get('keyboard_shortcuts_userconfigurable', true) and $this->rcmail->task == 'settings') {

            $this->include_script('keycode.js');

            $this->add_hook('preferences_list', array($this, 'preferences_list'));
            $this->add_hook('preferences_save', array($this, 'preferences_save'));
            $this->add_hook('preferences_sections_list',array($this, 'preferences_section'));
            $this->add_hook('preferences_section_header',array($this, 'preferences_section_header'));

            $this->config['disallowed_keys'] = $this->rcmail->config->get('keyboard_shortcuts_disallowed_keys', array());
        }

        // include css
        $skin = $this->local_skin_path();
        if (is_file($this->home . "/$skin/keyboard_shortcuts.css")) {
            $this->include_stylesheet("$skin/keyboard_shortcuts.css");
        }

        // add the keys to js
        if(in_array($this->rcmail->task, array('mail','compose','addressbook','settings'))) {

            $this->config['shortcuts'] = $this->get_shortcuts();
            $this->config['commands']  = $this->get_commands();

            // we need json output
            $config = json_serialize($this->config);

            $this->rcmail->output->add_script("Shortcuts.config($config);", 'foot');
        }

    }

    /**
     * get all configured commands
     * @return array
     */
    private function get_shortcuts()
    {
        // shortcuts
        $shortcuts = $this->rcmail->config->get('keyboard_shortcuts', $this->rcmail->config->get('keyboard_shortcuts_default'));

        // commands
        //$commands = $this->get_commands();

        //foreach($shortcuts as $section => $keys) {
        //    foreach($keys as $key => $command) {
        //        if(!isset($commands[$section][$command])) {
        //            unset($shortcuts[$section][$key]);
        //        }
        //    }
        //}

        return $shortcuts;
    }

    /**
     * get all commands including plugin commands
     * @return array
     */
    public function get_commands()
    {
        if($this->commands !== false) return $this->commands;

        // result array
        $commands = array();

        // load commands from config
        $config = $this->rcmail->config->get('keyboard_shortcuts_commands', array());

        foreach($config as $action => $acommands) {
            $commands[$action] = array(
                'label'     => Q($this->gettext($action)),
                'commands'  => array()
            );
            foreach($acommands as $command => $options) {
                $commands[$action]['commands'][$command] = $options;
                $commands[$action]['commands'][$command]['label'] = Q($this->gettext($command));
            }
        }

        // read in plugin commands;
        $plugins = $this->rcmail->plugins->exec_hook('shortcut_register', array());

        foreach($plugins as $plugin => $data) {
            if(! isset($data['commands']) or count($data['commands']) < 1) continue;

            if( isset($data['actions'])) {
                foreach($data['actions'] as $action => $label) {
                    $commands[$action] = array(
                        'label'     => $label,
                        'commands'  => array()
                    );
                }
            }

            foreach($data['commands'] as $action => $acommands) {
                foreach($acommands as $command => $options) {
                    $commands[$action]['commands'][$command] = $options;
                }
            }
        }

        //$this->commands = $commands;

        return $commands;
    }

    /**
     * add header to the preferences section
     * @param  array $args
     * @return array
     */
    function preferences_section_header($args)
    {
        if($args['section'] == 'keyboard_shortcuts') {
            $args['header'] = html::tag('p', null, Q($this->gettext('header')));
        }
        return $args;
    }

    /**
     * register preferences
     * @param  array $args
     * @return array
     */
    function preferences_section($args) {
        $args['list']['keyboard_shortcuts'] = array(
            'id'      => 'keyboard_shortcuts',
            'section' => Q($this->gettext('title'))
        );
        return($args);
    }

    /**
     * preferences screen
     * @param  array $args
     * @return array
     */
    function preferences_list($args)
    {
        if($args['section'] == 'keyboard_shortcuts') {
            // rcmail
            if(!$this->rcmail) $this->rcmail = rcmail::get_instance();

            // load shortcuts
            $shortcuts = $this->get_shortcuts();

            // all available commands
            $commands = $this->get_commands();

            $id = 0;
            // loop through all sections, and print the configured keys
            foreach($commands as $action => $a) {

                // no available commands for this action
                if(count($a['commands']) < 1) continue;

                // get section label
                $args['blocks'][$action] = array(
                    'name' => $a['label'],
                    'options' => array()
                );

                $keys = $shortcuts[$action] ?: array();

                foreach($keys as $key => $command) {

                    $title   = $this->create_title($id, $action, $commands, $command);
                    $content = $this->create_row($id++, $action, $key);

                    $args['blocks'][$action]['options'][$command.$key] = array(
                        'title' => $title,
                        'content' => $content
                    );
                }

                // add plus button
                $args['blocks'][$action]['options']['add'] = array(
                    'title' => '',
                    'content' => html::tag('span', array('class' => 'ks_content'), html::tag('a', array('class' => 'button ks_add', 'data-section' => $action), ''))
                );
            }

        }

        return($args);
    }

    /**
     * ajax call to create a new preference row
     */
    public function add_row()
    {
        if(!$this->rcmail) $this->rcmail = rcmail::get_instance();
        $this->add_texts('localization', false);

        // get input
        $section = get_input_value('_ks_section',   RCUBE_INPUT_GET);
        $id      = 'new' . get_input_value('_ks_id',   RCUBE_INPUT_GET);

        // get all commands
        $commands = $this->get_commands();

        // create new input row
        $content =  html::tag('tr', array(),
                        html::tag('td', array('class' => 'title'), $this->create_title($id, $section, $commands)) .
                        html::tag('td', array(), $this->create_row($id, $section))
                    );

        // return response
        $this->rcmail->output->command('plugin.ks_receive_row', array('section' => $section, 'row' => $content));
    }

    /**
     * create title field for preferences row
     * @param  int  $id
     * @param  string  $section
     * @param  string|boolean $command
     * @return string
     */
    private function create_title($id, $action, $commands, $command = false)
    {

        if($command !== false) {
            // label should always be set
            $label = isset($commands[$action]['commands'][$command]['label']) ? $commands[$action]['commands'][$command]['label'] : Q($this->gettext($command));

            // command
            $hidden_command = new html_hiddenfield(array('name' => "_ks_command[$action][]", 'value' => $command));

            $content = $label . $hidden_command->show();

        } else {

            // create a select box of the available commands in this action
            $select = new html_select(array('name' => "_ks_command[$action][]"));

            foreach($commands[$action]['commands'] as $command => $options) {
                $label = isset($options['label']) ? $options['label'] : Q($this->gettext($command));
                $select->add($label, $command);
            }

            $content = $select->show();
        }

        return $content;
    }

    /**
     * create a content field for preferences row
     * @param  int  $id
     * @param  string  $section
     * @param  string|int $key
     * @return string
     */
    private function create_row($id, $section, $key = false)
    {

        // ascii key
        $input = html::tag('input', array('name' => "_ks_ascii[$section][]", 'class' => 'rcmfd_ks_input key', 'type' => 'text', 'autocomplete' => 'off', 'value' => $key ? chr($key) : '', 'data-section' => $section, 'data-id' => $id));

        // key code
        $hidden_keycode = new html_hiddenfield(array('name' => "_ks_keycode[$section][]", 'value' => $key, 'class' => 'keycode', 'data-section' => $section, 'data-id' => $id++));

        // del button
        $button = html::a(array('class' => 'button ks_del'), '');

        // content
        $content = html::tag('span', array('class' => 'ks_content'), $input . $hidden_keycode->show() . $button);

        return $content;
    }

    /**
     * save preferences
     * @param  array $args
     * @return array
     */
    function preferences_save($args)
    {
        if($args['section'] == 'keyboard_shortcuts') {
            if(!$this->rcmail) $this->rcmail = rcmail::get_instance();
            $prefs = array();

            $input_ascii   = get_input_value('_ks_ascii',   RCUBE_INPUT_POST);
            $input_command = get_input_value('_ks_command', RCUBE_INPUT_POST);
            $input_keycode = get_input_value('_ks_keycode', RCUBE_INPUT_POST);

            foreach($input_keycode as $section => $keys) {
                foreach($keys as $i => $key) {
                    if(is_numeric($key)) $prefs[$section][$key] = $input_command[$section][$i];
                }
            }

            // sort the arrays on key
            foreach($prefs as $section => $keys) {
                uksort($prefs[$section], 'self::chrsort');
            }

            $args['prefs']['keyboard_shortcuts'] = $prefs;
        }
        return $args;
    }

    /**
     * show keyboard icon
     * @param  array $p
     * @return array
     */
    public function show_icon($p) {
        if ($p['name'] == "listcontrols") {
            if(!$this->rcmail) $this->rcmail = rcmail::get_instance();

            // icon path
            $icon = sprintf("%s/skins/%s/images/keyboard_icon.png", $this->urlbase, $this->rcmail->config->get('skin', 'larry'));

            $content = html::tag('a', array('class' => 'keyboard_shortcuts_icon',
                                            'href' => '#',
                                            'title' => $this->gettext("keyboard_shortcuts"),
                                            'onclick' => 'return Shortcuts.help();'
                                           ),
                                html::tag('img', array( 'src' => $icon,
                                                        'align' => 'top',
                                                        'alt' => $this->gettext('keyboard_shortcuts'))
                                )
                        );
            $p['content'] = $content . $p['content'];
        }
        return $p;
    }

    /**
     * display help window
     */
    public function get_help()
    {
        if(!$this->rcmail) $this->rcmail = rcmail::get_instance();

        $shortcuts = $this->get_shortcuts();
        $commands  = $this->get_commands();

        $table = new html_table(array('cols' => '2'));

        foreach($shortcuts as $section => $keys) {
            $table->add(array('class' => 'title', 'colspan' => 2), $this->gettext($section));
            //$s = html::tag('h4', array(), $this->gettext($section));
            foreach($keys as $key => $command) {
                $table->add(array('class' => 'shortcut_key'),  chr($key));

                $table->add(array('class' => 'command'), isset($commands[$section][$command]['label']) ? $this->gettext($commands[$section][$command]['label']) : $this->gettext($command));
            }
        }

        $content = html::tag('div', array('class' => 'keyboard_shortcuts_help'), $table->show());

        $this->rcmail->output->command('plugin.ks_receive_help', array('help' => $content));

    }

    /**
     * sort keycode array by character
     * @param  string $a
     * @param  string $b
     * @return
     */
    public static function chrsort($a, $b)
    {
        return strcasecmp(chr($a), chr($b));
    }

    function xs_log($log) {
      error_log(print_r($log,1). "\n",3,"/tmp/log");
    }
}
