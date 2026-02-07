import { useEffect, useState } from "react";
import "./App.css";

const categoryMap = {
  motivation: "success",
  life: "life",
  love: "love",
  work: "work",
};

export default function App() {
  const [advice, setAdvice] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [history, setHistory] = useState([]);
  const [category, setCategory] = useState("motivation");
  const [dark, setDark] = useState(false);
  const [toast, setToast] = useState("");

  useEffect(() => {
    const saved = JSON.parse(localStorage.getItem("adviceHistory")) || [];
    setHistory(saved);
  }, []);

  const getAdvice = async () => {
    setLoading(true);
    setError("");

    try {
      const query = categoryMap[category];
      const res = await fetch(
        `https://api.adviceslip.com/advice/search/${query}`
      );
      const data = await res.json();

      if (!data.slips) {
        setError("No advice found for this category.");
        setLoading(false);
        return;
      }

      // Pick random advice & avoid repetition
      let randomAdvice;
      let attempts = 0;

      do {
        randomAdvice =
          data.slips[Math.floor(Math.random() * data.slips.length)].advice;
        attempts++;
      } while (history.includes(randomAdvice) && attempts < 5);

      setAdvice(randomAdvice);

      const updated = [randomAdvice, ...history].slice(0, 5);
      setHistory(updated);
      localStorage.setItem("adviceHistory", JSON.stringify(updated));
    } catch {
      setError("Failed to fetch advice. Try again.");
    } finally {
      setLoading(false);
    }
  };

  /*const copyAdvice = () => {
    navigator.clipboard.writeText(advice);
    alert("Advice copied!");
  };*/
    
  const copyAdvice = () => {
  navigator.clipboard.writeText(advice);
  setToast("Advice copied!");
  setTimeout(() => setToast(""), 2000);
  };

  const clearHistory = () => {
    setHistory([]);
    localStorage.removeItem("adviceHistory");
  };

  return (
    <div className={`container ${dark ? "dark" : ""}`}>
      <h2>💬 Advice Generator</h2>

      <button onClick={() => setDark(!dark)}>
        {dark ? "Light Mode" : "Dark Mode"}
      </button>


      <select value={category} onChange={(e) => setCategory(e.target.value)}>
        <option value="motivation">Motivation</option>
        <option value="life">Life</option>
        <option value="love">Love</option>
        <option value="work">Work</option>
      </select>

      <div className="card">
        {loading && <p>Loading...</p>}
        {error && <p className="error">{error}</p>}
        {!loading && !error && advice && <p>"{advice}"</p>}
        {toast && <div className="toast">{toast}</div>}
      </div>

      <div className="buttons">
        <button onClick={getAdvice}>Get Advice</button>
        <button onClick={copyAdvice} disabled={!advice}>
          Copy
        </button>
      </div>

      {history.length > 0 && (
        <div className="history">
          <h4>Previous Advice</h4>
          {history.map((a, i) => (
            <div key={i} className="history-item">
              {a}
            </div>
          ))}
          <button className="clear" onClick={clearHistory}>
            Clear History
          </button>
        </div>
      )}
    </div>
  );
}
