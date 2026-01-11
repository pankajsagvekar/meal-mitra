package test.steps;

import io.cucumber.java.en.Given;
import io.cucumber.java.en.When;
import io.cucumber.java.en.Then;
import io.cucumber.java.en.And;
import org.junit.Assert;
import test.base.BaseTest;
import test.pages.LoginPage;

public class LoginSteps extends BaseTest {

    private LoginPage loginPage;

    @Given("user opens the browser")
    public void user_opens_the_browser() {
        setup();
        loginPage = new LoginPage(driver);
    }

    @And("user navigates to login page")
    public void user_navigates_to_login_page() {
        // Placeholder URL - UPDATE THIS TO MATCH YOUR APPLICATION
        driver.get("http://localhost:3000/login");
    }

    @When("user enters username and password")
    public void user_enters_username_and_password() {
        // Updated with actual credentials
        loginPage.enterCredentials("gauri", "12345");
        loginPage.clickLogin();
    }

    @Then("user should see home page")
    public void user_should_see_home_page() {
        Assert.assertTrue("Home page is not displayed", loginPage.isHomePageDisplayed());
        teardown();
    }
}
