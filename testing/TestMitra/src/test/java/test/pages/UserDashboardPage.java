package test.pages;

import org.openqa.selenium.WebDriver;
import org.openqa.selenium.WebElement;
import org.openqa.selenium.support.FindBy;
import org.openqa.selenium.support.PageFactory;

public class UserDashboardPage {
    private WebDriver driver;

    @FindBy(xpath = "//h1[text()='Dashboard']")
    private WebElement dashboardHeader;

    // Use xpath to find the card that contains "Donate Food"
    @FindBy(xpath = "//a[@href='/donate']")
    private WebElement donateFoodLink;

    @FindBy(xpath = "//a[@href='/my-donation']")
    private WebElement myDonationsLink;

    @FindBy(xpath = "//a[@href='/profile']")
    private WebElement profileLink;

    public UserDashboardPage(WebDriver driver) {
        this.driver = driver;
        PageFactory.initElements(driver, this);
    }

    public boolean isDashboardDisplayed() {
        return dashboardHeader.isDisplayed();
    }

    public void clickDonateFood() {
        donateFoodLink.click();
    }

    public void clickMyDonations() {
        myDonationsLink.click();
    }

    public void clickProfile() {
        profileLink.click();
    }
}
