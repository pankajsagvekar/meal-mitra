package test.pages;

import org.openqa.selenium.By;
import org.openqa.selenium.WebDriver;
import org.openqa.selenium.WebElement;
import org.openqa.selenium.support.FindBy;
import org.openqa.selenium.support.PageFactory;

public class AuthenticationPage {
    private WebDriver driver;

    // Login Selectors
    @FindBy(id = "login-username")
    private WebElement loginUsername;

    @FindBy(id = "login-password")
    private WebElement loginPassword;

    @FindBy(xpath = "//button[text()='Sign In']")
    private WebElement loginButton;

    // Registration Selectors
    @FindBy(id = "register-username")
    private WebElement regUsername;

    @FindBy(id = "register-email")
    private WebElement regEmail;

    @FindBy(id = "register-password")
    private WebElement regPassword;

    @FindBy(xpath = "//button[contains(text(), 'Sign Up')]")
    private WebElement registerButton;

    public AuthenticationPage(WebDriver driver) {
        this.driver = driver;
        PageFactory.initElements(driver, this);
    }

    public void login(String username, String password) {
        loginUsername.sendKeys(username);
        loginPassword.sendKeys(password);
        loginButton.click();
    }

    public void register(String username, String email, String password) {
        regUsername.sendKeys(username);
        regEmail.sendKeys(email);
        regPassword.sendKeys(password);
        registerButton.click();
    }
}
