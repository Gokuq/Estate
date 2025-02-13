import React, { useState, useEffect } from 'react';
import { View, Text, Image, StyleSheet, ScrollView, SafeAreaView, TouchableOpacity, Alert, Platform, Linking } from 'react-native';
import Icon from 'react-native-vector-icons/Ionicons';
import Geolocation from '@react-native-community/geolocation';

const DetailScreen = ({ route }) => {
  const { estate } = route.params;
  const [userLocation, setUserLocation] = useState(null);
  const [isNearProperty, setIsNearProperty] = useState(false);
  const [distance, setDistance] = useState(null);

  useEffect(() => {
    const watchId = Geolocation.watchPosition(
      position => {
        setUserLocation(position.coords);
        checkDistance(position.coords);
      },
      error => Alert.alert('Error', 'Failed to get your location. Please check your GPS settings.'),
      { enableHighAccuracy: true, distanceFilter: 10 }
    );

    return () => Geolocation.clearWatch(watchId);
  }, []);

  const checkDistance = (userCoords) => {
    const calculatedDistance = calculateDistance(
      userCoords.latitude,
      userCoords.longitude,
      parseFloat(estate.latitude),
      parseFloat(estate.longitude)
    );
    setDistance(calculatedDistance);
    setIsNearProperty(calculatedDistance <= 30);
  };

  const calculateDistance = (lat1, lon1, lat2, lon2) => {
    const R = 6371e3; // Earth's radius in meters
    const φ1 = lat1 * Math.PI / 180;
    const φ2 = lat2 * Math.PI / 180;
    const Δφ = (lat2 - lat1) * Math.PI / 180;
    const Δλ = (lon2 - lon1) * Math.PI / 180;

    const a = Math.sin(Δφ / 2) * Math.sin(Δφ / 2) +
              Math.cos(φ1) * Math.cos(φ2) *
              Math.sin(Δλ / 2) * Math.sin(Δλ / 2);
    const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));

    return R * c; // Distance in meters
  };

  const handleUnlock = () => {
    Alert.alert('Success', 'Property unlocked!');
    // Add your unlock logic here
  };

  const handleCallOwner = () => {
    const phoneNumber = estate.ownerPhone || '1234567890'; // Replace with actual owner's phone number
    Linking.openURL(`tel:${phoneNumber}`);
  };

  return (
    <SafeAreaView style={styles.container}>
      <ScrollView>
        <Image 
          source={{ uri: estate.imagerUrl }}
          style={styles.image}
          resizeMode="cover"
        />
        <View style={styles.infoContainer}>
          <Text style={styles.title}>{estate.title}</Text>
          <Text style={styles.description}>{estate.description}</Text>
          <View style={styles.locationContainer}>
            <Icon name="location-outline" size={20} color="#3B8575" />
            <Text style={styles.locationText}>
              {estate.latitude}, {estate.longitude}
            </Text>
          </View>
          <Text style={styles.dateText}>Created at: {new Date(estate.createdAt).toLocaleDateString()}</Text>
          
          {userLocation ? (
            <>
              <Text style={styles.distanceText}>
                Distance: {distance ? `${(distance / 1000).toFixed(2)} km` : 'Calculating...'}
              </Text>
              {isNearProperty ? (
                <TouchableOpacity style={styles.unlockButton} onPress={handleUnlock}>
                  <Text style={styles.unlockButtonText}>Unlock Property</Text>
                </TouchableOpacity>
              ) : (
                <View>
                  <Text style={styles.farAwayMessage}>You are too far from the property to unlock it.</Text>
                  <TouchableOpacity style={styles.callButton} onPress={handleCallOwner}>
                    <Text style={styles.callButtonText}>Call Owner</Text>
                  </TouchableOpacity>
                </View>
              )}
            </>
          ) : (
            <Text style={styles.loadingText}>Getting your location...</Text>
          )}
        </View>
      </ScrollView>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f5f5f5',
  },
  image: {
    width: '100%',
    height: 300,
  },
  infoContainer: {
    padding: 20,
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#333',
    marginBottom: 10,
  },
  description: {
    fontSize: 18,
    color: '#333',
    marginBottom: 15,
  },
  locationContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 10,
  },
  locationText: {
    fontSize: 16,
    color: '#666',
    marginLeft: 5,
  },
  dateText: {
    fontSize: 14,
    color: '#888',
    marginBottom: 20,
  },
  distanceText: {
    fontSize: 16,
    color: '#3B8575',
    marginBottom: 15,
  },
  unlockButton: {
    backgroundColor: '#3B8575',
    padding: 15,
    borderRadius: 5,
    alignItems: 'center',
  },
  unlockButtonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: 'bold',
  },
  farAwayMessage: {
    color: '#FF6347',
    fontSize: 16,
    textAlign: 'center',
    marginBottom: 15,
  },
  callButton: {
    backgroundColor: '#4A90E2',
    padding: 15,
    borderRadius: 5,
    alignItems: 'center',
  },
  callButtonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: 'bold',
  },
  loadingText: {
    color: '#888',
    fontSize: 16,
    textAlign: 'center',
  },
});

export default DetailScreen;