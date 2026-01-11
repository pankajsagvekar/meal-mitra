Feature: Authentication
  As a user (Donor, NGO, or Admin)
  I want to be able to log in, register, and manage my password
  So that I can access the application's features securely

  Scenario: Successful Donor Login
    Given I am on the login page
    When I enter valid donor email and password
    And I click the login button
    Then I should be redirected to the user dashboard
    And I should see the welcome message

  Scenario: Successful NGO Login
    Given I am on the login page
    When I enter valid NGO email and password
    And I click the login button
    Then I should be redirected to the user dashboard
    And I should see the NGO specific options

  Scenario: Successful Admin Login
    Given I am on the login page
    When I enter valid admin email and password
    And I click the login button
    Then I should be redirected to the admin dashboard

  Scenario: Failed Login
    Given I am on the login page
    When I enter invalid credentials
    And I click the login button
    Then I should see an error message indicating invalid credentials

  Scenario: User Registration
    Given I am on the register page
    When I enter valid registration details (Name, Email, Password, Phone, Address, Type)
    And I click the register button
    Then I should be redirected to the login page
    And I should see a success message

  Scenario: Forgot Password
    Given I am on the forgot password page
    When I enter a registered email address
    And I click the submit button
    Then I should see a message to check my email

  Scenario: Reset Password
    Given I am on the reset password page associated with a valid token
    When I enter a new password and confirm it
    And I click the reset password button
    Then I should be redirected to the login page
    And I should see a password reset success message
