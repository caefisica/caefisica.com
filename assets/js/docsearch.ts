const searchPlaceholder = document.getElementById("search-placeholder");
if (searchPlaceholder) {
  searchPlaceholder.className = "d-none";
}

algoliasearchNetlify({
  appId: "Q678D1SIXS",
  apiKey: "212b4289f18eff69818f91465a98e85d",
  siteId: "abc167f5-8dee-48db-a7da-3c97c18849be",
  branch: "master",
  selector: "#docsearch",
});
