import React, { useState } from 'react';
import {
  View,
  Image,
  Alert,
  Platform,
  StyleSheet,
  Text,
  Pressable,
} from 'react-native';
import { launchCamera } from 'react-native-image-picker';
import { check, request, PERMISSIONS, RESULTS } from 'react-native-permissions';
import { Colors } from '../../constants/colors';

export default function ImagePicker({ onTakeImage }) {
  const [pickedImage, setPickedImage] = useState(null);

  async function verifyPermissions() {
    const permission =
      Platform.OS === 'android'
        ? PERMISSIONS.ANDROID.CAMERA
        : PERMISSIONS.IOS.CAMERA;

    const result = await check(permission);
    if (result === RESULTS.GRANTED) return true;

    if (result === RESULTS.DENIED || result === RESULTS.LIMITED) {
      const reqResult = await request(permission);
      return reqResult === RESULTS.GRANTED;
    }

    if (result === RESULTS.BLOCKED) {
      Alert.alert(
        'Permission Blocked',
        'Enable camera permission in app settings.',
      );
      return false;
    }
    return false;
  }

  async function takeImageHandler() {
    const hasPermission = await verifyPermissions();
    if (!hasPermission) return;

    const result = await launchCamera({
      mediaType: 'photo',
      quality: 0.5,
      saveToPhotos: true,
    });

    if (!result.didCancel && result.assets && result.assets.length > 0) {
      const uri = result.assets[0].uri;
      setPickedImage(uri);
      onTakeImage && onTakeImage(uri);
    }
  }

  return (
    <View style={styles.container}>
      <View style={styles.imagePreview}>
        {pickedImage ? (
          <Image source={{ uri: pickedImage }} style={styles.image} />
        ) : (
          <Pressable style={styles.button} onPress={takeImageHandler}>
            <Text style={styles.buttonText}>Take Image</Text>
          </Pressable>
        )}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { width: '100%' },
  imagePreview: {
    width: '100%',
    height: 250,
    marginVertical: 8,
    borderRadius: 6,
    overflow: 'hidden',
    backgroundColor: Colors.primary100,
    justifyContent: 'center',
    alignItems: 'center',
  },
  image: { width: '100%', height: '100%', resizeMode: 'cover' },
  button: {
    width: '80%',
    backgroundColor: Colors.primary500,
    padding: 12,
    justifyContent: 'center',
    alignItems: 'center',
    borderRadius: 6,
  },
  buttonText: { color: 'white', fontWeight: 'bold' },
});
