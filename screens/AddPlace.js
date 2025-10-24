import React from 'react';
import PlaceForm from '../components/Places/PlaceForm';

function AddPlace({ navigation }) {
  function createPlaceHandler(place) {
    // For now, you can just log or alert the data
    console.log('New Place Created:', place);

    // Later, you might save it to a database or state
    navigation.navigate('AllPlaces', {
      place: place,
    });
  }

  return <PlaceForm onCreatePlace={createPlaceHandler} />;
}

export default AddPlace;
