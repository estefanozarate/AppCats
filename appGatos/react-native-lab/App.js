import { Share } from 'react-native';
import { StatusBar } from 'expo-status-bar';
import { StyleSheet, Text, View, Button, Image, Alert } from 'react-native';
import { useEffect, useState } from 'react';
import * as ImagePicker from 'expo-image-picker';
import axios from 'axios';

export default function App() {
  const [factData, setFactData] = useState('');
  const [facts, setFacts] = useState({});
  const [factIndex, setFactIndex] = useState(0);
  const [image, setImage] = useState(null);
  const [catImage, setCatImage] = useState(null);

  useEffect(() => {
    fetch('https://cat-fact.herokuapp.com/facts')
      .then((response) => response.json())
      .then((json) => {
        setFacts(json);
        setFactData(json[0].text);
      })
      .catch((error) => console.error(error));
      
    (async () => {
      const { status } = await ImagePicker.requestCameraPermissionsAsync();
      if (status !== 'granted') {
        Alert.alert('Permiso denegado para acceder a la cámara');
      }
    })();
  }, []);

  const onPressLearnMore = () => {
    let newIndex = factIndex + 1;
    if (facts[newIndex] === undefined) {
      setFactData(facts[0].text);
      setFactIndex(1);
    } else {
      setFactData(facts[newIndex].text);
      setFactIndex(newIndex);
    }
  };

  const openCamera = async () => {
    let result = await ImagePicker.launchCameraAsync({
      mediaTypes: ImagePicker.MediaTypeOptions.Images,
      allowsEditing: true,
      aspect: [4, 3],
      quality: 1,
    });

    if (!result.canceled) {
      setImage(result.uri);
      uploadImage(result.uri);
    }
  };

  const uploadImage = async (uri) => {
    const formData = new FormData();
    formData.append('file', {
      uri: uri,
      type: 'image/jpeg',
      name: 'upload.jpg',
    });
    formData.append('upload_preset', 'adwlbcbk');

    try {
      const response = await axios.post('https://api.cloudinary.com/v1_1/dofzvi4ep/image/upload', formData);
      console.log('Imagen subida con éxito a Cloudinary:', response.data);
      if (response.status === 200) {
        Alert.alert('Éxito', 'Su imagen se guardó correctamente, ahora puede observar al gato');
        getCatImage();
      }
    } catch (error) {
      console.error('Error al subir la imagen a Cloudinary:', error);
      Alert.alert('Error', 'Hubo un problema al subir la imagen.');

      if (error.response) {
        console.error('Response data:', error.response.data);
        console.error('Response status:', error.response.status);
        console.error('Response headers:', error.response.headers);
      } else if (error.request) {
        console.error('Request data:', error.request);
      } else {
        console.error('Error', error.message);
      }
    }
  };

  const getCatImage = async () => {
    try {
      const response = await axios.get('https://api.thecatapi.com/v1/images/search', {
        headers: {
          'x-api-key': 'live_RWFwUf8hjgxb8ed386fHSxyqL9cU7ZjqT80BDRxNilLVp2cAkDPqMZn6tz5QXPa0',
        },
      });
      if (response.data.length > 0) {
        const catImageUrl = response.data[0].url;
        setCatImage(catImageUrl);
      }
    } catch (error) {
      console.error('Error al obtener la imagen del gato:', error);
    }
  };

  const shareFact = () => {
    Share.share({
      message: factData,
      title: 'Cat Fact',
    });
  };

  const restartApp = () => {
    setFactIndex(0);
    setFactData(facts[0].text);
    setImage(null);
    setCatImage(null);
  };

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Cat Facts</Text>
      <View style={styles.imageContainer}>
        {image && <Image source={{ uri: image }} style={styles.image} />}
        {catImage && (
          <>
            <Text style={styles.imageText}>Cat Image from The Cat API:</Text>
            <Image source={{ uri: catImage }} style={styles.image} />
          </>
        )}
      </View>
      <Text style={styles.factText}>{factData}</Text>
      <Button onPress={onPressLearnMore} title="Change fact" color="#3498db" style={styles.button} />
      <Button onPress={openCamera} title="Open Camera" color="#2ecc71" style={styles.button} />
      <Button onPress={shareFact} title="Share Fact" color="#e67e22" style={styles.button} />
      <Button onPress={restartApp} title="Restart App" color="#e74c3c" style={styles.button} />
      <StatusBar style="auto" />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#ecf0f1',
    alignItems: 'center',
    justifyContent: 'center',
  },
  title: {
    fontWeight: 'bold',
    fontSize: 24,
    marginBottom: 10,
    color: '#e74c3c',
  },
  imageContainer: {
    margin: 20,
    alignItems: 'center',
  },
  image: {
    width: 200,
    height: 200,
    borderRadius: 10,
    marginTop: 10,
  },
  imageText: {
    fontSize: 16,
    fontWeight: 'bold',
    marginTop: 10,
    color: '#9b59b6',
  },
  factText: {
    marginTop: 20,
    marginBottom: 20,
    fontSize: 18,
    textAlign: 'center',
    color: '#34495e',
  },
  button: {
    margin: 10,
    padding: 10,
    minWidth: 150,
    borderRadius: 5,
  },
  buttonText: {
    color: '#fff',
    textAlign: 'center',
  },
});


