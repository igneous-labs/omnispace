import * as BabylonViewer from "babylonjs-viewer";
import models from "@/js/babylon/build/models";

const DEFAULT_MODEL = models.furnitureKit.items[0];

/**
 * @typedef CtorArgs
 * @property {HTMLDivElement} preview
 */

export class Build {
  /** @type {BabylonViewer.DefaultViewer} */
  modelViewer;

  /**
   * @param {CtorArgs} args
   * @returns {Build}
   */
  static load(args) {
    return new Build(args);
  }

  /**
   *
   * @param {CtorArgs} args
   */
  constructor(args) {
    this.setupModelPreview(args);
    this.showItemsCategories();
    this.initBackButton();
  }

  /**
   *
   * @param {CtorArgs} _unnamed
   */
  setupModelPreview({ preview }) {
    this.modelViewer = new BabylonViewer.DefaultViewer(preview, {
      model: DEFAULT_MODEL,
      extends: "minimal",
      scene: {
        debug: true,
      },
      camera: {
        behaviors: {
          autoRotate: 1,
        },
      },
      templates: {
        main: {
          html: "<fill-container></fill-container>",
        },
        // navBar: {
        //   html: navBar,
        //   events: {
        //     pointerdown: Object.keys(models).reduce((acc, cur) => {
        //       acc[cur] = true;
        //       return acc;
        //     }, {}),
        //   },
        // },
      },
    });

    // const navbar = this.modelViewer.templateManager.getTemplate("navBar");

    // if (!navbar) return;

    // register a new observer
    // navbar.onEventTriggered.add((data) => {
    //   const navbarItems = document.getElementById("navbarItems");
    //   const backButton = document.getElementById("backBtn");

    //   console.log(data);

    //   if (!navbarItems || !backButton) return;

    //   const categoryId = data.selector.substring(1);
    //   const clickedItem = models[categoryId];

    //   switch (data.event.type) {
    //     case "pointerdown":
    //       if (clickedItem.items) {
    //         backButton.classList.remove("hidden");
    //         navbarItems.innerHTML = getCategoryItemsButtons(categoryId);
    //       }
    //       break;
    //     default:
    //       break;
    //   }
    // });
  }

  initBackButton() {
    const backBtn = document.getElementById("backBtn");
    if (backBtn) {
      backBtn.addEventListener("click", () => {
        this.showItemsCategories();
        backBtn.classList.add("hidden");
      });
    }
  }

  showItemsCategories() {
    const navbarItems = document.getElementById("navbarItems");
    if (navbarItems) {
      navbarItems.innerHTML = "";
      navbarItems.append(...this.getCategoriesButtons());
    }
  }

  /**
   *
   * @returns {HTMLButtonElement[]}
   */
  getCategoriesButtons() {
    return Object.keys(models).map((key) => {
      const button = document.createElement("button");
      button.innerText = models[key].title;
      button.id = key;
      button.className =
        "rounded-md border bg-blue-200 py-1 px-3 hover:bg-blue-300";
      button.addEventListener("click", () => {
        const navbarItems = document.getElementById("navbarItems");
        const backButton = document.getElementById("backBtn");
        if (!navbarItems || !backButton) return;
        const clickedItem = models[key];
        if (clickedItem.items) {
          backButton.classList.remove("hidden");
          navbarItems.innerHTML = "";
          navbarItems.append(...this.getCategoryItemsButtons(key));
        }
      });
      return button;
    });
  }

  /**
   *
   * @param {string} category
   * @returns {HTMLButtonElement[]}
   */
  getCategoryItemsButtons(category) {
    const categoryItems = models[category].items;

    return categoryItems.map((item) => {
      const button = document.createElement("button");
      button.innerHTML = `<img loading="lazy" class="min-w-[60px] h-full p-3" src="${item.thumbnail}" alt="${item.title}" />`;
      button.className =
        "rounded-md border bg-blue-200 py-1 px-3 hover:bg-blue-300 h-[60px]";
      button.addEventListener("click", () => {
        this.modelViewer.loadModel(item);
      });
      return button;
    });
  }
}
