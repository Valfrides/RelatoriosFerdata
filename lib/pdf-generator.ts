import jsPDF from 'jspdf';
import autoTable from 'jspdf-autotable';
import { ServicoRealizadoCompleto } from '@/types';

export interface ParametrosRelatorioPDF {
  clienteNome: string;
  contatoAC: string;
  unidadeNome?: string;
  servicos: ServicoRealizadoCompleto[];
  dataInicio?: string;
  dataFim?: string;
  dataEmissao?: Date;
  customLogo?: string | null;
}

export interface ParametrosRelatorioFavoritaHorasPDF {
  clienteNome: string;
  contatoAC: string;
  unidadeNome?: string;
  servicos: ServicoRealizadoCompleto[];
  dataInicio?: string;
  dataFim?: string;
  horasContratadas?: number;
  dataEmissao?: Date;
  customLogo?: string | null;
}

// Formata data ISO (YYYY-MM-DD) para formato brasileiro (DD/MM/YYYY)
export function formatarDataBR(dataIso: string): string {
  if (!dataIso) return '';
  const partes = dataIso.split('-');
  if (partes.length === 3) {
    return `${partes[2]}/${partes[1]}/${partes[0]}`;
  }
  return dataIso;
}

// Formata quantidade de horas no padrão brasileiro (ex: 8 ou 8,25 ou 8,50)
export function formatarHorasBR(horas: number): string {
  if (horas === undefined || horas === null || isNaN(horas)) return '0';
  if (Number.isInteger(horas)) {
    return horas.toString();
  }
  return horas.toFixed(2).replace('.', ',');
}

// Formata a data atual por extenso em português (ex: "terça-feira, 29 de setembro de 2026")
export function formatarDataExtenso(data: Date = new Date()): string {
  const diasDaSemana = [
    'domingo',
    'segunda-feira',
    'terça-feira',
    'quarta-feira',
    'quinta-feira',
    'sexta-feira',
    'sábado',
  ];
  const meses = [
    'janeiro',
    'fevereiro',
    'março',
    'abril',
    'maio',
    'junho',
    'julho',
    'agosto',
    'setembro',
    'outubro',
    'novembro',
    'dezembro',
  ];
  const diaSemana = diasDaSemana[data.getDay()];
  const dia = data.getDate();
  const mes = meses[data.getMonth()];
  const ano = data.getFullYear();
  return `${diaSemana}, ${dia} de ${mes} de ${ano}`;
}

// Desenha o logotipo estilizado da Ferdata Informática
function desenharLogoFerdata(doc: jsPDF, x: number, y: number, tamanho: number = 18) {
  const s = tamanho / 100;
  // Caixa com fundo azul royal brilhante oficial (#0047e1)
  doc.setFillColor(0, 71, 225);
  doc.roundedRect(x, y, tamanho, tamanho, tamanho * 0.16, tamanho * 0.16, 'F');

  // Letra/Símbolo estilizado em branco puro
  doc.setFillColor(255, 255, 255);
  // Barra Horizontal Superior
  doc.roundedRect(x + 36 * s, y + 7.5 * s, 52 * s, 15 * s, 7.5 * s, 7.5 * s, 'F');
  doc.rect(x + 36 * s, y + 7.5 * s, 25 * s, 15 * s, 'F');

  // Coluna Principal Inclinada
  doc.triangle(
    x + 6.5 * s, y + 91.5 * s,
    x + 22 * s, y + 24 * s,
    x + 34 * s, y + 24 * s,
    'F'
  );
  doc.triangle(
    x + 6.5 * s, y + 91.5 * s,
    x + 34 * s, y + 24 * s,
    x + 18.5 * s, y + 91.5 * s,
    'F'
  );
  doc.roundedRect(x + 6.5 * s, y + 86 * s, 14 * s, 8 * s, 3 * s, 3 * s, 'F');

  // Alça Inferior Curva
  doc.roundedRect(x + 35 * s, y + 59.5 * s, 57 * s, 34.5 * s, 17 * s, 17 * s, 'F');
  doc.rect(x + 44 * s, y + 36.5 * s, 42 * s, 7 * s, 'F');
  doc.triangle(
    x + 35 * s, y + 80 * s,
    x + 44 * s, y + 36.5 * s,
    x + 48 * s, y + 60 * s,
    'F'
  );

  // Recorte interno
  doc.setFillColor(0, 71, 225);
  doc.roundedRect(x + 43 * s, y + 64 * s, 36 * s, 14 * s, 7 * s, 7 * s, 'F');

  // Matriz de Pixels
  doc.setFillColor(255, 255, 255);
  doc.rect(x + 23.5 * s, y + 11 * s, 5.5 * s, 5.5 * s, 'F');
  doc.rect(x + 30 * s, y + 11 * s, 5.5 * s, 5.5 * s, 'F');
  doc.rect(x + 27 * s, y + 17.5 * s, 5.5 * s, 5.5 * s, 'F');
  doc.rect(x + 33.5 * s, y + 17.5 * s, 5.5 * s, 5.5 * s, 'F');
  doc.rect(x + 40 * s, y + 17.5 * s, 5.5 * s, 5.5 * s, 'F');
  doc.rect(x + 29.5 * s, y + 24 * s, 5 * s, 5 * s, 'F');
  doc.rect(x + 35.5 * s, y + 24 * s, 5 * s, 5 * s, 'F');
  doc.rect(x + 41.5 * s, y + 24 * s, 5 * s, 5 * s, 'F');
}

// Aplica o logotipo oficial da Ferdata ou personalizado
function aplicarLogoNoDocumento(
  doc: jsPDF,
  customLogo: string | null | undefined,
  x: number,
  y: number,
  tamanho: number = 18
) {
  if (customLogo && customLogo.trim() !== '') {
    try {
      const format = customLogo.startsWith('data:image/jpeg') || customLogo.startsWith('data:image/jpg')
        ? 'JPEG'
        : 'PNG';
      doc.addImage(customLogo, format, x, y, tamanho, tamanho);
      return;
    } catch (e) {
      console.warn('Erro ao inserir logotipo personalizado no PDF:', e);
    }
  }

  // Fallback vetorial de alta fidelidade
  desenharLogoFerdata(doc, x, y, tamanho);
}

export function gerarRelatorioServicosPDF({
  clienteNome,
  contatoAC,
  unidadeNome,
  servicos,
  dataInicio,
  dataFim,
  dataEmissao = new Date(),
  customLogo,
}: ParametrosRelatorioPDF): jsPDF {
  const doc = new jsPDF({
    orientation: 'portrait',
    unit: 'mm',
    format: 'a4',
  });

  const pageWidth = doc.internal.pageSize.getWidth();
  const marginX = 18;
  const contentWidth = pageWidth - marginX * 2;

  // 1. LOGOTIPO
  aplicarLogoNoDocumento(doc, customLogo, marginX, 11, 18);

  // 2. CABEÇALHO CENTRALIZADO DA EMPRESA
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(13);
  doc.setTextColor(20, 20, 25);
  doc.text('FERDATA INFORMÁTICA', pageWidth / 2, 16, { align: 'center' });
  doc.setFontSize(8.5);
  doc.setTextColor(0, 71, 225);
  doc.text('ASSISTÊNCIA TÉCNICA', pageWidth / 2, 20.5, { align: 'center' });
  doc.setFont('helvetica', 'normal');
  doc.setFontSize(8.5);
  doc.setTextColor(60, 64, 75);
  doc.text('Rua Manoel José de Santana, 39 – Vila Yara – Osasco', pageWidth / 2, 25, { align: 'center' });
  doc.text('CEP: 06020-060 – Tel: 3682-2562 – 3699-1815', pageWidth / 2, 29, { align: 'center' });

  doc.setDrawColor(210, 215, 225);
  doc.setLineWidth(0.5);
  doc.line(marginX, 32.5, marginX + contentWidth, 32.5);

  // 3. TÍTULO DO RELATÓRIO
  doc.setFont('helvetica', 'bolditalic');
  doc.setFontSize(14.5);
  doc.setTextColor(20, 45, 95);
  doc.text('Relatório De Serviços Técnicos', pageWidth / 2, 38.5, { align: 'center' });

  doc.setDrawColor(210, 215, 225);
  doc.setLineWidth(0.5);
  doc.line(marginX, 41.5, marginX + contentWidth, 41.5);

  // 4. DADOS DO CLIENTE
  let posY = 47.5;
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(9.5);
  doc.setTextColor(20, 20, 25);
  doc.text('Cliente: ', marginX, posY);
  doc.setFont('helvetica', 'italic');
  doc.setTextColor(30, 40, 60);
  doc.text(clienteNome, marginX + 14, posY);

  posY += 5;
  doc.setFont('helvetica', 'bold');
  doc.setTextColor(20, 20, 25);
  doc.text('A/C: ', marginX, posY);
  doc.setFont('helvetica', 'italic');
  doc.setTextColor(30, 40, 60);
  doc.text(contatoAC || ' ', marginX + 9, posY);

  if (unidadeNome && unidadeNome.trim() !== '') {
    posY += 5;
    doc.setFont('helvetica', 'bold');
    doc.setTextColor(20, 20, 25);
    doc.text('Unidade: ', marginX, posY);
    doc.setFont('helvetica', 'italic');
    doc.setTextColor(30, 40, 60);
    doc.text(unidadeNome, marginX + 15, posY);
  }

  if (dataInicio && dataFim) {
    const periodoInfo = `Período: ${formatarDataBR(dataInicio)} a ${formatarDataBR(dataFim)}`;
    doc.setFont('helvetica', 'normal');
    doc.setFontSize(8);
    doc.setTextColor(100, 110, 125);
    doc.text(periodoInfo, marginX + contentWidth, 47.5, { align: 'right' });
  }

  // 5. CORPO DO RELATÓRIO - TABELA COM jspdf-autotable
  const tableStartY = posY + 5;
  const tableData = servicos.map((item) => [
    formatarDataBR(item.data_visita),
    item.periodo,
    item.descricao_servicos,
  ]);

  autoTable(doc, {
    startY: tableStartY,
    margin: { left: marginX, right: marginX, bottom: 18 },
    head: [['Data', 'Período', 'Serviços Executados']],
    body: tableData.length > 0 ? tableData : [[' ', ' ', 'Nenhum registro encontrado no período selecionado.']],
    theme: 'plain',
    styles: {
      font: 'helvetica',
      fontSize: 8.5,
      textColor: [25, 25, 30],
      cellPadding: { top: 2.5, bottom: 2.5, left: 2, right: 2 },
      valign: 'top',
      lineColor: [225, 230, 238],
      lineWidth: 0.1,
    },
    headStyles: {
      font: 'helvetica',
      fontStyle: 'bold',
      fontSize: 9,
      textColor: [10, 20, 50],
      fillColor: false,
      lineWidth: 0,
    },
    columnStyles: {
      0: { cellWidth: 24, fontStyle: 'normal' },
      1: { cellWidth: 38, fontStyle: 'normal' },
      2: { cellWidth: 'auto', fontStyle: 'normal' },
    },
    didDrawCell: (data) => {
      if (data.section === 'head') {
        const docInstance = data.doc;
        docInstance.setDrawColor(20, 40, 80);
        docInstance.setLineWidth(0.4);
        docInstance.line(data.cell.x, data.cell.y, data.cell.x + data.cell.width, data.cell.y);
        docInstance.line(data.cell.x, data.cell.y + data.cell.height, data.cell.x + data.cell.width, data.cell.y + data.cell.height);
        docInstance.setLineWidth(0.2);
        docInstance.line(data.cell.x, data.cell.y + data.cell.height + 0.8, data.cell.x + data.cell.width, data.cell.y + data.cell.height + 0.8);
      }
    },
    didDrawPage: (hookData) => {
      const pageNumber = hookData.pageNumber;
      const totalPages = (doc.internal as unknown as { getNumberOfPages: () => number }).getNumberOfPages();
      const footerY = doc.internal.pageSize.getHeight() - 10;

      doc.setDrawColor(210, 215, 225);
      doc.setLineWidth(0.3);
      doc.line(marginX, footerY - 3, marginX + contentWidth, footerY - 3);

      doc.setFont('helvetica', 'bolditalic');
      doc.setFontSize(8.5);
      doc.setTextColor(30, 40, 60);
      doc.text(formatarDataExtenso(dataEmissao), marginX, footerY);

      doc.text(`Página ${pageNumber} de ${totalPages}`, marginX + contentWidth, footerY, { align: 'right' });
    },
  });

  const totalPagesCount = (doc.internal as unknown as { getNumberOfPages: () => number }).getNumberOfPages();
  for (let i = 1; i <= totalPagesCount; i++) {
    doc.setPage(i);
    const footerY = doc.internal.pageSize.getHeight() - 10;
    doc.setFillColor(255, 255, 255);
    doc.rect(marginX + contentWidth - 30, footerY - 4, 32, 6, 'F');
    doc.setFont('helvetica', 'bolditalic');
    doc.setFontSize(8.5);
    doc.setTextColor(30, 40, 60);
    doc.text(`Página ${i} de ${totalPagesCount}`, marginX + contentWidth, footerY, { align: 'right' });
  }

  return doc;
}

export interface FilialSomatoria {
  nome: string;
  horas: number;
  textoHoras: string;
  isSaoPaulo: boolean;
}

// Identifica se uma filial é São Paulo (independente de acentuação ou caixa)
export function isFilialSaoPaulo(nome: string): boolean {
  if (!nome) return false;
  const normalizado = nome
    .trim()
    .toLowerCase()
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '');
  return normalizado === 'sao paulo' || normalizado === 'sp' || normalizado.includes('sao paulo');
}

// Calcula a somatória por filial aplicando a regra específica da filial São Paulo:
// "o valor de horas da filial São Paulo deve ser o 'Total das horas adicionais' menos a soma do total de todas as filiais, exceto São Paulo"
export function calcularSomatoriaFiliais(
  servicos: ServicoRealizadoCompleto[],
  horasAdicionais?: number,
  horasContratadas: number = 52
): FilialSomatoria[] {
  const mapa = new Map<string, number>();
  servicos.forEach((s) => {
    const nome = s.nome_unidade && s.nome_unidade.trim() ? s.nome_unidade.trim() : 'Matriz';
    const h = Number(s.qtde_horas) || 0;
    mapa.set(nome, (mapa.get(nome) || 0) + h);
  });

  if (mapa.size === 0) return [];

  // Se horas adicionais não foram fornecidas diretamente, calcula com base nas contratadas
  let adicionais = horasAdicionais;
  if (adicionais === undefined) {
    const totalHoras = servicos.reduce((acc, s) => acc + (Number(s.qtde_horas) || 0), 0);
    adicionais = Math.max(0, Number((totalHoras - horasContratadas).toFixed(2)));
  }

  // Identifica a filial São Paulo e soma todas as outras filiais
  let chaveSaoPaulo: string | null = null;
  let somaOutrasFiliais = 0;

  for (const [nome, horas] of mapa.entries()) {
    if (isFilialSaoPaulo(nome)) {
      chaveSaoPaulo = nome;
    } else {
      somaOutrasFiliais += horas;
    }
  }

  // Aplica a fórmula solicitada pelo usuário:
  // Horas São Paulo = Total das horas adicionais - soma das outras filiais
  if (chaveSaoPaulo) {
    const horasCalculadasSP = Math.max(0, Number((adicionais - somaOutrasFiliais).toFixed(2)));
    mapa.set(chaveSaoPaulo, horasCalculadasSP);
  }

  const filiais = Array.from(mapa.entries()).sort((a, b) => a[0].localeCompare(b[0]));
  return filiais.map(([filial, horas]) => {
    const textoHoras = horas === 1 ? '1 Hora' : `${formatarHorasBR(horas)} Horas`;
    return {
      nome: filial,
      horas,
      textoHoras,
      isSaoPaulo: isFilialSaoPaulo(filial),
    };
  });
}

export function obterDescritivoFiliais(
  servicos: ServicoRealizadoCompleto[],
  horasAdicionais?: number,
  horasContratadas: number = 52
): string {
  const filiais = calcularSomatoriaFiliais(servicos, horasAdicionais, horasContratadas);
  if (filiais.length === 0) return '';
  return filiais.map((f) => `• ${f.nome}: ${f.textoHoras}`).join('\n');
}

export function gerarRelatorioFavoritaHorasPDF({
  clienteNome,
  contatoAC,
  unidadeNome,
  servicos,
  dataInicio,
  dataFim,
  horasContratadas = 52,
  dataEmissao = new Date(),
  customLogo,
}: ParametrosRelatorioFavoritaHorasPDF): jsPDF {
  const doc = new jsPDF({
    orientation: 'portrait',
    unit: 'mm',
    format: 'a4',
  });

  const pageWidth = doc.internal.pageSize.getWidth();
  const marginX = 20;
  const contentWidth = pageWidth - marginX * 2;

  // 1. LOGOTIPO
  aplicarLogoNoDocumento(doc, customLogo, marginX, 11, 18);

  // 2. CABEÇALHO CENTRALIZADO
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(13);
  doc.setTextColor(20, 20, 25);
  doc.text('FERDATA INFORMÁTICA', pageWidth / 2, 16, { align: 'center' });
  doc.setFontSize(8.5);
  doc.setTextColor(0, 71, 225);
  doc.text('ASSISTÊNCIA TÉCNICA', pageWidth / 2, 20.5, { align: 'center' });
  doc.setFont('helvetica', 'normal');
  doc.setFontSize(8.5);
  doc.setTextColor(60, 64, 75);
  doc.text('Rua Manoel José de Santana, 39 – Vila Yara – Osasco', pageWidth / 2, 25, { align: 'center' });
  doc.text('CEP: 06020-060 – Tel: 3682-2562 – 3699-1815', pageWidth / 2, 29, { align: 'center' });

  doc.setDrawColor(210, 215, 225);
  doc.setLineWidth(0.5);
  doc.line(marginX, 32.5, marginX + contentWidth, 32.5);

  // 3. TÍTULO DO RELATÓRIO
  doc.setFont('helvetica', 'bolditalic');
  doc.setFontSize(14.5);
  doc.setTextColor(20, 45, 95);
  doc.text('Relatório De Serviços Técnicos', pageWidth / 2, 38.5, { align: 'center' });
  doc.line(marginX, 41.5, marginX + contentWidth, 41.5);

  // 4. DADOS DO CLIENTE
  let posY = 47.5;
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(9.5);
  doc.setTextColor(20, 20, 25);
  doc.text('Cliente: ', marginX, posY);
  doc.setFont('helvetica', 'italic');
  doc.setTextColor(30, 40, 60);
  doc.text(clienteNome, marginX + 14, posY);

  posY += 5;
  doc.setFont('helvetica', 'bold');
  doc.setTextColor(20, 20, 25);
  doc.text('A/C: ', marginX, posY);
  doc.setFont('helvetica', 'italic');
  doc.setTextColor(30, 40, 60);
  doc.text(contatoAC || ' ', marginX + 9, posY);

  if (unidadeNome && unidadeNome.trim() !== '') {
    posY += 5;
    doc.setFont('helvetica', 'bold');
    doc.setTextColor(20, 20, 25);
    doc.text('Unidade: ', marginX, posY);
    doc.setFont('helvetica', 'italic');
    doc.setTextColor(30, 40, 60);
    doc.text(unidadeNome, marginX + 15, posY);
  }

  if (dataInicio && dataFim) {
    const periodoInfo = `Período: ${formatarDataBR(dataInicio)} a ${formatarDataBR(dataFim)}`;
    doc.setFont('helvetica', 'normal');
    doc.setFontSize(8);
    doc.setTextColor(100, 110, 125);
    doc.text(periodoInfo, marginX + contentWidth, 47.5, { align: 'right' });
  }

  // 5. TABELA DE HORAS
  const tableStartY = posY + 6;
  const filiaisDistintas = Array.from(new Set(servicos.map((s) => s.nome_unidade).filter(Boolean)));
  const exibirColunaFilial = !unidadeNome && filiaisDistintas.length > 1;
  const tableHead = exibirColunaFilial
    ? [['Data', 'Filial / Unidade', 'Horas']]
    : [['Data', 'Horas']];

  const tableData = servicos.map((s) => {
    const dataFormatada = formatarDataBR(s.data_visita);
    const horasFormatadas = formatarHorasBR(Number(s.qtde_horas) || 0);
    if (exibirColunaFilial) {
      return [dataFormatada, s.nome_unidade || 'Matriz', horasFormatadas];
    }
    return [dataFormatada, horasFormatadas];
  });

  const totalHorasCalculado = Number(
    servicos.reduce((acc, s) => acc + (Number(s.qtde_horas) || 0), 0).toFixed(2)
  );
  const contratadas = Number(horasContratadas) || 52;
  const adicionais = Math.max(0, Number((totalHorasCalculado - contratadas).toFixed(2)));

  let finalY = tableStartY;
  autoTable(doc, {
    startY: tableStartY,
    margin: { left: marginX, right: marginX, bottom: 20 },
    head: tableHead,
    body: tableData.length > 0 ? tableData : (exibirColunaFilial ? [[' ', ' ', '0']] : [[' ', '0']]),
    theme: 'plain',
    styles: {
      font: 'helvetica',
      fontSize: 8.5,
      textColor: [25, 25, 30],
      cellPadding: { top: 2, bottom: 2, left: 2, right: 2 },
      lineColor: [225, 230, 238],
      lineWidth: 0,
    },
    headStyles: {
      font: 'helvetica',
      fontStyle: 'bolditalic',
      fontSize: 9,
      textColor: [10, 20, 50],
      fillColor: false,
    },
    columnStyles: exibirColunaFilial
      ? {
          0: { cellWidth: 32, fontStyle: 'normal' },
          1: { cellWidth: 50, fontStyle: 'normal' },
          2: { cellWidth: 28, fontStyle: 'normal', halign: 'left' },
        }
      : {
          0: { cellWidth: 34, fontStyle: 'normal' },
          1: { cellWidth: 32, fontStyle: 'normal', halign: 'left' },
        },
    didDrawCell: (data) => {
      if (data.section === 'head') {
        const docInstance = data.doc;
        docInstance.setDrawColor(20, 40, 80);
        docInstance.setLineWidth(0.4);
        docInstance.line(data.cell.x, data.cell.y, data.cell.x + data.cell.width, data.cell.y);
        docInstance.line(data.cell.x, data.cell.y + data.cell.height, data.cell.x + data.cell.width, data.cell.y + data.cell.height);
        docInstance.setLineWidth(0.2);
        docInstance.line(data.cell.x, data.cell.y + data.cell.height + 0.8, data.cell.x + data.cell.width, data.cell.y + data.cell.height + 0.8);
      }
    },
    didDrawPage: (hookData) => {
      finalY = hookData.cursor?.y || 100;
      const pageNumber = hookData.pageNumber;
      const totalPages = (doc.internal as unknown as { getNumberOfPages: () => number }).getNumberOfPages();
      const footerY = doc.internal.pageSize.getHeight() - 10;

      doc.setDrawColor(210, 215, 225);
      doc.setLineWidth(0.3);
      doc.line(marginX, footerY - 3, marginX + contentWidth, footerY - 3);

      doc.setFont('helvetica', 'bolditalic');
      doc.setFontSize(8.5);
      doc.setTextColor(30, 40, 60);
      doc.text(formatarDataExtenso(dataEmissao), marginX, footerY);

      doc.text(`Página ${pageNumber} de ${totalPages}`, marginX + contentWidth, footerY, { align: 'right' });
    },
  });

  // 6. BLOCO DESCRITIVO COM SOMATÓRIA POR FILIAL
  const filiaisSomatoria = calcularSomatoriaFiliais(servicos, adicionais, contratadas);
  const temFiliais = filiaisSomatoria.length > 0;

  const boxWidth = contentWidth > 140 ? 140 : contentWidth;
  const boxX = marginX;
  const labelX = boxX + 6;
  const valueX = boxX + boxWidth - 6;

  // Cada filial é apresentada em uma linha dedicada com destaque visual (5.0mm por linha)
  const alturaExtraFiliais = temFiliais ? 12 + filiaisSomatoria.length * 5.0 : 0;
  const boxHeight = 26 + alturaExtraFiliais;
  const pageHeight = doc.internal.pageSize.getHeight();

  if (finalY + boxHeight > pageHeight - 18) {
    doc.addPage();
    finalY = 35;
  } else {
    finalY += 10;
  }

  doc.setFillColor(248, 250, 252);
  doc.setDrawColor(215, 225, 238);
  doc.setLineWidth(0.4);
  doc.roundedRect(boxX, finalY, boxWidth, boxHeight, 2, 2, 'FD');

  let lineY = finalY + 6.5;
  doc.setFont('helvetica', 'bolditalic');
  doc.setFontSize(9.5);
  doc.setTextColor(20, 30, 55);
  doc.text('Total horas:', labelX, lineY);
  doc.setFont('helvetica', 'bold');
  doc.setTextColor(15, 23, 42);
  doc.text(`${formatarHorasBR(totalHorasCalculado)}`, valueX, lineY, { align: 'right' });

  lineY += 6.5;
  doc.setFont('helvetica', 'bolditalic');
  doc.setTextColor(20, 30, 55);
  doc.text('Total horas contratadas:', labelX, lineY);
  doc.setFont('helvetica', 'normal');
  doc.setTextColor(40, 50, 70);
  doc.text(`${formatarHorasBR(contratadas)}`, valueX, lineY, { align: 'right' });

  lineY += 6.5;
  doc.setFont('helvetica', 'bolditalic');
  if (adicionais > 0) {
    doc.setTextColor(180, 40, 20);
  } else {
    doc.setTextColor(20, 30, 55);
  }
  doc.text('Total horas adicionais:', labelX, lineY);
  doc.setFont('helvetica', 'bold');
  doc.text(`${formatarHorasBR(adicionais)}`, valueX, lineY, { align: 'right' });

  if (temFiliais) {
    lineY += 4.5;
    doc.setDrawColor(220, 228, 238);
    doc.setLineWidth(0.3);
    doc.line(labelX, lineY, valueX, lineY);

    lineY += 4.8;
    doc.setFont('helvetica', 'bolditalic');
    doc.setFontSize(9);
    doc.setTextColor(20, 30, 55);
    doc.text('Somatória por filial:', labelX, lineY);

    doc.setFontSize(8.5);
    filiaisSomatoria.forEach((f) => {
      lineY += 5.0;

      // Nome da filial em DESTAQUE (Negrito) com marcador •
      doc.setFont('helvetica', 'bold');
      if (f.isSaoPaulo) {
        doc.setTextColor(0, 55, 160); // Destaque sutil para São Paulo
      } else {
        doc.setTextColor(20, 30, 55);
      }
      doc.text(`• ${f.nome}:`, labelX + 2, lineY);

      // Quantidade de Horas da Filial alinhada à direita na mesma linha
      doc.setFont('helvetica', 'bold');
      doc.setTextColor(15, 23, 42);
      doc.text(f.textoHoras, valueX, lineY, { align: 'right' });
    });
  }

  const totalPagesCount = (doc.internal as unknown as { getNumberOfPages: () => number }).getNumberOfPages();
  for (let i = 1; i <= totalPagesCount; i++) {
    doc.setPage(i);
    const footerY = doc.internal.pageSize.getHeight() - 10;
    doc.setFillColor(255, 255, 255);
    doc.rect(marginX + contentWidth - 30, footerY - 4, 32, 6, 'F');
    doc.setFont('helvetica', 'bolditalic');
    doc.setFontSize(8.5);
    doc.setTextColor(30, 40, 60);
    doc.text(`Página ${i} de ${totalPagesCount}`, marginX + contentWidth, footerY, { align: 'right' });
  }

  return doc;
}
