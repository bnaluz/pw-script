# Product Data Scraper

This script uses Playwright to scrape product data from specific URLs (e.g., REI) and exports the data to CSV files. It also sends an email with the generated CSV files attached.

## Features

- Extracts product details such as URLs, savings, brand, title, and ratings.
- Converts the extracted data into CSV format and saves it in a csv directory.
- Automatically emails the CSV file to a specified recipient. (TODO)

## Code Overview

The script consists of the following main functions:

- scrapeDeals(url,fileName): opens a browser, navigates to a specified URL, scrapes teh product data and then saves into a CSV file.
- scrapeMultipleURLs(): calls scrapeDeals for each url in the list, then sends out an email with the CSV files
- sendEmailWithAttachments(attachments): sends an email with the specified CSV files as attachments

## Prerequisites

- Node.js and npm installed.
- Install required packages using:

  ```bash
  npm install playwright json2csv nodemailer dotenv
  ```

- Gmail App Password: For sending emails using Gmail, generate an App Password in your Google Account settings

## Configuration

- Environment Variables: Create a '.env' file in the root directory of your project with the following:

1.  EMAIL_USER=your-email@gmail.com
2.  EMAIL_PASS=your-app-pass
3.  RECIPIENT_EMAIL=recipient-email@domain.com

## How to Use

- Copy the code
- node your-file-name.js

Schedule for Regular Updates:
Use a scheduler like cron on Unix-based systems or Task Scheduler on Windows to run the script at your preferred intervals (e.g., weekly).

# Troubleshooting

- Blocked Requests: if you encounter 'access denied' errors, ensure that your headers are set up correctly, and consider adding delays between requests to avoid being blocked by anti-bot mechanisms
- CSV directory: ensure the csv folder exists in the root directory as the script will try to save files here

# License

This project is available under the MIT License
