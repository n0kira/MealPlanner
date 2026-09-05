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
    const response = await fetch(`https://www.themealdb.com/api/json/v1/1/filter.php?c=${category}`);
    const data = await response.json();
    return data.meals;
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
      category = "Breakfast";
    } else if (lunch) {
      category = "Lunch";
    } else if (dinner) {
      category = "Dinner";
    }

    const meals = await fetchMeal(category);
    const scrollBox = document.querySelector(`.scroll-box`);

    scrollBox.innerHTML = "";

    meals.forEach(meal => {
      const div = document.createElement('div');
      div.classList.add("meal");
      div.textContent = meal.strMeal;
      div.style.color = "rgb(255, 0, 0)";

      scrollBox.appendChild(div);
    });

    mealsListDiv.classList.remove('hidden');
  });
});
