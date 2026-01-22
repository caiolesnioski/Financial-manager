
import React, { useState, useEffect } from 'react';
import EntryForm from '../components/EntryForm';
import { useEntries } from '../hooks/useEntries';
import { useAccounts } from '../hooks/useAccounts';
import { CheckCircle, AlertCircle } from 'lucide-react';

export default function NewEntry() {
  const { create, loading } = useEntries();
  const { accounts } = useAccounts();
  const [success, setSuccess] = useState(false);
  const [error, setError] = useState(null);
  const [formKey, setFormKey] = useState(0);

  // Auto-dismiss success message after 3 seconds
  useEffect(() => {
    if (success) {
      const timer = setTimeout(() => {
        setSuccess(false);
      }, 3000);
      return () => clearTimeout(timer);
    }
  }, [success]);

  // Auto-dismiss error message after 5 seconds
  useEffect(() => {
    if (error) {
      const timer = setTimeout(() => {
        setError(null);
      }, 5000);
      return () => clearTimeout(timer);
    }
  }, [error]);

  const handleSubmit = async (data) => {
    setError(null);
    setSuccess(false);
    
    try {
      const { error: saveError } = await create(data);
      if (saveError) {
        setError(saveError.message || 'Erro ao salvar lançamento. Tente novamente.');
      } else {
        setSuccess(true);
        // Reset form by changing key
        setFormKey(prev => prev + 1);
      }
    } catch (err) {
      setError(err.message || 'Erro desconhecido ao salvar lançamento.');
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 p-4 md:p-8">
      <div className="max-w-2xl mx-auto">
        <h1 className="text-3xl font-bold text-gray-900 mb-2">Novo Lançamento</h1>
        <p className="text-gray-600 mb-8">Registre uma despesa, receita ou transferência</p>
        
        {success && (
          <div className="flex items-center gap-3 bg-green-50 border-2 border-green-200 text-green-800 px-4 py-3 rounded-lg mb-6 animate-fade-in">
            <CheckCircle size={20} className="flex-shrink-0" />
            <span className="font-medium">Lançamento salvo com sucesso!</span>
          </div>
        )}
        
        {error && (
          <div className="flex items-center gap-3 bg-red-50 border-2 border-red-200 text-red-800 px-4 py-3 rounded-lg mb-6 animate-fade-in">
            <AlertCircle size={20} className="flex-shrink-0" />
            <span className="font-medium">{error}</span>
          </div>
        )}
        
        <EntryForm key={formKey} onSubmit={handleSubmit} accounts={accounts} loading={loading} />
      </div>
    </div>
  );
}
