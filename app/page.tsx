'use client';

import React, { useState, useEffect, useCallback } from 'react';
import { Header } from '@/components/Header';
import { MenuRelatorios } from '@/components/MenuRelatorios';
import { CadastroServicos } from '@/components/CadastroServicos';
import { HistoricoServicos } from '@/components/HistoricoServicos';
import { GerenciamentoClientes } from '@/components/GerenciamentoClientes';
import { ModalRelatorio } from '@/components/ModalRelatorio';
import { ModalFavoritaHoras } from '@/components/ModalFavoritaHoras';
import { ModalUploadLogo } from '@/components/ModalUploadLogo';
import { ModalAlterarSenha } from '@/components/ModalAlterarSenha';
import { ModalConexaoBanco } from '@/components/ModalConexaoBanco';
import { LoginScreen } from '@/components/LoginScreen';
import { PdfViewerModal } from '@/components/PdfViewerModal';
import { Cliente, Unidade, ServicoRealizadoCompleto, DadosPreviaRelatorio, Usuario } from '@/types';
import { CheckCircle2 } from 'lucide-react';

export default function Home() {
  const [abaAtiva, setAbaAtiva] = useState<'relatorios' | 'cadastro' | 'historico' | 'clientes'>('relatorios');

  // Autenticação & Sessão
  const [usuarioLogado, setUsuarioLogado] = useState<Usuario | null>(null);
  const [authChecada, setAuthChecada] = useState(false);
  const [modalAlterarSenhaAberto, setModalAlterarSenhaAberto] = useState(false);
  const [modalConexaoAberto, setModalConexaoAberto] = useState(false);

  // Estados dos Dados
  const [clientes, setClientes] = useState<Cliente[]>([]);
  const [unidades, setUnidades] = useState<Unidade[]>([]);
  const [servicos, setServicos] = useState<ServicoRealizadoCompleto[]>([]);
  const [carregando, setCarregando] = useState(true);

  // Estado do Logotipo Personalizado da Empresa
  const [customLogo, setCustomLogo] = useState<string | null>(null);
  const [modalUploadLogoAberto, setModalUploadLogoAberto] = useState(false);

  // Estados dos Modais
  const [modalRelatorioAberto, setModalRelatorioAberto] = useState(false);
  const [clienteSelecionadoRelatorio, setClienteSelecionadoRelatorio] = useState<Cliente | null>(null);
  const [unidadeSelecionadaRelatorio, setUnidadeSelecionadaRelatorio] = useState<Unidade | null>(null);
  const [modalFavoritaAberto, setModalFavoritaAberto] = useState(false);

  // Prévia na Tela & Visualizador de PDF
  const [modalPdfAberto, setModalPdfAberto] = useState(false);
  const [dadosPrevia, setDadosPrevia] = useState<DadosPreviaRelatorio | null>(null);
  const [pdfDataUri, setPdfDataUri] = useState<string | null>(null);
  const [pdfTitulo, setPdfTitulo] = useState('Relatório Técnico');

  // Serviço em edição (null = cadastro novo com campos vazios)
  const [servicoParaEdicao, setServicoParaEdicao] = useState<ServicoRealizadoCompleto | null>(null);

  // Notificações
  const [notificacao, setNotificacao] = useState<string | null>(null);

  // Recupera sessão persistida no início
  useEffect(() => {
    try {
      const sessaoSalva = localStorage.getItem('ferdata_user_session') || sessionStorage.getItem('ferdata_user_session');
      if (sessaoSalva) {
        const user = JSON.parse(sessaoSalva);
        if (user && user.username) {
          setUsuarioLogado(user);
        }
      }
    } catch (e) {
      console.error('Erro ao recuperar sessão:', e);
    } finally {
      setAuthChecada(true);
    }
  }, []);

  // Carrega logotipo personalizado do LocalStorage e do Servidor
  useEffect(() => {
    try {
      const localLogo = localStorage.getItem('ferdata_custom_logo');
      if (localLogo) {
        setCustomLogo(localLogo);
      }
    } catch {
      // Ignora
    }
    async function buscarLogoServidor() {
      try {
        const res = await fetch('/api/logo');
        const data = await res.json();
        if (data.success && data.logo) {
          setCustomLogo(data.logo);
          try {
            localStorage.setItem('ferdata_custom_logo', data.logo);
          } catch {
            // Ignora
          }
        }
      } catch (err) {
        console.error('Erro ao buscar logo do servidor:', err);
      }
    }
    buscarLogoServidor();
  }, []);

  // Função para carregar todos os dados do banco
  const carregarDados = useCallback(async () => {
    try {
      const [resClientes, resUnidades, resServicos] = await Promise.all([
        fetch('/api/clientes'),
        fetch('/api/unidades'),
        fetch('/api/servicos'),
      ]);
      const [dataClientes, dataUnidades, dataServicos] = await Promise.all([
        resClientes.json(),
        resUnidades.json(),
        resServicos.json(),
      ]);

      if (dataClientes.success) setClientes(dataClientes.data);
      if (dataUnidades.success) setUnidades(dataUnidades.data);
      if (dataServicos.success) setServicos(dataServicos.data);
    } catch (err) {
      console.error('Erro ao carregar dados do sistema:', err);
    } finally {
      setCarregando(false);
    }
  }, []);

  useEffect(() => {
    if (usuarioLogado) {
      carregarDados();
    }
  }, [usuarioLogado, carregarDados]);

  // Handler de Login com Sucesso
  const handleLoginSucesso = (user: Usuario, lembrar: boolean) => {
    setUsuarioLogado(user);
    try {
      const jsonUser = JSON.stringify(user);
      if (lembrar) {
        localStorage.setItem('ferdata_user_session', jsonUser);
      } else {
        sessionStorage.setItem('ferdata_user_session', jsonUser);
      }
    } catch (e) {
      console.error('Erro ao salvar sessão:', e);
    }
    setNotificacao(`Bem-vindo ao sistema, ${user.nome || user.username}!`);
    setTimeout(() => setNotificacao(null), 5000);
  };

  // Handler de Logout
  const handleLogout = () => {
    try {
      localStorage.removeItem('ferdata_user_session');
      sessionStorage.removeItem('ferdata_user_session');
    } catch {
      // Ignora
    }
    setUsuarioLogado(null);
  };

  // Handler para selecionar cliente para relatório a partir da Tela Inicial
  const handleSelecionarClienteParaRelatorio = (cliente: Cliente, unidade?: Unidade) => {
    setClienteSelecionadoRelatorio(cliente);
    setUnidadeSelecionadaRelatorio(unidade || null);
    setModalRelatorioAberto(true);
  };

  // Handler para abrir Prévia na Tela com dados estruturados completos
  const handleVisualizarRelatorio = (dadosRelatorio: DadosPreviaRelatorio) => {
    setDadosPrevia(dadosRelatorio);
    setPdfDataUri(dadosRelatorio.pdfDataUri || null);
    setPdfTitulo(dadosRelatorio.titulo);
    setModalPdfAberto(true);
  };

  // Handler de compatibilidade para abrir visualizador de PDF
  const handleVisualizarPdf = (uri: string, tituloRelatorio: string) => {
    setPdfDataUri(uri);
    setPdfTitulo(tituloRelatorio);
    setModalPdfAberto(true);
  };

  // Encontra a Favorita Transportes para o botão Favorita Horas
  const clienteFavorita = clientes.find((c) =>
    c.nome_empresa.toLowerCase().includes('favorita')
  ) || null;

  const unidadesFavorita = clienteFavorita
    ? unidades.filter((u) => u.id_cliente === clienteFavorita.id_cliente)
    : [];

  // Se a verificação inicial ainda está acontecendo, exibe loader suave
  if (!authChecada) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-slate-950 text-slate-100">
        <div className="text-center space-y-3">
          <div className="w-9 h-9 border-2 border-blue-500 border-t-transparent rounded-full animate-spin mx-auto" />
          <p className="text-xs text-slate-400">Iniciando sistema Ferdata Informática...</p>
        </div>
      </div>
    );
  }

  // Se o usuário não estiver logado, exibe a tela de login
  if (!usuarioLogado) {
    return (
      <LoginScreen
        onLoginSucesso={handleLoginSucesso}
        customLogo={customLogo}
      />
    );
  }

  return (
    <div className="min-h-screen flex flex-col bg-slate-950 text-slate-100">
      <Header
        abaAtiva={abaAtiva}
        setAbaAtiva={(aba) => {
          if (aba === 'cadastro') {
            setServicoParaEdicao(null);
          }
          setAbaAtiva(aba);
        }}
        totalServicos={servicos.length}
        totalClientes={clientes.length}
        customLogo={customLogo}
        onAbrirUploadLogo={() => setModalUploadLogoAberto(true)}
        usuarioAtual={usuarioLogado}
        onAbrirAlterarSenha={() => setModalAlterarSenhaAberto(true)}
        onLogout={handleLogout}
        onAbrirConexaoBanco={() => setModalConexaoAberto(true)}
      />

      {notificacao && (
        <div className="max-w-4xl mx-auto mt-4 px-4 w-full">
          <div className="p-3.5 rounded-xl bg-emerald-950/80 border border-emerald-600/60 text-emerald-200 text-xs flex items-center justify-between shadow-lg">
            <div className="flex items-center gap-2">
              <CheckCircle2 className="w-4 h-4 text-emerald-400" />
              <span>{notificacao}</span>
            </div>
            <button onClick={() => setNotificacao(null)} className="cursor-pointer">✕</button>
          </div>
        </div>
      )}

      <main className="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-6">
        {carregando ? (
          <div className="py-24 text-center space-y-3">
            <div className="w-8 h-8 border-2 border-blue-500 border-t-transparent rounded-full animate-spin mx-auto" />
            <p className="text-sm text-slate-400">Carregando dados da Ferdata Informática...</p>
          </div>
        ) : (
          <>
            {abaAtiva === 'relatorios' && (
              <MenuRelatorios
                clientes={clientes}
                unidades={unidades}
                onSelecionarClienteParaRelatorio={handleSelecionarClienteParaRelatorio}
                onAbrirCadastro={() => {
                  setServicoParaEdicao(null);
                  setAbaAtiva('cadastro');
                }}
                onAbrirFavoritaHoras={() => setModalFavoritaAberto(true)}
                totalServicos={servicos.length}
                onAbrirUploadLogo={() => setModalUploadLogoAberto(true)}
                customLogo={customLogo}
              />
            )}

            {abaAtiva === 'cadastro' && (
              <CadastroServicos
                clientes={clientes}
                unidades={unidades}
                onServicoCriado={carregarDados}
                servicosExistentes={servicos}
                servicoParaEdicao={servicoParaEdicao}
                onLimparEdicao={() => setServicoParaEdicao(null)}
                customLogo={customLogo}
              />
            )}

            {abaAtiva === 'historico' && (
              <HistoricoServicos
                servicos={servicos}
                clientes={clientes}
                unidades={unidades}
                onAtualizar={carregarDados}
                onEditarServico={(servico) => {
                  setServicoParaEdicao(servico);
                  setAbaAtiva('cadastro');
                }}
              />
            )}

            {abaAtiva === 'clientes' && (
              <GerenciamentoClientes
                clientes={clientes}
                unidades={unidades}
                onAtualizarDados={carregarDados}
              />
            )}
          </>
        )}
      </main>

      <footer className="border-t border-slate-900 bg-slate-950 py-4 text-center text-xs text-slate-500">
        <div className="max-w-7xl mx-auto px-4 flex flex-col sm:flex-row items-center justify-between gap-2">
          <p>© 2026 FERDATA INFORMÁTICA – Assistência Técnica Especializada – Osasco / SP</p>
          <p className="text-slate-400">
            Tel: (11) 3682-2562 / 3699-1815 – Rua Manoel José de Santana, 39 – Vila Yara
          </p>
        </div>
      </footer>

      <ModalRelatorio
        cliente={clienteSelecionadoRelatorio}
        unidade={unidadeSelecionadaRelatorio}
        todasUnidadesCliente={
          clienteSelecionadoRelatorio
            ? unidades.filter((u) => u.id_cliente === clienteSelecionadoRelatorio.id_cliente)
            : []
        }
        isOpen={modalRelatorioAberto}
        onClose={() => setModalRelatorioAberto(false)}
        onVisualizarRelatorio={handleVisualizarRelatorio}
        onVisualizarPdf={handleVisualizarPdf}
        customLogo={customLogo}
      />

      <ModalFavoritaHoras
        clienteFavorita={clienteFavorita}
        unidadesFavorita={unidadesFavorita}
        isOpen={modalFavoritaAberto}
        onClose={() => setModalFavoritaAberto(false)}
        onVisualizarRelatorio={handleVisualizarRelatorio}
        onVisualizarPdf={handleVisualizarPdf}
        customLogo={customLogo}
      />

      <ModalUploadLogo
        isOpen={modalUploadLogoAberto}
        onClose={() => setModalUploadLogoAberto(false)}
        logoAtual={customLogo}
        onLogoSalvo={(novoLogo) => {
          setCustomLogo(novoLogo);
          setNotificacao(
            novoLogo
              ? 'Logotipo da empresa atualizado com sucesso e incorporado ao menu e relatórios!'
              : 'Logotipo redefinido para o padrão oficial da Ferdata.'
          );
          setTimeout(() => setNotificacao(null), 5000);
        }}
      />

      <PdfViewerModal
        isOpen={modalPdfAberto}
        onClose={() => setModalPdfAberto(false)}
        dados={dadosPrevia}
        pdfDataUri={pdfDataUri}
        titulo={pdfTitulo}
        customLogo={customLogo}
      />

      {usuarioLogado && (
        <ModalAlterarSenha
          isOpen={modalAlterarSenhaAberto}
          onClose={() => setModalAlterarSenhaAberto(false)}
          usuarioAtual={usuarioLogado}
          onSenhaAlterada={(msg) => {
            setNotificacao(msg);
            setTimeout(() => setNotificacao(null), 5000);
          }}
        />
      )}

      <ModalConexaoBanco
        isOpen={modalConexaoAberto}
        onClose={() => setModalConexaoAberto(false)}
        onDadosAtualizados={carregarDados}
      />
    </div>
  );
}
