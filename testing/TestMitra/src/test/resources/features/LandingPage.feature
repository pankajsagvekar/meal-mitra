Feature: Landing Page
  As a visitor
  I want to see the landing page
  So that I can understand the mission of Meal Mitra and navigate to login/signup

  Scenario: View Landing Page Content
    Given I am on the home page
    Then I should see the "Meal Mitra" logo
    And I should see the "Get Started" button
    And I should see the "Our Impact" section

  Scenario: Navigation to Login
    Given I am on the home page
    When I click the "Login" button
    Then I should be redirected to the login page

  Scenario: Navigation to Register
    Given I am on the home page
    When I click the "Join Us" button
    Then I should be redirected to the registration page
