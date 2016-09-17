<?php

require_once "phing/Task.php";

class SpinnerTask extends Task {

  protected static $pid;

  public function main() {
    if($this->pid) {
      exec("kill ". $this->pid);
      return;
    }
    exec("while true; do for X in '-' '/' '|' '\'; do echo -en \"\b$X\"; sleep 0.1; done; done &", $output, $pid);
    $this->pid = $pid;
  }
}