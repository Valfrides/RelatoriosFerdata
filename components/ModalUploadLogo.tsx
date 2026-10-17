'use client';

import React, { useState, useRef, useEffect } from 'react';
import Image from 'next/image';
import { Upload, X, CheckCircle, RotateCcw, Image as ImageIcon, Sparkles, Check } from 'lucide-react';
import { LOGO_FERDATA_PNG_BASE64 } from '@/lib/logo-base64';

interface ModalUploadLogoProps {
  isOpen: boolean;
  onClose: () => void;
  logoAtual: string | null;
  onLogoSalvo: (novoLogoBase64: string | null) => void;
}

export function ModalUploadLogo({
  isOpen,
  onClose,
  logoAtual,
  onLogoSalvo,
}: ModalUploadLogoProps) {
  const [preview, setPreview] = useState<string | null>(logoAtual);
  const [salvando, setSalvando] = useState(false);
  const [mensagemSucesso, setMensagemSucesso] = useState<string | null>(null);
  const [erro, setErro] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    setPreview(logoAtual);
    setMensagemSucesso(null);
    setErro(null);
  }, [logoAtual, isOpen]);

  if (!isOpen) return null;

  const processarArquivoImagem = (file: File) => {
    if (!file.type.startsWith('image/')) {
      setErro('Por favor, selecione um arquivo de imagem válido (PNG, JPG, WEBP, SVG).');
      return;
    }
    setErro(null);
    const reader = new FileReader();
    reader.onload = (event) => {
      const img = new window.Image();
      img.onload = () => {
        const maxDim = 500;
        let w = img.width;
        let h = img.height;
        if (w > maxDim || h > maxDim) {
          if (w > h) {
            h = Math.round((h * maxDim) / w);
            w = maxDim;
          } else {
            w = Math.round((w * maxDim) / h);
            h = maxDim;
          }
        }
        const canvas = document.createElement('canvas');
        canvas.width = w;
        canvas.height = h;
        const ctx = canvas.getContext('2d');
        if (ctx) {
          ctx.imageSmoothingEnabled = true;
          ctx.imageSmoothingQuality = 'high';
          ctx.drawImage(img, 0, 0, w, h);
          const pngDataUrl = canvas.toDataURL('image/png', 0.9);
          setPreview(pngDataUrl);
          setMensagemSucesso('Imagem carregada e otimizada! Clique em "Salvar Logotipo" para aplicar.');
        } else {
          setPreview(event.target?.result as string);
        }
      };
      img.src = event.target?.result as string;
    };
    reader.readAsDataURL(file);
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      processarArquivoImagem(file);
    }
  };

  const handleSalvar = async () => {
    if (!preview) return;
    setSalvando(true);
    setErro(null);
    try {
      // 1. Salva imediatamente no localStorage para garantir que a interface atualize na hora
      try {
        localStorage.setItem('ferdata_custom_logo', preview);
      } catch (storageErr) {
        console.warn('Aviso sobre localStorage:', storageErr);
      }

      // 2. Salva no Supabase através da rota de API persistente
      const res = await fetch('/api/logo', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ logo: preview }),
      });

      const data = await res.json();
      if (data.success) {
        onLogoSalvo(preview);
        setMensagemSucesso('Logotipo salvo e sincronizado com sucesso com o banco de dados!');
        setTimeout(() => {
          onClose();
        }, 900);
      } else {
        // Aplica na sessão e avisa
        onLogoSalvo(preview);
        setErro(data.error || 'Erro ao sincronizar logotipo no banco de dados.');
      }
    } catch (err: any) {
      console.error('Erro ao salvar logo:', err);
      // Fallback: mesmo com erro de rede externa, aplica na sessão local
      onLogoSalvo(preview);
      setMensagemSucesso('Logotipo aplicado na sessão local com sucesso!');
      setTimeout(() => {
        onClose();
      }, 900);
    } finally {
      setSalvando(false);
    }
  };

  const handleResetar = async () => {
    setSalvando(true);
    setErro(null);
    try {
      await fetch('/api/logo', { method: 'DELETE' });
      try {
        localStorage.removeItem('ferdata_custom_logo');
      } catch {
        // Ignora
      }
      setPreview(null);
      onLogoSalvo(null);
      setMensagemSucesso('Logotipo redefinido para o padrão oficial.');
      setTimeout(() => {
        onClose();
      }, 800);
    } catch (err) {
      console.error('Erro ao resetar logo:', err);
      setErro('Falha ao restaurar logotipo padrão.');
    } finally {
      setSalvando(false);
    }
  };

  const handleUsarOficialAnexado = () => {
    setPreview(LOGO_FERDATA_PNG_BASE64);
    setMensagemSucesso('Logotipo Oficial Ferdata selecionado! Clique em Salvar para aplicar.');
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-black/80 backdrop-blur-sm animate-in fade-in duration-150">
      <div className="bg-slate-900 border border-slate-700 rounded-2xl w-full max-w-lg p-5 sm:p-6 space-y-4 sm:space-y-5 shadow-2xl max-h-[94vh] flex flex-col overflow-hidden">
        <div className="flex items-center justify-between pb-3 border-b border-slate-800 shrink-0">
          <div className="flex items-center gap-2.5">
            <div className="p-2 rounded-xl bg-blue-600/20 text-blue-400">
              <Upload className="w-5 h-5" />
            </div>
            <div>
              <h3 className="font-bold text-white text-base">Personalizar Logotipo da Empresa</h3>
              <p className="text-xs text-slate-400">
                Envie o logotipo para atualizar o menu do aplicativo e os relatórios em PDF
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="text-slate-400 hover:text-white p-1 rounded-lg hover:bg-slate-800 transition cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {mensagemSucesso && (
          <div className="p-3 bg-emerald-950/70 border border-emerald-600/60 rounded-xl text-emerald-200 text-xs flex items-center gap-2 shrink-0">
            <CheckCircle className="w-4 h-4 text-emerald-400 shrink-0" />
            <span>{mensagemSucesso}</span>
          </div>
        )}
        {erro && (
          <div className="p-3 bg-red-950/70 border border-red-600/60 rounded-xl text-red-200 text-xs flex items-center gap-2 shrink-0">
            <X className="w-4 h-4 text-red-400 shrink-0" />
            <span>{erro}</span>
          </div>
        )}

        <div className="space-y-4 overflow-y-auto flex-1 pr-1">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div className="p-3.5 bg-slate-950 rounded-xl border border-slate-800 flex flex-col items-center justify-between space-y-2">
              <span className="text-[11px] font-semibold text-slate-400 uppercase tracking-wider">
                Menu do Sistema
              </span>
              <div className="w-16 h-16 rounded-xl bg-slate-900 border border-slate-800 flex items-center justify-center p-1.5 shadow">
                {preview ? (
                  <img
                    src={preview}
                    alt="Logo Prévia"
                    className="w-full h-full object-contain"
                  />
                ) : (
                  <Image
                    src="/logo_ferdata.svg"
                    alt="Logo Padrão"
                    width={48}
                    height={48}
                    className="w-12 h-12 object-contain"
                  />
                )}
              </div>
              <span className="text-[10px] text-slate-500 text-center">
                Visualização no cabeçalho
              </span>
            </div>

            <div className="p-3.5 bg-white rounded-xl border border-slate-300 flex flex-col items-center justify-between space-y-2 shadow-sm text-slate-800">
              <span className="text-[11px] font-bold text-slate-600 uppercase tracking-wider">
                Documento PDF
              </span>
              <div className="flex items-center gap-2 w-full justify-center py-1">
                <div className="w-12 h-12 flex items-center justify-center">
                  {preview ? (
                    <img
                      src={preview}
                      alt="Logo Relatório"
                      className="w-full h-full object-contain"
                    />
                  ) : (
                    <Image
                      src="/logo_ferdata.svg"
                      alt="Logo Padrão"
                      width={44}
                      height={44}
                      className="w-10 h-10 object-contain"
                    />
                  )}
                </div>
                <div className="text-left text-[9px] leading-tight">
                  <p className="font-extrabold text-slate-900">FERDATA</p>
                  <p className="text-blue-600 font-bold">ASSISTÊNCIA TÉCNICA</p>
                  <p className="text-slate-500 text-[8px]">Osasco - SP</p>
                </div>
              </div>
              <span className="text-[10px] text-slate-500 text-center">
                Visualização no relatório impresso
              </span>
            </div>
          </div>

          <div className="space-y-2.5">
            <input
              type="file"
              ref={fileInputRef}
              onChange={handleFileChange}
              accept="image/png,image/jpeg,image/svg+xml,image/webp"
              className="hidden"
            />
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
              <button
                type="button"
                onClick={() => fileInputRef.current?.click()}
                className="flex items-center justify-center gap-2 px-4 py-2.5 bg-blue-600 hover:bg-blue-500 text-white rounded-xl text-xs font-bold shadow-md shadow-blue-600/30 transition cursor-pointer"
              >
                <ImageIcon className="w-4 h-4" />
                <span>Escolher Imagem do PC...</span>
              </button>
              <button
                type="button"
                onClick={handleUsarOficialAnexado}
                className="flex items-center justify-center gap-2 px-4 py-2.5 bg-slate-800 hover:bg-slate-700 text-slate-200 rounded-xl text-xs font-semibold border border-slate-700 transition cursor-pointer"
              >
                <Sparkles className="w-4 h-4 text-blue-400" />
                <span>Usar Logo Oficial da Empresa</span>
              </button>
            </div>
            <p className="text-[11px] text-slate-400 text-center">
              Você pode fazer upload de qualquer imagem nos formatos PNG, JPG, JPEG, WEBP ou SVG.
            </p>
          </div>
        </div>

        <div className="flex items-center justify-between pt-3 border-t border-slate-800 shrink-0">
          <button
            type="button"
            onClick={handleResetar}
            disabled={salvando}
            className="flex items-center gap-1.5 px-3 py-1.5 text-xs text-slate-400 hover:text-white rounded-lg hover:bg-slate-800 transition cursor-pointer"
          >
            <RotateCcw className="w-3.5 h-3.5" />
            <span>Restaurar Padrão</span>
          </button>
          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={onClose}
              className="px-3.5 py-1.5 text-xs text-slate-300 hover:text-white rounded-lg hover:bg-slate-800 transition cursor-pointer"
            >
              Fechar
            </button>
            <button
              type="button"
              onClick={handleSalvar}
              disabled={salvando || !preview}
              className="flex items-center gap-1.5 px-5 py-2 bg-emerald-600 hover:bg-emerald-500 disabled:opacity-50 text-white rounded-xl text-xs font-bold transition shadow-lg shadow-emerald-600/30 cursor-pointer"
            >
              <Check className="w-4 h-4" />
              <span>{salvando ? 'Salvando...' : 'Salvar Logotipo'}</span>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
