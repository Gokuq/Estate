import React, { useEffect, useState, useCallback } from 'react';
import { View, Text, FlatList, Image, TouchableOpacity, ActivityIndicator, StyleSheet, SafeAreaView, TextInput } from 'react-native';
import MaterialCommunityIcons from 'react-native-vector-icons/MaterialCommunityIcons';
import { useNavigation } from '@react-navigation/native';
import AsyncStorage from '@react-native-async-storage/async-storage';

const API_URL = 'https://678f678849875e5a1a91b27f.mockapi.io/houses';

const HomeScreen = () => {
  const [estates, setEstates] = useState([]);
  const [filteredEstates, setFilteredEstates] = useState([]);
  const [savedEstates, setSavedEstates] = useState({});
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [searchQuery, setSearchQuery] = useState('');
  const navigation = useNavigation();

  useEffect(() => {
    const fetchEstates = async () => {
      try {
        const response = await fetch(API_URL);
        if (!response.ok) throw new Error('Failed to fetch data');
        const data = await response.json();
        setEstates(data);
        setFilteredEstates(data);
        
        const savedEstatesData = await AsyncStorage.getItem('savedEstates');
        if (savedEstatesData) {
          setSavedEstates(JSON.parse(savedEstatesData));
        }
      } catch (err) {
        console.error('Error fetching estates:', err);
        setError(err.message);
      } finally {
        setLoading(false);
      }
    };

    fetchEstates();
  }, []);

  const toggleSave = useCallback(async (id) => {
    const newSavedEstates = {
      ...savedEstates,
      [id]: !savedEstates[id]
    };
    setSavedEstates(newSavedEstates);
    
    try {
      await AsyncStorage.setItem('savedEstates', JSON.stringify(newSavedEstates));
    } catch (error) {
      console.error('Error saving to AsyncStorage:', error);
    }
  }, [savedEstates]);

  const handleSearch = (text) => {
    setSearchQuery(text);
    const filtered = estates.filter(estate => 
      estate.description.toLowerCase().includes(text.toLowerCase())
    );
    setFilteredEstates(filtered);
  };

  const renderEstateItem = useCallback(({ item }) => (
    <TouchableOpacity 
      style={styles.estateItem}
      onPress={() => navigation.navigate('Detail', { estate: item })}
    >
      <Image 
        source={{ uri: item.imagerUrl }}
        style={styles.estateImage} 
        resizeMode="cover"
      />
      <View style={styles.overlay}>
        <View style={styles.estateInfo}>
          <Text style={styles.estateDescription} numberOfLines={2}>
            {item.description}
          </Text>
          <View style={styles.locationContainer}>
            <MaterialCommunityIcons name="map-marker-outline" size={16} color="#fff" />
            <Text style={styles.locationText}>
              {!isNaN(parseFloat(item.latitude)) ? parseFloat(item.latitude).toFixed(2) : 'N/A'},
              {!isNaN(parseFloat(item.longitude)) ? parseFloat(item.longitude).toFixed(2) : 'N/A'}
            </Text>
          </View>
        </View>
      </View>
      <TouchableOpacity 
        style={styles.saveButton} 
        onPress={() => toggleSave(item.id)}
      >
        <MaterialCommunityIcons 
          name={savedEstates[item.id] ? "heart" : "heart-outline"} 
          size={24} 
          color={savedEstates[item.id] ? "#e74c3c" : "#fff"}
        />
      </TouchableOpacity>
    </TouchableOpacity>
  ), [navigation, savedEstates, toggleSave]);

  if (loading) return <ActivityIndicator size="large" color="#3B8575" style={styles.loader} />;
  if (error) return <Text style={styles.errorText}>Error: {error}</Text>;

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.title}>Discover Estates</Text>
        <View style={styles.searchContainer}>
          <MaterialCommunityIcons name="magnify" size={24} color="#666" style={styles.searchIcon} />
          <TextInput
            style={styles.searchInput}
            placeholder="Search properties..."
            value={searchQuery}
            onChangeText={handleSearch}
          />
        </View>
      </View>
      <FlatList
        data={filteredEstates}
        keyExtractor={(item) => item.id}
        renderItem={renderEstateItem}
        contentContainerStyle={styles.listContainer}
        showsVerticalScrollIndicator={false}
      />
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f5f5f5',
  },
  header: {
    backgroundColor: '#fff',
    padding: 20,
    borderBottomLeftRadius: 30,
    borderBottomRightRadius: 30,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 5,
  },
  title: {
    fontSize: 28,
    fontWeight: 'bold',
    color: '#3B8575',
    marginBottom: 15,
  },
  searchContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#f0f0f0',
    borderRadius: 25,
    paddingHorizontal: 15,
  },
  searchIcon: {
    marginRight: 10,
  },
  searchInput: {
    flex: 1,
    height: 50,
    fontSize: 16,
  },
  listContainer: {
    padding: 15,
  },
  estateItem: {
    borderRadius: 15,
    marginBottom: 20,
    overflow: 'hidden',
    height: 200,
  },
  estateImage: {
    width: '100%',
    height: '100%',
  },
  overlay: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: 'rgba(0, 0, 0, 0.4)',
    justifyContent: 'flex-end',
    padding: 15,
  },
  estateInfo: {
    justifyContent: 'flex-end',
  },
  estateDescription: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#fff',
    marginBottom: 5,
  },
  locationContainer: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  locationText: {
    marginLeft: 5,
    fontSize: 14,
    color: '#fff',
  },
  saveButton: {
    position: 'absolute',
    top: 10,
    right: 10,
    backgroundColor: 'rgba(0, 0, 0, 0.3)',
    borderRadius: 20,
    padding: 8,
  },
  loader: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  errorText: {
    textAlign: 'center',
    color: 'red',
    fontSize: 16,
    marginTop: 20,
  },
});

export default HomeScreen;