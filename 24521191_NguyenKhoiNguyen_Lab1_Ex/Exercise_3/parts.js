const availability = document.querySelector(".availability");
const loadingStatus = document.querySelector(".loading-status");
const skeleton = document.querySelector(".parts-skeleton");
const liveData = document.querySelector("#live-data");
const emptyState = document.querySelector("#empty-state");
const errorState = document.querySelector("#error-state");
const errorMessage = document.querySelector("#error-message");
const retryButton = document.querySelector("#retry-button");
const metadataBadges = document.querySelector("#metadata-badges");
const partsList = document.querySelector("#parts-list");
const states = {
    loading: skeleton,
    "live-data": liveData,
    empty: emptyState,
    error: errorState
};
let activeRequestId = 0;

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

const showState = state => {
    for (const [name, element] of Object.entries(states)) {
        element.hidden = name !== state;
    }
    availability.dataset.state = state;
    availability.setAttribute("aria-busy", String(state === "loading"));
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
    showState("live-data");
    loadingStatus.textContent = `Showing ${parts.length} demonstration parts. This is sample data, not live inventory.`;
};

const requestDemoData = async () => {
    await new Promise(resolve => window.setTimeout(resolve, 500));

    const scenario = new URLSearchParams(window.location.search).get("demo");
    if (scenario === "error") {
        throw new Error("The requested demo error scenario was activated.");
    }
    if (scenario === "empty") {
        return [];
    }
    if (!Array.isArray(window.partsDemoData)) {
        throw new Error("The demonstration data has an invalid format.");
    }
    return window.partsDemoData;
};

const loadDemoData = async () => {
    const requestId = ++activeRequestId;
    showState("loading");
    loadingStatus.textContent = "Loading aircraft parts...";
    errorMessage.textContent = "The demonstration inventory is temporarily unavailable.";

    try {
        const records = await requestDemoData();
        if (requestId !== activeRequestId) {
            return;
        }

        const validParts = records.filter(isValidPart);
        if (records.length > 0 && validParts.length === 0) {
            throw new Error("The demonstration data did not contain valid parts.");
        }

        if (validParts.length === 0) {
            showState("empty");
            loadingStatus.textContent = "";
            return;
        }

        renderLiveData(validParts);
    } catch {
        if (requestId !== activeRequestId) {
            return;
        }
        showState("error");
        loadingStatus.textContent = "";
    }
};

retryButton.addEventListener("click", loadDemoData);
loadDemoData();