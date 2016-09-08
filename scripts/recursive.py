import os
import sys
import re
from behat_process_actions import process_action_list

# find build/ -name "*Context.php"
files = [
    'drupal/drupal-extension/src/Drupal/DrupalExtension/Context/MinkContext.php',
    'drupal/drupal-extension/src/Drupal/DrupalExtension/Context/MessageContext.php',
    'drupal/drupal-extension/src/Drupal/DrupalExtension/Context/DrushContext.php',
    'drupal/drupal-extension/src/Drupal/DrupalExtension/Context/DrupalContext.php',
    'behat/mink-extension/src/Behat/MinkExtension/Context/MinkContext.php'
]

_dir = "/Library/WebServer/Documents/behavedrupal/build/vendor/"

actions = []
for file in files:
    with open(_dir + file, 'r') as fin:
        for line in fin:
            if re.match(r"\*\s{1}(@Given|@Then|@When)\s{1}.*$", line.strip()):
                line = line.strip()
                # print line
                if os.path.basename(fin.name) == "DrushContext.php":
                    actions.append([line[3:], 'api'])
                else:
                    actions.append([line[3:], ''])
        fin.close()

# write to a json file
process_action_list(actions)
sys.exit(0)
