import React, { useState, useEffect } from 'react'
import { CATEGORIAS_PADRAO } from '../utils/categorias';

export default function LimitForm({ onSubmit, initial }) {
  const [category, setCategory] = useState(initial?.category || '');
  const [categoryEmoji, setCategoryEmoji] = useState(initial?.categoryEmoji || '');
  const [isCustomCategory, setIsCustomCategory] = useState(false);
  const [limitValue, setLimitValue] = useState(initial?.limitValue ?? 0);
  const [usedValue, setUsedValue] = useState(initial?.usedValue ?? 0);

  useEffect(() => {
    setCategory(initial?.category || '');
    setCategoryEmoji(initial?.categoryEmoji || '');
    setIsCustomCategory(false);
    setLimitValue(initial?.limitValue ?? 0);
    setUsedValue(initial?.usedValue ?? 0);
  }, [initial]);

  const percentage = limitValue ? Math.round((usedValue / limitValue) * 100) : 0;

  const handleSubmit = (e) => {
    e.preventDefault();
    const categoriaFinal = isCustomCategory ? category : category;
    const emojiFinal = isCustomCategory ? categoryEmoji : (CATEGORIAS_PADRAO.find(c => c.nome === category)?.emoji || '');
    onSubmit({ category: categoriaFinal, categoryEmoji: emojiFinal, limitValue: Number(limitValue), usedValue: Number(usedValue), percentage });
  };

  return (
    <form onSubmit={handleSubmit} className="grid gap-3">
      <div>
        <label className="block text-sm mb-2 font-semibold">Categoria</label>
        <div className="flex gap-2">
          <select
            value={isCustomCategory ? 'custom' : category}
            onChange={e => {
              if (e.target.value === 'custom') {
                setIsCustomCategory(true);
                setCategory('');
                setCategoryEmoji('');
              } else {
                setIsCustomCategory(false);
                setCategory(e.target.value);
                setCategoryEmoji(CATEGORIAS_PADRAO.find(c => c.nome === e.target.value)?.emoji || '');
              }
            }}
            className="w-full border rounded px-3 py-2"
            required
          >
            <option value="">Selecione...</option>
            {CATEGORIAS_PADRAO.map(cat => (
              <option key={cat.nome} value={cat.nome}>{cat.emoji} {cat.nome}</option>
            ))}
            <option value="custom">+ Nova categoria</option>
          </select>
        </div>
        {isCustomCategory && (
          <div className="mt-2 flex gap-2 items-center">
            <input
              value={category}
              onChange={e => setCategory(e.target.value)}
              placeholder="Nome da categoria"
              className="w-2/3 border rounded px-3 py-2"
              required
            />
            <input
              value={categoryEmoji}
              onChange={e => setCategoryEmoji(e.target.value)}
              placeholder="Emoji"
              maxLength={2}
              className="w-1/3 border rounded px-3 py-2 text-center text-2xl"
              required
            />
          </div>
        )}
      </div>
      <input value={limitValue} onChange={(e) => setLimitValue(e.target.value)} type="number" step="0.01" className="border rounded px-3 py-2" />
      <input value={usedValue} onChange={(e) => setUsedValue(e.target.value)} type="number" step="0.01" className="border rounded px-3 py-2" />
      <div className="text-sm text-gray-600">Percentual: {percentage}%</div>
      <div>
        <button type="submit" className="button-primary">Salvar</button>
      </div>
    </form>
  );
}
