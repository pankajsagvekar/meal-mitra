package test.pages;

import org.openqa.selenium.WebDriver;
import org.openqa.selenium.WebElement;
import org.openqa.selenium.support.FindBy;
import org.openqa.selenium.support.PageFactory;

public class AdminDashboardPage {
    private WebDriver driver;

    @FindBy(xpath = "//h1[contains(text(), 'Admin Dashboard')]")
    private WebElement dashboardHeader;

    @FindBy(xpath = "//a[@href='/admin/donations']")
    private WebElement manageDonationsLink;

    @FindBy(xpath = "//a[@href='/admin/users']")
    private WebElement manageUsersLink;

    public AdminDashboardPage(WebDriver driver) {
        this.driver = driver;
        PageFactory.initElements(driver, this);
    }

    public boolean isDashboardDisplayed() {
        return dashboardHeader.isDisplayed();
    }

    public void clickManageDonations() {
        manageDonationsLink.click();
    }

    public void clickManageUsers() {
        manageUsersLink.click();
    }
}
