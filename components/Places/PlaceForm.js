import {
  View,
  Text,
  ScrollView,
  TextInput,
  StyleSheet,
  Alert,
} from 'react-native';
import { useState } from 'react';
import { Colors } from '../../constants/colors';
import ImagePicker from './ImagePicker';
import LocationPicker from './LocationPicker';
import Button from '../UI/Button';
import { Place } from '../../models/place';

function PlaceForm({ onCreatePlace }) {
  const [enteredTitle, setEnteredTitle] = useState('');
  const [selectedImage, setSelectedImage] = useState();
  const [pickedLocation, setPickedLocation] = useState();

  function changeTitleHandler(enteredText) {
    setEnteredTitle(enteredText);
  }

  function imageTakenHandler(imageUri) {
    setSelectedImage(imageUri);
  }

  function locationPickedHandler(location) {
    setPickedLocation(location);
  }

  function savePlaceHandler() {
    if (!enteredTitle.trim()) {
      Alert.alert('Validation Error', 'Please enter a title.');
      return;
    }

    if (!selectedImage) {
      Alert.alert('Validation Error', 'Please select an image.');
      return;
    }

    if (!pickedLocation) {
      Alert.alert('Validation Error', 'Please pick a location.');
      return;
    }

    const placeData = new Place(enteredTitle, selectedImage, pickedLocation);
    onCreatePlace(placeData);

    Alert.alert(
      'Place Details',
      `Title: ${enteredTitle}\nImage: ${selectedImage}\nAddress: ${
        pickedLocation?.address || 'No address available'
      }`,
    );
  }

  return (
    <ScrollView
      style={styles.form}
      contentContainerStyle={{ paddingBottom: 40 }}
    >
      <View style={styles.inputContainer}>
        <Text style={styles.label}>Title</Text>
        <TextInput
          style={styles.input}
          onChangeText={changeTitleHandler}
          value={enteredTitle}
          placeholder="Enter place title"
        />
      </View>

      <View style={styles.pickerContainer}>
        <Text style={styles.label}>Image</Text>
        <ImagePicker onTakeImage={imageTakenHandler} />
      </View>

      <View style={styles.pickerContainer}>
        <Text style={styles.label}>Location</Text>
        <LocationPicker onLocationPicked={locationPickedHandler} />
      </View>

      <Button onPress={savePlaceHandler}>Add Place</Button>
    </ScrollView>
  );
}

export default PlaceForm;

const styles = StyleSheet.create({
  form: { flex: 1, padding: 24, backgroundColor: 'white' },
  inputContainer: { marginBottom: 20 },
  pickerContainer: { marginVertical: 10 },
  label: {
    fontWeight: 'bold',
    marginBottom: 8,
    color: Colors.gray700,
    fontSize: 16,
    textAlign: 'center',
  },
  input: {
    paddingHorizontal: 8,
    paddingVertical: 10,
    fontSize: 16,
    borderBottomColor: Colors.primary700,
    borderBottomWidth: 2,
    backgroundColor: Colors.primary100,
    borderRadius: 6,
  },
});
