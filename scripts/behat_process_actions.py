#!/usr/bin/env python
import re


def process_action_list(actions):
    saved_placeholders = []
    saved_data_holders = []
    with open("/Library/WebServer/Documents/behavedrupal/themes/semantic/js/actions.js", 'w') as outfile:
        action_data = "var action_data = [\n"
        for action in actions:
            action_data += '\t{\n\t\t"t" : "'
            line = action[0].replace('"', r'\"')
            # remove regex form the string here.
            line = re.sub(r'\(\?P<([a-z_]*?)>.*?[*+]\)', r':\1', line)
            line = re.sub(r'\/\^', '', line)
            line = re.sub(r'\(\?\:([a-z\s]*?)\|.*?\)', r'\1', line)
            line = re.sub(r'\(\?P<([a-z_]*?)>.*?\$/', r'\\":\1\\"', line)
            # remove all the ending $ sign
            line = re.sub(r'\$/', '', line)
            # remove options words
            line = re.sub(r'\(([a-zA-Z\s]*?)\)', r'\1', line)
            # find all words start with : we use it as a placeholder
            pleace_holders = re.findall(r':\w+', line)
            if pleace_holders:
                for pleace_holder in pleace_holders:
                    if pleace_holder not in saved_placeholders:
                        saved_placeholders.append(pleace_holder)
            # for getting all the data place holders for an action
            data_holders = re.findall(r'\w+:', line)
            if data_holders:
                if data_holders[0] == "content:":
                    action_data += line + \
                        '",\n\t\t"d" : [["title", "author", "status", "created"], ["My title", "Joe Editor", "1", "2014-10-17 8:00am"]],'
                elif data_holders[0] == "users:":
                    action_data += line + \
                        '",\n\t\t"d" : [["name", "mail", "roles"], ["user foo", "foo@bar.com", "role1, role2"]],'
                elif data_holders[0] == "terms:":
                    action_data += line + \
                        '",\n\t\t"d" : [["term1"], ["term2"], ["term3"]],'
                else:
                    action_data += line + '",\n\t\t"d" : [],'
            else:
                action_data += line + '",\n\t\t"d" : [],'
            '''
            if action[1] == '':
                action_data += '\n\t\t"tag" : ""\n\t},\n'
            else:
                action_data += '\n\t\t"tag" : "' + action[1] + '"\n\t},\n'
            '''

        # end of for loop
        action_data = action_data.rstrip(',\n') + '\n];\n\n'
        # save all the placeholder messages at the end of file.
        action_data += 'var help_data = {\n'
        for pleace_holder in saved_placeholders:
            if pleace_holder == ":code":
                action_data += '\t"' + pleace_holder + \
                    '" : "Please specify a HTTP return code in :code palce holder",\n'
            else:
                action_data += '\t"' + pleace_holder + '" : "Please specify a ' + \
                    pleace_holder.lstrip(':') + ' for ' + \
                    pleace_holder + ' palce holder", \n'
        action_data = action_data.rstrip(',\n') + '\n};\n'
        # save all the data placeholder messages at the end of file.
        '''
        action_data += '\nvar action_tables = {\n'
        for pleace_holder in saved_data_holders:
            if pleace_holder == "content:":
                action_data += '\t"' + pleace_holder + '" : "", \n'
            elif pleace_holder == "messages:":
                action_data += '\t"' + pleace_holder + '" : "", \n'
            elif pleace_holder == "users:":
                action_data += '\t"' + pleace_holder + '" : "", \n'
            elif pleace_holder == "terms:":
                action_data += '\t"' + pleace_holder + '" : "", \n'
            else:
                action_data += '\t"' + pleace_holder + '" : "", \n'
        action_data = action_data.rstrip(',\n') + '\n};\n'
        '''
        outfile.write(action_data)
        outfile.close()
