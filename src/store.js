import Vuex from "vuex";
import pathify, { make } from "vuex-pathify";
import roles from "./roles.json";
import products from "./products.json";
import D27QO from "./data/D27QO.json";
import CO443726 from "./data/CO443726.json";
import X1YOGA from "./data/X1YOGA.json";
import LightSpeaker from "./data/LightSpeaker.json";
import axios from "axios";

const parseImgPath = (image) => require(`@/assets/${image}`);
const productData = {
  ...products,
  // D27QO,
  // CO443726,
  // X1YOGA,
  // LightSpeaker,
};

Object.values(productData).map((product) => {
  product.data.d0_product_image = '';
  product.data.d0_brand_image = '';
  product.data.d2 &&
    product.data.d2.map(
      (cert) => (cert.d2_image = parseImgPath(cert.d2_image))
    );
  product.data.d1 &&
    product.data.d1.map(
      (reseller) =>
        (reseller.d1_resellerImage = parseImgPath(reseller.d1_resellerImage))
    );
  product.data.d11 &&
    product.data.d11.map(
      (part) => (part.d11_icon = parseImgPath(part.d11_icon))
    );
  product.data.d14 &&
    product.data.d14.map(
      (guide) => (guide.d14_image = parseImgPath(guide.d14_image))
    );
  product.data.d20 &&
    product.data.d20.map(
      (item) => (item.d20_eventImage = parseImgPath(item.d20_eventImage))
    );
  product.data.d23 &&
    product.data.d23.map(
      (item) => (item.d23_image = parseImgPath(item.d23_image))
    );
  product.data.d25 &&
    product.data.d25.map(
      (item) =>
        (item.d25_image = item.d25_image && parseImgPath(item.d25_image))
    );
  product.data.d26 &&
    product.data.d26.map(
      (item) =>
        (item.d26_image = item.d26_image && parseImgPath(item.d26_image))
    );
  if (product.data.d7)
    product.data.d7.d7_sellerImage = parseImgPath(
      product.data.d7.d7_sellerImage
    );
});

const state = {
  currentRole: "consumer",
  currentCategory: 0,
  currentProduct: 0,
  gUIdeElements: [],
  gUIdeActive: false,
  gUIdeStep: 1,
  isOnboardingModalActive: false,
  mobileSidebarActive: false,
  roles,
  //products: productData,
  products: [],
};

const mutations = make.mutations(state);

const store = new Vuex.Store({
  state,
  mutations: {
    ...mutations,
    SET_ROLE(state, newRole) {
      state.currentRole = newRole;
    },
    SET_CATEGORY(state, newCategory) {
      state.currentCategory = newCategory;
    },
    ADD_GUIDE_ELEMENT(state, element) {
      const index = state.gUIdeElements.findIndex(
        (e) => e.element === element.element
      );
      if (index === -1) {
        state.gUIdeElements.push(element);
      } else {
        state.gUIdeElements[index] = element;
      }
      state.gUIdeElements = [...state.gUIdeElements];
    },
    SET_CUURENT_PRODUCT(state, currentProduct) {
      state.currentProduct = currentProduct;
    },
    SET_PRODUCTS(state, products) {
      state.products = products;
    },
  },
  actions: {
    addGUIdeElement({ commit, state }, elementData) {
      commit("ADD_GUIDE_ELEMENT", elementData);
    },
    async changeCurrentProduct({ commit }, currentProduct) {
      commit("SET_CUURENT_PRODUCT", currentProduct);
    },
    async fetchProducts({ commit }, address) {
      try {
        const data = await axios.get(
          "https://node.alpha.obada.io/obada-foundation/fullcore/nft/" + address + "/all"
        );

        const products = []

        for (let asset of data.data.nft){
          const product = Object.assign({}, productData[""])

          const data = await axios.get(
            "https://registry.beta.obada.io/api/v1.0/diddoc/" + asset.id
          );

          let didDoc = Object.assign({}, data.data.document)
          product.pId = asset.data.usn
          product.title = asset.data.usn
          product.did = didDoc.id
          product.documents = []
          product.usn = asset.data.usn
          product.checksum = asset.uri_hash
          product.data.did = didDoc.id
          product.data.usn = asset.data.usn
          product.data.checksum = asset.uri_hash

          for (const obj in didDoc.metadata.objects) {
            const ipfsHash = didDoc.metadata.objects[obj].url.split("://")[1]
            const ipfsUrl = "https://ipfs.alpha.obada.io/ipfs/" + ipfsHash

            switch (didDoc.metadata.objects[obj].metadata.type) {
              case "physicalAssetIdentifiers": {
                  const ipfsDoc = await axios.get(ipfsUrl); 
                  product.manufacturer = ipfsDoc.data.manufacturer
                  product.partNumber = ipfsDoc.data.part_number
                  product.serialNumber = ipfsDoc.data.serial_number
                  product.data.d0_brand = ipfsDoc.data.manufacturer
                  product.data.d0_serialNumber = ipfsDoc.data.serial_number
                  product.data.d0_modelId = ipfsDoc.data.part_number
                  product.documents.push({
                    type: didDoc.metadata.objects[obj].metadata.type,
                    name: didDoc.metadata.objects[obj].metadata.name,
                    description: didDoc.metadata.objects[obj].metadata.type,
                    obj: ipfsDoc.data
                  })
                  product.data.documents.push({
                    type: didDoc.metadata.objects[obj].metadata.type,
                    name: didDoc.metadata.objects[obj].metadata.name,
                    description: didDoc.metadata.objects[obj].metadata.type,
                    obj: ipfsDoc.data
                  })

                  break;
                }

                case "mainImage": {
                   product.image = ipfsUrl
                   product.data.d0_product_image = ipfsUrl

                   product.documents.push({
                    type: didDoc.metadata.objects[obj].metadata.type,
                    name: didDoc.metadata.objects[obj].metadata.name,
                    description: didDoc.metadata.objects[obj].metadata.type,
                    image: ipfsUrl
                  })

                   product.data.documents.push({
                    type: didDoc.metadata.objects[obj].metadata.type,
                    name: didDoc.metadata.objects[obj].metadata.name,
                    description: didDoc.metadata.objects[obj].metadata.type,
                    image: ipfsUrl
                  })
   
                   break;
                }

                default: {
                  product.documents.push({
                    type: didDoc.metadata.objects[obj].metadata.type,
                    name: didDoc.metadata.objects[obj].metadata.name,
                    description: didDoc.metadata.objects[obj].metadata.type,
                    link: ipfsUrl
                  })

                  product.data.documents.push({
                    type: didDoc.metadata.objects[obj].metadata.type,
                    name: didDoc.metadata.objects[obj].metadata.name,
                    description: didDoc.metadata.objects[obj].metadata.type,
                    link: ipfsUrl
                  })
                }
            }
          }

          products.push(product)
        }

        console.log(products)

        commit("SET_PRODUCTS", products);
      } catch (error) {
        alert(error);
      }
    },

  },
  getters: {
    getProducts: (state) => state.products,
  },
  plugins: [pathify.plugin],
});

export default store;
