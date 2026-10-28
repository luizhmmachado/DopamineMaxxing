import * as ImagePicker from 'expo-image-picker';
import * as Location from 'expo-location';
import { useRouter } from 'expo-router';
import {
  forwardRef,
  useEffect,
  useImperativeHandle,
  useState,
  type ComponentProps,
} from 'react';
import { Alert, Pressable, StyleSheet, Switch, View } from 'react-native';
import { Ionicons } from '@expo/vector-icons';

import { AppText } from '@/components/ui/app-text';
import { Avatar } from '@/components/ui/avatar';
import { Button } from '@/components/ui/button';
import { Checkbox } from '@/components/ui/checkbox';
import { TextField } from '@/components/ui/text-field';
import { Radius, Spacing } from '@/constants/theme';
import { getErrorMessage } from '@/lib/errors';
import {
  birthDateError,
  displayNameError,
  normalizeUsername,
  parseBirthDate,
  PRIVACY_POLICY_VERSION,
  toBrDate,
  toIsoDate,
  usernameError,
} from '@/lib/validation';
import { useAppTheme } from '@/hooks/use-app-theme';
import { useProfile } from '@/providers/profile-provider';
import type { ConsentInput, DopamineProfile, ProfileInput } from '@/types/models';

export interface ProfileFormValues {
  input: ProfileInput;
  consents: ConsentInput[];
}

export interface ProfileFormHandle {
  submit: () => void;
}

interface ProfileFormProps {
  initial?: DopamineProfile | null;
  mode: 'onboarding' | 'edit';
  submitLabel: string;
  submitting?: boolean;
  onSubmit: (values: ProfileFormValues) => Promise<void>;
  onCancel?: () => void;
  hideSubmit?: boolean;
  onBusyChange?: (busy: boolean) => void;
}

export const ProfileForm = forwardRef<ProfileFormHandle, ProfileFormProps>(function ProfileForm(
  {
    initial,
    mode,
    submitLabel,
    submitting = false,
    onSubmit,
    onCancel,
    hideSubmit = false,
    onBusyChange,
  },
  ref,
) {
  const router = useRouter();
  const { colors } = useAppTheme();
  const { uploadAvatar } = useProfile();
  const [displayName, setDisplayName] = useState(initial?.displayName ?? '');
  const [username, setUsername] = useState(initial?.username ?? '');
  const [usernameTouched, setUsernameTouched] = useState(Boolean(initial?.username));
  const [birthDate, setBirthDate] = useState(initial?.birthDate ? toBrDate(initial.birthDate) : '');
  const [avatarUri, setAvatarUri] = useState<string | undefined>(initial?.avatarUrl);
  const [locationLabel, setLocationLabel] = useState(initial?.locationLabel ?? '');
  const [locationConsent, setLocationConsent] = useState(Boolean(initial?.locationConsent));
  const [termsAccepted, setTermsAccepted] = useState(mode === 'edit');
  const [personalization, setPersonalization] = useState(false);
  const [analytics, setAnalytics] = useState(false);
  const [errors, setErrors] = useState<Record<string, string | null>>({});
  const [saving, setSaving] = useState(false);
  const [locating, setLocating] = useState(false);

  const busy = submitting || saving;

  useEffect(() => {
    onBusyChange?.(busy);
  }, [busy, onBusyChange]);

  function handleDisplayName(value: string) {
    setDisplayName(value);
    if (!usernameTouched) {
      setUsername(normalizeUsername(value));
    }
  }

  async function pickAvatar() {
    try {
      const permission = await ImagePicker.requestMediaLibraryPermissionsAsync();
      if (!permission.granted) {
        Alert.alert(
          'Permissão necessária',
          'Autorize o acesso à galeria para escolher uma foto de perfil.',
        );
        return;
      }
      const result = await ImagePicker.launchImageLibraryAsync({
        mediaTypes: ['images'],
        allowsEditing: true,
        aspect: [1, 1],
        quality: 0.6,
      });
      if (!result.canceled && result.assets[0]?.uri) {
        setAvatarUri(result.assets[0].uri);
      }
    } catch (error) {
      Alert.alert('Não foi possível abrir a galeria', getErrorMessage(error));
    }
  }

  async function detectLocation() {
    setLocating(true);
    try {
      const permission = await Location.requestForegroundPermissionsAsync();
      if (!permission.granted) {
        Alert.alert(
          'Localização não autorizada',
          'Você pode continuar sem compartilhar sua localização.',
        );
        setLocationConsent(false);
        return;
      }
      const position = await Location.getCurrentPositionAsync({
        accuracy: Location.Accuracy.Balanced,
      });
      const places = await Location.reverseGeocodeAsync({
        latitude: position.coords.latitude,
        longitude: position.coords.longitude,
      });
      const place = places[0];
      const label = [place?.city ?? place?.subregion, place?.country]
        .filter(Boolean)
        .join(', ');
      if (label) {
        setLocationLabel(label);
        setLocationConsent(true);
      } else {
        setLocationLabel('Localização aproximada');
        setLocationConsent(true);
      }
    } catch (error) {
      Alert.alert('Não foi possível obter a localização', getErrorMessage(error));
      setLocationConsent(false);
    } finally {
      setLocating(false);
    }
  }

  function handleLocationToggle(value: boolean) {
    setLocationConsent(value);
    if (value && !locationLabel) {
      detectLocation();
    }
  }

  async function handleSubmit() {
    const nextErrors: Record<string, string | null> = {
      displayName: displayNameError(displayName),
      username: usernameError(username),
      birthDate: birthDateError(birthDate),
      terms: mode === 'onboarding' && !termsAccepted ? 'Aceite os termos para continuar.' : null,
      location:
        locationConsent && !locationLabel ? 'Detecte sua localização ou desative o compartilhamento.' : null,
    };
    setErrors(nextErrors);
    if (Object.values(nextErrors).some(Boolean)) {
      return;
    }

    const parsedDate = parseBirthDate(birthDate);
    if (!parsedDate) {
      return;
    }

    setSaving(true);
    try {
      let storedAvatar = initial?.avatarUrl;
      if (avatarUri && avatarUri !== initial?.avatarUrl) {
        storedAvatar = await uploadAvatar(avatarUri);
      }
      const input: ProfileInput = {
        displayName: displayName.trim(),
        username: normalizeUsername(username),
        birthDate: toIsoDate(parsedDate),
        avatarUrl: storedAvatar,
        locationLabel: locationConsent ? locationLabel : undefined,
        locationConsent,
        termsAccepted: mode === 'edit' ? true : termsAccepted,
        privacyPolicyVersion: PRIVACY_POLICY_VERSION,
      };
      const consents: ConsentInput[] =
        mode === 'onboarding'
          ? [
              { purpose: 'essential', granted: true },
              { purpose: 'personalization', granted: personalization },
              { purpose: 'analytics', granted: analytics },
              { purpose: 'location', granted: locationConsent },
            ]
          : [{ purpose: 'location', granted: locationConsent }];
      await onSubmit({ input, consents });
    } catch (error) {
      Alert.alert('Não foi possível salvar', getErrorMessage(error));
    } finally {
      setSaving(false);
    }
  }

  useImperativeHandle(ref, () => ({ submit: handleSubmit }));

  return (
    <View style={styles.root}>
      <View style={styles.avatarSection}>
        <Avatar name={displayName || 'Você'} uri={avatarUri} size={64} ringColor={colors.border} />
        <View style={styles.avatarTexts}>
          <AppText variant="bodyStrong">
            {mode === 'onboarding' ? 'Um perfil do seu jeito' : 'Sua imagem'}
          </AppText>
          <AppText variant="caption" color={colors.textSecondary}>
            {mode === 'onboarding' ? 'Imagem opcional' : 'Retrato ilustrativo'}
          </AppText>
        </View>
        <Pressable
          accessibilityRole="button"
          accessibilityLabel="Escolher foto de perfil"
          onPress={pickAvatar}
          style={[styles.avatarButton, { backgroundColor: colors.surface }]}
        >
          <Ionicons name="camera-outline" size={22} color={colors.text} />
        </Pressable>
      </View>

      <TextField
        label="Nome"
        value={displayName}
        onChangeText={handleDisplayName}
        placeholder="Como você quer ser chamado?"
        autoCapitalize="words"
        maxLength={80}
        error={errors.displayName}
        icon="person-outline"
      />
      <TextField
        label="Nome de usuário"
        value={username}
        onChangeText={(value) => {
          setUsernameTouched(true);
          setUsername(value);
        }}
        placeholder="@seunome"
        autoCapitalize="none"
        autoCorrect={false}
        maxLength={30}
        error={errors.username}
        hint={mode === 'edit' ? 'Seu identificador no DopamineMaxxing.' : undefined}
        icon="at-outline"
      />
      <TextField
        label="Data de nascimento"
        value={birthDate}
        onChangeText={setBirthDate}
        placeholder="DD/MM/AAAA"
        keyboardType="numbers-and-punctuation"
        maxLength={10}
        error={errors.birthDate}
        hint={
          mode === 'edit'
            ? 'Esta informação não aparece no seu perfil.'
            : 'Você precisa ter 18 anos ou mais.'
        }
        icon="calendar-outline"
      />
      <TextField
        label="Localização · opcional"
        value={locationLabel}
        onChangeText={setLocationLabel}
        placeholder="Cidade, estado"
        error={errors.location}
        icon="location-outline"
      />

      <SwitchRow
        icon="location-outline"
        title="Permitir localização"
        subtitle={
          locating
            ? 'Detectando localização…'
            : locationConsent && locationLabel
              ? `Compartilhada: ${locationLabel}`
              : 'Somente com seu consentimento'
        }
        value={locationConsent}
        onValueChange={handleLocationToggle}
      />

      {mode === 'onboarding' ? (
        <View style={styles.consentSection}>
          <Checkbox
            checked={termsAccepted}
            onChange={(value) => {
              setTermsAccepted(value);
              if (value) {
                setErrors((current) => ({ ...current, terms: null }));
              }
            }}
            label={
              <AppText variant="caption" color={colors.textSecondary}>
                Concordo com os{' '}
                <AppText
                  variant="caption"
                  color={colors.primary}
                  onPress={() => router.push('/(auth)/terms')}
                >
                  Termos de uso
                </AppText>{' '}
                e a{' '}
                <AppText
                  variant="caption"
                  color={colors.primary}
                  onPress={() => router.push('/settings/privacy-policy')}
                >
                  Política de privacidade
                </AppText>
                .
              </AppText>
            }
            error={errors.terms}
          />
          <SwitchRow
            icon="sparkles-outline"
            title="Personalizar meu feed"
            subtitle="Opcional. Você pode mudar depois."
            value={personalization}
            onValueChange={setPersonalization}
          />
          <SwitchRow
            icon="bar-chart-outline"
            title="Métricas anônimas"
            subtitle="Opcional. Ajude a melhorar o app."
            value={analytics}
            onValueChange={setAnalytics}
          />
        </View>
      ) : null}

      {hideSubmit ? null : (
        <>
          <Button
            label={busy ? 'Salvando…' : submitLabel}
            onPress={handleSubmit}
            loading={busy}
            size="lg"
            icon="checkmark"
            fullWidth
          />
          {onCancel ? (
            <Button label="Cancelar" onPress={onCancel} variant="ghost" fullWidth />
          ) : null}
        </>
      )}
    </View>
  );
});

function SwitchRow({
  icon,
  title,
  subtitle,
  value,
  onValueChange,
}: {
  icon: ComponentProps<typeof Ionicons>['name'];
  title: string;
  subtitle: string;
  value: boolean;
  onValueChange: (value: boolean) => void;
}) {
  const { colors } = useAppTheme();
  return (
    <View style={styles.switchRow}>
      <Ionicons name={icon} size={20} color={colors.textSecondary} />
      <View style={styles.switchTexts}>
        <AppText variant="bodyStrong">{title}</AppText>
        <AppText variant="caption" color={colors.textSecondary}>
          {subtitle}
        </AppText>
      </View>
      <Switch
        value={value}
        onValueChange={onValueChange}
        trackColor={{ false: colors.surfaceAlt, true: colors.primarySoft }}
        thumbColor={value ? colors.primary : colors.textMuted}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  root: {
    gap: Spacing.lg,
  },
  avatarSection: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.md,
    paddingVertical: Spacing.xs,
  },
  avatarTexts: {
    flex: 1,
    gap: 1,
  },
  avatarButton: {
    width: 44,
    height: 44,
    borderRadius: 22,
    alignItems: 'center',
    justifyContent: 'center',
  },
  switchRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.md,
    minHeight: 60,
    paddingHorizontal: Spacing.lg,
    paddingVertical: Spacing.sm,
    borderRadius: Radius.lg,
  },
  switchTexts: {
    flex: 1,
    gap: 1,
  },
  consentSection: {
    gap: Spacing.sm,
  },
});
