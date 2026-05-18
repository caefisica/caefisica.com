import { autocomplete, getAlgoliaResults } from "@algolia/autocomplete-js";
import { liteClient } from "algoliasearch/lite";

interface NetlifyRecord {
  [key: string]: unknown;
  url: string;
  title: string;
  description?: string;
  content?: string;
}

const searchClient = liteClient("Q678D1SIXS", "212b4289f18eff69818f91465a98e85d");

const placeholder = document.getElementById("search-placeholder");
if (placeholder) {
  placeholder.className = "d-none";
}

autocomplete<NetlifyRecord>({
  container: "#docsearch",
  placeholder: "Buscar...",
  getSources({ query }) {
    return [
      {
        sourceId: "netlify",
        getItems() {
          return getAlgoliaResults<NetlifyRecord>({
            searchClient,
            queries: [
              {
                indexName: "netlify_abc167f5-8dee-48db-a7da-3c97c18849be_master_all",
                params: {
                  query,
                  hitsPerPage: 5,
                  attributesToHighlight: ["title"],
                  attributesToSnippet: ["description:15", "content:15"],
                },
              },
            ],
          });
        },
        getItemUrl({ item }) {
          return item.url;
        },
        templates: {
          item({ item, components, html }) {
            const snippetAttr = item.description ? "description" : "content";
            return html`<a href="${item.url}" class="aa-ItemContent">
              <div class="aa-ItemTitle">
                <${components.Highlight} hit=${item} attribute="title" />
              </div>
              <div class="aa-ItemDescription">
                <${components.Snippet} hit=${item} attribute=${snippetAttr} />
              </div>
            </a>`;
          },
          noResults() {
            return "Sin resultados.";
          },
        },
      },
    ];
  },
});
