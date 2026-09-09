// Super duper JavaScript

document.querySelectorAll('.page-container ul li a').forEach(link => {
  link.addEventListener('click', (e) => {
    document.getElementById('menu-toggle').checked = false;
    document.querySelectorAll(`.view`).forEach(view => {
      view.classList.add('hidden');
    });

    const id = link.getAttribute('data-target');
    document.getElementById(id).classList.remove('hidden');
    document.getElementById('title').textContent = link.textContent;
  });
});

// Meal search
async function fetchMeal(category) {
  try {
    let response;
    if (category == "breakfast") {
      response = await fetch(`https://www.themealdb.com/api/json/v1/1/filter.php?c=${category}`);
      const data = await response.json();
      const meals = data.meals || [];
      meals.forEach(meal => {
        meal.category = "Breakfast";
      });
      return meals;
    } else {
      const categoriesResp = await fetch(`https://www.themealdb.com/api/json/v1/1/categories.php`);
      const categoriesData = await categoriesResp.json();

      const excludedCategories = ["Breakfast", "Dessert", "Side", "Starter", "Miscellaneous"];  

      const categoriesList = categoriesData.categories
        .map(cat => cat.strCategory)
        .filter(cat => !excludedCategories.includes(cat));

      const meals = categoriesList.map(cat =>
        fetch(`https://www.themealdb.com/api/json/v1/1/filter.php?c=${cat}`).then(resp => resp.json())
          .then(data => {
            const catMeals = data.meals || [];
            catMeals.forEach(meal => {
              meal.category = cat;
            });
            return catMeals;
          })
      );

      response = await Promise.all(meals);

      let allMeals = [];
      response.forEach(catMeals => {
        allMeals = allMeals.concat(catMeals);
      });

      return allMeals;
    }
  } catch (e) {
    console.error("Error: " + e)
  }
}

const resultsDiv = document.querySelector(`.meals-results`);
const closeBtn = resultsDiv.querySelector(`.meals-close`);
const mealsListDiv = document.getElementById('meals-view');
const addBtns = document.querySelectorAll(`.meal-selection-add`);
const scrollBox = document.querySelector(`.scroll-box`);
const searchInput = resultsDiv.querySelector(`.meals-search`);

const filterToggle = resultsDiv.querySelector(`.meals-filter-toggle`);
const filterPanel = resultsDiv.querySelector(`.meals-filter-panel`);
const filterOptionsList = resultsDiv.querySelector(`.meals-filter-options`);
const filterCount = resultsDiv.querySelector(`.meals-filter-count`);
const filterAllBtn = resultsDiv.querySelector(`.meals-filter-all`);
const filterNoneBtn = resultsDiv.querySelector(`.meals-filter-none`);

let clickedAddBtn = null;
let currentMeals = [];
let activeCategories = new Set();

closeBtn.addEventListener("click", () => {
  mealsListDiv.classList.add('hidden');
  filterPanel.classList.add('hidden');
});

filterToggle.addEventListener("click", () => {
  filterPanel.classList.toggle('hidden');
});

document.addEventListener("click", (event) => {
  if (!filterPanel.classList.contains('hidden') && !event.target.closest('.meals-filter')) {
    filterPanel.classList.add('hidden');
  }
});

filterAllBtn.addEventListener("click", () => {
  filterOptionsList.querySelectorAll(`input[type="checkbox"]`).forEach(checkbox => {
    checkbox.checked = true;
    activeCategories.add(checkbox.value);
  });
  updateFilterCount();
  applyFilters();
});

filterNoneBtn.addEventListener("click", () => {
  filterOptionsList.querySelectorAll(`input[type="checkbox"]`).forEach(checkbox => {
    checkbox.checked = false;
  });
  activeCategories.clear();
  updateFilterCount();
  applyFilters();
});

searchInput.addEventListener("input", applyFilters);

function updateFilterCount() {
  const total = filterOptionsList.querySelectorAll(`input[type="checkbox"]`).length;
  filterCount.textContent = `${activeCategories.size}/${total}`;
}

function filterOptions(categories, isBreakfast = false) {
  filterOptionsList.innerHTML = "";
  activeCategories = new Set(categories);

  if (isBreakfast || categories.length <= 1) {
    filterToggle.classList.add('hidden');
    filterPanel.classList.add('hidden');
    updateFilterCount();
    return;
  }

  filterToggle.classList.remove('hidden');

  categories.forEach(cat => {
    const label = document.createElement('label');
    label.classList.add('meals-filter-option');

    const checkbox = document.createElement('input');
    checkbox.type = 'checkbox';
    checkbox.value = cat;
    checkbox.checked = true;
    checkbox.addEventListener("change", () => {
      if (checkbox.checked) {
        activeCategories.add(cat);
      } else {
        activeCategories.delete(cat);
      }
      updateFilterCount();
      applyFilters(); 
    });

    const text = document.createElement('span');
    text.textContent = cat;

    label.appendChild(checkbox);
    label.appendChild(text);
    filterOptionsList.appendChild(label);
  });

  updateFilterCount();
}

function renderMeals(meals) {
  scrollBox.innerHTML = "";

  meals.forEach(meal => {
    const div = document.createElement('div');
    div.classList.add("meal");      
    div.dataset.category = meal.category || "";
    div.dataset.name = meal.strMeal.toLowerCase();

    const img = document.createElement('img');
    img.src = meal.strMealThumb;
    img.alt = meal.strMeal;
    img.style.width = "100px";

    const title = document.createElement('span');
    title.textContent = meal.strMeal;
    title.style.color = "red";

    div.addEventListener('click', () => {
      const btn = clickedAddBtn.querySelector('.meal-selection-add');
      btn.classList.add('hidden');
      mealsListDiv.classList.add('hidden');

      const previousMeal = clickedAddBtn.querySelector('.selected-meal-display');
      if (previousMeal) {
        previousMeal.remove();
      }

      const selectedMeal = document.createElement('div');
      selectedMeal.style.color = "var(--color-bg)";
      selectedMeal.style.textAlign = "center";

      const mealName = document.createElement('span');
      mealName.innerHTML = title.textContent;

      selectedMeal.appendChild(mealName);
      clickedAddBtn.appendChild(selectedMeal);
      clickedAddBtn.classList.remove('meal-selection-empty');
    });

    div.appendChild(img);
    div.appendChild(title);
    scrollBox.appendChild(div);
  });  
}

function applyFilters() {
  const search = searchInput.value.trim().toLowerCase();

  scrollBox.querySelectorAll(`.meal`).forEach(card => {
    const categoryMatch = activeCategories.has(card.dataset.category);
    const searchMatch = !search || card.dataset.name.includes(search);
    card.classList.toggle('hidden', !(categoryMatch && searchMatch));
  });
}

addBtns.forEach(btn => {
  btn.addEventListener('click', async () => {
    clickedAddBtn = btn.closest('.meal-selection-content');

    const mealSelection = btn.closest('.meal-selection');
    
    const breakfast = mealSelection.classList.contains("breakfast");
    const lunch = mealSelection.classList.contains("lunch");
    const dinner = mealSelection.classList.contains("dinner");

    const dailyPlan = btn.closest('.daily-plan');
    const dayId = dailyPlan.getAttribute('data-day');

    let category = undefined;
    if (breakfast) {
      category = "breakfast";
    } else if (lunch) {
      category = "";
    } else if (dinner) {
      category = "";
    }

    searchInput.value = "";
    currentMeals = await fetchMeal(category);

    const categories = [...new Set(currentMeals.map(meal => meal.category))];
    filterOptions(categories, breakfast);
    renderMeals(currentMeals);
    applyFilters();

    mealsListDiv.classList.remove('hidden');
  });
});
