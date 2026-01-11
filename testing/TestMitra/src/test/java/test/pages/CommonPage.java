package test.pages;

import org.openqa.selenium.WebDriver;
import org.openqa.selenium.WebElement;
import org.openqa.selenium.support.FindBy;
import org.openqa.selenium.support.PageFactory;

public class CommonPage {
    private WebDriver driver;

    @FindBy(tagName = "nav")
    private WebElement navBar;

    @FindBy(tagName = "footer")
    private WebElement footer;

    public CommonPage(WebDriver driver) {
        this.driver = driver;
        PageFactory.initElements(driver, this);
    }

    public boolean isNavBarDisplayed() {
        return navBar.isDisplayed();
    }

    public boolean isFooterDisplayed() {
        return footer.isDisplayed();
    }
}
