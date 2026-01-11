Feature: Common Functionality
  As a use of the website
  I want a consistent layout
  So that I can easily navigate the site

  Scenario: Navigation Bar Presence
    Given I am on any page
    Then I should see the navigation bar at the top
    And the navigation bar should contain links to "Home", "About", and "Contact"

  Scenario: Footer Presence
    Given I am on any page
    Then I should see the footer at the bottom
    And the footer should contain copyright information
    And the footer should contain social media links
