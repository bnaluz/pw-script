# Product Data Scraper

This script uses Playwright to scrape product data from a specified website and exports the data to a CSV file.

## Features

- Extracts product details such as URLs, savings, brand, title, and ratings.
- Converts the extracted data into a CSV file.
- Automatically emails the CSV file to a specified recipient. (TODO)

## Prerequisites

- Node.js and npm installed.
- Install required packages using:

  ```bash
  npm install playwright json2csv nodemailer
  ```

How to Use
Edit Configuration:

Execute the script using:
bash
Copy code
node your-script-name.js

Schedule for Regular Updates:

Use a scheduler like cron on Unix-based systems or Task Scheduler on Windows to run the script at your preferred intervals (e.g., weekly).
