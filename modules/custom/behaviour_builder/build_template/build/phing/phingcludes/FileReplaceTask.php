<?php

require_once "phing/Task.php";

class FileReplaceTask extends Task {

    protected $browser = null;
    protected $file = null;

    public function main() {
      $file_contents = file_get_contents($this->file);
      $file_contents = preg_replace("/browser_name:.*$/m", 'browser_name: '. $this->browser, $file_contents);
      file_put_contents($this->file, $file_contents);
    }

    public function setBrowser($browser) {
      $this->browser = "" . $browser;
    }

    public function setFile($file) {
      $this->file = "" . $file;
    }
}