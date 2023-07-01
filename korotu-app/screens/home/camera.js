import React, { useState, useEffect, useRef } from "react";
import { Text, View, StyleSheet, Image, ActivityIndicator } from "react-native";
import { Camera, CameraType } from "expo-camera";
import * as MediaLibrary from "expo-media-library";
import * as FileSystem from "expo-file-system";
import Button from "./components/button";
import Infobox from "./components/infobox";

export default function CameraScreen({ ...props }) {
  const [hasCameraPermission, setHasCameraPermission] = useState(null);
  const [image, setImage] = useState(null);
  const [species, setSpecies] = useState(null);
  const [speciesName, setSpeciesName] = useState(null);
  const [loading, setLoading] = useState(false);
  const [type] = useState(Camera.Constants.Type.back);
  const cameraRef = useRef(null);

  useEffect(() => {
    (async () => {
      MediaLibrary.requestPermissionsAsync();
      const cameraStatus = await Camera.requestCameraPermissionsAsync();
      setHasCameraPermission(cameraStatus.status === "granted");
    })();
  }, []);

  const takePicture = async () => {
    if (cameraRef) {
      try {
        const data = await cameraRef.current.takePictureAsync();
        console.log(data);
        setImage(data.uri);
      } catch (error) {
        console.log(error);
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

  if (hasCameraPermission === false) {
    return <Text>No access to camera</Text>;
  }

  const uploadImage = () => {
    console.log("image", image);
    console.log("speciesName", speciesName);

    fetch(
      "https://whispering-citadel-32592.herokuapp.com/draft/images/uploadImage",
      {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          sessionToken: props.user.sessionId,
        },
        body: JSON.stringify({
          image: image,
          species: speciesName,
        }),
      }
    )
      .then((response) => response.json())
      .then((data) => {
        if (data["error"]) {
          // setShowError(true);
          console.log(data);
        } else {
          setData(data);
          console.log("data", data);
        }
      })
      .catch((error) => {
        console.error(error);
        // setShowError(true);
      });
  };

  useEffect(() => {
    // call function to upload image to user's library once identification has loaded
    if (!loading && image && speciesName) {
      uploadTreeToLibrary();
    }
  }, [loading]);

  return (
    <View style={[styles.container, { backgroundColor: props.theme.primary }]}>
      {!image ? (
        <Camera style={styles.camera} type={type} ref={cameraRef}>
          <View
            style={{
              flexDirection: "row",
              justifyContent: "space-between",
              paddingHorizontal: 30,
            }}
          ></View>
        </Camera>
      ) : (
        <Image source={{ uri: image }} style={styles.camera} />
      )}

      <View style={styles.controls}>
        {loading && <ActivityIndicator size="large" color="#2F6E55" />}
        {image ? (
          <View style={{ bottom: 0, position: "absolute", width: "100%" }}>
            <View
              style={{
                flexDirection: "row",
                justifyContent: "space-between",
                paddingHorizontal: 30,
                zIndex: 5,
                backgroundColor: props.theme.primary,
              }}
            >
              <Button
                title="Re-take"
                onPress={() => {
                  setImage(null);
                  setSpecies(null);
                  setSpeciesName(null);
                }}
                icon="retweet"
              />
              <Button title="PlantID" onPress={PlantIDAPI} icon="tree" />
              <Button title="CustomAPI" onPress={CustomAPI} icon="leaf" />
            </View>
            {(species || loading) && (
              <View
                style={{
                  bottom: 0,
                  // position: "absolute",
                  width: "100%",
                  zIndex: 1,
                }}
              >
                <Infobox identifiedSpecies={species} loading={loading} />
              </View>
            )}
          </View>
        ) : (
          <Button title="Capture" onPress={takePicture} icon="camera" />
        )}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: "center",
  },
  text: {
    fontWeight: "bold",
    fontSize: 16,
    color: "#000",
    marginLeft: 10,
  },
  camera: {
    flex: 5,
  },
});
