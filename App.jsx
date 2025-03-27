import React from 'react';
import { SafeAreaView, Text, StatusBar, View, StyleSheet } from 'react-native';
import { WebView } from 'react-native-webview';

export default function App() {
  // The app URL - using Replit's domain when available
  const appUrl = process.env.REPLIT_URL || 'https://triiqi.replit.app';
  
  return (
    <SafeAreaView style={styles.container}>
      <StatusBar barStyle="light-content" backgroundColor="#000000" />
      <WebView
        source={{ uri: appUrl }}
        style={styles.webview}
        startInLoadingState={true}
        renderLoading={() => (
          <View style={styles.loadingContainer}>
            <Text style={styles.loadingText}>Loading Triiqi...</Text>
          </View>
        )}
        onError={(syntheticEvent) => {
          const { nativeEvent } = syntheticEvent;
          console.error('WebView error: ', nativeEvent);
        }}
      />
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#000000',
  },
  webview: {
    flex: 1,
  },
  loadingContainer: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#000000',
  },
  loadingText: {
    fontSize: 18,
    color: '#FF8800', // Triiqi orange color
    marginTop: 10,
  },
});