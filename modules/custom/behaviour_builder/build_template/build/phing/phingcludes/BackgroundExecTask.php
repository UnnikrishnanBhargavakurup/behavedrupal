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
      $output = array();
      exec($this->executable . ' > /dev/null &', $output, $pid);
      self::$pidMap[$this->pid] = $pid;
    }

    protected function stop() {
      exec("kill ". self::$pidMap[$this->pid]);
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