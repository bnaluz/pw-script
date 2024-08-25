const { chromium } = require('playwright');
const fs = require('fs');
const { parse } = require('json2csv');

const getREIPrices = async () => {
  const browser = await chromium.launch({
    headless: false,
  });

  const context = await browser.newContext();

  const page = await context.newPage();

  await page.goto('https://www.rei.com/');

  try {
    await page
      .locator('button[data-analytics-id="rei_nav:rei_topleveltab_deals"]')
      .click();

    await page
      .locator(
        "a[data-analytics-id='rei_nav:deals_footwear deals_men\\'s footwear']"
      )
      .click();

    await page.waitForTimeout(Math.random() * 2000 + 1000);
    await page.mouse.move(0, 200);

    await page.locator('button[class="zCU31v49r7TwTyKHRBF2"]').click();
    await page
      .locator('input[id="products-search-zip"]')
      .fill('Ann Arbor, MI', { delay: 100 });

    await page.keyboard.press('Enter');
    await page.waitForTimeout(Math.random() * 2000 + 1000);
    await page.mouse.move(0, 100);

    await page.locator('a[aria-label="Select Ann Arbor"]').click();
    await page.waitForTimeout(Math.random() * 2000 + 500);

    await page
      .locator('select[aria-label="Sort By"]')
      .first()
      .selectOption('percentageoff');

    await page.waitForTimeout(Math.random() * 2000 + 5000);

    //*This is currently working at Black Diesel Coffee which uses a public wifi - ran into issue when working at Drip Coffee which had a protected network

    //TODO: Currently able to navigate to Ann Arbor REI's top deals [percentoff] for mens shoes. Need to grab result grid, and extract the product data, its presented as multiple list items, and there is a data-color-swatch attribute which has a value of 'product/<productNum>/' and an <a> tag which has the link to the product. Now need to get the desired values to then export into csv file

    //*1 - Grab all the items

    //*1 Grab the unordered list using its specific class
    await page.waitForSelector('ul.cdr-grid_13-5-2');
    const allListItems = page.locator(
      'ul.cdr-grid_13-5-2 > li.VcGDfKKy_dvNbxUqm29K'
    );

    //* Get the count of all list items
    const listItemCount = await allListItems.count();
    console.log(listItemCount);
    const productData = [];

    // //*2 Iterate through each list item
    for (let i = 0; i < listItemCount; i++) {
      const item = allListItems.nth(i);
      const product = {};

      const linkElement = await item.locator('a').first();
      if ((await linkElement.count()) > 0) {
        product.productUrl =
          'rei.com' + (await linkElement.getAttribute('href'));
      } else {
        console.log(`No link found for item ${i}`);
      }

      const savingsElement = await item.locator(
        'div[data-ui="savings-percent-variant2"]'
      );
      if ((await savingsElement.count()) > 0) {
        product.savingsPercent = await savingsElement.textContent();
      } else {
        console.log(`No savings element found for item ${i}`);
      }

      const brandElement = await item.locator('span[data-ui="product-brand"]');
      if ((await brandElement.count()) > 0) {
        product.brand = await brandElement.textContent();
      } else {
        console.log(`No brand element found for item ${i}`);
      }

      const titleElement = await item.locator('span[data-ui="product-title"]');
      if ((await titleElement.count()) > 0) {
        product.title = await titleElement.textContent();
      } else {
        console.log(`No title element found for item ${i}`);
      }

      const ratingElement = await item.locator(
        'span.cdr-rating__caption-sr_13-5-2'
      );
      if ((await ratingElement.count()) > 0) {
        product.rating = await ratingElement.textContent();
      } else {
        console.log(`No rating element found for item ${i}`);
      }

      productData.push(product);
    }

    if (productData.length > 0) {
      const csv = parse(productData);
      fs.writeFileSync('productData.csv', csv);
      console.log('CSV file created successfully.');
    } else {
      console.log('No data available to convert to CSV.');
    }
  } catch (e) {
    console.log(e);
  }
};

(async () => {
  await getREIPrices();
})();
