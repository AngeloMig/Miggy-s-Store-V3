const ringBuilderExist = document.getElementById("ring-builder");

const ringBuilderTrigger = document.querySelector("#ringBuilderTrigger");
if (ringBuilderTrigger) {
  ringBuilderTrigger.addEventListener("click", function () {
    const queryString = window.location.search;
    const urlParams = new URLSearchParams(queryString);
    let variantId = urlParams.get("variant");
    if (!variantId) {
      variantId = document.querySelector(
        ".product-form__buy-buttons input[name='id']"
      ).value;
    }
    const productId = window.currentProduct.id;
    location.assign(
      `/pages/ring-builder?variantId=${variantId}&productId=${productId}`
    );
  });
}

const PriceFormatter = (price, symbol = true, number = false) => {
  let priceLength = price.toString().length;
  let decimal = price.toString().substring(priceLength, priceLength - 2);
  let wholeNumber = price.toString().substring(0, priceLength - 2);
  let arrange = wholeNumber.includes(".")
    ? wholeNumber.concat("", decimal)
    : wholeNumber.concat(".", decimal);
  if (number) {
    return parseFloat(arrange);
  }
  return `${symbol == true ? "$" : ""}${parseFloat(arrange).toLocaleString()}`;
};

if (ringBuilderExist) {
  function RingBuilderEvent(name, data) {
    return new CustomEvent(name, data);
  }

  function RingBuilder() {
    this.settingCollectionData = [];
    this.addOnCollectionData = {};
    this.selectedProduct = {};
    this.addToCart = () => {
      const options = this.selectedProduct.options || [];
      let matchingVariant = null;
      if (options.length == 2) {
        matchingVariant = this.selectedProduct.variants.find(
          (variant) =>
            variant.option1 == this.collector.metalType &&
            variant.option2 == this.collector.bandWidth
        );
      }
      if (options.length == 3) {
        matchingVariant = this.selectedProduct.variants.find(
          (variant) =>
            variant.option1 == this.collector.metalType &&
            variant.option2 == this.collector.bandWidth &&
            variant.option3 == this.collector.prongType
        );
      }
      const moissaniteStone = RingBuilderConfig.moissaniteStone.find(
        (p) => p.id == this.collector.stone
      );
      const culturedStone = RingBuilderConfig.culturedStone.find(
        (p) => p.id == this.collector.stone
      );
      let stone = moissaniteStone || culturedStone || null;

      let addon = [];

      let hiddenGem = [];

      RingBuilderConfig.addon.forEach((product) => {
        product.variants.forEach((variant) => {
          for (let i = 0; i < this.collector.customization.length; i++) {
            if (variant.id == this.collector.customization[i]) {
              addon.push(variant);
              break;
            }
          }
        });
      });

      RingBuilderConfig.hiddenGem.forEach((product) => {
        product.variants.forEach((variant) => {
          for (let i = 0; i < this.collector.hiddenGem.length; i++) {
            if (variant.id == this.collector.hiddenGem[i]) {
              hiddenGem.push(variant);
              break;
            }
          }
        });
      });

      // RingBuilderConfig.hiddenGem.forEach((product) => {
      //   product.variants.forEach((variant) => {
      //     if (variant.id == this.collector.hiddenGem) {
      //       hiddenGem = variant;
      //     }
      //   });
      // });
      if (matchingVariant) {
        let items = [];

        if (hiddenGem.length != 0) {
          hiddenGem.forEach((a) => {
            let hiddeGemCartData = {
              id: Number(a.id),
              quantity: 1,
              properties: {},
            };
            items.push(hiddeGemCartData);
          });
        }
        if (stone) {
          let stoneCartData = {
            id: Number(stone.variants[0].id),
            quantity: 1,
            properties: {},
          };
          stoneCartData.properties["faceting_type"] =
            this.collector.facetingType;
          items.push(stoneCartData);
        }
        if (addon.length != 0) {
          addon.forEach((a) => {
            let addOnCartData = {
              id: Number(a.id),
              quantity: 1,
              properties: {},
            };
            items.push(addOnCartData);
          });
        }

        let settingCartData = {
          id: Number(matchingVariant.id),
          quantity: 1,
          properties: {},
        };
        settingCartData.properties["size"] = this.collector.size;
        settingCartData.properties["engraving"] = this.collector.engraving;
        items.push(settingCartData);

        let data = {
          items: items,
          sections: "mini-cart",
        };
        console.log("cart items:", data);
        fetch("/cart/add.js", {
          body: JSON.stringify(data),
          credentials: "same-origin",
          headers: {
            "Content-Type": "application/json",
            "X-Requested-With": "xmlhttprequest",
          },
          method: "POST",
        })
          .then((res) => res.json())
          .then((res) => {
            if (res.status != 422) {
              document.documentElement.dispatchEvent(
                new CustomEvent("cart:refresh", {
                  bubbles: true,
                })
              );
              document.getElementById("mini-cart").open = true;
            } else {
              alert("Cart Error: " + res.description);
            }
          })
          .catch((error) => console.log(`cart-error:`, error));
      } else {
        return;
      }
    };
    this.calculateValue = () => {
      let price = 0;
      const options = this.selectedProduct.options || [];
      let matchingVariant = null;
      if (options.length == 2) {
        matchingVariant = this.selectedProduct.variants.find(
          (variant) =>
            variant.option1 == this.collector.metalType &&
            variant.option2 == this.collector.bandWidth
        );
      }
      if (options.length == 3) {
        matchingVariant = this.selectedProduct.variants.find(
          (variant) =>
            variant.option1 == this.collector.metalType &&
            variant.option2 == this.collector.bandWidth &&
            variant.option3 == this.collector.prongType
        );
      }
      if (matchingVariant) {
        if (matchingVariant.featured_image) {
          document.querySelector(".rb-image img").src =
            matchingVariant.featured_image.src;
        }
        document.querySelector("#rb-add-cart").removeAttribute("disabled");
        price += PriceFormatter(matchingVariant.price, false, true);
        const moissaniteStone = RingBuilderConfig.moissaniteStone.find(
          (p) => p.id == this.collector.stone
        );
        const culturedStone = RingBuilderConfig.culturedStone.find(
          (p) => p.id == this.collector.stone
        );
        let stone = moissaniteStone || culturedStone || null;

        let addon = [];

        let hiddenGem = [];

        RingBuilderConfig.addon.forEach((product) => {
          product.variants.forEach((variant) => {
            for (let i = 0; i < this.collector.customization.length; i++) {
              if (variant.id == this.collector.customization[i]) {
                addon.push(variant);
                break;
              }
            }
          });
        });

        RingBuilderConfig.hiddenGem.forEach((product) => {
          product.variants.forEach((variant) => {
            for (let i = 0; i < this.collector.hiddenGem.length; i++) {
              if (variant.id == this.collector.hiddenGem[i]) {
                hiddenGem.push(variant);
                break;
              }
            }
          });
        });
        if (stone) {
          const stonePrice = PriceFormatter(stone.price, false, true);
          price += stonePrice;
        }
        if (addon.length != 0) {
          for (let x = 0; x < addon.length; x++) {
            const addOnPrice = PriceFormatter(addon[x].price, false, true);
            price += addOnPrice;
          }
        }
        if (hiddenGem != 0) {
          for (let x = 0; x < hiddenGem.length; x++) {
            const hiddenGemPrice = PriceFormatter(
              hiddenGem[x].price,
              false,
              true
            );
            price += hiddenGemPrice;
          }
        }
        document.querySelector(
          `#rb-price`
        ).innerHTML = `$${price.toLocaleString()}`;
      } else {
        document.querySelector("#rb-add-cart").setAttribute("disabled", "");
      }
    };

    this.proxyConfig = {
      set: (target, property, value) => {
        // do something
        console.log(
          `%cCollector Update:`,
          "color:purple;font-weight:bold,font-style:italic",
          `[${property}] - ${
            target[property] != null ? `${target[property]} to` : ""
          } ${value == "" ? "blank" : value}`
        );
        target[property] = value;
        this.calculateValue();
        return true;
      },
    };

    this.collector = new Proxy(
      {
        setting: null,
        stone: null,
        size: null,
        shape: null,
        color: null,
        metalType: null,
        bandWidth: null,
        engraving: null,
        carat: null,
        customization: [],
        prongType: null,
        hiddenGem: [],
        facetingType: null,
      },
      this.proxyConfig
    );

    //   FUNCTIONS
    this.setDataClear = () => {
      this.collector = new Proxy(
        {
          setting: null,
          stone: null,
          size: null,
          shape: this.collector.shape,
          color: null,
          metalType: null,
          bandWidth: null,
          carat: null,
          engraving: null,
          customization: [],
          prongType: null,
          lastOptionLabel: null,
          hiddenGem: [],
          facetingType: null,
        },
        this.proxyConfig
      );

      document.querySelector("#rb-stone-btn").innerHTML = "SELECT STONE";

      return;
    };

    /**
     * @param {string} type Available Options ['setting', 'stone', 'size', 'metalType', 'bandWidth', 'engraving', 'customization']
     * @param {object} data {} Object To Dispatch
     */

    this.dataChange = (type, data) => {
      let settingsChange = null;

      switch (type) {
        case "setting":
          settingsChange = RingBuilderEvent("ring_builder_change", {
            detail: {
              data,
            },
          });
          this.collector.setting = data;
          document.dispatchEvent(settingsChange);
          break;
        case "stone":
          settingsChange = RingBuilderEvent("ring_builder_change", {
            detail: {
              data,
            },
          });
          document.dispatchEvent(settingsChange);
          break;
        case "size":
          settingsChange = RingBuilderEvent("ring_builder_change", {
            detail: {
              data,
            },
          });
          document.dispatchEvent(settingsChange);
          break;
        case "metalType":
          settingsChange = RingBuilderEvent("ring_builder_change", {
            detail: {
              data,
            },
          });
          document.dispatchEvent(settingsChange);
          break;
        case "bandWidth":
          settingsChange = RingBuilderEvent("ring_builder_change", {
            detail: {
              data,
            },
          });
          document.dispatchEvent(settingsChange);
          break;
        case "engraving":
          settingsChange = RingBuilderEvent("ring_builder_change", {
            detail: {
              data,
            },
          });
          document.dispatchEvent(settingsChange);
          break;
        case "customization":
          settingsChange = RingBuilderEvent("ring_builder_change", {
            detail: {
              data,
            },
          });
          document.dispatchEvent(settingsChange);
          break;

        case "prongType":
          settingsChange = RingBuilderEvent("ring_builder_change", {
            detail: {
              data,
            },
          });
          document.dispatchEvent(settingsChange);
          break;

        case "hiddenGem":
          settingsChange = RingBuilderEvent("ring_builder_change", {
            detail: {
              data,
            },
          });
          document.dispatchEvent(settingsChange);
          break;
      }
    };
    this.paramCheck = () => {
      const queryString = window.location.search;
      const urlParams = new URLSearchParams(queryString);
      const variantId = urlParams.get("variantId");
      const productId = urlParams.get("productId");
      if (variantId && productId) {
        const product = RingBuilderConfig.setting.find(
          (prod) => prod.id == productId
        );
        const variant = product.variants.find(
          (variant) => variant.id == variantId
        );
        if (product) {
          this.setSetting(product);
          this.collector.metalType = variant.option1;
          this.collector.bandWidth = variant.option2;

          document
            .querySelectorAll("#rb-metal-type .select-items div")
            .forEach((selection) => {
              if (selection.innerText == variant.option1) {
                selection.click();
              }
            });
          document
            .querySelectorAll("#rb-bandwidth [name='bandwidth']")
            .forEach((input) => {
              if (input.value == variant.option2) {
                input.click();
              }
            });
          if (variant.option3) {
            this.collector.prongType = variant.option3;
            document
              .querySelectorAll("#rb-prong-type .select-items div")
              .forEach((selection) => {
                if (selection.innerText == variant.option3) {
                  selection.click();
                }
              });
          }
        }
      }
    };
    this.elementsConnectedSelector = {
      setting: "#rb-setting-btn",
      stone: "#rb-stone-btn",
      size: "#rb-sizes-option",
      metalType: "#rb-metal-type",
      bandWidth: "#rb-bandwidth",
      engraving: "#rb-engraving",
      customization: "#rb-bespoke-customization",
      prongType: "#rb-prong-type",
      hiddenGem: "#rb-hidden-gem",
    };

    this.disableElements = () => {
      if (!this.collector.stone) {
        document
          .querySelector(this.elementsConnectedSelector.stone)
          .setAttribute("disabled", "");
      }
      if (!this.collector.size) {
        document
          .querySelector(this.elementsConnectedSelector.size)
          .setAttribute("disabled", "");
      }
      if (!this.collector.metalType) {
        document
          .querySelector(this.elementsConnectedSelector.metalType)
          .setAttribute("disabled", "");
      }
      if (!this.collector.bandWidth) {
        document
          .querySelector(this.elementsConnectedSelector.bandWidth)
          .setAttribute("disabled", "");
      }
      if (!this.collector.engraving) {
        document
          .querySelector(this.elementsConnectedSelector.engraving)
          .setAttribute("disabled", "");
      }
      if (this.collector.customization.length == 0) {
        document
          .querySelector(this.elementsConnectedSelector.customization)
          .setAttribute("disabled", "");
      }
      if (!this.collector.prongType) {
        document
          .querySelector(this.elementsConnectedSelector.prongType)
          .setAttribute("disabled", "");
      }
      if (this.collector.hiddenGem.length == 0) {
        document
          .querySelector(this.elementsConnectedSelector.hiddenGem)
          .setAttribute("disabled", "");
      }
    };

    this.setSetting = (product, currImage = null) => {
      this.setDataClear();
      this.selectedProduct = product;
      this.collector.setting = product.id;
      const shape = RingBuilderConfig.settingMetafields[product.id].shapeTag;
      this.collector.shape = shape;
      document.querySelector(`#rb-setting-btn`).innerHTML = product.title;

      if (currImage) {
        document.querySelector(".rb-image img").src = currImage.src;
      } else {
        document.querySelector(".rb-image img").src = product.images[0];
      }
      document.querySelector("#rb-price").innerHTML = "$0.00";
      document
        .querySelector(this.elementsConnectedSelector.stone)
        .removeAttribute("disabled");
      const mtIndex = product.variants[0].options[0].toLowerCase().includes("k")
        ? 0
        : null;
      const bwIndex = product.variants[0].options[1]
        .toLowerCase()
        .includes("mm")
        ? 1
        : null;
      const prongIndex = product.variants[0].options[2] ? 2 : null;
      if (!prongIndex) {
        document.querySelector("#rb-prong-type").setAttribute("disabled", "");
      }

      const bandWidthOptionsArr = product.variants.map((variant, i) => {
        return variant.options[bwIndex];
      });
      const metalTypeOptionsArr = product.variants.map((variant, i) => {
        return variant.options[mtIndex];
      });

      let prongTypeOptionsArr = [];

      if (prongIndex) {
        prongTypeOptionsArr = product.variants.map((variant, i) => {
          return variant.options[prongIndex];
        });
      }

      const filteredBandWidth = [...new Set(bandWidthOptionsArr)];
      const filteredMetalTypes = [...new Set(metalTypeOptionsArr)];
      const filteredProngTypes = [...new Set(prongTypeOptionsArr)];
      const metalTypeOptions = filteredMetalTypes.map((option, i) => {
        let color = "";
        if (
          String(option).replace(/\s+/g, "").toLowerCase() ===
          String("14k Yellow Gold").replace(/\s+/g, "").toLowerCase()
        ) {
          color = "#DBC08A";
        }
        if (
          String(option).replace(/\s+/g, "").toLowerCase() ===
          String("18k Yellow Gold").replace(/\s+/g, "").toLowerCase()
        ) {
          color = "#DBC08A";
        }
        if (
          String(option).replace(/\s+/g, "").toLowerCase() ===
          String("14k Rose Gold").replace(/\s+/g, "").toLowerCase()
        ) {
          color = "#D49F88";
        }
        if (
          String(option).replace(/\s+/g, "").toLowerCase() ===
          String("18k Rose Gold").replace(/\s+/g, "").toLowerCase()
        ) {
          color = "#D49F88";
        }
        if (
          String(option).replace(/\s+/g, "").toLowerCase() ===
          String("14k White Gold").replace(/\s+/g, "").toLowerCase()
        ) {
          color = "#E9E6E6";
        }
        if (
          String(option).replace(/\s+/g, "").toLowerCase() ===
          String("18k White Gold").replace(/\s+/g, "").toLowerCase()
        ) {
          color = "#E9E6E6";
        }
        if (
          String(option).replace(/\s+/g, "").toLowerCase() ===
          String("Platinum").replace(/\s+/g, "").toLowerCase()
        ) {
          color = "#E0DEDE";
        }
        return `
            <option value="${option}" data-color="${color}">${option}</option>
            `;
      });

      const bandWidthOptions = filteredBandWidth.map((option, i) => {
        const template = `
            <label class="rb-radio-container">
            <input type="radio" name="bandwidth" ${
              i == 0 && `checked="checked"`
            } value="${option}" >
            <span class="b-radio-checkmark">${option}</span>
            </label>
            `;
        if (i == 0) {
          this.collector.bandWidth = option;
        }
        return template;
      });

      let prongTypeOptions = [];

      if (prongTypeOptionsArr.length != 0) {
        prongTypeOptions = filteredProngTypes.map((option, i) => {
          return `
              <option value="${option}" >${option}</option>
              `;
        });
      }

      let prongTypeValues = ``;

      if (prongTypeOptions) {
        this.collector.lastOptionLabel =
          product.options[2]?.toUpperCase() || null;
        prongTypeValues = `
          <option value="0">SELECT ${product.options[2]?.toUpperCase()}</option>
           ${prongTypeOptions}
        `;
      }

      const metalTypeValues =
        `
          <option value="0">SELECT METAL TYPE</option>
          ` + metalTypeOptions;

      document.querySelector("#rb-metal-type select").innerHTML =
        metalTypeValues;

      document.querySelector("#rb-bandwidth").innerHTML =
        bandWidthOptions.join("");
      updateSelect("#rb-metal-type");
      document.querySelector("#rb-metal-type").removeAttribute("disabled");
      if (prongIndex) {
        document.querySelector("#rb-prong-type select").innerHTML =
          prongTypeValues;
        updateSelect("#rb-prong-type");
        document.querySelector("#rb-prong-type").removeAttribute("disabled");
      }
      document
        .querySelector("#rb-bespoke-customization")
        .removeAttribute("disabled");
      document.querySelector("#rb-stone-btn").removeAttribute("disabled");
      document.querySelector("#rb-engraving").removeAttribute("disabled");
      document.querySelector("#rb-hidden-gem").removeAttribute("disabled");
      document.querySelector("#rb-sizes-option").removeAttribute("disabled");
      document.querySelector("#rb-bandwidth").removeAttribute("disabled");
    };

    this.getShape = () => {
      return this.collector.shape;
    };
  }

  document.addEventListener("ring_builder_change", (e) => {
    console.log("%cring builder event detected!", "color: green", e.detail);
  });

  // TEST DATA

  const builder = new RingBuilder();
  console.log(
    `%cRing Builder Initializing...`,
    "color:purple;font-weight:bold",
    builder.collector
  );
  console.log(
    `%cChecking Section Configuration...`,
    "color:purple;font-weight:bold",
    RingBuilderConfig
  );
  builder.settingCollectionData = RingBuilderConfig.setting;
  builder.disableElements();

  document.addEventListener("click", function (e) {
    const selectSettingBtn = e.target.matches("#rb-setting-btn");
    const stoneBtn = e.target.matches("#rb-stone-btn");
    const bespoke = e.target.matches("#rb-bespoke-customization");
    const engraving = e.target.matches("#rb-engraving");
    const gemstone = e.target.matches("#rb-hidden-gem");
    const metalType = e.target.matches("#rb-metal-type .select-items div");
    const prongType = e.target.matches("#rb-prong-type .select-items div");
    const ringSize = e.target.matches("#rb-sizes-option .select-items div");
    const bandWidth = e.target.matches("#rb-bandwidth [name='bandwidth']");

    if (selectSettingBtn) {
      document
        .querySelector("rb-popup")
        .setAttribute("data-content-type", "setting");
      document
        .querySelector("rb-popup")
        .setAttribute("data-rb-present", "true");
    }
    if (stoneBtn) {
      document
        .querySelector("rb-popup")
        .setAttribute("data-content-type", "stone");
      document
        .querySelector("rb-popup")
        .setAttribute("data-rb-present", "true");
      document.querySelectorAll(`.rb-stone-table tbody tr`).forEach((tr) => {
        const tag = tr.dataset.shapeTag;
        const collection = tr.dataset.collection;
        if (tag) {
          if (collection == "cultured") {
            tr.style.display = "none";
          }
        }
      });
      if (builder.collector.stone) {
        document
          .querySelectorAll(`.rb-stone-table .rb-view-add`)
          .forEach((btn) => {
            const productId = btn.dataset.productId;
            const culturedProd = RingBuilderConfig.culturedStone.find(
              (p) => (p.id = productId)
            );
            const moissaniteProd = RingBuilderConfig.moissaniteStone.find(
              (p) => (p.id = productId)
            );

            let matched = false;
            if (culturedProd) {
              if (culturedProd.id == builder.collector.stone) {
                matched = true;
              }
            }

            if (moissaniteProd) {
              if (moissaniteProd.id == builder.collector.stone) {
                matched = true;
              }
            }

            if (matched) {
              btn.setAttribute("data-active", true);
              btn.textContent = "- REMOVE";
            }
          });
      }
    }
    if (bespoke) {
      document
        .querySelector("rb-popup")
        .setAttribute("data-content-type", "bespoke");
      document
        .querySelector("rb-popup")
        .setAttribute("data-rb-present", "true");
      if (builder.collector.customization.length != 0) {
        document.querySelectorAll(".rb-bespoke-item").forEach((item) => {
          const prodId = item.dataset.productId;
          const product = RingBuilderConfig.addon.find(
            (prod) => prod.id == prodId
          );
          for (let i = 0; i < builder.collector.customization.length; i++) {
            product.variants.forEach((variant) => {
              if (variant.id == builder.collector.customization[i]) {
                const addBtn = item.querySelector(".rb-bespoke-add");
                const input = item.querySelector(
                  `.rb-bespoke-variant input[value="${builder.collector.customization[i]}"]`
                );
                item.setAttribute(
                  "data-selected-variant",
                  builder.collector.customization[i]
                );
                input.setAttribute("checked", true);
                addBtn.innerHTML = "- REMOVE";
                if (product.title == "Singular Prongs") {
                  document
                    .querySelector(
                      `.rb-bespoke-item[data-product-title="Double Prongs"]`
                    )
                    .setAttribute("disabled", "disabled");
                }
                if (product.title == "Double Prongs") {
                  document
                    .querySelector(
                      `.rb-bespoke-item[data-product-title="Singular Prongs"]`
                    )
                    .setAttribute("disabled", "disabled");
                }
              }
            });
          }
        });
      }
    }
    if (engraving) {
      document
        .querySelector("rb-popup")
        .setAttribute("data-content-type", "engraving");
      document
        .querySelector("rb-popup")
        .setAttribute("data-rb-present", "true");
      if (builder.collector.engraving) {
        document.querySelector("#rb-engraving-input").value =
          builder.collector.engraving;
      }
    }
    if (gemstone) {
      document
        .querySelector("rb-popup")
        .setAttribute("data-content-type", "gemstone");
      document
        .querySelector("rb-popup")
        .setAttribute("data-rb-present", "true");
      if (builder.collector.hiddenGem.length != 0) {
        document.querySelectorAll(".rb-bespoke-item").forEach((item) => {
          const variantId = item.dataset.selectedVariant;
          for (let y = 0; y < builder.collector.hiddenGem.length; y++) {
            const currHiddenGem = builder.collector.hiddenGem[y];
            if (currHiddenGem == variantId) {
              item.querySelector(".rb-gemstone-add").innerHTML = "- REMOVE";
            }
          }
        });
      }
    }

    if (metalType) {
      const metalTypeValue = document.querySelector(
        "#rb-metal-type select"
      ).value;
      builder.collector.metalType = metalTypeValue;
    }

    if (prongType) {
      const prongTypeValue = document.querySelector(
        "#rb-prong-type select"
      ).value;
      builder.collector.prongType = prongTypeValue;
    }

    if (ringSize) {
      const sizeValue = document.querySelector("#rb-sizes-option select").value;
      builder.collector.size = sizeValue;
    }

    if (bandWidth) {
      const bandWidthEl = document.querySelector("[name='bandwidth']:checked");
      if (bandWidthEl.parentElement.hasAttribute("disabled")) {
        document.querySelectorAll(`[name='bandwidth']`).forEach((input) => {
          if (!input.parentElement.hasAttribute("disabled")) {
            input.click();
            builder.collector.bandWidth = input.value;
          }
        });
      } else {
        builder.collector.bandWidth = bandWidthEl.value;
      }
    }
  });

  document.querySelector("#rb-add-cart").addEventListener("click", () => {
    builder.addToCart();
  });

  const stoneProductData = () => {
    let stoneTemplate = [];
    const moissaniteStone = RingBuilderConfig.moissaniteStone
      .map((m) => {
        m["carat"] = parseFloat(
          String(RingBuilderConfig.moissaniteMetafields[m.id].carat).replace(
            "ct",
            ""
          )
        );
        return m;
      })
      .filter(
        (m) =>
          RingBuilderConfig.moissaniteMetafields[m.id].shapeTag ==
          builder.collector.shape
      )
      .sort((b, a) => a.carat - b.carat);
    const moissaniteTemplate = moissaniteStone.map((prod, i) => {
      const hideFaceting =
        RingBuilderConfig.moissaniteMetafields[prod.id].shape == "Emerald" ||
        RingBuilderConfig.moissaniteMetafields[prod.id].shape == "Asscher" ||
        false;

      const shape = RingBuilderConfig.moissaniteMetafields[prod.id].shape;

      return `
        ${
          i == 0
            ? `<tr class="rb-thead" data-collection="moissanite" data-shape-tag="">
              <td>Carat Equivalent</td>
              <td>Dimensions</td>
              <td>Colour</td>
              <td>Clarity</td>
              <td>Price</td>
              <td></td>
              <td></td>
            </tr>`
            : ""
        }

          <tr class="rb-view" data-shape-tag="${
            RingBuilderConfig.moissaniteMetafields[prod.id].shapeTag
          }" data-collection="moissanite">
            <td>${RingBuilderConfig.moissaniteMetafields[prod.id].carat}</td>
            <td>${
              RingBuilderConfig.moissaniteMetafields[prod.id].dimension
            }</td>
            <td>${RingBuilderConfig.moissaniteMetafields[prod.id].colour}</td>
            <td>${RingBuilderConfig.moissaniteMetafields[prod.id].clarity}</td>
            <td>${PriceFormatter(prod.price)}</td>
            <td><button class="rb-view-btn"><span class="hidden-phone">VIEW</span><span class="hidden-tablet-and-up toggle-arrow"></span></button></td>
            <td><button class="rb-view-add" data-product-id="${
              prod.id
            }" data-product-title="${
        prod.title
      }" data-active="false">+ ADD</button></td>
          </tr>
          <tr class="rb-fold rb-table-active"  >
            <td colspan="6">
              <div class="rb-fold-container">
              <ul>
                  <li><strong>Shape:</strong> ${
                    RingBuilderConfig.moissaniteMetafields[prod.id].shape
                  }</li>
                  <li><strong>Carat Equivalent:</strong> ${
                    RingBuilderConfig.moissaniteMetafields[prod.id].carat
                  }</li>
                  <li><strong>Dimensions:</strong> ${
                    RingBuilderConfig.moissaniteMetafields[prod.id].dimension
                  }</li>
                  <li><strong>Colour:</strong> ${
                    RingBuilderConfig.moissaniteMetafields[prod.id].colour
                  }</li>
                  <li><strong>Clarity:</strong> ${
                    RingBuilderConfig.moissaniteMetafields[prod.id].clarity
                  }</li>
                  <li class="rb-fold-price"><strong>Price:</strong> ${PriceFormatter(
                    prod.price
                  )} </li>
                  ${
                    hideFaceting == false
                      ? `<li><strong>Faceting Type: </strong>
                    <select name="facetingOption" data-product-id="${prod.id}">
                      ${RingBuilderConfig.facetingOptions.map((fOption) => {
                        if (
                          shape == "Oval" &&
                          (fOption == "Brilliant" ||
                            fOption == "Crushed Ice" ||
                            fOption == "Old Mine Cut" ||
                            fOption == "Rose Cut")
                        ) {
                          return `<option>${fOption}</option>`;
                        }
                        if (
                          shape == "Round" &&
                          (fOption == "Brilliant" ||
                            fOption == "Old European Cut")
                        ) {
                          return `<option>${fOption}</option>`;
                        }
                        if (
                          shape == "Radiant" &&
                          (fOption == "Brilliant" || fOption == "Crushed Ice")
                        ) {
                          return `<option>${fOption}</option>`;
                        }
                        if (
                          shape == "Pear" &&
                          (fOption == "Brilliant" ||
                            fOption == "Crushed Ice" ||
                            fOption == "Rose Cut")
                        ) {
                          return `<option>${fOption}</option>`;
                        }
                        if (
                          shape == "Cushion" &&
                          (fOption == "Brilliant" ||
                            fOption == "Crushed Ice" ||
                            fOption == "Old Mine Cut")
                        ) {
                          return `<option>${fOption}</option>`;
                        }
                        if (
                          shape == "Elongated Cushion" &&
                          (fOption == "Brilliant" ||
                            fOption == "Crushed Ice" ||
                            fOption == "Old Mine Cut")
                        ) {
                          return `<option>${fOption}</option>`;
                        }
                        if (
                          shape == "Oval" &&
                          (fOption == "Brilliant" || fOption == "Crushed Ice")
                        ) {
                          return `<option>${fOption}</option>`;
                        }
                        if (
                          shape == "Marquise" &&
                          (fOption == "Crushed Ice" || fOption == "Brilliant")
                        ) {
                          return `<option>${fOption}</option>`;
                        }
                      })}
                    </select>
                  </li>`
                      : ""
                  }

                </ul>
                ${prod.images[0] ? ` <img src="${prod.images[0]}"/> ` : ""}



              </div>
            </td>
          </tr>
        `;
    });
    const culturedStone = RingBuilderConfig.culturedStone
      .map((m) => {
        m["carat"] = parseFloat(
          String(RingBuilderConfig.culturedMetafields[m.id].carat).replace(
            "ct",
            ""
          )
        );
        return m;
      })
      .filter(
        (c) =>
          RingBuilderConfig.culturedMetafields[c.id].shapeTag ==
          builder.collector.shape
      )
      .sort((b, a) => a.carat - b.carat);
    const culturedTemplate = culturedStone.map((prod, i) => {
      return `
      ${
        i == 0
          ? `<tr class="rb-thead" data-collection="cultured" data-shape-tag="" style="display: none;">
          <td>Carat</td>
          <td>Colour</td>
          <td>Clarity</td>
          <td>Price</td>
          <td></td>
          <td></td>
        </tr>`
          : ""
      }

        <tr class="rb-view"  data-shape-tag="${
          RingBuilderConfig.culturedMetafields[prod.id].shapeTag
        }" data-collection="cultured" style="display: none;">
          <td>${RingBuilderConfig.culturedMetafields[prod.id].carat}</td>
          <td>${RingBuilderConfig.culturedMetafields[prod.id].colour}</td>
          <td>${RingBuilderConfig.culturedMetafields[prod.id].clarity}</td>
          <td>${PriceFormatter(prod.price)}</td>
          <td><button class="rb-view-btn">VIEW</button></td>
          <td><button class="rb-view-add" data-product-id="${
            prod.id
          }" data-product-title="${
        prod.title
      }" data-active="false">+ ADD</button></td>
        </tr>
        <tr class="rb-fold rb-table-active" >
          <td colspan="6">
            <div class="rb-fold-container">
            <ul>
                <li><strong>Certification: </strong><a target="_blank" href="${
                  RingBuilderConfig.culturedMetafields[prod.id].certificate_link
                }">View Certificate</a></li>
                <li><strong>Shape:</strong> ${
                  RingBuilderConfig.culturedMetafields[prod.id].shape
                }</li>
                <li><strong>Carat:</strong> ${
                  RingBuilderConfig.culturedMetafields[prod.id].carat
                }</li>
                <li><strong>Dimensions:</strong> ${
                  RingBuilderConfig.culturedMetafields[prod.id].dimension
                }</li>
                <li><strong>Colour:</strong> ${
                  RingBuilderConfig.culturedMetafields[prod.id].colour
                }</li>
                <li><strong>Clarity:</strong> ${
                  RingBuilderConfig.culturedMetafields[prod.id].clarity
                }</li>
                <li class="rb-fold-price"><strong>Price:</strong> ${PriceFormatter(
                  prod.price
                )}</li>
              </ul>
              ${
                RingBuilderConfig.culturedMetafields[prod.id].video
                  ? `<div class="iframe_wrap"><iframe width="200" height="201" loading="lazy" data-src="${
                      RingBuilderConfig.culturedMetafields[prod.id].video
                    }" src="" scrolling="no"></iframe></div>`
                  : ""
              }
            </div>
          </td>
        </tr>
      `;
    });
    stoneTemplate = [...moissaniteTemplate, ...culturedTemplate].join("");

    const parentTemplate = `
    <div class="rb-stone">
      <span class="rb-back">GO TO RING BUILDER</span>
      <div class="rb-container">
        <div class="rb-heading">
          <h3>${RingBuilderConfig.stoneHeading}</h3>
          <p>${RingBuilderConfig.stoneSubheading}</p>
        </div>
        <div class="rb-stone-filters-container">
          <div class="rb-stone-filters">
            <span>Select Stone</span>
            <div class="rb-stone-filter" data-collection="moissanite" data-active="true">
             <img src="https://cdn.shopify.com/s/files/1/0544/6408/6189/files/image_25.svg?v=1675034989" >
              <span>MOISSANITE</span>
            </div>
            <div class="rb-stone-filter" data-collection="cultured">
             <img src="https://cdn.shopify.com/s/files/1/0544/6408/6189/files/Ellipse_1.svg?v=1675034988" >
              <span>CULTURED DIAMONDS</span>
            </div>
          </div>
          <div class="rb-stone-table">
            <table>

                ${stoneTemplate}

            </table>
          </div>
        </div>
      </div>
    </div>`;
    return parentTemplate;
  };

  const ProductDataGenerator = {
    setting: () => {
      return RingBuilderConfig.setting
        .map((prod) => {
          return `
          <div class="rb-setting-product" data-product-id="${
            prod.id
          }" data-shape-tag="${
            RingBuilderConfig.settingMetafields[prod.id].shapeTag
          }">
            <div class="rb-image-container">
              <img src="${prod.images[0]}"/>
            </div>
            <div class="rb-prod-info">
              <p>${prod.title}</p>
              <span>From ${PriceFormatter(prod.price_min)}</span>
            </div>
          </div>
        `;
        })
        .join("");
    },

    bespoke: () => {
      return RingBuilderConfig.addon
        .map((prod) => {
          return `
          <div class="rb-bespoke-item" data-fold-active="false" data-product-id="${
            prod.id
          }" data-selected-variant="${
            prod.variants[0].id
          }" data-product-title="${prod.title}">
            <div class="rb-bespoke-item-info">
            ${
              prod.images[0]
                ? `<img src="${prod.images[0]}"/>`
                : "<img src='https://cdn.shopify.com/s/files/1/0714/6455/0687/files/Ellipse_6_1.png?v=1676248611'/>"
            }
              <div class="rb-bespoke-info-main">
                <h6>${prod.title}</h6>
                <div class="rb-bespoke-variants">
                  <span class="rb-bespoke-label ${
                    prod.variants.length != 1 ? "rb-bespoke-label-view" : ""
                  }">${
            prod.variants.length == 1
              ? PriceFormatter(prod.price)
              : prod.description
          }</span>
                </div>
              </div>
            </div>
            <div class="rb-bespoke-item-options">
              <button class="rb-bespoke-view" ${
                prod.variants.length == 1 ? 'style=" display:none"' : ""
              }>VIEW</button>
              <button class="rb-bespoke-add">+ ADD</button>
            </div>
            <div class="rb-bespoke-fold">

            ${
              prod.images[0]
                ? `<img src="${prod.images[0]}"/>`
                : "<img src='https://cdn.shopify.com/s/files/1/0714/6455/0687/files/Ellipse_6_1.png?v=1676248611'/>"
            }
              <div class="rb-bespoke-fold-variants" ${
                prod.variants.length == 1 ? 'style=" display:none"' : ""
              }>
                 <span>Select Stone</span>
                 ${prod.variants
                   .map((variant, i) => {
                     return `
                  <div class="rb-bespoke-variant">
                    <label>
                    <input name="product-${prod.id}" value="${
                       variant.id
                     }" type="radio" ${i == 0 && `checked="checked"`}/>${
                       prod.variants.length != 1 ? `${variant.title} | ` : ""
                     }${PriceFormatter(variant.price)}</label>
                  </div>
                  `;
                   })
                   .join("")}

              </div>
            </div>
          </div>
        `;
        })
        .join("");
    },
    gemstone: () => {
      return RingBuilderConfig.hiddenGem
        .map((prod) => {
          return `
          <div class="rb-bespoke-item" data-fold-active="false" data-product-id="${
            prod.id
          }" data-selected-variant="${prod.variants[0].id}" >
            <div class="rb-bespoke-item-info">
            ${prod.images[0] ? `<img src="${prod.images[0]}"/>` : ""}

              <div class="rb-bespoke-info-main">
                <h6>${prod.title}</h6>
                <div class="rb-bespoke-variants">
                  <span class="rb-bespoke-label">${PriceFormatter(
                    prod.price
                  )}</span>
                </div>
              </div>
            </div>
            <div class="rb-bespoke-item-options">
              <button class="rb-gemstone-add">+ ADD</button>
            </div>

          </div>
        `;
        })
        .join("");
    },
  };

  const shapeFilterTemplate = () => {
    const shapeAssets = RingBuilderConfig.shapeAssets;
    let template = [];
    for (const property in shapeAssets) {
      if (shapeAssets[property] != "") {
        template.push(`<div class="rb-shape-container">
        <button data-active="false" data-value="${property}">
          <img src="${shapeAssets[property]}" title="${property}"/>
          <span>${property}</span>
        </button>
      </div>`);
      }
    }
    return template.join("");
  };

  const RingBuilderPopupTemplate = {
    setting: `<div class="rb-setting">
      <span class="rb-back">GO TO RING BUILDER</span>
      <div class="rb-setting-container">
        <div class="rb-setting-heading">${
          RingBuilderConfig.settingHeading
        }</div>
        <div class="rb-setting-subheading">${
          RingBuilderConfig.settingSubheading
        }</div>
        <div class="rb-setting-filters">
          <div class="rb-setting-shape">
            <span>Select Shape</span>
            <div class="rb-shapes-filter-container">
              <div class="rb-shapes-filter">
                ${shapeFilterTemplate()}
              </div>
              <button aria-label="Previous" class="glider-prev">&#8249;</button>
              <button aria-label="Next" class="glider-next">&#8250;</button>
            </div>

          </div>
          <div class="rb-setting-color">
            <span>Select Colour</span>
            <div class="rb-color-filter">
              <button class="rb-yellow-gold" data-active="false" data-color="yellowGoldImage"><span></span><div>Yellow Gold</div></button>
              <button class="rb-white-gold" data-active="false" data-color="whiteGoldImage"><span></span><div>White Gold</div></button>
              <button class="rb-rose-gold" data-active="false" data-color="roseGoldImage"><span></span><div>Rose Gold</div></button>
              <button class="rb-platinum" data-active="false" data-color="platinumImage"><span></span><div>Platinum</div></button>
            </div>
          </div>
        </div>
        <div class="rb-setting-products">
          ${ProductDataGenerator.setting()}
        </div>
      </div>
    </div>`,

    bespoke: `
      <div class="rb-bespoke">
      <span class="rb-back">GO TO RING BUILDER</span>
        <div class="rb-bespoke-heading">
          <h4>${RingBuilderConfig.bespokeHeading}</h4>
          <p>${RingBuilderConfig.bespokeSubheading}</p>
        </div>
        <div class="rb-bespoke-container">
          ${ProductDataGenerator.bespoke()}
        </div>
      </div>
    `,

    engraving: `
        <div class="rb-engraving">
          <div class="rb-engraving-header">
            <h4>${RingBuilderConfig.engravingHeading}</h4>
            <p>
            ${RingBuilderConfig.engravingSubheading}
            </p>
          </div>
          <div class="rb-engraving-main">
            <input type="text" id="rb-engraving-input" placeholder="${RingBuilderConfig.engravingPlaceholder}"/>
          </div>
          <div class="rb-engraving-options">
            <button class="rb-engraving-cancel-btn">CANCEL</button>
            <button class="rb-engraving-save-btn">SAVE</button>
          </div>
        </div>
    `,

    gemstone: `
    <div class="rb-bespoke">
    <span class="rb-back">GO TO RING BUILDER</span>
        <div class="rb-bespoke-heading">
          <h4>${RingBuilderConfig.gemstoneHeading}</h4>
          <p>${RingBuilderConfig.gemstoneSubheading}</p>
        </div>
        <div class="rb-bespoke-container">
          ${ProductDataGenerator.gemstone()}
        </div>
      </div>
    `,
  };

  class RingBuilderPopup extends HTMLElement {
    constructor() {
      super();
      this.addEventListener("click", (e) => {
        const product = e.target.closest(".rb-setting-product");
        const colorFilter = e.target.closest(".rb-color-filter button");
        const shapeFilter = e.target.closest(".rb-shapes-filter button");
        const stoneFilter = e.target.closest(".rb-stone-filter");
        const settingBack = e.target.closest(".rb-back");
        const modalBg = e.target == this.querySelector(".rb-popup-container");
        const foldViewBtn = e.target.closest(".rb-view-btn");
        const tableAddBtn = e.target.closest(".rb-view-add");
        const bespokeViewBtn = e.target.closest(".rb-bespoke-view");
        const bespokeLabelView = e.target.closest(".rb-bespoke-label-view");
        const gemstoneViewBtn = e.target.closest(".rb-gemstone-view");
        const engravingCancel = e.target.closest(".rb-engraving-cancel-btn");
        const engravingSave = e.target.closest(".rb-engraving-save-btn");
        const bespokeAdd = e.target.closest(".rb-bespoke-add");
        const gemstoneAdd = e.target.closest(".rb-gemstone-add");
        const bespokeVariant = e.target.closest(".rb-bespoke-variant input");

        if (product) {
          const productId = product.dataset.productId;
          const currImage = document.querySelector(
            `.rb-setting-product[data-product-id="${productId}"] .rb-image-container img`
          );
          builder.collector.setting = productId;
          document
            .querySelector("rb-popup")
            .setAttribute("data-rb-present", "false");
          const productData = builder.settingCollectionData.find(
            (p) => p.id == productId
          );
          builder.setSetting(productData, currImage);
        }
        if (colorFilter) {
          const colorSelected = colorFilter.dataset.color;
          const isActive = colorFilter.dataset.active;
          document
            .querySelectorAll(".rb-color-filter button")
            .forEach((rcfBtn) => {
              rcfBtn.setAttribute("data-active", false);
            });
          if (isActive == "false") {
            colorFilter.setAttribute("data-active", true);
            document.querySelectorAll(".rb-setting-product").forEach((prod) => {
              const productId = prod.dataset.productId;
              const productImage =
                RingBuilderConfig.settingMetafields[productId][colorSelected];
              prod.querySelector("img").src = productImage;
            });
            // get data-product-id of .rb-setting-product then change child image
          }

          if (isActive == "true") {
            document.querySelectorAll(".rb-setting-product").forEach((prod) => {
              const productId = prod.dataset.productId;
              const product = RingBuilderConfig.setting.find(
                (p) => p.id == productId
              );
              prod.querySelector("img").src = product.images[0];
            });
          }
        }
        if (shapeFilter) {
          const shapeSelected = shapeFilter.dataset.value;
          const isActive = shapeFilter.dataset.active;
          document
            .querySelectorAll(".rb-shapes-filter button")
            .forEach((rsfBtn) => {
              rsfBtn.setAttribute("data-active", false);
            });
          if (isActive == "false") {
            shapeFilter.setAttribute("data-active", true);
            document.querySelectorAll(`.rb-setting-product`).forEach((prod) => {
              const shapeTag = prod.dataset.shapeTag;
              if (shapeTag == shapeSelected) {
                prod.style.display = "block";
              } else {
                prod.style.display = "none";
              }
            });

            builder.collector.shape = shapeSelected;
          }
          if (isActive == "true") {
            document.querySelectorAll(`.rb-setting-product`).forEach((prod) => {
              prod.style.display = "block";
            });
            builder.collector.shape = null;
          }
        }
        if (stoneFilter) {
          const currIsActive = stoneFilter.dataset.active;
          const collectionFilter = stoneFilter.dataset.collection;
          if (currIsActive == "false" || !currIsActive) {
            document.querySelectorAll(".rb-stone-filter").forEach((el) => {
              const isActive = el.dataset.active;
              if (isActive == "true") {
                el.setAttribute("data-active", false);
              }
            });
            stoneFilter.setAttribute("data-active", true);
            document.querySelectorAll(`.rb-stone-table tr`).forEach((tr) => {
              if (!tr.classList.contains("rb-fold")) {
                tr.style.display = "flex";

                const tag = tr.dataset.shapeTag;
                const collection = tr.dataset.collection;

                if (tag) {
                  const fold = tr.nextElementSibling;
                  tr.classList.remove("rb-table-active");
                  if (!fold.classList.contains("rb-fold")) {
                    fold.classList.toggle("rb-fold");
                  }
                }

                if (collection != collectionFilter) {
                  tr.style.display = "none";
                }
              }
            });
          } else {
            stoneFilter.setAttribute("data-active", false);
            document.querySelectorAll(`.rb-stone-table tr`).forEach((tr) => {
              tr.style.display = "flex";
              const tag = tr.dataset.shapeTag;
              const collection = tr.dataset.collection;
              if (tag) {
                const fold = tr.nextElementSibling;
                tr.classList.remove("rb-table-active");
                if (!fold.classList.contains("rb-fold")) {
                  fold.classList.toggle("rb-fold");
                }
              }

              document.querySelectorAll(".rb-stone-filter").forEach((sf) => {
                if (sf.dataset.collection != stoneFilter) {
                  sf.click();
                }
              });
            });
          }
        }
        if (settingBack) {
          document
            .querySelector("rb-popup")
            .setAttribute("data-rb-present", "false");
        }
        if (modalBg) {
          document
            .querySelector("rb-popup")
            .setAttribute("data-rb-present", "false");
        }
        if (foldViewBtn) {
          const fold =
            foldViewBtn.parentElement.parentElement.nextElementSibling;
          const controller = foldViewBtn.parentElement.parentElement;
          controller.classList.toggle("rb-table-active");
          const collection = controller.dataset.collection;
          if (collection == "cultured") {
            const iframe = fold.querySelector("iframe");
            if (iframe.src != iframe.dataset.src) {
              iframe.src = iframe.dataset.src;
              // setTimeout(function () {
              //   let newIframe = document.querySelector(
              //     `iframe[data-src="${iframe.dataset.src}"]`
              //   );
              //   const doc = newIframe.contentDocument
              //     ? newIframe.contentDocument
              //     : newIframe.contentWindow;
              //   console.log(doc.document);
              // }, 2000);
            } else {
              iframe.src = "";
            }
          }
          fold.classList.toggle("rb-fold");
        }
        if (tableAddBtn) {
          const productId = tableAddBtn.dataset.productId;
          const productTitle = tableAddBtn.dataset.productTitle;
          const isActive = tableAddBtn.dataset.active;
          const cultured = RingBuilderConfig.culturedMetafields[productId];
          const moissanite = RingBuilderConfig.moissaniteMetafields[productId];

          const facetingOption = document.querySelector(
            `[name="facetingOption"][data-product-id="${productId}"]`
          );
          if (isActive == "false") {
            const caratProcessed = parseFloat(
              String(cultured?.carat || moissanite?.carat).replace("ct", "")
            );
            if (caratProcessed > 2) {
              const inputEl = document.querySelector(
                `[name='bandwidth'][value='1.6mm']`
              ).parentElement;
              inputEl.setAttribute("disabled", "disabled");
              document
                .querySelectorAll(`[name='bandwidth']`)
                .forEach((input) => {
                  if (!input.parentElement.hasAttribute("disabled")) {
                    input.click();
                  }
                });
            }
            document
              .querySelectorAll("[data-active='true'].rb-view-add")
              .forEach((rva) => {
                rva.setAttribute("data-active", false);
                rva.textContent = "+ ADD";
              });
            tableAddBtn.setAttribute("data-active", true);
            tableAddBtn.textContent = "- REMOVE";
            builder.collector.stone = productId;
            if (facetingOption) {
              builder.collector.facetingType = facetingOption.value;
            } else {
              builder.collector.facetingType = null;
            }
            document.querySelector("#rb-stone-btn").innerHTML = productTitle;
          } else {
            builder.collector.carat = null;
            builder.collector.stone = "";
            builder.collector.facetingType = "";
            tableAddBtn.setAttribute("data-active", false);
            tableAddBtn.textContent = "+ ADD";
            document.querySelector("#rb-stone-btn").innerHTML = "SELECT STONE";
          }
        }
        if (bespokeViewBtn) {
          const parent = bespokeViewBtn.parentElement.parentElement;
          const variantChildren =
            bespokeViewBtn.parentElement.previousElementSibling.children[1]
              .lastElementChild.children;
          const productId = parent.dataset.productId;
          const foldIsActive = parent.dataset.foldActive;
          if (foldIsActive == "false") {
            parent.setAttribute("data-fold-active", true);

            bespokeViewBtn.textContent = "CLOSE";
            // for (let i = 0; i < variantChildren.length; i++) {
            //   variantChildren[i].style.display = "none";
            // }
            // bespokeViewBtn.parentElement.previousElementSibling.children[1].lastElementChild.lastElementChild.style.display =
            //   "block";
          } else {
            parent.setAttribute("data-fold-active", false);
            bespokeViewBtn.textContent = "VIEW";
            // for (let i = 0; i < variantChildren.length; i++) {
            //   variantChildren[i].style.display = "block";
            // }
            // bespokeViewBtn.parentElement.previousElementSibling.children[1].lastElementChild.lastElementChild.style.display =
            //   "none";
          }
        }

        if (bespokeLabelView) {
          const parent =
            bespokeLabelView.parentElement.parentElement.parentElement
              .parentElement;
          const bespokeViewBtn = parent.querySelector(".rb-bespoke-view");
          const foldIsActive = parent.dataset.foldActive;
          if (foldIsActive == "false") {
            parent.setAttribute("data-fold-active", true);
            bespokeViewBtn.textContent = "CLOSE";
          } else {
            parent.setAttribute("data-fold-active", false);
            bespokeViewBtn.textContent = "VIEW";
          }
        }

        if (gemstoneViewBtn) {
          const parent = gemstoneViewBtn.parentElement.parentElement;
          const variantChildren =
            gemstoneViewBtn.parentElement.previousElementSibling.children[1]
              .lastElementChild.children;
          const productId = parent.dataset.productId;
          const foldIsActive = parent.dataset.foldActive;
          if (foldIsActive == "false") {
            parent.setAttribute("data-fold-active", true);

            gemstoneViewBtn.textContent = "CLOSE";
            // for (let i = 0; i < variantChildren.length; i++) {
            //   variantChildren[i].style.display = "none";
            // }
            // gemstoneViewBtn.parentElement.previousElementSibling.children[1].lastElementChild.lastElementChild.style.display =
            //   "block";
          } else {
            parent.setAttribute("data-fold-active", false);
            gemstoneViewBtn.textContent = "VIEW";
            // for (let i = 0; i < variantChildren.length; i++) {
            //   variantChildren[i].style.display = "block";
            // }
            // gemstoneViewBtn.parentElement.previousElementSibling.children[1].lastElementChild.lastElementChild.style.display =
            //   "none";
          }
        }

        if (engravingCancel) {
          document
            .querySelector("rb-popup")
            .setAttribute("data-rb-present", "false");
        }

        if (engravingSave) {
          const engravingValue = document.querySelector(
            "#rb-engraving-input"
          ).value;
          builder.collector.engraving = engravingValue;
          document.querySelector("#rb-engraving-value").innerHTML =
            engravingValue;
          if (engravingValue != "") {
            document.querySelector("#rb-engraving").innerHTML =
              "+ EDIT ENGRAVING";
          } else {
            document.querySelector("#rb-engraving").innerHTML =
              "+ ADD ENGRAVING";
          }
          document
            .querySelector("rb-popup")
            .setAttribute("data-rb-present", "false");
        }

        if (bespokeAdd) {
          const content = bespokeAdd.innerHTML;
          const bespokeItem = bespokeAdd.parentElement.parentElement;
          const productId = bespokeItem.dataset.productId;
          const variantId = this.querySelector(
            `[name="product-${productId}"]:checked`
          ).value;
          const productTitle = bespokeItem.dataset.productTitle;
          if (content == "+ ADD") {
            builder.collector.customization.push(variantId);
            bespokeAdd.innerHTML = "- REMOVE";

            if (productTitle == "Singular Prongs") {
              document
                .querySelector(
                  `.rb-bespoke-item[data-product-title="Double Prongs"]`
                )
                .setAttribute("disabled", "disabled");
            }
            if (productTitle == "Double Prongs") {
              document
                .querySelector(
                  `.rb-bespoke-item[data-product-title="Singular Prongs"]`
                )
                .setAttribute("disabled", "disabled");
            }

            document.querySelector(
              "#rb-bespoke-customization-value"
            ).innerHTML = builder.collector.customization
              .map((c) => {
                let variant;
                const prod = RingBuilderConfig.addon.find((p) => {
                  let matched;
                  for (let i = 0; i < p.variants.length; i++) {
                    if (p.variants[i].id == c) {
                      variant = p.variants[i];
                      matched = true;
                      break;
                    }
                  }
                  if (matched) {
                    return true;
                  } else {
                    return false;
                  }
                });

                if (prod.variants.length > 1) {
                  return `<span>${prod.title} + ${PriceFormatter(
                    variant.price
                  )}</span>`;
                }
                return `<span>${prod.title} + ${PriceFormatter(
                  prod.price
                )}</span>`;
              })
              .join("");

            document.querySelector("#rb-bespoke-customization").innerHTML =
              "+ EDIT BESPOKE CUSTOMISATION";
          } else {
            if (productTitle == "Singular Prongs") {
              document
                .querySelector(
                  `.rb-bespoke-item[data-product-title="Double Prongs"]`
                )
                .removeAttribute("disabled");
            }
            if (productTitle == "Double Prongs") {
              document
                .querySelector(
                  `.rb-bespoke-item[data-product-title="Singular Prongs"]`
                )
                .removeAttribute("disabled");
            }
            const index = builder.collector.customization.indexOf(variantId);
            builder.collector.customization.splice(index, 1);
            bespokeAdd.innerHTML = "+ ADD";
            if (builder.collector.customization.length != 0) {
              document.querySelector(
                "#rb-bespoke-customization-value"
              ).innerHTML = builder.collector.customization
                .map((c) => {
                  let variant;
                  const prod = RingBuilderConfig.addon.find((p) => {
                    let matched;
                    for (let i = 0; i < p.variants.length; i++) {
                      if (p.variants[i].id == c) {
                        variant = p.variants[i];
                        matched = true;
                        break;
                      }
                    }
                    if (matched) {
                      return true;
                    } else {
                      return false;
                    }
                  });

                  if (prod.variants.length > 1) {
                    return `<span>${prod.title} + ${PriceFormatter(
                      variant.price
                    )}</span>`;
                  }
                  return `<span>${prod.title} + ${PriceFormatter(
                    prod.price
                  )}</span>`;
                })
                .join("");
            } else {
              document.querySelector("#rb-bespoke-customization").innerHTML =
                "+ ADD BESPOKE CUSTOMISATION";
              document.querySelector(
                "#rb-bespoke-customization-value"
              ).innerHTML = "";
            }
          }
          builder.calculateValue();
        }

        if (gemstoneAdd) {
          const content = gemstoneAdd.innerHTML;
          const bespokeItem = gemstoneAdd.parentElement.parentElement;
          const variantId = bespokeItem.dataset.selectedVariant;
          if (content == "+ ADD") {
            // document
            //   .querySelectorAll(".rb-gemstone-add")
            //   .forEach((ga) => (ga.innerHTML = "+ ADD"));
            builder.collector.hiddenGem.push(variantId);
            gemstoneAdd.innerHTML = "- REMOVE";
            document.querySelector("#rb-hidden-gem-value").innerHTML =
              builder.collector.hiddenGem
                .map((g) => {
                  const product = RingBuilderConfig.hiddenGem.find(
                    (h) => h.variants[0].id == g
                  );
                  return `<span>${product.title} + ${PriceFormatter(
                    product.price
                  )}</span>`;
                })
                .join("");
            document.querySelector("#rb-hidden-gem").innerHTML =
              "+ EDIT HIDDEN GEMSTONE";
          } else {
            const index = builder.collector.hiddenGem.indexOf(variantId);
            builder.collector.hiddenGem.splice(index, 1);
            gemstoneAdd.innerHTML = "+ ADD";
            document.querySelector("#rb-hidden-gem-value").innerHTML =
              builder.collector.hiddenGem
                .map((g) => {
                  const product = RingBuilderConfig.hiddenGem.find(
                    (h) => h.variants[0].id == g
                  );
                  return `<span>${product.title} + ${PriceFormatter(
                    product.price
                  )}</span>`;
                })
                .join("");
            if (builder.collector.hiddenGem.length == 0) {
              document.querySelector("#rb-hidden-gem").innerHTML =
                "+ ADD HIDDEN GEMSTONE";
            }
          }
          builder.calculateValue();
        }
        // if (bespokeVariant) {
        //   console.log(
        //     bespokeVariant.parentElement.parentElement.parentElement
        //       .parentElement.parentElement
        //   );
        // }
        return false;
      });
    }

    static get observedAttributes() {
      return ["data-rb-present", "data-content-type"];
    }

    attributeChangedCallback(name, oldValue, newValue) {
      if (name == "data-content-type") {
        this.templateBuilder(newValue, {});
        // if (newValue == "setting") {
        //   this.miniShapeCarousel();
        // }
      }
      if (name == "data-rb-present" && newValue == "true") {
        document.documentElement.classList.toggle("lock-all", true);
      }
      if (name == "data-rb-present" && newValue == "false") {
        document.documentElement.classList.toggle("lock-all", false);
      }
    }

    templateBuilder(type, data) {
      if (type == "stone") {
        this.innerHTML = `<div class="rb-popup-container"><div class="rb-sticky">${stoneProductData()}</div>`;
        return;
      } else {
        const htmlVal = RingBuilderPopupTemplate[type];
        this.innerHTML = `<div class="rb-popup-container"><div class="rb-sticky">${htmlVal}</div></div>`;
      }
    }

    miniShapeCarousel() {
      const shapeContainer = this.querySelector(".rb-shapes-filter");
      new Glider(shapeContainer, {
        exactWidth: true,
        itemWidth: 58,
        draggable: true,
        arrows: {
          prev: ".glider-prev",
          next: ".glider-next",
        },
      });
    }
  }

  customElements.define("rb-popup", RingBuilderPopup);
  builder.paramCheck();
}

const productEngraving = document.querySelector("#engraving");
if (productEngraving) {
  productEngraving.addEventListener("click", () => {
    document
      .querySelector("rb-popup")
      .setAttribute("data-content-type", "productEngraving");
    document.querySelector("rb-popup").innerHTML = `
    <div class="rb-popup-container"><div class="rb-sticky">
    <div class="engraving">
          <div class="engraving-header">
            <h4>Customisation</h4>
            <p>
            Have your ring custom engaved, with 20 characters
            or less. This will be laser engraved on the inside
            of your band.
            </p>
          </div>
          <div class="engraving-main">
            <input type="text" id="engraving-input" maxlength="20" placeholder="A name, a date, initials or a word"/>
          </div>
          <div class="engraving-options">
            <button class="engraving-cancel-btn">CANCEL</button>
            <button class="engraving-save-btn">SAVE</button>
          </div>
        </div>
        </div></div>
    `;
    document.querySelector("rb-popup").setAttribute("data-rb-present", "true");
  });
  document.addEventListener("click", function (e) {
    const productEngravingSave = e.target.matches(".engraving-save-btn");
    const productEngravingCancel = e.target.matches(".engraving-cancel-btn");
    if (productEngravingSave) {
      const productEngravingInput = document.querySelector("#engraving-input");
      const productEngravingTrigger = document.querySelector("#engraving");
      const productEngravingHiddenInput = document.querySelector(
        `#${productEngravingTrigger.dataset.hiddenInput}`
      );
      productEngravingHiddenInput.value = productEngravingInput.value;
      document
        .querySelector("rb-popup")
        .setAttribute("data-rb-present", "false");
    }
    if (productEngravingCancel) {
      document
        .querySelector("rb-popup")
        .setAttribute("data-rb-present", "false");
    }
  });
}

if (window.estimateConfig) {
  const date = new Date();
  function addWeeks(date, weeks, day = 7) {
    date.setDate(date.getDate() + day * weeks);
    return date;
  }
  const newDate = addWeeks(date, window.estimateConfig);
  let monthOptions = { month: "long" };
  const firstDay = newDate.getDate();
  const firstMonth = new Intl.DateTimeFormat("en-us", monthOptions).format(
    newDate
  );
  const lastDay = addWeeks(newDate, 1, 6);
  const month = new Intl.DateTimeFormat("en-us", monthOptions).format(lastDay);
  let yearOptions = { year: "numeric" };
  const year = new Intl.DateTimeFormat("en-us", yearOptions).format(lastDay);
  const estimateTemplate = `${firstDay} ${firstMonth} - ${lastDay.getDate()} ${month} ${year}`;
  document.querySelector("#e-range").innerHTML = estimateTemplate;
}

document.addEventListener("click", function (e) {
  const collectionShape = e.target.matches(
    ".product-facet__meta-bar .rb-shape-container button"
  );

  if (collectionShape) {
    console.log("clicked");
  }
});
