# Cowurl
Taming the Web. Inspired by the cowboy's dexterity in capturing wild horses, Cowurl offers the ability to capture and manage URLs from the vastness of cyberspace.

## Key Features

* **Automatic URL Collection**
* **Automatic Pagination**
* **Real-time Output Cleaning**
* **Persistent Storage**
* **Scraping Control**
* **Smart Auto-Stop**
* **Easy Output Management**

## How to Use Cowurl

### Installation

1.  Download or clone this repository.
2.  Open Chrome and navigate to `chrome://extensions`.
3.  Enable "Developer mode" in the top right corner.
4.  Click "Load unpacked".
5.  Select the folder where you saved the Cowurl extension files.

### Configuration

1.  **Start URL**: Enter the initial URL from which you want to start scraping. Make sure the URL includes the page parameter if the site uses pagination (ex: `https://example.com/search?page=1` or `https://example.com/items?offset=SPG:0`).
2.  **Max Page**: Specify the maximum number of pages you wish to scrape.
3.  **Main Tag**: Enter the primary HTML tag containing the elements you want to extract (e.g., `div`, `a`, `li`).
4.  **Lock Selector (attr/class/id)**: Use this selector to filter `Main Tag` elements.
    * `attr:attribute_name` (e.g., `attr:href` to filter elements that have an `href` attribute)
    * `class:class_name` (e.g., `class:product-item` to filter elements with the `product-item` class)
    * `id:id_name` (e.g., `id:main-content` to filter elements with the `main-content` ID)
    * Leave blank if no specific filter is needed.
5.  **Get Value From (attr/class/id)**: Define how values will be extracted from the filtered elements.
    * `attr:attribute_name` (e.g., `attr:src` to get the value from the `src` attribute)
    * `class:class_name` (e.g., `class:title` to get the text from a child element with the `title` class)
    * `id:id_name` (e.g., `id:product-link` to get the text from a child element with the `product-link` ID)
6.  **Output Cleaner (regex)**: (Optional) Enter a regular expression to purify the extracted output. This is applied to each scraped item before being displayed and saved. Example: `(?<=images/)(.*?)(?=\.png)` will extract the `.png` filename from an image URL.


## Contributions

Contributions are welcome! Please feel free to open an *issue* or create a *pull request*.

---
*Created with ❤️ by [xcapri/Tegalsec]*