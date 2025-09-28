import React from 'react';
import { View, Text, StyleSheet } from 'react-native';

const STATUS_COLORS = {
  enabled: {
    background: 'rgba(34,197,94,0.12)',
    border: '#16a34a',
    text: '#166534',
  },
  disabled: {
    background: 'rgba(156,163,175,0.16)',
    border: '#6b7280',
    text: '#374151',
  },
};

const KnoxStatusBadge = ({ knoxEnabled, securityLevel, size = 'medium' }) => {
  const variant = knoxEnabled ? STATUS_COLORS.enabled : STATUS_COLORS.disabled;
  const containerStyles = [
    styles.badge,
    {
      backgroundColor: variant.background,
      borderColor: variant.border,
    },
    size === 'small' && styles.small,
    size === 'large' && styles.large,
  ];

  return (
    <View style={containerStyles}>
      <Text
        style={[
          styles.icon,
          { color: variant.text },
          size === 'small' && styles.iconSmall,
          size === 'large' && styles.iconLarge,
        ]}
      >
        {knoxEnabled ? '🛡️' : '⚠️'}
      </Text>
      <View style={styles.textContainer}>
        <Text
          style={[
            styles.title,
            { color: variant.text },
            size === 'small' && styles.titleSmall,
            size === 'large' && styles.titleLarge,
          ]}
        >
          {knoxEnabled ? 'Knox Secured' : 'Standard Security'}
        </Text>
        {securityLevel ? (
          <Text
            style={[
              styles.subtitle,
              size === 'small' && styles.subtitleSmall,
              { color: `${variant.text}CC` },
            ]}
          >
            Security Level: {securityLevel}
          </Text>
        ) : null}
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  badge: {
    flexDirection: 'row',
    alignItems: 'center',
    borderRadius: 12,
    borderWidth: 1,
    paddingVertical: 8,
    paddingHorizontal: 12,
  },
  small: {
    borderRadius: 10,
    paddingVertical: 4,
    paddingHorizontal: 8,
  },
  large: {
    borderRadius: 16,
    paddingVertical: 14,
    paddingHorizontal: 16,
  },
  icon: {
    fontSize: 20,
    marginRight: 10,
  },
  iconSmall: {
    fontSize: 16,
    marginRight: 6,
  },
  iconLarge: {
    fontSize: 26,
    marginRight: 12,
  },
  textContainer: {
    flex: 1,
  },
  title: {
    fontSize: 16,
    fontWeight: '700',
  },
  titleSmall: {
    fontSize: 13,
    fontWeight: '600',
  },
  titleLarge: {
    fontSize: 18,
  },
  subtitle: {
    marginTop: 2,
    fontSize: 12,
  },
  subtitleSmall: {
    fontSize: 11,
  },
});

export default KnoxStatusBadge;
