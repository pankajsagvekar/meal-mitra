Feature: User Dashboard
  As a logged-in Donor or NGO
  I want to access my dashboard
  So that I can make donations, view my history, and manage my profile

  Background:
    Given user opens the browser
    And user navigates to login page
    When user enters username and password
    Then user should see home page

  Scenario: View User Dashboard
    When I navigate to the user dashboard
    Then I should see the dashboard overview
    And I should see the "Donate" option
    And I should see the "My Donations" option

  Scenario: Make a Money Donation
    Given I am on the donate page
    When I select "Money" as donation type
    And I enter the amount and payment details
    And I submit the donation
    Then I should see a successful donation message

  Scenario: Make a Food Donation
    Given I am on the donate page
    When I select "Food" as donation type
    And I enter food details (name, quantity, expiry, location)
    And I submit the donation
    Then I should see a message thanking me for the food donation

  Scenario: View My Donations
    Given I am on the My Donations page
    Then I should see a list of my past donations
    And I should see the status of each donation

  Scenario: Update Profile
    Given I am on the User Profile page
    When I update my contact information
    And I save the changes
    Then I should see a profile updated success message
