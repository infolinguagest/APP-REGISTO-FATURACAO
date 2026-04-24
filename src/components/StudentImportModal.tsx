import React, { useState, useEffect } from 'react';
import { X, Loader2, Upload, CheckCircle } from 'lucide-react';
import { Empresa, Student, Lingua } from '../types';
import { getEmpresas, getStudents, addAluno, updateAluno, getLinguas } from '../services/dbService';
import { useToast } from '../contexts/ToastContext';

interface StudentImportModalProps {
  isOpen: boolean;
  onClose: () => void;
  onUpdate: () => void;
}

export function StudentImportModal({ isOpen, onClose, onUpdate }: StudentImportModalProps) {
  const { showToast } = useToast();
  const [empresas, setEmpresas] = useState<Empresa[]>([]);
  const [linguasList, setLinguasList] = useState<Lingua[]>([]);
  const [selectedEmpresaId, setSelectedEmpresaId] = useState('');
  const [selectedLingua, setSelectedLingua] = useState('');
  const [textValue, setTextValue] = useState('');
  const [hasNumeroAluno, setHasNumeroAluno] = useState(false);
  const [isProcessing, setIsProcessing] = useState(false);
  const [result, setResult] = useState<{ criados: number; atualizados: number } | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [importLog, setImportLog] = useState<{nome: string, email: string, isNew: boolean, missingMBB: boolean}[]>([]);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const [empresasData, linguasData] = await Promise.all([
          getEmpresas(),
          getLinguas()
        ]);
        setEmpresas(empresasData);
        setLinguasList(linguasData);
      } catch (error) {
        console.error('Failed to fetch data', error);
      }
    };
    
    if (isOpen) {
      fetchData();
      window.addEventListener('focus', fetchData);
      
      // Reset state on open
      setSelectedEmpresaId('');
      setSelectedLingua('');
      setTextValue('');
      setHasNumeroAluno(false);
      setResult(null);
      setError(null);
      setImportLog([]);
    }
    
    return () => {
      window.removeEventListener('focus', fetchData);
    };
  }, [isOpen]);

  const handleProcess = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedEmpresaId || !selectedLingua || !textValue.trim()) return;

    setIsProcessing(true);
    setError(null);
    let criados = 0;
    let atualizados = 0;
    const currentLog: {nome: string, email: string, isNew: boolean, missingMBB: boolean}[] = [];

    try {
      const alunosAtuais = await getStudents();
      const rows = textValue.split('\n');

      for (const row of rows) {
        if (!row.trim()) continue;

        const cells = row.split('\t').map(c => c.trim());
        const emailIndex = cells.findIndex(c => c.includes('@'));

        if (emailIndex === -1) continue;

        const email = cells[emailIndex].toLowerCase();
        const nivel = cells[emailIndex + 1] || '';
        const nivelFormatado = nivel ? `${selectedLingua}:${nivel}` : '';
        
        let numeroAluno = '';
        let nome = '';

        if (hasNumeroAluno) {
          numeroAluno = cells[0];
          nome = cells.slice(1, emailIndex).join(' ').trim();
        } else {
          nome = cells.slice(0, emailIndex).join(' ').trim();
        }

        if (!nome || !email || email.trim() === '') continue;
        if (!email.includes('@') || !email.includes('.')) continue;

        const existingStudent = alunosAtuais.find(a => a.email.toLowerCase() === email);

        if (existingStudent) {
          const updateData: Partial<Student> = {
            empresaId: selectedEmpresaId
          };
          
          if (numeroAluno) {
            updateData.numeroAluno = numeroAluno;
          }

          const currentNiveis = existingStudent.niveis || [];
          const filteredNiveis = currentNiveis.filter(n => !n.startsWith(`${selectedLingua}:`));
          
          if (nivelFormatado) {
            filteredNiveis.push(nivelFormatado);
          }
          updateData.niveis = filteredNiveis;

          await updateAluno(existingStudent.id, updateData);
          atualizados++;
          
          const isMissing = !updateData.numeroAluno && !existingStudent.numeroAluno;
          currentLog.push({ nome, email, isNew: false, missingMBB: !!isMissing });
        } else {
          await addAluno({
            nome,
            email,
            niveis: nivelFormatado ? [nivelFormatado] : [],
            empresaId: selectedEmpresaId,
            numeroAluno: numeroAluno
          });
          criados++;
          
          const isMissing = !numeroAluno;
          currentLog.push({ nome, email, isNew: true, missingMBB: !!isMissing });
        }
      }

      setResult({ criados, atualizados });
      setImportLog(currentLog);
      onUpdate();
      showToast(`Importação concluída: ${criados} criados, ${atualizados} atualizados.`, 'success');
    } catch (err) {
      console.error('Erro na importação:', err);
      setError("Ocorreu um erro inesperado ao processar os dados. Verifique se o formato copiado está correto e tente novamente.");
      showToast('Erro ao importar alunos.', 'error');
    } finally {
      setIsProcessing(false);
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 sm:p-6">
      <div className="absolute inset-0 bg-slate-900/60 backdrop-blur-sm transition-opacity" onClick={onClose} />
      
      <div className="relative bg-white rounded-xl shadow-2xl w-full max-w-2xl flex flex-col animate-in fade-in zoom-in-95 duration-200">
        <div className="px-6 py-5 border-b border-slate-200 flex items-center justify-between bg-white rounded-t-xl shrink-0">
          <h2 className="text-xl font-bold text-slate-900 flex items-center">
            <Upload className="h-5 w-5 mr-2 text-indigo-600" />
            Importar Lista de Alunos
          </h2>
          <button onClick={onClose} className="text-slate-400 hover:text-slate-600 transition-colors rounded-full p-2 hover:bg-slate-100">
            <X className="h-6 w-6" />
          </button>
        </div>

        <div className="p-6 overflow-y-auto max-h-[calc(100vh-10rem)]">
          {result ? (
            <div className="flex flex-col items-center justify-center py-4 space-y-4">
              <h3 className="text-xl font-bold text-slate-900">Processamento concluído!</h3>
              <div className="flex justify-center gap-6 bg-slate-50 border border-slate-200 rounded-lg p-3 w-full max-w-md text-center text-sm">
                <p className="text-slate-700">Novos criados: <strong className="text-indigo-600 text-base">{result.criados}</strong></p>
                <p className="text-slate-700">Atualizados: <strong className="text-indigo-600 text-base">{result.atualizados}</strong></p>
              </div>
              
              {importLog.length > 0 && (
                <div className="w-full flex flex-col border border-slate-200 rounded-lg overflow-hidden mt-2 text-sm text-left">
                  <div className="bg-slate-100 px-4 py-3 border-b border-slate-200">
                    <h4 className="font-semibold text-slate-800">Detalhe da Importação</h4>
                  </div>
                  <div className="max-h-[50vh] overflow-y-auto bg-white">
                    <div className="divide-y divide-slate-100">
                      {importLog.map((log, index) => (
                        <div key={index} className="flex justify-between items-center px-4 py-3 hover:bg-slate-50">
                          <div className="flex flex-col">
                            <span className="font-semibold text-slate-800">{log.nome}</span>
                            <span className="text-slate-500 text-xs">{log.email}</span>
                          </div>
                          <div className="flex items-center space-x-3">
                            {log.missingMBB && (
                              <span className="text-red-600 font-medium text-xs">Falta Nº Aluno</span>
                            )}
                            <span className={`px-2 py-1 rounded-full text-xs font-medium ${log.isNew ? 'bg-blue-100 text-blue-800' : 'bg-slate-200 text-slate-700'}`}>
                              {log.isNew ? 'Novo' : 'Atualizado'}
                            </span>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>
              )}
            </div>
          ) : (
            <form id="import-form" onSubmit={handleProcess} className="space-y-5">
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1">Empresa de Destino *</label>
                <select
                  required
                  value={selectedEmpresaId}
                  onChange={(e) => setSelectedEmpresaId(e.target.value)}
                  className="w-full rounded-md border border-slate-300 px-3 py-2 text-sm focus:border-indigo-500 focus:outline-none focus:ring-1 focus:ring-indigo-500"
                >
                  <option value="">-- Selecionar Empresa --</option>
                  {empresas.map(emp => (
                    <option key={emp.id} value={emp.id}>{emp.nome}</option>
                  ))}
                </select>
                <p className="mt-1 text-xs text-slate-500">Todos os alunos importados ficarão associados a esta empresa.</p>
              </div>

              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1">Língua Padrão da Lista *</label>
                <select
                  required
                  value={selectedLingua}
                  onChange={(e) => setSelectedLingua(e.target.value)}
                  className="w-full rounded-md border border-slate-300 px-3 py-2 text-sm focus:border-indigo-500 focus:outline-none focus:ring-1 focus:ring-indigo-500"
                >
                  <option value="">-- Selecionar Língua --</option>
                  {linguasList.map(lang => (
                    <option key={lang.code} value={lang.code}>{lang.name}</option>
                  ))}
                </select>
                <p className="mt-1 text-xs text-slate-500">A língua associada ao nível extraído do Excel.</p>
              </div>

              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1">Dados (Copiar do Excel) *</label>
                
                {error && (
                  <div className="mb-4 p-3 bg-red-50 border border-red-200 text-red-700 rounded-md text-sm">
                    {error}
                  </div>
                )}

                <div className="flex items-center mt-2 mb-3">
                  <input
                    type="checkbox"
                    id="hasNumeroAluno"
                    checked={hasNumeroAluno}
                    onChange={(e) => setHasNumeroAluno(e.target.checked)}
                    className="h-4 w-4 text-indigo-600 focus:ring-indigo-500 border-slate-300 rounded"
                  />
                  <label htmlFor="hasNumeroAluno" className="ml-2 block text-sm text-slate-700">
                    A primeira coluna copiada é o Nº Aluno (MyBlueBee)
                  </label>
                </div>

                <textarea
                  required
                  value={textValue}
                  onChange={(e) => setTextValue(e.target.value)}
                  placeholder="Copie do Excel e cole aqui..."
                  className="w-full rounded-md border border-slate-300 px-3 py-2 text-sm focus:border-indigo-500 focus:outline-none focus:ring-1 focus:ring-indigo-500 h-64 font-mono whitespace-pre"
                />
                <div className="mt-2 bg-blue-50 border border-blue-100 rounded-md p-3">
                  <h4 className="text-xs font-semibold text-blue-800 uppercase tracking-wider mb-1">Formato Esperado (Colunas)</h4>
                  <ol className="list-decimal list-inside text-xs text-blue-700 space-y-1">
                    {hasNumeroAluno && <li><strong>Nº Aluno</strong> (Opcional)</li>}
                    <li><strong>Nome(s)</strong> (Pode ocupar várias colunas)</li>
                    <li><strong>Email</strong> (Obrigatório, detetado pelo @)</li>
                    <li><strong>Nível Atual</strong> (Opcional, coluna a seguir ao email)</li>
                  </ol>
                </div>
              </div>
            </form>
          )}
        </div>

        <div className="px-6 py-4 border-t border-slate-200 bg-slate-50 rounded-b-xl flex justify-end space-x-3">
          {result ? (
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
            >
              Fechar
            </button>
          ) : (
            <>
              <button
                type="button"
                onClick={onClose}
                className="px-4 py-2 border border-slate-300 text-sm font-medium rounded-md text-slate-700 bg-white hover:bg-slate-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
              >
                Cancelar
              </button>
              <button
                type="submit"
                form="import-form"
                disabled={isProcessing || !selectedEmpresaId || !selectedLingua || !textValue.trim()}
                className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 disabled:opacity-50"
              >
                {isProcessing ? (
                  <>
                    <Loader2 className="h-4 w-4 animate-spin mr-2" />
                    A processar...
                  </>
                ) : (
                  <>
                    <Upload className="h-4 w-4 mr-2" />
                    Processar Importação
                  </>
                )}
              </button>
            </>
          )}
        </div>
      </div>
    </div>
  );
}
