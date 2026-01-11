package test.steps;

import io.cucumber.java.en.Given;
import io.cucumber.java.en.Then;
import io.cucumber.java.en.When;
import test.pages.LandingPage;
import org.openqa.selenium.WebDriver;

public class LandingSteps {
    private WebDriver driver;
    private LandingPage landingPage;

    @Given("I am on the home page")
    public void i_am_on_the_home_page() {
        // driver.get(baseUrl);
        // landingPage = new LandingPage(driver);
    }

    @Then("I should see the {string} logo")
    public void i_should_see_the_logo(String logoText) {
        // assert logo
    }

    @Then("I should see the {string} button")
    public void i_should_see_the_button(String btnText) {
        // assert button
    }

    @When("I click the {string} button")
    public void i_click_the_button(String btnText) {
        // landingPage.clickButton(btnText);
    }
}
