//react-native/app/screens/AdminLoginScreen.js

import React, { useState, useCallback, useMemo, useEffect } from 'react';
import { 
  View, 
  Text, 
  TextInput, 
  TouchableOpacity, 
  StyleSheet, 
  Alert,
  ActivityIndicator,
  KeyboardAvoidingView,
  Platform 
} from 'react-native';
import { useFocusEffect } from '@react-navigation/native';
import KnoxSdk from 'knox-sdk';
import { loginAdmin } from '../services/authService';
import SecurityLevelIndicator from '../components/SecurityLevelIndicator';
import KnoxStatusBadge from '../components/KnoxStatusBadge';
import useStore from '../services/store';

export default function AdminLoginScreen({ navigation }) {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const {
    knoxStatus,
    deviceCompliance,
    refreshKnoxStatus,
    refreshAdminSession,
    setAdminSession,
    isAdminAuthenticated,
  } = useStore((state) => ({
    knoxStatus: state.knoxStatus,
    deviceCompliance: state.deviceCompliance,
    refreshKnoxStatus: state.refreshKnoxStatus,
    refreshAdminSession: state.refreshAdminSession,
    setAdminSession: state.setAdminSession,
    isAdminAuthenticated: state.isAdminAuthenticated,
  }));

  useFocusEffect(
    useCallback(() => {
      let isActive = true;
      (async () => {
        try {
          if (isActive) {
            await refreshKnoxStatus();
            const sessionStatus = await refreshAdminSession();
            await KnoxSdk.logAuditEvent('ADMIN_LOGIN_VIEW', {
              timestamp: new Date().toISOString(),
              isAuthenticated: sessionStatus?.isAuthenticated ?? false,
            });
            if (sessionStatus?.isAuthenticated && navigation) {
              navigation.replace('AdminDashboard');
            }
          }
        } catch (error) {
          // fallback to JS path
        }
      })();

      return () => {
        isActive = false;
      };
    }, [refreshKnoxStatus])
  );

  const warnings = useMemo(() => deviceCompliance?.warnings || [], [deviceCompliance]);
  const errors = useMemo(() => deviceCompliance?.errors || [], [deviceCompliance]);
  const hasBlockingIssues = errors.length > 0;
  const complianceScore = useMemo(() => deviceCompliance?.score ?? 0, [deviceCompliance]);

  useEffect(() => {
    if (isAdminAuthenticated) {
      navigation.replace('AdminDashboard');
    }
  }, [isAdminAuthenticated, navigation]);

  const handleLogin = async () => {
    if (!username.trim() || !password.trim()) {
      Alert.alert('Error', 'Please enter both username and password');
      return;
    }

    if (hasBlockingIssues) {
      Alert.alert(
        'Security Requirements Not Met',
        'This device does not meet the security baseline required for admin access.'
      );
      return;
    }

    setLoading(true);
    try {
      await KnoxSdk.logAuditEvent('ADMIN_LOGIN_ATTEMPT', {
        timestamp: new Date().toISOString(),
        username: username.trim(),
      });
      const result = await loginAdmin(username.trim(), password);
      
      if (result.success) {
        setAdminSession(result);
        Alert.alert('Success', 'Welcome back, Administrator!', [
          {
            text: 'Continue',
            onPress: () => navigation.replace('AdminDashboard')
          }
        ]);
      } else {
        await refreshKnoxStatus();
        Alert.alert('Login Failed', result.message || 'Invalid credentials');
      }
    } catch (error) {
      console.error('Login error:', error);
      Alert.alert('Error', 'Failed to connect to server. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const handleBackToWelcome = () => {
    navigation.goBack();
  };

  return (
    <KeyboardAvoidingView 
      style={styles.container}
      behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
    >
      <View style={styles.content}>
        {/* Header */}
        <View style={styles.header}>
          <TouchableOpacity 
            style={styles.backButton}
            onPress={handleBackToWelcome}
          >
            <Text style={styles.backButtonText}>← Back</Text>
          </TouchableOpacity>
          
          <View style={styles.titleSection}>
            <Text style={styles.title}>Administrator Login</Text>
            <Text style={styles.subtitle}>Access the admin dashboard</Text>
          </View>
        </View>

        {/* Login Form */}
        <View style={styles.formSection}>
          <KnoxStatusBadge
            knoxEnabled={knoxStatus?.enabled}
            securityLevel={knoxStatus?.securityLevel}
            size="large"
          />
          <SecurityLevelIndicator
            level={knoxStatus?.enabled ? knoxStatus.securityLevel : 'STANDARD'}
            style={styles.securityIndicator}
          />
          <Text style={styles.securityMeta}>
            Knox status: {knoxStatus?.enabled ? 'Verified' : 'Fallback mode'}
          </Text>
          <Text style={styles.securityMeta}>
            Compliance score: {complianceScore}/100
          </Text>

          {(warnings.length > 0 || errors.length > 0) && (
            <View style={[styles.callout, errors.length ? styles.errorCallout : styles.warningCallout]}>
              <Text style={styles.calloutTitle}>
                {errors.length ? 'Security Requirements Not Met' : 'Security Checks'}
              </Text>
              {errors.map((issue) => (
                <Text key={`error-${issue}`} style={styles.calloutText}>
                  • {issue}
                </Text>
              ))}
              {warnings.map((issue) => (
                <Text key={`warning-${issue}`} style={styles.calloutText}>
                  • {issue}
                </Text>
              ))}
            </View>
          )}

          <View style={styles.inputContainer}>
            <Text style={styles.inputLabel}>Username</Text>
            <TextInput
              style={styles.input}
              placeholder="Enter your username"
              value={username}
              onChangeText={setUsername}
              autoCapitalize="none"
              autoCorrect={false}
              editable={!loading}
            />
          </View>

          <View style={styles.inputContainer}>
            <Text style={styles.inputLabel}>Password</Text>
            <View style={styles.passwordContainer}>
              <TextInput
                style={styles.passwordInput}
                placeholder="Enter your password"
                value={password}
                onChangeText={setPassword}
                secureTextEntry={!showPassword}
                autoCapitalize="none"
                autoCorrect={false}
                editable={!loading}
              />
              <TouchableOpacity 
                style={styles.eyeButton}
                onPress={() => setShowPassword(!showPassword)}
              >
                <Text style={styles.eyeButtonText}>
                  {showPassword ? '🙈' : '👁️'}
                </Text>
              </TouchableOpacity>
            </View>
          </View>

          <TouchableOpacity 
            style={[styles.loginButton, loading && styles.loginButtonDisabled]}
            onPress={handleLogin}
            disabled={loading || hasBlockingIssues}
          >
            {loading ? (
              <ActivityIndicator color="#ffffff" size="small" />
            ) : (
              <Text style={styles.loginButtonText}>Login</Text>
            )}
          </TouchableOpacity>
        </View>

        {/* Development Info */}
        <View style={styles.devInfo}>
          <Text style={styles.devInfoTitle}>Development Credentials:</Text>
          <Text style={styles.devInfoText}>Username: admin</Text>
          <Text style={styles.devInfoText}>Password: admin123</Text>
          <Text style={styles.devInfoNote}>
            (This will be replaced with secure authentication in production)
          </Text>
        </View>

        {/* Footer */}
        <View style={styles.footer}>
          <Text style={styles.footerText}>Samsung Inventory Management System</Text>
          <Text style={styles.footerVersion}>Version 1.0.0</Text>
        </View>
      </View>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#ffffff',
  },
  content: {
    flex: 1,
    padding: 20,
    justifyContent: 'space-between',
  },
  header: {
    marginTop: 40,
    marginBottom: 40,
  },
  backButton: {
    alignSelf: 'flex-start',
    padding: 10,
    marginLeft: -10,
  },
  backButtonText: {
    fontSize: 16,
    color: '#2563eb',
    fontWeight: '600',
  },
  titleSection: {
    alignItems: 'center',
    marginTop: 20,
  },
  title: {
    fontSize: 28,
    fontWeight: 'bold',
    color: '#1f2937',
    marginBottom: 8,
  },
  subtitle: {
    fontSize: 16,
    color: '#6b7280',
  },
  formSection: {
    flex: 1,
    justifyContent: 'center',
    maxHeight: 400,
  },
  securityIndicator: {
    alignSelf: 'flex-start',
    marginBottom: 8,
  },
  securityMeta: {
    fontSize: 12,
    color: '#6b7280',
    marginBottom: 12,
  },
  callout: {
    borderRadius: 12,
    padding: 16,
    marginBottom: 20,
  },
  warningCallout: {
    backgroundColor: '#fef9c3',
    borderWidth: 1,
    borderColor: '#fde68a',
  },
  errorCallout: {
    backgroundColor: '#fee2e2',
    borderWidth: 1,
    borderColor: '#fecaca',
  },
  calloutTitle: {
    fontSize: 15,
    fontWeight: '700',
    marginBottom: 8,
    color: '#b91c1c',
  },
  calloutText: {
    fontSize: 13,
    color: '#374151',
  },
  inputContainer: {
    marginBottom: 20,
  },
  inputLabel: {
    fontSize: 16,
    fontWeight: '600',
    color: '#374151',
    marginBottom: 8,
  },
  input: {
    borderWidth: 1,
    borderColor: '#d1d5db',
    borderRadius: 8,
    padding: 16,
    fontSize: 16,
    backgroundColor: '#ffffff',
  },
  passwordContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    borderWidth: 1,
    borderColor: '#d1d5db',
    borderRadius: 8,
    backgroundColor: '#ffffff',
  },
  passwordInput: {
    flex: 1,
    padding: 16,
    fontSize: 16,
  },
  eyeButton: {
    padding: 16,
  },
  eyeButtonText: {
    fontSize: 18,
  },
  loginButton: {
    backgroundColor: '#2563eb',
    paddingVertical: 16,
    borderRadius: 8,
    alignItems: 'center',
    marginTop: 10,
    shadowColor: '#2563eb',
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.3,
    shadowRadius: 3.84,
    elevation: 5,
  },
  loginButtonDisabled: {
    backgroundColor: '#9ca3af',
    shadowOpacity: 0,
    elevation: 0,
  },
  loginButtonText: {
    color: '#ffffff',
    fontSize: 18,
    fontWeight: 'bold',
  },
  devInfo: {
    backgroundColor: '#fef3c7',
    padding: 15,
    borderRadius: 8,
    marginVertical: 20,
    borderWidth: 1,
    borderColor: '#fbbf24',
  },
  devInfoTitle: {
    fontSize: 14,
    fontWeight: 'bold',
    color: '#92400e',
    marginBottom: 5,
  },
  devInfoText: {
    fontSize: 13,
    color: '#92400e',
    fontFamily: 'monospace',
  },
  devInfoNote: {
    fontSize: 12,
    color: '#78716c',
    fontStyle: 'italic',
    marginTop: 5,
  },
  footer: {
    alignItems: 'center',
    paddingVertical: 20,
  },
  footerText: {
    fontSize: 14,
    color: '#9ca3af',
    fontWeight: '500',
  },
  footerVersion: {
    fontSize: 12,
    color: '#d1d5db',
    marginTop: 4,
  },
});