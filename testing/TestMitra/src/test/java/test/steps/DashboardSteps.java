package test.steps;

import io.cucumber.java.en.When;
import io.cucumber.java.en.Then;
import test.pages.UserDashboardPage;
import test.pages.AdminDashboardPage; // Will create next
import org.openqa.selenium.WebDriver;

public class DashboardSteps {
    private WebDriver driver;
    private UserDashboardPage userDashboard;
    private AdminDashboardPage adminDashboard;

    // Needs constructor/DI for driver

    @When("I navigate to the user dashboard")
    public void i_navigate_to_the_user_dashboard() {
        // Validation or direct navigation if needed
    }

    @Then("I should see the dashboard overview")
    public void i_should_see_the_dashboard_overview() {
        // assert userDashboard.isDashboardDisplayed();
    }

    @Then("I should see the {string} option")
    public void i_should_see_the_option(String option) {
        // if option.equals("Donate") ...
    }

    // Add logic for Admin steps
}
