Feature: Add feature
   In oder to test behaviour of an application we need to add features first

   Scenario: add feature
      When I visit "/ide.html"
      And I press the "add-feature" button
      Then I should see the text "Add Feature"

   Scenario: add scenario
      When I visit "/ide.html"
      And I press the "add-scenario" button
      Then I should see the text "Please add a feature before adding scenarios"
