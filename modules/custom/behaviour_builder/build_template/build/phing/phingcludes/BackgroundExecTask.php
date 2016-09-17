<?php

require_once "phing/Task.php";

class BackgroundExecTask extends Task {

    protected $command = null;
    protected $executable = null;
    protected $pid = null;

    protected static $pidMap = [];

    public function init() {

    }

    public function main() {
        switch ($this->command) {
          case "start":
            return $this->start();
          case "stop":
            return $this->stop();
        }
    }

    protected function start() {
      $pid = exec($this->executable . ' > /dev/null 2>&1 & echo $!;');
      self::$pidMap[$this->id] = $pid;
    }

    protected function stop() {
      exec("kill ". self::$pidMap[$this->id]);
    }

    public function setCommand($command) {
      $this->command = "" . $command;
    }

    public function setExecutable($executable) {
      $this->executable = "" . $executable;
    }

    public function setPid($id) {      
      $this->id = "" . $id;
    }
}
/*
    <exec command="${phantomjs.bin} --webdriver=${server.port}"
          passthru="true"
          spawn="true"
          checkreturn="true" /> 

 <backgroundexec pid="phantomjs_pid" 
        command="start" 
        executable="${phantomjs.bin} --webdriver=${server.port}" 
      />  
*/