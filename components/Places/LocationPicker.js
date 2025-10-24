import React, { useState } from 'react';
import {
  View,
  StyleSheet,
  Alert,
  Platform,
  Modal,
  Text,
  TouchableOpacity,
  ActivityIndicator,
} from 'react-native';
import OutlinedButton from '../UI/OutlinedButton';
import { Colors } from '../../constants/colors';
import Geolocation from '@react-native-community/geolocation';
import { PermissionsAndroid } from 'react-native';
import MapView, { Marker } from 'react-native-maps';

const GOOGLE_API_KEY = '';

function LocationPicker({ onLocationPicked }) {
  const [location, setLocation] = useState(null);
  const [pickedLocation, setPickedLocation] = useState(null);
  const [isPicking, setIsPicking] = useState(false);
  const [isLoading, setIsLoading] = useState(false);

  // Request device location
  async function getLocationHandler() {
    setIsLoading(true);
    try {
      if (Platform.OS === 'android') {
        const granted = await PermissionsAndroid.request(
          PermissionsAndroid.PERMISSIONS.ACCESS_FINE_LOCATION,
        );

        if (granted !== PermissionsAndroid.RESULTS.GRANTED) {
          Alert.alert(
            'Permission denied',
            'Enable location permission to continue.',
          );
          setIsLoading(false);
          return;
        }
      } else {
        const auth = await Geolocation.requestAuthorization();
        if (auth !== 'granted') {
          Alert.alert(
            'Permission denied',
            'Enable location permission to continue.',
          );
          setIsLoading(false);
          return;
        }
      }

      Geolocation.getCurrentPosition(
        async position => {
          const { latitude, longitude } = position.coords;
          const address = await getAddressFromCoords(latitude, longitude);
          const loc = { latitude, longitude, address };
          setLocation(loc);
          onLocationPicked(loc);
          setIsLoading(false);
        },
        error => {
          console.error('Error getting location:', error);
          Alert.alert('Error', `Could not fetch location: ${error.message}`);
          setIsLoading(false);
        },
        { enableHighAccuracy: true, timeout: 15000, maximumAge: 10000 },
      );
    } catch (err) {
      console.error(err);
      Alert.alert('Error', 'Something went wrong while fetching location.');
      setIsLoading(false);
    }
  }

  // Convert lat/lng to address
  async function getAddressFromCoords(lat, lng) {
    try {
      const response = await fetch(
        `https://maps.googleapis.com/maps/api/geocode/json?latlng=${lat},${lng}&key=${GOOGLE_API_KEY}`,
      );
      const data = await response.json();

      if (data.status === 'OK' && data.results.length > 0) {
        return data.results[0].formatted_address;
      } else {
        console.warn('Geocoding API error:', data.status, data.error_message);
        return 'Address not found';
      }
    } catch (err) {
      console.error('Fetch error:', err);
      return 'Address not found';
    }
  }

  // Handle map press
  function onMapPress(event) {
    const { latitude, longitude } = event.nativeEvent.coordinate;
    setPickedLocation({ latitude, longitude });
  }

  // Confirm location picked on map
  async function confirmPickedLocation() {
    if (!pickedLocation) {
      Alert.alert('No location selected', 'Please tap on the map first.');
      return;
    }
    setIsLoading(true);
    const address = await getAddressFromCoords(
      pickedLocation.latitude,
      pickedLocation.longitude,
    );
    const loc = { ...pickedLocation, address };
    setLocation(loc);
    onLocationPicked(loc);
    setIsPicking(false);
    setIsLoading(false);
  }

  return (
    <View style={styles.container}>
      <View style={styles.mapPreview}>
        {isLoading ? (
          <ActivityIndicator size="large" color={Colors.primary500} />
        ) : location ? (
          <MapView
            style={styles.map}
            region={{
              latitude: location.latitude,
              longitude: location.longitude,
              latitudeDelta: 0.01,
              longitudeDelta: 0.01,
            }}
            showsUserLocation
          >
            <Marker coordinate={location} title="Selected Location" />
          </MapView>
        ) : (
          <View style={styles.noLocation}>
            <OutlinedButton icon="location" onPress={getLocationHandler}>
              Locate User
            </OutlinedButton>
          </View>
        )}
      </View>

      <View style={styles.actions}>
        <OutlinedButton icon="location" onPress={getLocationHandler}>
          Locate User
        </OutlinedButton>
        <OutlinedButton icon="map" onPress={() => setIsPicking(true)}>
          Pick on Map
        </OutlinedButton>
      </View>

      <Modal visible={isPicking} animationType="slide">
        <View style={{ flex: 1 }}>
          <MapView
            style={{ flex: 1 }}
            initialRegion={{
              latitude: location ? location.latitude : 37.78825,
              longitude: location ? location.longitude : -122.4324,
              latitudeDelta: 0.05,
              longitudeDelta: 0.05,
            }}
            onPress={onMapPress}
          >
            {pickedLocation && <Marker coordinate={pickedLocation} />}
          </MapView>

          <View style={styles.modalActions}>
            <TouchableOpacity
              style={styles.confirmButton}
              onPress={confirmPickedLocation}
            >
              <Text style={styles.confirmButtonText}>Confirm Location</Text>
            </TouchableOpacity>

            <TouchableOpacity
              style={styles.cancelButton}
              onPress={() => setIsPicking(false)}
            >
              <Text style={styles.cancelButtonText}>Cancel</Text>
            </TouchableOpacity>
          </View>
        </View>
      </Modal>
    </View>
  );
}

export default LocationPicker;

const styles = StyleSheet.create({
  container: { flex: 1 },
  mapPreview: {
    width: '100%',
    height: 300,
    marginVertical: 8,
    borderRadius: 4,
    overflow: 'hidden',
    backgroundColor: Colors.primary100,
    justifyContent: 'center',
    alignItems: 'center',
  },
  map: { width: '100%', height: '100%' },
  noLocation: { justifyContent: 'center', alignItems: 'center' },
  actions: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    alignItems: 'center',
  },
  modalActions: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    padding: 10,
    backgroundColor: 'white',
  },
  confirmButton: {
    backgroundColor: Colors.primary500,
    padding: 10,
    borderRadius: 6,
  },
  confirmButtonText: { color: 'white', fontWeight: 'bold' },
  cancelButton: {
    backgroundColor: Colors.primary100,
    padding: 10,
    borderRadius: 6,
  },
  cancelButtonText: { color: 'black', fontWeight: 'bold' },
});
