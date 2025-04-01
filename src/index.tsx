import { useEffect, useState, useCallback } from "react";
import { createRoot } from "react-dom/client";
import "./styles.css";

// Безопасная проверка на существование Telegram WebApp API
const tg = window.Telegram ? window.Telegram.WebApp : null;

// Описания зелий лечения из справочника
const HEALING_POTIONS = [
  {
    id: 'potion-healing-common',
    name: 'Зелье лечения',
    description: 'Красная жидкость, сверкающая при встряхивании. Восстанавливает 2к4+2 хитов при употреблении.',
    rarity: 'Обычный',
    price: '50 зм',
    type: 'Зелье'
  },
  {
    id: 'potion-healing-uncommon',
    name: 'Зелье большого лечения',
    description: 'Красная жидкость, сверкающая при встряхивании. Восстанавливает 4к4+4 хитов при употреблении.',
    rarity: 'Необычный',
    price: '100 зм',
    type: 'Зелье'
  },
  {
    id: 'potion-healing-rare',
    name: 'Зелье отличного лечения',
    description: 'Красная жидкость, сверкающая при встряхивании. Восстанавливает 8к4+8 хитов при употреблении.',
    rarity: 'Редкий',
    price: '500 зм',
    type: 'Зелье'
  },
  {
    id: 'potion-healing-very-rare',
    name: 'Зелье превосходного лечения',
    description: 'Красная жидкость, сверкающая при встряхивании. Восстанавливает 10к4+20 хитов при употреблении.',
    rarity: 'Очень редкий',
    price: '5000 зм',
    type: 'Зелье'
  }
];

// Тип для товаров
type Item = {
  id: number | string;
  name: string;
  name_en: string;
  price: number | string;
  description: string;
  rarity: string;
  type: string;
};

// Категории предметов
const ITEM_CATEGORIES = [
  "Доспех",
  "Оружие",
  "Жезл",
  "Снаряжение",
  "Амулет",
  "Кольцо",
  "Компонент",
  "Посох",
  "Чудесный предмет",
  "Свиток"
];

// Типы редкости предметов
const RARITY_TYPES = ["Обычный", "Необычный", "Редкий", "Очень редкий", "Легендарный"];

// Функция для получения класса редкости
const getRarityClass = (rarity: string): string => {
  switch(rarity) {
    case "Обычный":
      return "rarity-common";
    case "Необычный":
      return "rarity-uncommon";
    case "Редкий":
      return "rarity-rare";
    case "Очень редкий":
      return "rarity-very-rare";
    case "Легендарный":
      return "rarity-legendary";
    default:
      return "";
  }
};

// Ключ для хранения времени последней генерации
const LAST_GENERATION_TIME_KEY = 'lastGenerationTime';
// Ключ для хранения сгенерированных предметов
const GENERATED_ITEMS_KEY = 'generatedItems';
// Интервал обновления в миллисекундах (2 часа)
const UPDATE_INTERVAL = 2 * 60 * 60 * 1000;

const App = () => {
  const [items, setItems] = useState<Item[]>([]);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);
  const [activeCategory, setActiveCategory] = useState<string | null>(null);
  const [generatedItems, setGeneratedItems] = useState<{[category: string]: Item[]}>({});
  
  // Инициализация Telegram WebApp и фонового изображения
  useEffect(() => {
    // Установка фонового изображения
    document.body.style.backgroundImage = "url(/images/MainImage.jpg)";
    
    if (tg) {
      tg.expand(); // Разворачиваем приложение только если в Telegram
      tg.ready(); // Сообщаем приложению Telegram, что приложение готово
    }
  }, []);

  // Загрузка товаров
  useEffect(() => {
    setIsLoading(true);

    fetch("/items.json")
      .then((res) => {
        if (!res.ok) {
          throw new Error("Ошибка сервера при загрузке товаров");
        }
        return res.json();
      })
      .then((data) => {
        setItems(data);
        // Загружаем сгенерированные предметы из localStorage или генерируем новые
        loadOrGenerateItems(data);
        // По умолчанию открываем первую категорию, если есть предметы
        if (data.length > 0) {
          setActiveCategory(ITEM_CATEGORIES[0]);
        }
        setIsLoading(false);
      })
      .catch((err) => {
        console.error("Ошибка загрузки предметов:", err);
        setError("Не удалось загрузить предметы. Пожалуйста, попробуйте позже.");
        setIsLoading(false);
      });
  }, []);

  // Проверяем необходимость обновления предметов каждую минуту
  useEffect(() => {
    const checkForUpdate = () => {
      const lastGenerationTime = localStorage.getItem(LAST_GENERATION_TIME_KEY);
      if (lastGenerationTime) {
        const timePassed = Date.now() - parseInt(lastGenerationTime);
        if (timePassed >= UPDATE_INTERVAL) {
          generateRandomItems();
        }
      }
    };

    const intervalId = setInterval(checkForUpdate, 60000); // Проверка каждую минуту
    return () => clearInterval(intervalId);
  }, [items]);

  // Загрузка ранее сгенерированных предметов из localStorage или генерация новых
  const loadOrGenerateItems = (allItems: Item[]) => {
    const lastGenerationTimeStr = localStorage.getItem(LAST_GENERATION_TIME_KEY);
    const savedItemsStr = localStorage.getItem(GENERATED_ITEMS_KEY);
    
    let shouldGenerateNewItems = true;
    
    if (lastGenerationTimeStr && savedItemsStr) {
      const lastGenerationTime = parseInt(lastGenerationTimeStr);
      const timePassed = Date.now() - lastGenerationTime;
      
      if (timePassed < UPDATE_INTERVAL) {
        try {
          const savedItems = JSON.parse(savedItemsStr);
          setGeneratedItems(savedItems);
          shouldGenerateNewItems = false;
        } catch (e) {
          console.error("Ошибка парсинга сохраненных предметов:", e);
        }
      }
    }
    
    if (shouldGenerateNewItems && allItems.length > 0) {
      generateRandomItems(allItems);
    }
  };

  // Генерация случайных предметов с учетом требований по редкости
  const generateRandomItems = useCallback((allItems?: Item[]) => {
    const itemsToUse = allItems || items;
    
    if (itemsToUse.length === 0) return;
    
    const newGeneratedItems: {[category: string]: Item[]} = {};
    
    // Для каждой категории генерируем набор предметов
    ITEM_CATEGORIES.forEach(category => {
      const categoryItems = itemsToUse.filter(item => item.type === category);
      if (categoryItems.length === 0) {
        newGeneratedItems[category] = [];
        return;
      }
      
      // Разделяем предметы по редкости
      const itemsByRarity: {[rarity: string]: Item[]} = {};
      RARITY_TYPES.forEach(rarity => {
        itemsByRarity[rarity] = categoryItems.filter(item => item.rarity === rarity);
      });
      
      // Выбираем предметы согласно требованиям
      const selectedItems: Item[] = [];
      
      // 3 обычных
      selectedItems.push(...getRandomItems(itemsByRarity["Обычный"], 3));
      
      // 2 необычных
      selectedItems.push(...getRandomItems(itemsByRarity["Необычный"], 2));
      
      // 2 редких
      selectedItems.push(...getRandomItems(itemsByRarity["Редкий"], 2));
      
      // 1 очень редкий
      selectedItems.push(...getRandomItems(itemsByRarity["Очень редкий"], 1));
      
      // 1 легендарный
      selectedItems.push(...getRandomItems(itemsByRarity["Легендарный"], 1));
      
      newGeneratedItems[category] = selectedItems;
    });
    
    // Сохраняем сгенерированные предметы и время генерации
    setGeneratedItems(newGeneratedItems);
    localStorage.setItem(GENERATED_ITEMS_KEY, JSON.stringify(newGeneratedItems));
    localStorage.setItem(LAST_GENERATION_TIME_KEY, Date.now().toString());
  }, [items]);

  // Получаем случайные предметы из массива
  const getRandomItems = (itemsArray: Item[], count: number): Item[] => {
    if (!itemsArray || itemsArray.length === 0) return [];
    
    // Если предметов меньше, чем нужно, возвращаем все имеющиеся
    if (itemsArray.length <= count) return [...itemsArray];
    
    // Иначе выбираем случайные
    const shuffled = [...itemsArray].sort(() => 0.5 - Math.random());
    return shuffled.slice(0, count);
  };

  // Получаем предметы по категории
  const getItemsByCategory = (category: string) => {
    // Если есть сгенерированные предметы для категории, возвращаем их
    if (generatedItems[category] && generatedItems[category].length > 0) {
      return generatedItems[category];
    }
    
    // В противном случае возвращаем все предметы данной категории с ограничением
    return items
      .filter(item => item.type === category)
      .slice(0, 9); // Показываем максимум 9 предметов в категории по умолчанию
  };

  // Получаем зелья лечения
  const getHealingPotions = () => {
    // Объединяем стандартные зелья лечения из справочника с другими зельями из каталога
    const catalogHealingPotions = items.filter(item => 
      item.type === "Зелье" && 
      (item.name.toLowerCase().includes("лечения") || 
       item.name.toLowerCase().includes("исцеления") ||
       item.description.toLowerCase().includes("восстанавливает") ||
       item.description.toLowerCase().includes("хиты"))
    );
    
    // Фильтруем зелья из HEALING_POTIONS, чтобы не было дубликатов с теми, что уже есть в каталоге
    const standardPotions = HEALING_POTIONS.filter(
      standardPotion => !catalogHealingPotions.some(
        catalogPotion => catalogPotion.name === standardPotion.name
      )
    );
    
    return [...standardPotions, ...catalogHealingPotions];
  };

  const toggleCategory = (category: string) => {
    setActiveCategory(activeCategory === category ? null : category);
  };

  // Обработчик клика по кнопке обновления предметов
  const handleRefreshItems = () => {
    generateRandomItems();
  };

  // Обработчик клика по кнопке с проверкой пароля
  const handleRefreshButtonClick = () => {
    const password = prompt('Введите пароль для обновления предметов:');
    if (password === '4441') {
      handleRefreshItems();
    } else if (password !== null) {
      alert('Неверный пароль. Предметы не были обновлены.');
    }
  };

  if (isLoading) {
    return <div className="loading">Загрузка предметов...</div>;
  }

  if (error) {
    return <div className="error">{error}</div>;
  }

  const healingPotions = getHealingPotions();

  return (
    <div className="container">
      <h1>Динь - Динь - Дон</h1>
      {/* Блок зелий лечения */}
      <div className="healing-potions-section">
        <h2 className="section-title">Зелья лечения</h2>
        <div className="grid">
          {healingPotions.length > 0 ? (
            healingPotions.map((item) => (
              <div key={item.id} className="card healing-potion-card">
                <h2>{item.name}</h2>
                <div className="rarity-container">
                  <div className={`rarity ${getRarityClass(item.rarity)}`}>{item.rarity}</div>
                </div>
                <p>{item.description}</p>
                <span className="price">{item.price}</span>
              </div>
            ))
          ) : (
            <div className="empty-category">
              Зелья лечения отсутствуют в каталоге
            </div>
          )}
        </div>
      </div>
      
      {/* Кнопка обновления предметов */}
      <button 
        className="refresh-button" 
        onClick={handleRefreshButtonClick}
        title="Обновить товары в магазине"
      >
        Обновить товары
      </button>
      
      <div className="accordion">
        {ITEM_CATEGORIES.map(category => (
          <div key={category} className="accordion-item">
            <div 
              className={`accordion-header ${activeCategory === category ? 'active' : ''}`}
              onClick={() => toggleCategory(category)}
            >
              <span>{category}</span>
              <span className="accordion-icon">{activeCategory === category ? '−' : '+'}</span>
            </div>
            {activeCategory === category && (
              <div className="accordion-content">
                <div className="items-by-rarity">
                  {RARITY_TYPES.map(rarity => {
                    const rarityItems = getItemsByCategory(category).filter(item => item.rarity === rarity);
                    if (rarityItems.length === 0) return null;
                    
                    return (
                      <div key={rarity} className="rarity-section">
                        <h3 className={`rarity-title ${getRarityClass(rarity)}`}>{rarity}</h3>
                        <div className="grid">
                          {rarityItems.map((item) => (
                            <div key={item.id} className="card">
                              <h2>{item.name}</h2>
                              <h4>{item.name_en}</h4>
                              <div className="rarity-container">
                              <div className={`rarity ${getRarityClass(item.rarity)}`}>{item.rarity}</div>

                              </div>
                              <p>{item.description}</p>
                              <span className="price">{`${item.price} зм`}</span>
                            </div>
                          ))}
                        </div>
                      </div>
                    );
                  })}
                </div>
                {getItemsByCategory(category).length === 0 && (
                  <div className="empty-category">
                    Предметы отсутствуют в этой категории
                  </div>
                )}
              </div>
            )}
          </div>
        ))}
      </div>

      {items.length === 0 && !isLoading && (
        <div className="empty-state">
          Предметы отсутствуют в каталоге
        </div>
      )}
    </div>
  );
};

const rootElement = document.getElementById("root");
if (!rootElement) {
  throw new Error("Failed to find the root element");
}
const root = createRoot(rootElement);
root.render(<App />);
