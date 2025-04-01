var __assign = (this && this.__assign) || function () {
    __assign = Object.assign || function(t) {
        for (var s, i = 1, n = arguments.length; i < n; i++) {
            s = arguments[i];
            for (var p in s) if (Object.prototype.hasOwnProperty.call(s, p))
                t[p] = s[p];
        }
        return t;
    };
    return __assign.apply(this, arguments);
};
var __spreadArray = (this && this.__spreadArray) || function (to, from, pack) {
    if (pack || arguments.length === 2) for (var i = 0, l = from.length, ar; i < l; i++) {
        if (ar || !(i in from)) {
            if (!ar) ar = Array.prototype.slice.call(from, 0, i);
            ar[i] = from[i];
        }
    }
    return to.concat(ar || Array.prototype.slice.call(from));
};
import { jsx as _jsx, jsxs as _jsxs } from "react/jsx-runtime";
import { useEffect, useState, useCallback } from "react";
import { createRoot } from "react-dom/client";
import "./styles.css";
// Безопасная проверка на существование Telegram WebApp API
var tg = window.Telegram ? window.Telegram.WebApp : null;
// Описания зелий лечения из справочника
var HEALING_POTIONS = [
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
// Категории предметов
var ITEM_CATEGORIES = [
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
var RARITY_TYPES = ["Обычный", "Необычный", "Редкий", "Очень редкий", "Легендарный"];
// Функция для получения класса редкости
var getRarityClass = function (rarity) {
    switch (rarity) {
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
var LAST_GENERATION_TIME_KEY = 'lastGenerationTime';
// Ключ для хранения сгенерированных предметов
var GENERATED_ITEMS_KEY = 'generatedItems';
// Интервал обновления в миллисекундах (2 часа)
var UPDATE_INTERVAL = 2 * 60 * 60 * 1000;
var App = function () {
    var _a = useState([]), items = _a[0], setItems = _a[1];
    var _b = useState(true), isLoading = _b[0], setIsLoading = _b[1];
    var _c = useState(null), error = _c[0], setError = _c[1];
    var _d = useState(null), activeCategory = _d[0], setActiveCategory = _d[1];
    var _e = useState({}), generatedItems = _e[0], setGeneratedItems = _e[1];
    // Инициализация Telegram WebApp и фонового изображения
    useEffect(function () {
        // Установка фонового изображения
        document.body.style.backgroundImage = "url(/images/MainImage.jpg)";
        if (tg) {
            tg.expand(); // Разворачиваем приложение только если в Telegram
            tg.ready(); // Сообщаем приложению Telegram, что приложение готово
        }
    }, []);
    // Загрузка товаров
    useEffect(function () {
        setIsLoading(true);
        fetch("/items.json")
            .then(function (res) {
            if (!res.ok) {
                throw new Error("Ошибка сервера при загрузке товаров");
            }
            return res.json();
        })
            .then(function (data) {
            setItems(data);
            // Загружаем сгенерированные предметы из localStorage или генерируем новые
            loadOrGenerateItems(data);
            // По умолчанию открываем первую категорию, если есть предметы
            if (data.length > 0) {
                setActiveCategory(ITEM_CATEGORIES[0]);
            }
            setIsLoading(false);
        })
            .catch(function (err) {
            console.error("Ошибка загрузки предметов:", err);
            setError("Не удалось загрузить предметы. Пожалуйста, попробуйте позже.");
            setIsLoading(false);
        });
    }, []);
    // Проверяем необходимость обновления предметов каждую минуту
    useEffect(function () {
        var checkForUpdate = function () {
            var lastGenerationTime = localStorage.getItem(LAST_GENERATION_TIME_KEY);
            if (lastGenerationTime) {
                var timePassed = Date.now() - parseInt(lastGenerationTime);
                if (timePassed >= UPDATE_INTERVAL) {
                    generateRandomItems();
                }
            }
        };
        var intervalId = setInterval(checkForUpdate, 60000); // Проверка каждую минуту
        return function () { return clearInterval(intervalId); };
    }, [items]);
    // Загрузка ранее сгенерированных предметов из localStorage или генерация новых
    var loadOrGenerateItems = function (allItems) {
        var lastGenerationTimeStr = localStorage.getItem(LAST_GENERATION_TIME_KEY);
        var savedItemsStr = localStorage.getItem(GENERATED_ITEMS_KEY);
        var shouldGenerateNewItems = true;
        if (lastGenerationTimeStr && savedItemsStr) {
            var lastGenerationTime = parseInt(lastGenerationTimeStr);
            var timePassed = Date.now() - lastGenerationTime;
            if (timePassed < UPDATE_INTERVAL) {
                try {
                    var savedItems = JSON.parse(savedItemsStr);
                    setGeneratedItems(savedItems);
                    shouldGenerateNewItems = false;
                }
                catch (e) {
                    console.error("Ошибка парсинга сохраненных предметов:", e);
                }
            }
        }
        if (shouldGenerateNewItems && allItems.length > 0) {
            generateRandomItems(allItems);
        }
    };
    // Генерация случайных предметов с учетом требований по редкости
    var generateRandomItems = useCallback(function (allItems) {
        var itemsToUse = allItems || items;
        if (itemsToUse.length === 0)
            return;
        var newGeneratedItems = {};
        // Для каждой категории генерируем набор предметов
        ITEM_CATEGORIES.forEach(function (category) {
            var categoryItems = itemsToUse.filter(function (item) { return item.type === category; });
            if (categoryItems.length === 0) {
                newGeneratedItems[category] = [];
                return;
            }
            // Разделяем предметы по редкости
            var itemsByRarity = {};
            RARITY_TYPES.forEach(function (rarity) {
                itemsByRarity[rarity] = categoryItems.filter(function (item) { return item.rarity === rarity; });
            });
            // Выбираем предметы согласно требованиям
            var selectedItems = [];
            // 3 обычных
            selectedItems.push.apply(selectedItems, getRandomItems(itemsByRarity["Обычный"], 3));
            // 2 необычных
            selectedItems.push.apply(selectedItems, getRandomItems(itemsByRarity["Необычный"], 2));
            // 2 редких
            selectedItems.push.apply(selectedItems, getRandomItems(itemsByRarity["Редкий"], 2));
            // 1 очень редкий
            selectedItems.push.apply(selectedItems, getRandomItems(itemsByRarity["Очень редкий"], 1));
            // 1 легендарный
            selectedItems.push.apply(selectedItems, getRandomItems(itemsByRarity["Легендарный"], 1));
            newGeneratedItems[category] = selectedItems;
        });
        // Сохраняем сгенерированные предметы и время генерации
        setGeneratedItems(newGeneratedItems);
        localStorage.setItem(GENERATED_ITEMS_KEY, JSON.stringify(newGeneratedItems));
        localStorage.setItem(LAST_GENERATION_TIME_KEY, Date.now().toString());
    }, [items]);
    // Получаем случайные предметы из массива
    var getRandomItems = function (itemsArray, count) {
        if (!itemsArray || itemsArray.length === 0)
            return [];
        // Если предметов меньше, чем нужно, возвращаем все имеющиеся
        if (itemsArray.length <= count)
            return __spreadArray([], itemsArray, true);
        // Иначе выбираем случайные
        var shuffled = __spreadArray([], itemsArray, true).sort(function () { return 0.5 - Math.random(); });
        return shuffled.slice(0, count);
    };
    // Получаем предметы по категории
    var getItemsByCategory = function (category) {
        // Если есть сгенерированные предметы для категории, возвращаем их
        if (generatedItems[category] && generatedItems[category].length > 0) {
            return generatedItems[category];
        }
        // В противном случае возвращаем все предметы данной категории с ограничением
        return items
            .filter(function (item) { return item.type === category; })
            .slice(0, 9); // Показываем максимум 9 предметов в категории по умолчанию
    };
    // Получаем зелья лечения
    var getHealingPotions = function () {
        // Объединяем стандартные зелья лечения из справочника с другими зельями из каталога
        var catalogHealingPotions = items.filter(function (item) {
            return item.type === "Зелье" &&
                (item.name.toLowerCase().includes("лечения") ||
                    item.name.toLowerCase().includes("исцеления") ||
                    item.description.toLowerCase().includes("восстанавливает") ||
                    item.description.toLowerCase().includes("хиты"));
        });
        // Фильтруем зелья из HEALING_POTIONS, чтобы не было дубликатов с теми, что уже есть в каталоге
        var standardPotions = HEALING_POTIONS.filter(function (standardPotion) { return !catalogHealingPotions.some(function (catalogPotion) { return catalogPotion.name === standardPotion.name; }); });
        return __spreadArray(__spreadArray([], standardPotions, true), catalogHealingPotions, true);
    };
    var toggleCategory = function (category) {
        setActiveCategory(activeCategory === category ? null : category);
    };
    // Обработчик клика по кнопке обновления предметов
    var handleRefreshItems = function () {
        generateRandomItems();
    };
    // Обработчик клика по кнопке с проверкой пароля
    var handleRefreshButtonClick = function () {
        var password = prompt('Введите пароль для обновления предметов:');
        if (password === '4441') {
            handleRefreshItems();
        }
        else if (password !== null) {
            alert('Неверный пароль. Предметы не были обновлены.');
        }
    };
    if (isLoading) {
        return _jsx("div", __assign({ className: "loading" }, { children: "\u0417\u0430\u0433\u0440\u0443\u0437\u043A\u0430 \u043F\u0440\u0435\u0434\u043C\u0435\u0442\u043E\u0432..." }));
    }
    if (error) {
        return _jsx("div", __assign({ className: "error" }, { children: error }));
    }
    var healingPotions = getHealingPotions();
    return (_jsxs("div", __assign({ className: "container" }, { children: [_jsx("h1", { children: "\u0414\u0438\u043D\u044C - \u0414\u0438\u043D\u044C - \u0414\u043E\u043D" }), _jsxs("div", __assign({ className: "healing-potions-section" }, { children: [_jsx("h2", __assign({ className: "section-title" }, { children: "\u0417\u0435\u043B\u044C\u044F \u043B\u0435\u0447\u0435\u043D\u0438\u044F" })), _jsx("div", __assign({ className: "grid" }, { children: healingPotions.length > 0 ? (healingPotions.map(function (item) { return (_jsxs("div", __assign({ className: "card healing-potion-card" }, { children: [_jsx("h2", { children: item.name }), _jsx("div", __assign({ className: "rarity-container" }, { children: _jsx("div", __assign({ className: "rarity ".concat(getRarityClass(item.rarity)) }, { children: item.rarity })) })), _jsx("p", { children: item.description }), _jsx("span", __assign({ className: "price" }, { children: item.price }))] }), item.id)); })) : (_jsx("div", __assign({ className: "empty-category" }, { children: "\u0417\u0435\u043B\u044C\u044F \u043B\u0435\u0447\u0435\u043D\u0438\u044F \u043E\u0442\u0441\u0443\u0442\u0441\u0442\u0432\u0443\u044E\u0442 \u0432 \u043A\u0430\u0442\u0430\u043B\u043E\u0433\u0435" }))) }))] })), _jsx("button", __assign({ className: "refresh-button", onClick: handleRefreshButtonClick, title: "\u041E\u0431\u043D\u043E\u0432\u0438\u0442\u044C \u0442\u043E\u0432\u0430\u0440\u044B \u0432 \u043C\u0430\u0433\u0430\u0437\u0438\u043D\u0435" }, { children: "\u041E\u0431\u043D\u043E\u0432\u0438\u0442\u044C \u0442\u043E\u0432\u0430\u0440\u044B" })), _jsx("div", __assign({ className: "accordion" }, { children: ITEM_CATEGORIES.map(function (category) { return (_jsxs("div", __assign({ className: "accordion-item" }, { children: [_jsxs("div", __assign({ className: "accordion-header ".concat(activeCategory === category ? 'active' : ''), onClick: function () { return toggleCategory(category); } }, { children: [_jsx("span", { children: category }), _jsx("span", __assign({ className: "accordion-icon" }, { children: activeCategory === category ? '−' : '+' }))] })), activeCategory === category && (_jsxs("div", __assign({ className: "accordion-content" }, { children: [_jsx("div", __assign({ className: "items-by-rarity" }, { children: RARITY_TYPES.map(function (rarity) {
                                        var rarityItems = getItemsByCategory(category).filter(function (item) { return item.rarity === rarity; });
                                        if (rarityItems.length === 0)
                                            return null;
                                        return (_jsxs("div", __assign({ className: "rarity-section" }, { children: [_jsx("h3", __assign({ className: "rarity-title ".concat(getRarityClass(rarity)) }, { children: rarity })), _jsx("div", __assign({ className: "grid" }, { children: rarityItems.map(function (item) { return (_jsxs("div", __assign({ className: "card" }, { children: [_jsx("h2", { children: item.name }), _jsx("h4", { children: item.name_en }), _jsx("div", __assign({ className: "rarity-container" }, { children: _jsx("div", __assign({ className: "rarity ".concat(getRarityClass(item.rarity)) }, { children: item.rarity })) })), _jsx("p", { children: item.description }), _jsx("span", __assign({ className: "price" }, { children: "".concat(item.price, " \u0437\u043C") }))] }), item.id)); }) }))] }), rarity));
                                    }) })), getItemsByCategory(category).length === 0 && (_jsx("div", __assign({ className: "empty-category" }, { children: "\u041F\u0440\u0435\u0434\u043C\u0435\u0442\u044B \u043E\u0442\u0441\u0443\u0442\u0441\u0442\u0432\u0443\u044E\u0442 \u0432 \u044D\u0442\u043E\u0439 \u043A\u0430\u0442\u0435\u0433\u043E\u0440\u0438\u0438" })))] })))] }), category)); }) })), items.length === 0 && !isLoading && (_jsx("div", __assign({ className: "empty-state" }, { children: "\u041F\u0440\u0435\u0434\u043C\u0435\u0442\u044B \u043E\u0442\u0441\u0443\u0442\u0441\u0442\u0432\u0443\u044E\u0442 \u0432 \u043A\u0430\u0442\u0430\u043B\u043E\u0433\u0435" })))] })));
};
var rootElement = document.getElementById("root");
if (!rootElement) {
    throw new Error("Failed to find the root element");
}
var root = createRoot(rootElement);
root.render(_jsx(App, {}));
