import React, { useEffect, useState } from "react";
import {
  SafeAreaView,
  View,
  FlatList,
  StyleSheet,
  Text,
  StatusBar,
  Image,
  TouchableOpacity,
  ActivityIndicator,
  TextInput,
} from "react-native";
import Ionicons from "react-native-vector-icons/Ionicons";

export default function LibraryScreen({ ...props }) {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(false);
  const [errorMessage, setErrorMessage] = useState(null);

  useEffect(() => {
    // call function to fetch user's image library on load
    getImages();
  }, []);

  const getImages = () => {
    // API: GET user's image library from backend
    setLoading(true);
    // console.log("Session ID:", props.user.sessionId);
    fetch(
      "https://whispering-citadel-32592.herokuapp.com/draft/images/getImages",
      {
        method: "GET",
        headers: {
          "Content-Type": "application/json",
          sessionToken: props.user.sessionId,
        },
      }
    )
      .then((response) => response.json())
      .then((data) => {
        if (data["error"]) {
          setErrorMessage("Error retrieving images (response)");
          setLoading(false);
        } else {
          setData(data?.data.map((e) => ({ edit: false, ...e })));
          setLoading(false);
        }
      })
      .catch((error) => {
        console.error(error);
        setErrorMessage("Error retrieving images (fetch)");
        setLoading(false);
      });
  };

  const handleDelete = (data) => {
    // API: DELETE selected image from the user's library
    fetch(
      "https://whispering-citadel-32592.herokuapp.com/draft/images/deleteImage",
      {
        method: "DELETE",
        headers: {
          "Content-Type": "application/json",
          sessionToken: props.user.sessionId,
        },
        body: JSON.stringify({
          imageId: data.objectId,
        }),
      }
    )
      .then((response) => response.json())
      .then((data) => {
        if (data["error"]) {
          setErrorMessage("Error deleting image (response)");
        } else {
          getImages();
          console.log("tree deleted successfully");
        }
      })
      .catch((error) => {
        console.error(error);
        setErrorMessage("Error deleting image (fetch)");
      });
  };

  const handleSave = (dataElement) => {
    console.log("SAVE", dataElement);
    // API: PUT user's changes to the selected image in their library
    setData(
      data.map((dat) =>
        dat.objectId === dataElement.objectId ? { ...dat, edit: false } : dat
      )
    );
    fetch(
      "https://whispering-citadel-32592.herokuapp.com/draft/images/updateImage",
      {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
          sessionToken: props.user.sessionId,
        },
        body: JSON.stringify({
          image: dataElement.image_file,
          imageId: dataElement.objectId,
          species: dataElement.species,
        }),
      }
    )
      .then((response) => response.json())
      .then((data) => {
        if (data["error"]) {
          setErrorMessage("Error saving image (response)");
        } else {
          console.log("updated Image successfully:", data);
          getImages();
        }
      })
      .catch((error) => {
        console.error(error);
        setErrorMessage("Error saving image (fetch)");
      });
  };

  const Item = ({ dataElement }) => {
    // render item row for an image in the user's library
    // console.log("ITEM:", dataElement);
    return (
      <View style={styles.item}>
        <Image
          source={dataElement.image_file}
          style={styles.imageStyle}
        ></Image>
        <View style={styles.details}>
          <TextInput
            keyboardDismissMode="none"
            onChangeText={(text) =>
              setData(
                data.map((dat) =>
                  dat.objectId === dataElement.objectId
                    ? { ...dat, species: text }
                    : dat
                )
              )
            }
            value={dataElement.species}
            editable={dataElement?.edit}
            style={[
              styles.title,
              {
                backgroundColor: dataElement?.edit
                  ? props.theme.foreground
                  : null,
              },
            ]}
            placeholder="Enter species"
          />
          <Text style={styles.info}>
            Date Identified: {dataElement.createdAt.slice(0, 10)}
          </Text>
          <Text style={styles.info}>
            Time Identified (UTC): {dataElement.createdAt.slice(11, 16)}
          </Text>
          <View style={styles.buttonContainer}>
            {/* {dataElement.edit ? (
              <TouchableOpacity
                onPress={() => {
                  setData(
                    data.map((dat) =>
                      dat.objectId === dataElement.objectId
                        ? { ...dat, edit: false }
                        : dat
                    )
                  );
                  handleSave(dataElement);
                }}
                style={[
                  styles.button,
                  { backgroundColor: props.theme.primary },
                ]}
              >
                <View>
                  <Text style={styles.buttonText}>Save</Text>
                </View>
              </TouchableOpacity>
            ) : (
              <TouchableOpacity
                onPress={() => {
                  setData(
                    data.map((dat) =>
                      dat.objectId === dataElement.objectId
                        ? { ...dat, edit: true }
                        : dat
                    )
                  );
                }}
                style={[
                  styles.button,
                  { backgroundColor: props.theme.foreground },
                ]}
              >
                <View>
                  <Text style={[styles.buttonText, { color: "#000" }]}>
                    Edit
                  </Text>
                </View>
              </TouchableOpacity>
            )} */}
            <TouchableOpacity
              style={[styles.button, { backgroundColor: "#DA4343" }]}
              onPress={() => handleDelete(dataElement)}
            >
              <View>
                <Text style={styles.buttonText}>Delete</Text>
              </View>
            </TouchableOpacity>
          </View>
        </View>
      </View>
    );
  };

  return (
    <SafeAreaView style={styles.container}>
      {errorMessage && (
        <View style={styles.alert}>
          <View style={{ flexDirection: "row", alignItems: "center" }}>
            <Ionicons name={"warning"} size={20} color={"white"} />
            <Text
              style={{
                marginLeft: 20,
                fontSize: 16,
                color: "white",
              }}
            >
              {errorMessage}
            </Text>
          </View>
          <TouchableOpacity onPress={() => setErrorMessage(null)}>
            <Ionicons name={"close"} size={40} color={"white"} />
          </TouchableOpacity>
        </View>
      )}
      {loading && (
        <ActivityIndicator
          size="large"
          color="#2F6E55"
          style={{ marginTop: 10 }}
        />
      )}

      {data && !loading && (
        <FlatList
          data={data}
          renderItem={({ item }) => <Item dataElement={item} />}
          keyExtractor={(item) => item.objectId}
          style={{ width: "100%" }}
          contentContainerStyle={{ padding: 10 }}
        />
      )}
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#E5E5E5",
    marginTop: StatusBar.currentHeight || 0,
    alignItems: "center",
    justifyContent: "center",
  },
  item: {
    backgroundColor: "#fff",
    padding: 5,
    marginTop: 10,
    flexDirection: "row",
    width: "100%",
    borderRadius: 8,
  },
  details: {
    paddingLeft: 15,
    paddingTop: 5,
    flexDirection: "column",
  },
  title: {
    fontSize: 20,
    fontWeight: "500",
  },
  info: {
    fontSize: 14,
    paddingVertical: 2,
  },
  imageStyle: {
    alignSelf: "center",
    height: 100,
    width: 100,
  },
  buttonContainer: {
    flexDirection: "row",
  },
  button: {
    marginTop: 8,
    marginBottom: 6,
    padding: 10,
    marginRight: 8,
    borderRadius: 12,
  },
  buttonText: {
    color: "#fff",
    textAlign: "center",
    fontWeight: "bold",
    fontSize: 14,
    paddingLeft: 5,
    paddingRight: 5,
  },
  alert: {
    marginTop: 10,
    height: 60,
    width: "90%",
    borderRadius: 12,
    backgroundColor: "#DA4343",
    opacity: 0.9,
    alignItems: "center",
    flexDirection: "row",
    justifyContent: "space-between",
    paddingLeft: 20,
    paddingRight: 10,
    zIndex: 99,
  },
});
