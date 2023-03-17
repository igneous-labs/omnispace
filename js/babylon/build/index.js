import { Build } from "@/js/babylon/build/build";

async function onPageParsed() {
  /** @type {HTMLDivElement} */
  // @ts-ignore
  const preview = document.getElementById("preview");
  const build = await Build.load({ preview });

  const backBtn = document.getElementById("backBtn");
  if (backBtn) {
    backBtn.addEventListener("click", () => {
      build.showItemsCategories();
      backBtn.classList.add("hidden");
    });
  }
}

onPageParsed();
