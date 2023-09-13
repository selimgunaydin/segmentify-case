const questionsDataPath = "../../assets/data/questions.json";
const productsDataPath = "../../assets/data/products.json";

//Değişken tanımlamaları
const questions = [];
const products = [];
let stepIndex = 0; //Adım Sayacı tanımlaması

//HTML Elemanlarına erişim
const selectors = {
  surveyContainer: document.querySelector(".survey"),
  questionsContainer: document.getElementById("questions"),
  controlButtonsContainer: document.getElementById("control-buttons"),
  filteredProductsContainer: document.getElementById("products"),
};

//Class tanımlamaları
class Question {
  constructor(title, options, subtype, subtitle) {
    this.title = title;
    this.options = options;
    this.subtype = subtype;
    this.subtitle = subtitle;
  }
  createQuestion() {
    selectors.questionsContainer.innerHTML = "";

    //Adım sayacı kontrolü
    var bottomControlButtons = document.querySelectorAll(
      ".bottom-control-button"
    );

    bottomControlButtons.forEach(function (button, index) {
      if (index === stepIndex) {
        button.classList.add("active");
      }
      if (stepIndex < index) {
        button.classList.remove("active");
      }
    });

    //Gerekli HTML elemanlarını oluşturup "testQuestion" nesnesinden verileri alıp ekrana bastırılması.
    const question = document.createElement("div");
    question.classList.add("question");
    question.innerHTML = `
    <div class="question-top"><p class="question-subtitle">${this.subtitle}</p>
    <p class="question-title">${this.title}</p></div>
    `;
    selectors.questionsContainer.append(question);
    const answerButtons = document.createElement("div");
    answerButtons.classList.add("answer-buttons");
    this.options.forEach((item) => {
      const button = document.createElement("button");
      button.classList.add("answer-button");
      //Soru yapısına göre şıkların özelleştirilmesi
      switch (this.subtype) {
        case "category":
          button.textContent = item;
          break;
        case "color":
          answerButtons.classList.add("color-question");
          button.style = `background-color:${item}`;
          button.classList.add("color-button");
          break;
        case "price":
          answerButtons.classList.add("price-question");
          answerButtons.classList.add("row");
          button.textContent = "€" + item;
          button.classList.add("col-5");
          break;
        default:
          break;
      }
      answerButtons.append(button);
      //Buttona atanan filtre değerinin "click" fonksiyonuyla filtre nesnesine tanımlanması.
      button.addEventListener("click", () => {
        answers.setAnswers(this.subtype, item);
        let answerButtons = document.querySelectorAll(".answer-button");
        answerButtons.forEach((button, index) => {
          button.classList.remove("selected");
        });
        button.classList.add("selected");
        next.removeAttribute("disabled");
      });
    });
    question.append(answerButtons);
  }
}

class UserAnswers {
  constructor(category, color, price) {
    this.category = category;
    this.color = color;
    this.price = price;
  }
  //Kullanıcıdan aldığımız cevapların "answers" nesnesine atanması
  setAnswers(subtype, item) {
    switch (subtype) {
      case "color":
        answers.color = item;
        break;
      case "price":
        answers.price = item;
        break;
      default:
        answers.category = item;
        break;
    }
  }
}

//Cevapları tutacağımız nesnenin oluşturulması.
let answers = new UserAnswers(null, null, null);

//Dataların çekilmesi ve değişkenlere atanması.
fetch(questionsDataPath)
  .then((response) => {
    if (!response.ok) {
      throw new Error("Network response was not ok");
    }
    return response.json();
  })
  .then((data) => {
    questions.push(...data);

    //HTML de gösterilecek adım sayacı tanımlamaları
    const bottomControlButtons = document.createElement("div");
    bottomControlButtons.classList.add("bottom-control-buttons");
    questions[0].steps.forEach((item, index) => {
      const controlButton = document.createElement("span");
      controlButton.classList.add("bottom-control-button");
      controlButton.setAttribute("id", index);
      bottomControlButtons.append(controlButton);
    });
    selectors.controlButtonsContainer.append(bottomControlButtons);

    //İlk soru oluşturulması

    const questionTitle = questions[0].steps[0].title;
    const questionOptions = questions.map((item) => item.name);
    const questionSubtype = questions[0].steps[0].subtype;
    const questionSubtitle = questions[0].steps[0].subtitle;
    const testQuestion = new Question(
      questionTitle,
      questionOptions,
      questionSubtype,
      questionSubtitle
    );
    testQuestion.createQuestion();
  })
  .catch((error) => {
    console.error("Fetch error:", error);
  });

fetch(productsDataPath)
  .then((response) => {
    if (!response.ok) {
      throw new Error("Network response was not ok");
    }
    return response.json();
  })
  .then((data) => {
    products.push(...data);
  })
  .catch((error) => {
    console.error("Fetch error:", error);
  });

//Prev ve Next button kontrolleri
const prev = document.getElementById("prev");
const next = document.getElementById("next");

prev.addEventListener("click", () => {
  selectors.filteredProductsContainer.innerHTML = "";
  //Buttonun gerekli şartlar sağlandığında çalışıp isteği yerine getirmesi.
  if (stepIndex <= questions.length && stepIndex >= 0) {
    stepIndex -= 1;
    const newQuestionSteps = questions.find(
      (item) => item.name === answers.category
    );
    //Önceki sorunun oluşturulması.
    const prevQuestion = new Question(
      newQuestionSteps.steps[stepIndex].title,
      newQuestionSteps.steps[stepIndex].answers,
      newQuestionSteps.steps[stepIndex].subtype,
      newQuestionSteps.steps[stepIndex].subtitle
    );
    prevQuestion.createQuestion();

    if (stepIndex === 0) {
      prev.setAttribute("disabled", true);
    }
    next.removeAttribute("disabled");
  }
});

next.addEventListener("click", () => {
  //Buttonun gerekli şartlar sağlandığında çalışıp isteği yerine getirmesi.
  if (stepIndex < questions.length - 1 && stepIndex >= 0) {
    stepIndex += 1;
    next.setAttribute("disabled", true);

    const newQuestionSteps = questions.find(
      (item) => item.name === answers.category
    );
    //Sonraki sorunun oluşturulması.
    const nextQuestion = new Question(
      newQuestionSteps.steps[stepIndex].title,
      newQuestionSteps.steps[stepIndex].answers,
      newQuestionSteps.steps[stepIndex].subtype,
      newQuestionSteps.steps[stepIndex].subtitle
    );
    nextQuestion.createQuestion();

    if (stepIndex > 0) {
      prev.removeAttribute("disabled");
    }
  } else {
    //Adım sayacı sayesinde sorular bittiğinde elde edilen datanın filtre fonksiyonuna gönderilmesi ve oradan dönen değerin ekrana yazdırılması.
    displayFilteredProducts(filterProducts(products, answers));
  }
});

//Products JSON datası elde edilen filtrelerle beraber filtrelenip sonuç datasını döndüren fonksiyon.
function filterProducts(products, filters) {
  const filteredProducts = products.filter((product) => {
    return (
      product.category.includes(filters.category) &&
      product.colors.includes(filters.color.toLowerCase()) &&
      isPriceInRange(product, filters.price)
    );
  });
  return filteredProducts;
}

//Fiyat filtrelemesi
function isPriceInRange(product, priceRange) {
  switch (priceRange) {
    case "0-25":
      return product.price >= 0 && product.price <= 25;
    case "25-50":
      return product.price >= 25 && product.price <= 50;
    case "50-100":
      return product.price >= 50 && product.price <= 100;
    case "100+":
      return product.price >= 100;
    default:
      return false;
  }
}
//Filtrelenmiş ürünleri alan ve ekrana yazdıran fonksiyon
function displayFilteredProducts(products) {
  if (products.length == 0) {
    //Filtreye uygun ürün bulunamama durumu.
    stepIndex += 1;
    let questionTop = document.querySelector(".question-top");
    let answerButtons = document.querySelectorAll(".answer-button");
    questionTop.remove();
    answerButtons.forEach(function (button) {
      button.remove();
    });
    selectors.filteredProductsContainer.innerHTML = `<p class="bg-dark text-white px-5 py-1 rounded-4">Loading...</p>`;
    selectors.filteredProductsContainer.classList.add("no-product");
    setTimeout(() => {
      selectors.filteredProductsContainer.innerHTML = "No Product Found";
    }, 1500);
  } else {
    //Filtreye uygun ürün bulunma durumu.
    selectors.surveyContainer.remove();
    selectors.controlButtonsContainer.remove();
    selectors.filteredProductsContainer.classList.remove("no-product");

    selectors.filteredProductsContainer.innerHTML = `<p class="bg-dark text-white px-5 py-1 rounded-4">Loading...</p>`;
    //Filtrelenmiş ürünlerin yapıya uygun şekilde kullanıcıya gösterilmesi.
    setTimeout(() => {
      selectors.filteredProductsContainer.innerHTML = `
      <div id="carouselExampleIndicators" class="carousel slide ">
        <div class="carousel-indicators">
        ${products
          .map((item, index) => {
            if (index == 0)
              return `<button type="button" data-bs-target="#carouselExampleIndicators" data-bs-slide-to="${index}" class="active" aria-current="true" aria-label="Slide ${index}"></button>`;
            return `    <button type="button" data-bs-target="#carouselExampleIndicators" data-bs-slide-to="${index}" aria-label="Slide ${index}"></button>`;
          })
          .join("")}
        </div>
        <div class="carousel-inner">
          ${products
            .map((item, index) => {
              return `<div class="carousel-item ${
                index == 0 ? "active" : null
              }">
            <img src="${
              item.image
            }" loading="lazy" class="d-block w-100" alt="${item.productId}">
            <div class="carousel-caption d-md-block">
              <h5>${item.name}</h5>
              <div class="d-flex justify-content-center">        ${
                item.oldPrice
                  ? `<p class="text-decoration-line-through"><span">${item.currency}</span>${item.oldPrice}</p>`
                  : ""
              }
            <p class="ms-2 text-danger"><span class="text-danger">${
              item.currency
            }</span>${item.price}</p></div>
            <a href="${
              item.url
            }" class="view-product-button btn btn-dark px-4 py-2 v">VIEW PRODUCT</a>
            </div>
  
          </div>`;
            })
            .join("")}
        </div>
      ${
        products.length > 1
          ? ` <button class="carousel-control-prev" type="button" data-bs-target="#carouselExampleIndicators" data-bs-slide="prev">
        <span class="carousel-control-prev-icon" aria-hidden="true"></span>
        <span class="visually-hidden">Previous</span>
      </button>
      <button class="carousel-control-next" type="button" data-bs-target="#carouselExampleIndicators" data-bs-slide="next">
        <span class="carousel-control-next-icon" aria-hidden="true"></span>
        <span class="visually-hidden">Next</span>
      </button>`
          : ""
      }
     
    </div>`;
    }, 500);
  }
}
