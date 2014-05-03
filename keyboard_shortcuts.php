<?php
/**
 * keyboard_shortcuts
 *
 * Enables some common tasks to be executed with keyboard shortcuts
 *
 * @version 3.0
 * @author Patrik Kullman / Roland 'rosali' Liebl
 * @author Cor Bosman <cor@roundcu.be>
 * @licence GNU GPL
 *
 **/


class keyboard_shortcuts extends rcube_plugin
{
    public $task = 'mail|compose|addressbook|settings';
    public $noajax = true;
    private $rcmail;
    private $prefs;

    function init()
    {
        // load rcmail
        $this->rcmail = rcmail::get_instance();

        // require jqueryui
        $this->require_plugin('jqueryui');

        // set up hooks
        $this->add_hook('template_container', array($this, 'html_output'));
        $this->add_hook('preferences_list', array($this, 'preferences_list'));
        $this->add_hook('preferences_save', array($this, 'preferences_save'));
        $this->add_hook('preferences_sections_list',array($this, 'preferences_section'));
        $this->add_hook('preferences_section_header',array($this, 'preferences_section_header'));

        // include js/css
        $this->include_stylesheet('keyboard_shortcuts.css');
        $this->include_script('keyboard_shortcuts.js');

        $this->load_config();

        // add the keys to js
        if(in_array($task, array('mail','compose','addressbook'))) {
            $commands = json_serialize($this->rcmail->config->get('keyboard_shortcuts', $this->rcmail->config->get('keyboard_shortcuts_default')));
            $this->rcmail->output->add_script("var ks_commands = $commands;", 'foot');
        }

        // set up localization
        $this->add_texts('localization', true);

        // load config file
        //$this->load_config();
    }

    function preferences_section_header($args)
    {
        if($args['section'] == 'keyboard_shortcuts') {
            $args['header'] = html::tag('p', null, Q($this->gettext('header')));
        }
        return $args;
    }

    // add a section to the preferences tab
    function preferences_section($args) {
        $args['list']['keyboard_shortcuts'] = array(
            'id'      => 'keyboard_shortcuts',
            'section' => Q($this->gettext('title'))
        );
        return($args);
    }

    // preferences screen
    function preferences_list($args)
    {

        if($args['section'] == 'keyboard_shortcuts') {

            // rcmail
            if(!$this->rcmail) $this->rcmail = rcmail::get_instance();

            // load shortcuts
            $this->prefs = $this->rcmail->config->get('keyboard_shortcuts', $this->rcmail->config->get('keyboard_shortcuts_default'));

            // all available commands
            $this->commands = $this->rcmail->config->get('keyboard_shortcuts_commands', array());

            // loop through all sections, and print the configured keys
            foreach($this->prefs as $section => $keys) {
                $args['blocks'][$section] = array(
                    'name' => Q($this->gettext($section)),
                    'options' => array()
                );
                ksort($keys);
                foreach($keys as $key => $command) {
                    // command title
                    $title = isset($this->commands[$section][$command]['label']) ? Q($this->gettext($this->commands[$section][$command]['label'])) : Q($this->gettext($command));

                    // lightning rode
                    $hidden_lightning = new html_inputfield(array('name' => "_ks_lightning[$section][]", 'value' => 'lightning'));
                    // ascii key
                    $input = new html_inputfield(array('name' => "_ks_ascii[$section][]", 'class' => 'rcmfd_ks_input key', 'type' => 'text', 'autocomplete' => 'off', 'value' => chr($key)));

                    // command
                    $hidden_command =  new html_hiddenfield(array('name' => "_ks_command[$section][]", 'value' => $command));

                    // key code
                    $hidden_keycode = new html_hiddenfield(array('name' => "_ks_keycode[$section][]", 'value' => $key, 'class' => 'keycode'));

                    $args['blocks'][$section]['options'][$command] = array(
                        'title' => $title,
                        'content' => $input->show() . $hidden_command->show() . $hidden_keycode->show()
                    );
                }
            }

        }

        return($args);
    }

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
                    $prefs[$section][$key] = $input_command[$section][$i];
                }
            }

            $args['prefs']['keyboard_shortcuts'] = $prefs;
        }
        return $args;
    }

    function html_output($p) {
        if ($p['name'] == "listcontrols") {
            if(!$this->rcmail) $this->rcmail = rcmail::get_instance();
            $skin  = $this->rcmail->config->get('skin');

            if(!file_exists('plugins/keyboard_shortcuts/skins/' . $skin . '/images/keyboard.png')){
                $skin = "default";
            }

            $c = "";
            $c .= '<span id="keyboard_shortcuts_title">' . $this->gettext("title") . ":&nbsp;</span><a id='keyboard_shortcuts_link' href='#' class='button' title='".$this->gettext("keyboard_shortcuts")." ".$this->gettext("show")."' onclick='return keyboard_shortcuts_show_help()'><img align='top' src='plugins/keyboard_shortcuts/skins/".$skin."/images/keyboard.png' alt='".$this->gettext("keyboard_shortcuts")." ".$this->gettext("show")."' /></a>\n";
            $c .= "<div id='keyboard_shortcuts_help'>";
            $c .= "<div><h4>".$this->gettext("mailboxview")."</h4>";
            $c .= "<div class='shortcut_key'>?</div> ".$this->gettext('help')."<br class='clear' />";
            $c .= "<div class='shortcut_key'>a</div> ".$this->gettext('selectallvisiblemessages')."<br class='clear' />";
            $c .= "<div class='shortcut_key'>A</div> ".$this->gettext('markallvisiblemessagesasread')."<br class='clear' />";
            $c .= "<div class='shortcut_key'>c</div> ".$this->gettext('compose')."<br class='clear' />";
            $c .= "<div class='shortcut_key'>d</div> ".$this->gettext('deletemessage')."<br class='clear' />";
            $c .= "<div class='shortcut_key'>f</div> ".$this->gettext('forwardmessage')."<br class='clear' />";
            $c .= "<div class='shortcut_key'>j</div> ".$this->gettext('previouspage')."<br class='clear' />";
            $c .= "<div class='shortcut_key'>k</div> ".$this->gettext('nextpage')."<br class='clear' />";
            $c .= "<div class='shortcut_key'>p</div> ".$this->gettext('printmessage')."<br class='clear' />";
            $c .= "<div class='shortcut_key'>r</div> ".$this->gettext('replytomessage')."<br class='clear' />";
            $c .= "<div class='shortcut_key'>R</div> ".$this->gettext('replytoallmessage')."<br class='clear' />";
            $c .= "<div class='shortcut_key'>s</div> ".$this->gettext('quicksearch')."<br class='clear' />";
            $c .= "<div class='shortcut_key'>u</div> ".$this->gettext('checkmail')."<br class='clear' />";
            $c .= "<div class='shortcut_key'> </div> <br class='clear' />";
            $c .= "</div>";

            if(!is_object($thisrcmail->imap)){
                $this->rcmail->imap_connect();
            }
            $threading_supported = $this->rcmail->imap->get_capability('thread=references')
                || $this->rcmail->imap->get_capability('thread=orderedsubject')
                || $this->rcmail->imap->get_capability('thread=refs');

            if ($threading_supported) {
                $c .= "<div><h4>".$this->gettext("threads")."</h4>";
                $c .= "<div class='shortcut_key'>E</div> ".$this->gettext('expand-all')."<br class='clear' />";
                $c .= "<div class='shortcut_key'>C</div> ".$this->gettext('collapse-all')."<br class='clear' />";
                $c .= "<div class='shortcut_key'>U</div> ".$this->gettext('expand-unread')."<br class='clear' />";
                $c .= "<div class='shortcut_key'> </div> <br class='clear' />";
                $c .= "</div>";
            }
            $c .= "<div><h4>".$this->gettext("messagesdisplaying")."</h4>";
            $c .= "<div class='shortcut_key'>d</div> ".$this->gettext('deletemessage')."<br class='clear' />";
            $c .= "<div class='shortcut_key'>c</div> ".$this->gettext('compose')."<br class='clear' />";
            $c .= "<div class='shortcut_key'>f</div> ".$this->gettext('forwardmessage')."<br class='clear' />";
            $c .= "<div class='shortcut_key'>j</div> ".$this->gettext('previousmessage')."<br class='clear' />";
            $c .= "<div class='shortcut_key'>k</div> ".$this->gettext('nextmessage')."<br class='clear' />";
            $c .= "<div class='shortcut_key'>p</div> ".$this->gettext('printmessage')."<br class='clear' />";
            $c .= "<div class='shortcut_key'>r</div> ".$this->gettext('replytomessage')."<br class='clear' />";
            $c .= "<div class='shortcut_key'>R</div> ".$this->gettext('replytoallmessage')."<br class='clear' />";
            $c .= "<div class='shortcut_key'> </div> <br class='clear' />";
            $c .= "</div></div>";

            //$this->prefs = $this->rcmail->config->get('keyboard_shortcuts', $this->rcmail->config->get('keyboard_shortcuts_default'));

            //$rcmail->output->set_env('ks_commands', $this->prefs);

            $p['content'] = $c . $p['content'];
        }
        return $p;
    }

    function xs_log($log) {
      error_log(print_r($log,1). "\n",3,"/tmp/log");
    }
}
