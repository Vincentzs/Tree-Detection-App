import React, { useEffect, useState } from "react";
import Ionicons from "react-native-vector-icons/Ionicons";
import {
  StyleSheet,
  View,
  Text,
  TouchableOpacity,
  ImageBackground,
  ActivityIndicator,
} from "react-native";
import * as MediaLibrary from "expo-media-library";
import * as FileSystem from "expo-file-system";
import * as ImagePicker from "expo-image-picker";
import Infobox from "./components/infobox";

export default function UploadScreen({ ...props }) {
  const [loading, setLoading] = useState(false);
  const [image, setImage] = useState(null);
  const [species, setSpecies] = useState(null);
  const [speciesName, setSpeciesName] = useState(null);

  const getPermissionAsync = async () => {
    const { status } = await MediaLibrary.getPermissionsAsync();
    if (status !== "granted") {
      const { status: newStatus } =
        await MediaLibrary.requestPermissionsAsync();
      if (newStatus === "granted") {
        return true;
      } else {
        return false;
      }
    }
    return true;
  };

  const pickImage = async () => {
    const permissionGranted = await getPermissionAsync();
    if (permissionGranted) {
      const result = await ImagePicker.launchImageLibraryAsync({
        mediaTypes: ImagePicker.MediaTypeOptions.Images,
        allowsEditing: true,
        aspect: [4, 3],
        quality: 1,
      });

      if (result?.assets) {
        setImage(result.assets[0].uri);
        setSpecies(null);
      }
    }
  };

  const uploadTreeToLibrary = async () => {
    // upload tree to the user's library
    let formData = new FormData();

    const fileData = await FileSystem.readAsStringAsync(image, {
      encoding: FileSystem.EncodingType.Base64,
    });

    const imageObject = {
      uri: `data:image/jpg;base64,${fileData}`,
      type: "image/jpeg",
      name: `${speciesName}.jpg`,
    };

    formData.append("image", imageObject);
    formData.append("species", speciesName);

    const apiUrl =
      "https://whispering-citadel-32592.herokuapp.com/draft/images/uploadImage";

    try {
      const response = await fetch(apiUrl, {
        method: "POST",
        body: formData,
        headers: {
          "Content-Type": "multipart/form-data",
          sessionToken: props.user.sessionId,
        },
      });
      const responseData = await response.json();
      console.log(responseData);
    } catch (error) {
      console.error("Error uploading image:", error);
    }
  };

  const CustomAPI = async () => {
    // identify tree using custom ML API
    if (image) {
      try {
        const base64 = await FileSystem.readAsStringAsync(image, {
          encoding: FileSystem.EncodingType.Base64,
        });
        // https://plantclassification-qpfub.eastus2.inference.ml.azure.com/score
        const data = {
          data: base64,
        };
        setLoading(true);

        fetch(
          "https://plantclassification-qpfub.eastus2.inference.ml.azure.com/score",
          {
            method: "POST",
            headers: {
              "Content-Type": "application/json",
              Authorization: "Bearer yPcbgdXSX6MUdGrlM4PEE5Pf2PYaPuJE",
            },
            body: JSON.stringify(data),
          }
        )
          .then((response) => response.json())
          .then((data) => {
            const tree = JSON.parse(data).class_name;
            return tree;
          })
          .then((tree) => {
            alert("This is a " + tree + "!");
            setSpecies({ plant_details: { scientific_name: tree } });
            setSpeciesName(tree);
            setLoading(false);
          })
          .catch((error) => {
            console.error("Error:", error);
            setLoading(false);
          });
      } catch (error) {
        console.log(error);
      }
    }
  };

  const PlantIDAPI = async () => {
    // identify tree using Plant API
    setSpecies(null);
    if (image) {
      try {
        const base64 = await FileSystem.readAsStringAsync(image, {
          encoding: FileSystem.EncodingType.Base64,
        });
        const data = {
          api_key: "3Z8jL1JAehx9NABUOw2Fy07IotXkIA1t80kZXWlSJaGr4vLu4j",
          images: [base64],
          // modifiers docs: https://github.com/flowerchecker/Plant-id-API/wiki/Modifiers
          modifiers: ["crops_fast"],
          plant_language: "en",
          // plant details docs: https://github.com/flowerchecker/Plant-id-API/wiki/Plant-details
          plant_details: [
            "common_names",
            "url",
            "name_authority",
            "taxonomy",
            "synonyms",
          ],
        };
        setLoading(true);
        const res = await fetch("https://api.plant.id/v2/identify", {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify(data),
        })
          .then((response) => response.json())
          .then((data) => {
            setSpecies(data.suggestions[0]);
            setSpeciesName(data.suggestions[0].plant_details.scientific_name);
            setLoading(false);
          })
          .catch((error) => {
            console.error("Error:", error);
            setLoading(false);
          });
      } catch (error) {
        console.log(error);
      }
    }
  };

  useEffect(() => {
    // call function to upload image to user's library once identification has loaded
    if (!loading && image && speciesName) {
      uploadTreeToLibrary();
    }
  }, [loading]);

  return (
    <View style={styles.container}>
      {image ? (
        <ImageBackground source={{ uri: image }} style={styles.image}>
          <TouchableOpacity
            activeOpacity={0.8}
            onPress={pickImage}
            style={styles.uploadButton}
          >
            <Ionicons name={"image-outline"} size={35} color={"#ffffff"} />
          </TouchableOpacity>
        </ImageBackground>
      ) : (
        <View style={styles.image}>
          <TouchableOpacity
            activeOpacity={0.8}
            onPress={pickImage}
            style={styles.uploadButton}
          >
            <Ionicons name={"image-outline"} size={35} color={"#ffffff"} />
          </TouchableOpacity>
        </View>
      )}
      {image ? (
        loading ? (
          <View style={styles.loadingContainer}>
            <ActivityIndicator size="large" />
          </View>
        ) : species ? (
          <Infobox identifiedSpecies={species} />
        ) : (
          <View style={styles.innerContainer}>
            <TouchableOpacity
              activeOpacity={0.8}
              onPress={PlantIDAPI}
              style={[styles.button, { backgroundColor: props?.theme.primary }]}
            >
              <Text style={styles.buttonText}>Identify with PlantID</Text>
            </TouchableOpacity>
            <TouchableOpacity
              activeOpacity={0.8}
              onPress={CustomAPI}
              style={[styles.button, { backgroundColor: props?.theme.primary }]}
            >
              <Text style={styles.buttonText}>Identify with CustomAPI</Text>
            </TouchableOpacity>
            <TouchableOpacity
              activeOpacity={0.8}
              onPress={() => setImage(null)}
              style={[styles.button, { backgroundColor: "#DA4343" }]}
            >
              <Text style={styles.buttonText}>Cancel</Text>
            </TouchableOpacity>
          </View>
        )
      ) : (
        <Text style={{ height: "100%" }}>
          Press the button above to select a photo!
        </Text>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    alignItems: "center",
    width: "100%",
    justifyContent: "space-between",
    backgroundColor: "#E5E5E5",
  },
  innerContainer: {
    flex: 1,
    alignItems: "center",
    width: "100%",
    justifyContent: "flex-start",
    backgroundColor: "#E5E5E5",
  },
  uploadButton: {
    backgroundColor: "#4a4a4a",
    width: 60,
    height: 60,
    borderRadius: 35,
    marginTop: 20,
    justifyContent: "center",
    alignItems: "center",
    position: "absolute",
    right: 25,
  },
  image: {
    alignItems: "center",
    justifyContent: "space-between",
    top: 0,
    width: "100%",
    height: undefined,
    aspectRatio: 1,
  },
  button: {
    marginTop: 30,
    padding: 14,
    width: "70%",
    borderRadius: 12,
  },
  buttonText: {
    color: "#fff",
    textAlign: "center",
    fontWeight: "bold",
    fontSize: 16,
  },
  loadingContainer: {
    width: "100%",
    padding: 30,
    paddingTop: "25%",
    backgroundColor: "#ffffff",
    height: "100%",
  },
});
