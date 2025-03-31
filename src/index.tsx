import { useEffect, useState } from "react";
import { createRoot } from "react-dom/client";
import "./styles.css";

// Безопасная проверка на существование Telegram WebApp API
const tg = window.Telegram ? window.Telegram.WebApp : null;

// Тип для товаров
type Item = {
  id: number;
  name: string;
  price: string;
  description: string;
  rarity: string;
};

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

const App = () => {
  const [items, setItems] = useState<Item[]>([]);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);

  // Инициализация Telegram WebApp
  useEffect(() => {
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
        setIsLoading(false);
      })
      .catch((err) => {
        console.error("Ошибка загрузки предметов:", err);
        setError("Не удалось загрузить товары. Пожалуйста, попробуйте позже.");
        setIsLoading(false);
      });
  }, []);

  if (isLoading) {
    return <div className="loading">Загрузка предметов...</div>;
  }

  if (error) {
    return <div className="error">{error}</div>;
  }

  return (
    <div className="container">
      <h1>Каталог предметов DnD</h1>
      
      <div className="grid">
        {items.map((item) => (
          <div key={item.id} className="card">
            <h2>{item.name}</h2>
            <div className={`rarity ${getRarityClass(item.rarity)}`}>{item.rarity}</div>
            <p>{item.description}</p>
            <span className="price">{item.price}</span>
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
