import type { ComponentProps } from 'react';
import { Ionicons } from '@expo/vector-icons';

import { NetworkColors } from '@/constants/theme';
import type { NetworkAvailability, NetworkId } from '@/types/models';

export interface NetworkMeta {
  id: NetworkId;
  name: string;
  shortName: string;
  color: string;
  icon: ComponentProps<typeof Ionicons>['name'];
  availability: NetworkAvailability;
  supportsFeed: boolean;
  supportsLike: boolean;
  supportsComment: boolean;
  supportsRepost: boolean;
  note: string;
}

export const NETWORKS: Record<NetworkId, NetworkMeta> = {
  instagram: {
    id: 'instagram',
    name: 'Instagram',
    shortName: 'Instagram',
    color: NetworkColors.instagram,
    icon: 'aperture-outline',
    availability: 'demo',
    supportsFeed: false,
    supportsLike: true,
    supportsComment: true,
    supportsRepost: true,
    note: 'A API oficial cobre apenas contas Business/Creator. Feed pessoal e ações em posts de terceiros não são disponibilizados.',
  },
  youtube: {
    id: 'youtube',
    name: 'YouTube',
    shortName: 'YouTube',
    color: NetworkColors.youtube,
    icon: 'play-circle-outline',
    availability: 'limited',
    supportsFeed: false,
    supportsLike: true,
    supportsComment: true,
    supportsRepost: false,
    note: 'A Data API v3 é gratuita com cota diária. Permite inscrições e playlists, mas não o feed personalizado da página inicial.',
  },
  tiktok: {
    id: 'tiktok',
    name: 'TikTok',
    shortName: 'TikTok',
    color: NetworkColors.tiktok,
    icon: 'musical-notes-outline',
    availability: 'demo',
    supportsFeed: false,
    supportsLike: true,
    supportsComment: true,
    supportsRepost: true,
    note: 'A Display API expõe apenas o perfil e vídeos do próprio usuário. Não há acesso ao feed "Para você" nem a curtidas/comentários de terceiros.',
  },
  x: {
    id: 'x',
    name: 'X',
    shortName: 'X',
    color: NetworkColors.x,
    icon: 'chatbubble-ellipses-outline',
    availability: 'demo',
    supportsFeed: false,
    supportsLike: true,
    supportsComment: true,
    supportsRepost: true,
    note: 'O acesso à timeline e leitura em escala exige planos pagos. O plano gratuito não atende a um agregador de feed.',
  },
  threads: {
    id: 'threads',
    name: 'Threads',
    shortName: 'Threads',
    color: NetworkColors.threads,
    icon: 'at-outline',
    availability: 'demo',
    supportsFeed: false,
    supportsLike: true,
    supportsComment: true,
    supportsRepost: true,
    note: 'A API da Threads é focada na própria conta e em insights. Não entrega a timeline de terceiros.',
  },
  mastodon: {
    id: 'mastodon',
    name: 'Mastodon',
    shortName: 'Mastodon',
    color: NetworkColors.mastodon,
    icon: 'planet-outline',
    availability: 'official',
    supportsFeed: true,
    supportsLike: true,
    supportsComment: true,
    supportsRepost: true,
    note: 'API aberta e gratuita. Permite timeline, favoritos, reposts e respostas com OAuth por instância.',
  },
  bluesky: {
    id: 'bluesky',
    name: 'Bluesky',
    shortName: 'Bluesky',
    color: NetworkColors.bluesky,
    icon: 'cloud-outline',
    availability: 'official',
    supportsFeed: true,
    supportsLike: true,
    supportsComment: true,
    supportsRepost: true,
    note: 'AT Protocol aberto. Permite feed, curtidas, reposts e respostas sem custo de API.',
  },
  reddit: {
    id: 'reddit',
    name: 'Reddit',
    shortName: 'Reddit',
    color: NetworkColors.reddit,
    icon: 'chatbubbles-outline',
    availability: 'limited',
    supportsFeed: true,
    supportsLike: true,
    supportsComment: true,
    supportsRepost: false,
    note: 'API gratuita com limites e termos específicos. Permite feed, votos e comentários, mas exige revisão de uso comercial.',
  },
};

export const NETWORK_LIST: NetworkMeta[] = Object.values(NETWORKS);

export const DEFAULT_ONBOARDING_NETWORKS: NetworkId[] = [
  'instagram',
  'youtube',
  'tiktok',
  'x',
  'threads',
];

export function getNetwork(network: NetworkId): NetworkMeta {
  return NETWORKS[network];
}
