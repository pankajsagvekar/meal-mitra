package test.pages;

import org.openqa.selenium.WebDriver;
import org.openqa.selenium.WebElement;
import org.openqa.selenium.support.FindBy;
import org.openqa.selenium.support.PageFactory;

public class LandingPage {
    private WebDriver driver;

    // Assuming Hero Section has specific text or ID. Inspecting Index.tsx showed
    // HeroSection component.
    // Usually Hero has an H1.
    @FindBy(tagName = "h1")
    private WebElement heroHeader;

    @FindBy(xpath = "//button[contains(text(), 'Login')]") // Assuming login button is visible
    private WebElement loginButton;

    // Index.tsx uses HeroSection which passes onDonateClick.
    // Button might be "Donate Now" or "Get Started".
    // I will assume generic for now or based on typical hero.

    public LandingPage(WebDriver driver) {
        this.driver = driver;
        PageFactory.initElements(driver, this);
    }

    public boolean isPageDisplayed() {
        return heroHeader.isDisplayed();
    }

    public void clickLogin() {
        loginButton.click();
    }
}
