export class Place {
  constructor(title, imageUri, location) {
    this.title = title;
    this.imageUri = imageUri;
    this.address = location?.address || 'Unknown';
    this.location = location ? { lat: location.lat, lng: location.lng } : null;
    this.id = new Date().toString() + Math.random().toString();
  }
}
