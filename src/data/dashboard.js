import {
  ArchiveBoxIcon,
  ArrowPathIcon,
  ChartPieIcon,
  ClipboardDocumentListIcon,
  EyeIcon,
  UserCircleIcon,
  TruckIcon,
} from '@heroicons/vue/24/outline';

const profileItem = { id: 'meu-perfil', label: 'Meu Perfil', icon: UserCircleIcon };

export const dashboardProfiles = {
  producer: {
    title: 'Painel do Produtor',
    subtitle: 'Acompanhe estoque, oportunidades e preços sugeridos para vender melhor.',
    navItems: [
      { id: 'meu-estoque', label: 'Meu Estoque', icon: ArchiveBoxIcon },
      { id: 'wishlist-analytics', label: 'Análise de Produtos', icon: ChartPieIcon },
      { id: 'historico-venda', label: 'Histórico de Venda', icon: ArrowPathIcon },
      profileItem,
    ],
  },
  retailer: {
    title: 'Painel do Varejo',
    subtitle: 'Monte listas de desejo, encontre fornecedores e acompanhe compras com facilidade.',
    navItems: [
      { id: 'explorar-ofertas', label: 'Explorar Ofertas', icon: EyeIcon },
      { id: 'lista-desejos', label: 'Lista de Desejos', icon: ClipboardDocumentListIcon },
      { id: 'historico-compra', label: 'Histórico de Compra', icon: ArrowPathIcon },
      profileItem,
    ],
  },
  delivery: {
    title: 'Painel do Entregador',
    subtitle: 'Acesse seu perfil e as ferramentas disponíveis para entregadores.',
    navItems: [
      { id: 'visao-geral', label: 'Visão Geral', icon: TruckIcon },
      { id: 'minhas-entregas', label: 'Minhas Entregas', icon: TruckIcon },
      { id: 'historico-entregas', label: 'Histórico de Entregas', icon: ArrowPathIcon },
      profileItem,
    ],
  },
};
