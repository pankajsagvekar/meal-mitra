Feature: Admin Dashboard
  As an Admin
  I want to manage donations and users
  So that I can ensure the platform runs smoothly

  Background:
    Given I am logged in as an Admin

  Scenario: View Admin Dashboard Overview
    When I navigate to the admin dashboard
    Then I should see the platform statistics
    And I should see the latest donation activities

  Scenario: View All Donations
    Given I am on the Admin Donations page
    Then I should see a comprehensive list of all donations
    And I should be able to filter donations by status

  Scenario: Verify a Donation
    Given I am on the Admin Donation Detail page for a pending donation
    When I review the donation details
    And I click "Approve"
    Then the donation status should change to "Approved"

  Scenario: View All Users
    Given I am on the Admin Users page
    Then I should see a list of all registered users (Donors and NGOs)
    And I should see their account status
