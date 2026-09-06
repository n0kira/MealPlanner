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

// Today's Meal Plan
async function fetchMeal(category) {
  try {
    let response;
    if (category == "breakfast") {
      response = await fetch(`https://www.themealdb.com/api/json/v1/1/filter.php?c=${category}`);
      const data = await response.json();
      return data.meals;
    } else {
      const categoriesResp = await fetch(`https://www.themealdb.com/api/json/v1/1/categories.php`);
      const categoriesData = await categoriesResp.json();

      const excludedCategories = ["Breakfast", "Dessert", "Side", "Starter", "Miscellaneous"];  

      const categoriesList = categoriesData.categories
        .map(cat => cat.strCategory)
        .filter(cat => !excludedCategories.includes(cat));

      const meals = categoriesList.map(cat =>
        fetch(`https://www.themealdb.com/api/json/v1/1/filter.php?c=${cat}`).then(resp => resp.json())
      );

      response = await Promise.all(meals);

      let allMeals = [];
      response.forEach(item => {
        if (item.meals) {
          allMeals = allMeals.concat(item.meals);
        }
      });

      return allMeals;
    }
  } catch (e) {
    console.error("Error: " + e)
  }
}

const resultsDiv = document.querySelector(`.meals-results`);
const closeBtn = resultsDiv.querySelector("button");
const mealsListDiv = document.getElementById('meals-view');
const addBtns = document.querySelectorAll(`.meal-selection-add`);

closeBtn.addEventListener("click", () => {
  mealsListDiv.classList.add('hidden');
});

addBtns.forEach(btn => {
  btn.addEventListener('click', async () => {
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

    const meals = await fetchMeal(category);
    const scrollBox = document.querySelector(`.scroll-box`);

    scrollBox.innerHTML = "";

    meals.forEach(meal => {
      const div = document.createElement('div');
      div.classList.add("meal");      

      const img = document.createElement('img');
      img.src = meal.strMealThumb;
      img.alt = meal.strMeal;
      img.style.width = "100px";

      const title = document.createElement('span');
      title.textContent = meal.strMeal;
      title.style.color = "red";

      div.appendChild(img);
      div.appendChild(title);
      scrollBox.appendChild(div);
    });

    mealsListDiv.classList.remove('hidden');
  });
});
