import { useRouter } from 'expo-router';
import { StyleSheet, View } from 'react-native';

import { AppText } from '@/components/ui/app-text';
import { Button } from '@/components/ui/button';
import { Screen } from '@/components/ui/screen';
import { Spacing } from '@/constants/theme';
import { useAppTheme } from '@/hooks/use-app-theme';

export default function NotFoundScreen() {
  const router = useRouter();
  const { colors } = useAppTheme();
  return (
    <Screen>
      <View style={styles.container}>
        <AppText variant="display" color={colors.primary}>
          404
        </AppText>
        <AppText variant="heading" align="center">
          Essa tela não existe
        </AppText>
        <AppText variant="body" color={colors.textSecondary} align="center">
          O link pode estar quebrado ou a página foi movida.
        </AppText>
        <Button label="Voltar ao feed" onPress={() => router.replace('/(tabs)/videos')} />
      </View>
    </Screen>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    gap: Spacing.md,
    padding: Spacing.xl,
  },
});
