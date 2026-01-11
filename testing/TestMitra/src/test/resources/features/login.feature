Feature: Login Test

  Scenario: Login with valid credentials
    Given user opens the browser
    And user navigates to login page
    When user enters username and password
    Then user should see home page
