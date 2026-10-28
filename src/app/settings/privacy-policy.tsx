import { StyleSheet, View } from 'react-native';

import { AppText } from '@/components/ui/app-text';
import { Card } from '@/components/ui/card';
import { Screen } from '@/components/ui/screen';
import { ScreenHeader } from '@/components/ui/screen-header';
import { Spacing } from '@/constants/theme';
import { PRIVACY_POLICY_VERSION } from '@/lib/validation';
import { useAppTheme } from '@/hooks/use-app-theme';

const SECTIONS: { title: string; body: string[] }[] = [
  {
    title: '1. Quem somos',
    body: [
      'O DopamineMaxxing é um aplicativo que centraliza feeds de redes sociais em uma única experiência. Para fins da Lei Geral de Proteção de Dados (Lei nº 13.709/2018), o controlador dos dados é o DopamineMaxxing.',
      'Contato do Encarregado de Dados (DPO): [preencher e-mail antes da publicação].',
    ],
  },
  {
    title: '2. Dados que tratamos',
    body: [
      'Dados de conta: e-mail e identificador de autenticação.',
      'Dados de perfil: nome de exibição, nome de usuário, data de nascimento, foto de perfil e, se você consentir, cidade e país.',
      'Dados de uso: redes conectadas, posts agregados, curtidas, reposts e comentários que você cria no app.',
      'Preferências: tema, modo desempenho, economia de dados, autoplay e consentimentos.',
      'Não coletamos localização precisa, não armazenamos senhas em texto claro e não armazenamos tokens de redes sociais no banco de dados.',
    ],
  },
  {
    title: '3. Finalidades e bases legais',
    body: [
      'Execução de contrato (art. 7º, V): criar sua conta, autenticar, exibir o feed e permitir interações.',
      'Consentimento (art. 7º, I): personalização do feed, métricas anônimas e compartilhamento de localização aproximada. Você pode revogar a qualquer momento.',
      'Obrigação legal (art. 7º, II): registros de consentimento e atendimento de direitos do titular.',
      'Legítimo interesse (art. 7º, IX): segurança, prevenção a fraudes e melhoria do serviço, sempre com dados minimizados.',
    ],
  },
  {
    title: '4. Compartilhamento',
    body: [
      'Usamos o Supabase como provedor de banco de dados, autenticação e armazenamento de arquivos. Quando configurado, o projeto deve ser hospedado na região de São Paulo (sa-east-1).',
      'Não vendemos dados pessoais. Não compartilhamos dados com redes sociais sem sua ação explícita de compartilhamento.',
      'Provedores de infraestrutura podem tratar dados como operadores, sob obrigações contratuais de confidencialidade e segurança.',
    ],
  },
  {
    title: '5. Retenção e eliminação',
    body: [
      'Mantemos seus dados enquanto sua conta existir. Comentários excluídos são marcados como removidos e purgados em até 30 dias.',
      'Ao excluir a conta, o perfil, as conexões, as interações e os comentários são removidos em cascata. Registros de consentimento podem ser mantidos de forma mínima para comprovar conformidade, quando exigido por lei.',
      'Você pode exportar seus dados em JSON e solicitar a exclusão em Configurações → Privacidade e LGPD.',
    ],
  },
  {
    title: '6. Seus direitos',
    body: [
      'Você pode solicitar confirmação de tratamento, acesso, correção, anonimização, bloqueio, eliminação, portabilidade, informação sobre compartilhamento e revogação de consentimento.',
      'Atendemos solicitações em até 15 dias. Para exercer seus direitos, use as opções do app ou o canal de contato do DPO informado nesta política.',
    ],
  },
  {
    title: '7. Segurança',
    body: [
      'Aplicamos controle de acesso por linha (RLS) no Supabase, princípio do menor privilégio, armazenamento seguro de sessão no dispositivo e minimização de dados.',
      'Nenhum sistema é 100% imune. Em caso de incidente relevante, comunicaremos os titulares e a ANPD conforme a LGPD.',
    ],
  },
  {
    title: '8. Transferência internacional',
    body: [
      'Quando o Supabase estiver configurado fora do Brasil, a transferência ocorre com base em garantias contratuais e na escolha de região que reduza riscos. Recomendamos a região sa-east-1 (São Paulo).',
    ],
  },
  {
    title: '9. Crianças e adolescentes',
    body: [
      'O DopamineMaxxing é destinado a maiores de 18 anos. Não coletamos intencionalmente dados de menores. Se identificarmos uma conta de menor, ela será removida.',
    ],
  },
  {
    title: '10. Alterações',
    body: [
      `Esta política está na versão ${PRIVACY_POLICY_VERSION}. Mudanças relevantes serão comunicadas no app e exigirão novo consentimento quando aplicável.`,
    ],
  },
];

export default function PrivacyPolicyScreen() {
  const { colors } = useAppTheme();
  return (
    <Screen scroll padded={false} edges={['top', 'bottom']}>
      <ScreenHeader title="Política de privacidade" subtitle={`Versão ${PRIVACY_POLICY_VERSION}`} />
      <View style={styles.content}>
        <Card style={styles.summary}>
          <AppText variant="bodyStrong">Resumo rápido</AppText>
          <AppText variant="caption" color={colors.textSecondary}>
            Coletamos o mínimo para o app funcionar. Consentimentos opcionais são granulares e
            revogáveis. Você pode exportar ou excluir seus dados a qualquer momento. O app é
            restrito a maiores de 18 anos.
          </AppText>
        </Card>

        {SECTIONS.map((section) => (
          <View key={section.title} style={styles.section}>
            <AppText variant="bodyStrong">{section.title}</AppText>
            {section.body.map((paragraph) => (
              <AppText key={paragraph} variant="caption" color={colors.textSecondary} style={styles.paragraph}>
                {paragraph}
              </AppText>
            ))}
          </View>
        ))}

        <AppText variant="caption" color={colors.textMuted} align="center">
          Última atualização: {PRIVACY_POLICY_VERSION}
        </AppText>
      </View>
    </Screen>
  );
}

const styles = StyleSheet.create({
  content: {
    padding: Spacing.lg,
    gap: Spacing.xl,
  },
  summary: {
    gap: Spacing.sm,
  },
  section: {
    gap: Spacing.sm,
  },
  paragraph: {
    lineHeight: 20,
  },
});
