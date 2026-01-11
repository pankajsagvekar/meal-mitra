package test.steps;

import io.cucumber.java.en.Given;
import io.cucumber.java.en.Then;
import test.pages.CommonPage;
import test.base.BaseTest;

public class CommonSteps extends BaseTest {
    private CommonPage commonPage;

    @Given("I am on any page")
    public void i_am_on_any_page() {
        if (driver == null) {
            setup();
            driver.get("http://localhost:3000/");
        }
        commonPage = new CommonPage(driver);
    }

    @Then("I should see the navigation bar at the top")
    public void i_should_see_the_navigation_bar_at_the_top() {
        commonPage.isNavBarDisplayed();
    }

    @Then("I should see the footer at the bottom")
    public void i_should_see_the_footer_at_the_bottom() {
        commonPage.isFooterDisplayed();
    }
}
