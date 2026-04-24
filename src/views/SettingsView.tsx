import React, { useState, useEffect } from 'react';
import { Lingua } from '../types';
import { getLinguas, addLingua } from '../services/dbService';
import { Plus, Loader2, Globe } from 'lucide-react';

export function SettingsView() {
  const [linguas, setLinguas] = useState<Lingua[]>([]);
  const [loading, setLoading] = useState(true);
  const [newCode, setNewCode] = useState('');
  const [newName, setNewName] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  const fetchLinguas = async () => {
    setLoading(true);
    try {
      const data = await getLinguas();
      setLinguas(data);
    } catch (err) {
      console.error('Failed to fetch linguas', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchLinguas();
  }, []);

  const handleAddLingua = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newCode.trim() || !newName.trim()) {
      setError('Por favor preencha todos os campos.');
      return;
    }

    setIsSubmitting(true);
    setError('');
    setSuccess('');

    try {
      const added = await addLingua({
        code: newCode.trim().toUpperCase(),
        name: newName.trim()
      });

      if (added) {
        setSuccess('Língua adicionada com sucesso!');
        setNewCode('');
        setNewName('');
        await fetchLinguas();
      } else {
        setError('Já existe uma língua com este código.');
      }
    } catch (err) {
      setError('Ocorreu um erro ao adicionar a língua.');
      console.error(err);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <div className="mb-8">
        <h1 className="text-2xl font-bold text-slate-900">Configurações Gerais</h1>
        <p className="mt-1 text-sm text-slate-500">
          Faça a gestão das definições base do sistema.
        </p>
      </div>

      <div className="bg-white shadow-sm rounded-xl border border-slate-200 overflow-hidden">
        <div className="px-6 py-5 border-b border-slate-200 bg-slate-50">
          <div className="flex items-center">
            <Globe className="h-5 w-5 text-indigo-500 mr-2" />
            <h3 className="text-lg font-medium text-slate-900">Gestão de Línguas</h3>
          </div>
          <p className="mt-1 text-sm text-slate-500">
            Adicione e consulte as línguas disponíveis para os cursos.
          </p>
        </div>

        <div className="p-6">
          {/* Add Form */}
          <form onSubmit={handleAddLingua} className="mb-8 bg-slate-50 p-4 rounded-lg border border-slate-200">
            <h4 className="text-sm font-medium text-slate-900 mb-4">Adicionar Nova Língua</h4>
            
            {error && (
              <div className="mb-4 p-3 bg-red-50 text-red-700 text-sm rounded-md border border-red-200">
                {error}
              </div>
            )}
            
            {success && (
              <div className="mb-4 p-3 bg-green-50 text-green-700 text-sm rounded-md border border-green-200">
                {success}
              </div>
            )}

            <div className="flex flex-col sm:flex-row gap-4 items-end">
              <div className="flex-1 w-full">
                <label className="block text-xs font-medium text-slate-700 mb-1">
                  Código (ex: MAN) *
                </label>
                <input
                  type="text"
                  required
                  maxLength={5}
                  value={newCode}
                  onChange={(e) => setNewCode(e.target.value.toUpperCase())}
                  className="w-full rounded-md border border-slate-300 px-3 py-2 text-sm focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500 uppercase"
                  placeholder="Código"
                />
              </div>
              <div className="flex-[2] w-full">
                <label className="block text-xs font-medium text-slate-700 mb-1">
                  Nome da Língua (ex: Mandarim) *
                </label>
                <input
                  type="text"
                  required
                  value={newName}
                  onChange={(e) => setNewName(e.target.value)}
                  className="w-full rounded-md border border-slate-300 px-3 py-2 text-sm focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500"
                  placeholder="Nome da Língua"
                />
              </div>
              <button
                type="submit"
                disabled={isSubmitting}
                className="w-full sm:w-auto inline-flex justify-center items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 disabled:opacity-50"
              >
                {isSubmitting ? (
                  <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                ) : (
                  <Plus className="h-4 w-4 mr-2" />
                )}
                Adicionar
              </button>
            </div>
          </form>

          {/* List */}
          <div>
            <h4 className="text-sm font-medium text-slate-900 mb-4">Línguas Registadas</h4>
            {loading ? (
              <div className="flex justify-center py-8">
                <Loader2 className="h-6 w-6 text-indigo-500 animate-spin" />
              </div>
            ) : linguas.length === 0 ? (
              <p className="text-sm text-slate-500 text-center py-4">Nenhuma língua registada.</p>
            ) : (
              <div className="border border-slate-200 rounded-lg overflow-hidden">
                <table className="min-w-full divide-y divide-slate-200">
                  <thead className="bg-slate-50">
                    <tr>
                      <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-slate-500 uppercase tracking-wider w-1/4">
                        Código
                      </th>
                      <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-slate-500 uppercase tracking-wider">
                        Nome da Língua
                      </th>
                    </tr>
                  </thead>
                  <tbody className="bg-white divide-y divide-slate-200">
                    {linguas.map((lingua) => (
                      <tr key={lingua.code} className="hover:bg-slate-50">
                        <td className="px-6 py-4 whitespace-nowrap text-sm font-mono font-medium text-indigo-600">
                          {lingua.code}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-slate-900">
                          {lingua.name}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
