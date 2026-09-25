const availability = document.querySelector(".availability");
const loadingStatus = document.querySelector(".loading-status");
const skeleton = document.querySelector(".parts-skeleton");
const liveData = document.querySelector("#live-data");
const metadataBadges = document.querySelector("#metadata-badges");
const partsList = document.querySelector("#parts-list");

const isNonEmptyString = value => typeof value === "string" && value.trim().length > 0;

const isValidPart = part =>
    part !== null &&
    typeof part === "object" &&
    isNonEmptyString(part.id) &&
    isNonEmptyString(part.partNumber) &&
    isNonEmptyString(part.name) &&
    isNonEmptyString(part.category) &&
    isNonEmptyString(part.supplier) &&
    (part.stockStatus === "In stock" || part.stockStatus === "Limited stock") &&
    Number.isInteger(part.leadTimeDays) &&
    part.leadTimeDays >= 0;

const addTextElement = (parent, tagName, className, text) => {
    const element = document.createElement(tagName);
    element.className = className;
    element.textContent = text;
    parent.append(element);
    return element;
};

const createPartCard = part => {
    const item = document.createElement("li");
    const article = document.createElement("article");
    article.className = "part-card";

    addTextElement(article, "p", "part-number", part.partNumber);

    const heading = addTextElement(article, "h4", "", part.name);
    heading.id = `part-${part.id}`;

    const header = document.createElement("header");
    header.className = "part-card-header";
    article.insertBefore(header, article.firstChild);
    header.append(article.querySelector(".part-number"), heading);

    const stockBadge = addTextElement(header, "span", "stock-badge", part.stockStatus);
    stockBadge.dataset.stock = part.stockStatus === "In stock" ? "available" : "limited";

    addTextElement(article, "p", "part-category", part.category);

    const details = document.createElement("dl");
    details.className = "part-details";
    for (const [label, value] of [
        ["Supplier", part.supplier],
        ["Lead time", `${part.leadTimeDays} days`]
    ]) {
        addTextElement(details, "dt", "", label);
        addTextElement(details, "dd", "", value);
    }
    article.append(details);

    item.append(article);
    return item;
};

const renderLiveData = parts => {
    const supplierCount = new Set(parts.map(part => part.supplier)).size;
    const availableCount = parts.filter(part => part.stockStatus === "In stock").length;

    for (const label of [
        `${parts.length} demo listings`,
        `${supplierCount} demo suppliers`,
        `${availableCount} marked in stock`
    ]) {
        addTextElement(metadataBadges, "li", "", label);
    }

    parts.forEach(part => partsList.append(createPartCard(part)));
    skeleton.hidden = true;
    liveData.hidden = false;
    availability.dataset.state = "live-data";
    availability.setAttribute("aria-busy", "false");
    loadingStatus.textContent = `Showing ${parts.length} demonstration parts. This is sample data, not live inventory.`;
};

const loadDemoData = async () => {
    await new Promise(resolve => window.setTimeout(resolve, 500));

    const validParts = Array.isArray(window.partsDemoData)
        ? window.partsDemoData.filter(isValidPart)
        : [];

    if (validParts.length > 0) {
        renderLiveData(validParts);
    }
};

loadDemoData();