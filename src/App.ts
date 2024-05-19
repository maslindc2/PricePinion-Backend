import { logger } from "@logger";
import express from "express";
import { WebScraperController } from "./WebScraping/WebScraperController";
import { ProductProcessor } from "./WebScraping/ProductProcessor";
import { ProductModel } from "@product-model";
import { CustomerModel } from "@customer-model";

// Creates and configures an ExpressJS web server.
class App {
    // ref to Express instance
    public expressApp: express.Application;
    public Products: ProductModel;
    public Customer: CustomerModel;

    //Run configuration methods on the Express instance.
    constructor(mongoDBConnection: string) {
        this.expressApp = express();
        this.middleware();
        this.routes();
        this.Products = new ProductModel(mongoDBConnection);
        this.Customer = new CustomerModel(mongoDBConnection, this.Products);
        // Uncomment this to populate the DB
        ////this.scrapeAllStores();
    }

    // Configure the express middleware
    private middleware(): void {
        // Express bundles include bodyParser by default no longer needed as a separate library
        this.expressApp.use(express.json());
        this.expressApp.use(express.urlencoded({ extended: false }));
        // Setting allowed headers for the Express server
        this.expressApp.use((req, res, next) => {
            res.header("Access-Control-Allow-Origin", "*");
            res.header(
                "Access-Control-Allow-Headers",
                "Origin, X-Requested-With, Content-Type, Accept"
            );
            res.header(
                "Access-Control-Allow-Methods",
                "GET, POST, PUT, DELETE"
            );
            next();
        });
    }
    // Defining the routes use for PricePinion's Express server
    private routes(): void {
        const router = express.Router();

        router.get("/api/products", async (req, res) => {
            // Retrieve all products from the DB
            await this.Products.retrieveAllProducts(res);
        });

        router.get("/api/save-for-later", async (req, res) => {
            // Retrieve a specific customer
            await this.Customer.retrieveSaveForLater(res);
        });

        router.post("/api/customer/save-for-later", async (req, res) => {
            // Call save product comparison for later function
            await this.Customer.saveComparisonForLater(req, res);
        });

        router.delete(
            "/api/customer/delete-all-products-from-sfl",
            async (req, res) => {
                // Call save product comparison for later function
                await this.Customer.deleteAllProductsFromSFL(req, res);
            }
        );

        router.delete(
            "/api/customer/delete-one-product-from-sfl/:productID",
            async (req, res) => {
                const productID = req.params.productID;
                // Call save product comparison for later function
                await this.Customer.deleteOneProductFromSFL(res, productID);
            }
        );

        router.get("/api/product/:productID", async (req, res) => {
            // Store the productID from the request parameters
            const productID = req.params.productID;
            // Retrieve the specific product by productID
            await this.Products.retrieveProductByID(res, productID);
        });
        this.expressApp.use("/", router);
        this.expressApp.use(
            "/",
            express.static(__dirname + "/dist/front-end/browser")
        );
    }
    // Scrape store function starts the webscraper
    private async scrapeAllStores() {
        logger.info("Starting Scrape Jobs!");
        // Creating a scraperController object.
        const scraperController = new WebScraperController();
        // Run the webscraper and store object results.
        const scrapeResults = await scraperController.runWebScrapers();
        // Creating an object productProcessor.
        const productProcessor = new ProductProcessor(this.Products);
        // Process and update the products on the DB using the results from the web scraper.
        productProcessor.processScrapeResults(scrapeResults);
    }
}
export { App };
