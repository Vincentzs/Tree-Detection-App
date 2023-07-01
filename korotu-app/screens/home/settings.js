import React, { useEffect, useState } from "react";
import Ionicons from "react-native-vector-icons/Ionicons";
import {
  Text,
  View,
  StyleSheet,
  TextInput,
  ScrollView,
  TouchableOpacity,
  Alert,
} from "react-native";

function SettingRow({
  icon,
  name,
  value,
  editable = true,
  placeholder,
  onChangeText,
  ...props
}) {
  return (
    <View style={styles.settingRow}>
      <View style={styles.settingRowHeaderSection}>
        <Ionicons name={icon} size={25} color={props?.theme?.primary} />
        <Text style={styles.settingRowHeaderText}>{name}</Text>
      </View>
      {editable ? (
        <TextInput
          style={{ color: "#2F2F2F" }}
          value={value}
          placeholder={placeholder}
          onChangeText={onChangeText}
        />
      ) : (
        <Text style={[styles.settingRowBodyText, { color: "#AFAFAF" }]}>
          {value}
        </Text>
      )}
    </View>
  );
}

export default function SettingsScreen({ navigation, ...props }) {
  const [username, setUsername] = useState(props?.user?.username);
  const [email, setEmail] = useState(
    props?.user?.email ? props?.user?.username : "email@gmail.com"
  );
  const [password, setPassword] = useState(null);
  const [isEdited, setIsEdited] = useState(false);

  useEffect(() => {
    if (username != props.user.username || email != props.user?.email) {
      setIsEdited(true);
    }
  }, [username, email]);

  const handleEditUsername = async () => {
    // console.log("-- editing username");
    try {
      await fetch(
        "https://whispering-citadel-32592.herokuapp.com/draft/editusername",
        {
          method: "PUT",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            username: props.user.username,
            // password: password,
            newUsername: username,
          }),
        }
      );
      Alert.alert("Username updated ✅");
    } catch (error) {
      console.error(error);
      Alert.alert("Failed to update username ❌");
    }
  };

  const handleSaveChanges = async () => {
    if (username != props.user.username) {
      handleEditUsername();
    }
    setIsEdited(false);
  };

  return (
    <View style={styles.container}>
      <ScrollView contentContainerStyle={styles.scrollContainer}>
        <View style={styles.profilePhoto}>
          <Ionicons
            name={"person-circle-outline"}
            size={80}
            color={props.theme.primary}
          />
        </View>
        <View style={styles.innerContainer}>
          <SettingRow
            onChangeText={setUsername}
            icon={"at-circle-outline"}
            name={"Username"}
            value={username}
            editable={true}
            {...props}
          />
          <SettingRow
            icon={"lock-closed-outline"}
            name={"Password"}
            value={"********"}
            editable={false}
            {...props}
          />
          <SettingRow
            icon={"time-outline"}
            name={"Account created"}
            value={props?.user?.createdAt.slice(0, 10)}
            editable={false}
            {...props}
          />
        </View>
        <TouchableOpacity
          style={[
            styles.saveButton,
            !isEdited ? { backgroundColor: "#D1D1D1" } : {},
          ]}
          onPress={handleSaveChanges}
          disabled={!isEdited}
        >
          <Text
            style={[
              styles.saveButtonText,
              !isEdited ? { color: "#9A9A9A" } : {},
            ]}
          >
            Save Changes
          </Text>
        </TouchableOpacity>
        <TouchableOpacity
          style={[styles.saveButton, { backgroundColor: "#DA4343" }]}
          onPress={() => props.setUser(null)}
        >
          <Text style={styles.saveButtonText}>Log out</Text>
        </TouchableOpacity>
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    backgroundColor: "#E5E5E5",
  },
  scrollContainer: {
    marginTop: 30,
    alignItems: "center",
    height: "100%",
  },
  profilePhoto: {
    marginBottom: 20,
  },
  innerContainer: {
    width: "90%",
    borderRadius: "10%",
    backgroundColor: "#fff",
    alignItems: "center",
  },
  settingRow: {
    width: "100%",
    height: 50,
    paddingHorizontal: 15,
    borderBottomColor: "#E5E5E5",
    borderBottomWidth: 2,
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
  },
  settingRowHeaderSection: {
    flexDirection: "row",
    alignItems: "center",
  },
  settingRowHeaderText: {
    fontSize: 16,
    marginLeft: 8,
  },
  settingRowBodyText: {
    fontSize: 16,
    marginRight: 2,
  },
  saveButton: {
    width: "90%",
    paddingHorizontal: 30,
    height: 50,
    borderRadius: "10%",
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: "#357961",
    marginTop: 30,
  },
  saveButtonText: {
    fontSize: 16,
    fontWeight: "bold",
    color: "#fff",
  },
});
