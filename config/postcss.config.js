const autoprefixer = require("autoprefixer");
const purgecss = require("@fullhuman/postcss-purgecss");
const whitelister = require("purgecss-whitelister");

module.exports = {
  plugins: [
    autoprefixer(),
    purgecss({
      content: ["./layouts/**/*.html", "./content/**/*.md"],
      safelist: [
        "lazyloaded",
        "table",
        "thead",
        "tbody",
        "tr",
        "th",
        "td",
        "h5",
        "aria-selected",
        "alert-link",
        "container-xxl",
        "container-fluid",
        "offcanvas-backdrop",
        ...whitelister([
          "./layouts/index.html",
          "./assets/scss/components/_alerts.scss",
          "./assets/scss/components/_algolia.scss",
          "./assets/scss/components/_banner.scss",
          "./assets/scss/components/_buttons.scss",
          "./assets/scss/components/_code.scss",
          "./assets/scss/components/_details.scss",
          "./assets/scss/components/_forms.scss",
          "./assets/scss/components/_gallery.scss",
          "./assets/scss/components/_iframe.scss",
          "./assets/scss/components/_images.scss",
          "./assets/scss/components/_missing_classes.scss",
          "./assets/scss/components/_posts.scss",
          "./node_modules/@docsearch/css/dist/style.css",
          "./assets/scss/components/_search.scss",
          "./assets/scss/components/_socialmedia.scss",
          "./assets/scss/components/_syntax.scss",
          "./assets/scss/components/_tables.scss",
          "./assets/scss/common/_dark.scss",
          "./node_modules/bootstrap/scss/_dropdown.scss",
          "./node_modules/katex/dist/katex.css",
          "./node_modules/bootstrap/scss/_dropdown.scss",
          "./assets/scss/home.scss",
        ]),
      ],
    }),
  ],
};
