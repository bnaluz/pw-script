//*FINAL !
require('dotenv').config();
const nodemailer = require('nodemailer');
const { chromium } = require('playwright');
const fs = require('fs');
const { parse } = require('json2csv');

const sendEmailWithAttachments = async (attachments) => {
  const transporter = nodemailer.createTransport({
    service: 'Gmail',
    auth: {
      user: process.env.EMAIL_USER,
      pass: process.env.EMAIL_PASS,
    },
  });

  const mailOptions = {
    from: process.env.EMAIL_USER,
    to: process.env.RECIPIENT_EMAIL,
    subject: 'Scraped Data CSV Files',
    text: 'Attached are the CSV files with the scraped data.',
    attachments,
  };

  try {
    await transporter.sendMail(mailOptions);
    console.log('Email sent successfully!');
  } catch (error) {
    console.error('Error sending email:', error);
  }
};

const scrapeDeals = async (url, fileName) => {
  const browser = await chromium.launch({
    headless: false,
  });

  const headers = {
    'User-Agent':
      'Mozilla/5.0 (Windows NT 10.0; Win64; x64; rv:109.0) Gecko/20100101 Firefox/119.0',
    Accept:
      'text/html,application/xhtml+xml,application/xml;q=0.9,image/avif,image/webp,*/*;q=0.8',
    'Accept-Language': 'en-US,en;q=0.5',
    Connection: 'keep-alive',
    'Upgrade-Insecure-Requests': '1',
    'Sec-Fetch-Dest': 'document',
    'Sec-Fetch-Mode': 'navigate',
    'Sec-Fetch-Site': 'none',
    'Sec-Fetch-User': '?1',
    Pragma: 'no-cache',
    'Cache-Control': 'no-cache',
  };

  const context = await browser.newContext({
    extraHTTPHeaders: headers,
  });

  const page = await context.newPage();

  await page.goto('https://www.rei.com/');

  try {
    await page.goto(url, {
      waitUntil: 'networkidle',
      timeout: 60000,
    });

    await page.waitForTimeout(Math.random() * 2000 + 1000);

    const productData = await page.$$eval(
      'ul.cdr-grid_13-5-2 > li.VcGDfKKy_dvNbxUqm29K',
      (items) => {
        return items.map((item) => {
          const productUrl = item.querySelector('a')
            ? 'rei.com' + item.querySelector('a').getAttribute('href')
            : 'N/A';
          const savingsPercent = item.querySelector(
            'div[data-ui="savings-percent-variant2"]'
          )
            ? item
                .querySelector('div[data-ui="savings-percent-variant2"]')
                .textContent.trim()
            : 'N/A';
          const brand = item.querySelector('span[data-ui="product-brand"]')
            ? item
                .querySelector('span[data-ui="product-brand"]')
                .textContent.trim()
            : 'N/A';
          const title = item.querySelector('span[data-ui="product-title"]')
            ? item
                .querySelector('span[data-ui="product-title"]')
                .textContent.trim()
            : 'N/A';
          const rating = item.querySelector(
            'span.cdr-rating__caption-sr_13-5-2'
          )
            ? item
                .querySelector('span.cdr-rating__caption-sr_13-5-2')
                .textContent.trim()
            : 'N/A';

          return { productUrl, savingsPercent, brand, title, rating };
        });
      }
    );

    if (productData.length > 0) {
      const csv = parse(productData);
      fs.writeFileSync(`csv/${fileName}`, csv);
      console.log(`CSV file "${fileName}" created successfully.`);
    } else {
      console.log('No data available to convert to CSV.');
    }
  } catch (e) {
    console.error('Error during operation:', e);
  } finally {
    await browser.close();
  }
};

const scrapeMultipleURLs = async () => {
  const urls = [
    {
      url: 'https://www.rei.com/c/mens-footwear/f/scd-deals?sort=percentageoff&ir=category%3Amens-footwear%3Bdeals%3ASee+All+Deals&r=c%3Bf%3Bstores%3A124',
      fileName: 'mensFootwear.csv',
    },
    {
      url: 'https://www.rei.com/c/womens-footwear/f/scd-deals?ir=category%3Awomens-footwear%3Bdeals%3ASee+All+Deals&r=c%3Bf%3Bstores%3A124&sort=percentageoff',
      fileName: 'womensFootwear.csv',
    },
    {
      url: 'https://www.rei.com/c/womens-jackets/f/scd-deals?ir=category%3Awomens-jackets%3Bdeals%3ASee+All+Deals&r=c%3Bf%3Bstores%3A124&sort=percentageoff',
      fileName: 'womensJackets.csv',
    },
    {
      url: 'https://www.rei.com/c/mens-jackets/f/scd-deals?ir=category%3Amens-jackets%3Bdeals%3ASee+All+Deals&r=c%3Bf%3Bstores%3A124&sort=percentageoff',
      fileName: 'mensJackets.csv',
    },
    {
      url: 'https://www.rei.com/c/tents/f/scd-deals?ir=category%3Atents%3Bdeals%3ASee+All+Deals&r=c%3Bf%3Bstores%3A124&sort=percentageoff',
      fileName: 'tents.csv',
    },
    {
      url: 'https://www.rei.com/c/backpacks/f/scd-deals?ir=category%3Abackpacks%3Bdeals%3ASee+All+Deals&r=c%3Bf%3Bstores%3A124&sort=percentageoff',
      fileName: 'backpacks.csv',
    },
  ];

  const attachments = [];

  for (const { url, fileName } of urls) {
    await scrapeDeals(url, fileName);

    attachments.push({
      filename: fileName,
      path: `./csv/${fileName}`,
    });

    const delay = Math.floor(Math.random() * 7000) + 5000;
    console.log(
      `Waiting for ${delay} milliseconds before processing the next URL...`
    );
    await new Promise((resolve) => setTimeout(resolve, delay));
  }

  await sendEmailWithAttachments(attachments);
};

(async () => {
  await scrapeMultipleURLs();
})();
