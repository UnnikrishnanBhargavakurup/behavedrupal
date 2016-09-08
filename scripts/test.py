import re

print re.sub(r"[^\w\s\\']", '', "When /^(?:|I )fill in \"(?P < value > (?: [ ^ \"]|\")*)\" for \"(?P<field>(?:[^\"]|\")*)\"$/")
