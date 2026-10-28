import { useRouter } from 'expo-router';
import { StyleSheet, View } from 'react-native';

import { AppText } from '@/components/ui/app-text';
import { Button } from '@/components/ui/button';
import { Screen } from '@/components/ui/screen';
import { ScreenHeader } from '@/components/ui/screen-header';
import { Spacing } from '@/constants/theme';
import { PRIVACY_POLICY_VERSION } from '@/lib/validation';
import { useAppTheme } from '@/hooks/use-app-theme';

const SECTIONS: { title: string; body: string[] }[] = [
  {
    title: '1. Aceitação',
    body: [
      'Ao criar uma conta ou usar o DopamineMaxxing, você concorda com estes Termos de Uso e com a Política de Privacidade. Se não concordar, não utilize o app.',
    ],
  },
  {
    title: '2. Elegibilidade',
    body: [
      'O app é destinado a pessoas maiores de 18 anos. A data de nascimento é verificada no onboarding. Contas de menores podem ser suspensas e os dados tratados conforme a lei.',
    ],
  },
  {
    title: '3. Sua conta',
    body: [
      'Você é responsável por manter a confidencialidade da sua senha e pelas atividades realizadas na sua conta. Informe imediatamente qualquer uso não autorizado.',
      'Não compartilhe credenciais de redes sociais. O app não solicita nem armazena tokens de redes sociais no estado atual.',
    ],
  },
  {
    title: '4. Uso aceitável',
    body: [
      'É proibido usar o app para assédio, discurso de ódio, fraude, spam, scraping, engenharia reversa, automação não autorizada ou violação de direitos de terceiros.',
      'O app pode remover conteúdo e suspender contas que violem estes termos ou a legislação aplicável.',
    ],
  },
  {
    title: '5. Conteúdo de terceiros',
    body: [
      'O feed pode exibir conteúdo de redes sociais de terceiros. A disponibilidade depende das APIs oficiais de cada plataforma e pode mudar sem aviso.',
      'Instagram, TikTok, X e Threads são exibidos como demonstração por limitação de API. Mastodon, Bluesky, YouTube e Reddit têm integrações planejadas ou limitadas.',
      'O app não faz scraping e não se responsabiliza por conteúdo publicado em plataformas externas.',
    ],
  },
  {
    title: '6. Propriedade intelectual',
    body: [
      'O nome, a marca, o código e os elementos visuais do DopamineMaxxing pertencem aos seus criadores. Marcas de terceiros pertencem aos respectivos titulares e são usadas apenas para identificação.',
    ],
  },
  {
    title: '7. Isenções',
    body: [
      'O app é fornecido “como está”. Não garantimos disponibilidade ininterrupta, ausência de erros ou que APIs de terceiros continuem funcionando.',
      'Na máxima extensão permitida pela lei, não nos responsabilizamos por danos indiretos decorrentes do uso do app ou de serviços de terceiros.',
    ],
  },
  {
    title: '8. Privacidade e LGPD',
    body: [
      'O tratamento de dados pessoais é descrito na Política de Privacidade. Você pode exportar seus dados, revogar consentimentos e excluir sua conta a qualquer momento.',
    ],
  },
  {
    title: '9. Alterações',
    body: [
      'Podemos atualizar estes termos para refletir mudanças no produto ou na lei. A versão e a data ficam visíveis nesta tela. O uso continuado após a atualização representa aceitação.',
    ],
  },
  {
    title: '10. Contato',
    body: [
      'Dúvidas sobre estes termos podem ser enviadas para o canal de suporte informado na Política de Privacidade.',
    ],
  },
];

export default function TermsScreen() {
  const router = useRouter();
  const { colors } = useAppTheme();

  return (
    <Screen scroll padded={false} edges={['top', 'bottom']}>
      <ScreenHeader title="Termos de Uso" subtitle="Regras para usar o DopamineMaxxing" />
      <View style={styles.content}>
        {SECTIONS.map((section) => (
          <View key={section.title} style={styles.section}>
            <AppText variant="bodyStrong">{section.title}</AppText>
            {section.body.map((paragraph) => (
              <AppText key={paragraph} variant="body" color={colors.textSecondary}>
                {paragraph}
              </AppText>
            ))}
          </View>
        ))}
        <AppText variant="caption" color={colors.textMuted} align="center">
          Versão {PRIVACY_POLICY_VERSION}
        </AppText>
        <Button
          label="Ler Política de Privacidade"
          onPress={() => router.push('/settings/privacy-policy')}
          variant="secondary"
          fullWidth
        />
      </View>
    </Screen>
  );
}

const styles = StyleSheet.create({
  content: {
    padding: Spacing.lg,
    gap: Spacing.xl,
  },
  section: {
    gap: Spacing.sm,
  },
});
