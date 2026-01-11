package test.pages;

import org.openqa.selenium.By;
import org.openqa.selenium.WebDriver;

public class LoginPage {
    private WebDriver driver;

    // Placeholder locators - UPDATE THESE TO MATCH YOUR APPLICATION
    private By usernameField = By.id("username");
    private By passwordField = By.id("password");
    private By loginButton = By.id("login-btn");
    private By homePageIdentifier = By.id("home-welcome");

    public LoginPage(WebDriver driver) {
        this.driver = driver;
    }

    public void enterCredentials(String username, String password) {
        driver.findElement(usernameField).sendKeys(username);
        driver.findElement(passwordField).sendKeys(password);
    }

    public void clickLogin() {
        driver.findElement(loginButton).click();
    }

    public boolean isHomePageDisplayed() {
        try {
            return driver.findElement(homePageIdentifier).isDisplayed();
        } catch (Exception e) {
            return false;
        }
    }
}
