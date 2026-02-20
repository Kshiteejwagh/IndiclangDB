package com.selenium.test;

import java.time.Duration;
import org.openqa.selenium.By;
import org.openqa.selenium.WebDriver;
import org.openqa.selenium.WebElement;
import org.openqa.selenium.chrome.ChromeDriver;
import org.openqa.selenium.support.ui.ExpectedConditions;
import org.openqa.selenium.support.ui.WebDriverWait;

public class LoginProject {

    public static void main(String[] args) {

        // 1. Setup ChromeDriver
        System.setProperty("webdriver.chrome.driver",
                "C:\\Users\\hp\\Downloads\\Devops\\chromedriver-win64\\chromedriver.exe");
        WebDriver driver = new ChromeDriver();

        try {
            // 2. Navigate to the local web app
            // NOTE: Using file protocol for local file
            String appUrl = "https://indidict.netlify.app/";
            driver.get(appUrl);

            driver.manage().window().maximize();

            // 3. Open Login Modal if not already open (The app defaults to showing auth if
            // not logged in)
            // But just in case, we can ensure we are on the login screen
            // The script says: if session is null, showScreen('login') is called
            // automatically.

            // 4. Fill in Credentials
            // IMPORTANT: Update these with valid Supabase credentials for your project!
            // If you haven't signed up, run the app manually and sign up first.
            String email = "tanmaykalinkar4105@gmail.com";
            String password = "qwertyuiop";

            System.out.println("Attempting login with: " + email);

            WebDriverWait wait = new WebDriverWait(driver, Duration.ofSeconds(10));

            // Wait for login form to be visible
            WebElement emailInput = wait.until(ExpectedConditions.visibilityOfElementLocated(By.id("login-email")));
            emailInput.clear();
            emailInput.sendKeys(email);

            WebElement passwordInput = driver.findElement(By.id("login-password"));
            passwordInput.clear();
            passwordInput.sendKeys(password);

            // 5. Submit Form
            // The button is inside the form
            WebElement loginButton = driver.findElement(By.cssSelector("#login-form button[type='submit']"));
            loginButton.click();

            // 6. Wait for Login Success
            // Success is indicated by the #user-actions div becoming visible (and
            // #auth-container hidden)
            // We wait for user-actions to be visible

            try {
                WebElement userActions = wait.until(
                        ExpectedConditions.visibilityOfElementLocated(By.id("user-actions")));

                if (userActions.isDisplayed()) {
                    System.out.println("✔ TEST PASSED: Successfully logged in!");
                } else {
                    System.out.println("✘ TEST FAILED: User actions not visible.");
                }
            } catch (Exception e) {
                System.out.println("✘ TEST FAILED: Timeout waiting for login success. Check credentials or network.");
                // Optional: Check for alert or error message
                // Note: The app uses 'alert()' for errors, which Selenium can handle
                try {
                    String alertText = driver.switchTo().alert().getText();
                    System.out.println("Alert message: " + alertText);
                    driver.switchTo().alert().accept();
                } catch (Exception noAlert) {
                    // No alert found
                }
            }

        } catch (Exception e) {
            e.printStackTrace();
        } finally {
            // 7. Cleanup
            driver.quit(); // Uncomment to close browser automatically
        }
    }
}
