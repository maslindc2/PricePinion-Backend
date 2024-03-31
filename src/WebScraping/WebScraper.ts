/**
 * This is the Web Scraper controller for handling the web scraping jobs.
 * The current theory is index.ts will call this function.
 * The controller will then tell each of the grocery store crawlers to run.
 * Storing the data to the DB could be handled in a different class we'll cross that bridge when we get to it.
 */
import { fredMeyerScraper } from "./GroceryStores/FredMeyerScraper";

export const webScraperController = () => {
    // Logging that we running the Webscraper controller
    console.log("Reached WebScraper Controller");
    // Run the FredMeyer webscraper once we have the data the print it to the console.
    fredMeyerScraper().then((data) => {
        for (let index = 0; index < data.length; index++) {
            // We are currently only printing the size of the scrape result array for each URL
            console.log(`Scraped URL Number ${index+1} resulted in ${data[index]?.length} products scraped.`);
        }
    });
};
