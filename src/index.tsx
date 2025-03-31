import { useEffect, useState } from "react";
import { createRoot } from "react-dom/client";
import "./styles.css";

const tg = window.Telegram ? window.Telegram.WebApp : null;

type Item = {
  id: number;
  name: string;
  price: string;
  description: string;
  image?: string;
};

const App = () => {
  const [items, setItems] = useState<Item[]>([]);

  useEffect(() => {
    if (tg) {
      tg.expand(); // Разворачиваем приложение только если в Telegram
    }
  }, []);

  useEffect(() => {
    fetch("/items.json")
      .then((res) => res.json())
      .then((data) => setItems(data))
      .catch((err) => console.error("Ошибка загрузки предметов:", err));
  }, []);

  return (
    <div className="container">
      <h1>Магазин DnD</h1>
      <div className="grid">
        {items.map((item) => (
          <div key={item.id} className="card">
            {item.image && <img src={item.image} alt={item.name} />}
            <h2>{item.name}</h2>
            <p>{item.description}</p>
            <span className="price">{item.price}</span>
          </div>
        ))}
      </div>
    </div>
  );
};

const rootElement = document.getElementById("root");
if (!rootElement) {
  throw new Error("Failed to find the root element");
}
const root = createRoot(rootElement);
root.render(<App />);
