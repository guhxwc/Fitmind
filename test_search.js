import { LOCAL_FOOD_DATABASE } from './src/services/localFoodData.js';

function normalize(str) {
  return (str || '')
    .toLowerCase()
    .replace(/[.,]/g, ' ')
    .replace(/\s+/g, ' ')
    .trim();
}

const query = "ovo de galinha";
const normalizedQuery = normalize(query);
const queryWords = normalizedQuery.split(' ').filter(Boolean);

const localResults = LOCAL_FOOD_DATABASE
  .filter((item) => {
    const nameNorm = normalize(item.nome);
    return queryWords.every((w) => nameNorm.includes(w));
  })
  .slice(0, 10);

console.log(localResults);
